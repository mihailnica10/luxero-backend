import { Hono } from "hono";
import dbConnect from "../db";
import { ErrorCodes } from "../lib/error-codes";
import { error, success } from "../lib/response";
import { Competition, Entry, Order, Profile } from "../models";

const app = new Hono();

// POST /api/payments/create-checkout-session
// Body: { items: [{competitionId, quantity}], userId, promoCode?, subtotal, discount? }
app.post("/create-checkout-session", async (c) => {
  try {
    const body = await c.req.json();
    const { items, userId, subtotal, discount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "items array is required", 400);
    }
    if (!userId) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "userId is required", 400);
    }

    await dbConnect();

    // Validate all competitions are active and have availability
    for (const item of items) {
      const competition = await Competition.findById(item.competitionId).lean();
      if (!competition) {
        return error(c, ErrorCodes.NOT_FOUND, `Competition ${item.competitionId} not found`, 404);
      }
      if (competition.status !== "active") {
        return error(
          c,
          ErrorCodes.VALIDATION_ERROR,
          `Competition "${competition.title}" is not active`,
          400
        );
      }
      const available = competition.maxTickets - (competition.ticketsSold || 0);
      if (item.quantity > available) {
        return error(
          c,
          ErrorCodes.VALIDATION_ERROR,
          `Only ${available} tickets available for "${competition.title}"`,
          400
        );
      }
    }

    const total = subtotal - (discount || 0);
    const orderNumber = Date.now();

    // Create pending order
    const order = await Order.create({
      orderNumber,
      userId,
      status: "pending",
      subtotal: subtotal || 0,
      discountAmount: discount || 0,
      total,
      promoCodeId: undefined,
      referralBonusTickets: 0,
      referralBalanceUsed: 0,
      stripeSessionId: `cs_mock_${Date.now()}`,
    });

    // Auto-complete the order (simulate successful payment for now)
    // In production this would be triggered by Stripe webhook
    order.status = "completed";
    order.paidAt = new Date();
    await order.save();

    // Create entries for each competition
    for (const item of items) {
      const competition = await Competition.findById(item.competitionId).lean();
      if (!competition) continue;

      const startTicket = (competition.ticketsSold || 0) + 1;
      const ticketNumbers = Array.from({ length: item.quantity }, (_, i) => startTicket + i);

      await Entry.create({
        userId,
        competitionId: item.competitionId,
        orderId: order._id,
        ticketNumbers,
        quantity: item.quantity,
        answerIndex: item.answerIndex,
      });

      // Update competition tickets sold
      await Competition.findByIdAndUpdate(item.competitionId, {
        $inc: { ticketsSold: item.quantity },
      });

      // Update profile stats
      await Profile.findByIdAndUpdate(userId, {
        $inc: { totalEntries: item.quantity, totalSpent: competition.ticketPrice * item.quantity },
      });
    }

    return success(c, {
      orderId: order._id,
      sessionId: `cs_mock_${Date.now()}`,
      status: "succeeded",
      amount: total,
      currency: "gbp",
    });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// POST /api/payments/webhook
app.post("/webhook", async (c) => {
  try {
    const { sessionId, competitionId, tickets, userId, paymentStatus } = await c.req.json();

    if (paymentStatus !== "succeeded") {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Payment not succeeded", 400);
    }

    await dbConnect();

    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }

    if (order.status === "completed") {
      // Idempotent - already processed
      return success(c, { order, entries: [] });
    }

    const competition = await Competition.findById(competitionId).lean();
    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }

    const startTicket = (competition.ticketsSold || 0) + 1;
    const ticketNumbers = Array.from({ length: tickets }, (_, i) => startTicket + i);

    const entries = await Entry.create({
      userId,
      competitionId,
      orderId: order._id,
      ticketNumbers,
      quantity: tickets,
    });

    order.status = "completed";
    order.paidAt = new Date();
    await order.save();

    await Competition.findByIdAndUpdate(competitionId, {
      $inc: { ticketsSold: tickets },
    });

    await Profile.findByIdAndUpdate(userId, {
      $inc: { totalEntries: tickets, totalSpent: competition.ticketPrice * tickets },
    });

    return success(c, { order, entries });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/payments/session/:sessionId
app.get("/session/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    await dbConnect();

    const order = await Order.findOne({ stripeSessionId: sessionId }).lean();
    if (!order) {
      return success(c, { sessionId, status: "pending" });
    }

    return success(c, { sessionId, status: order.status });
  } catch (err) {
    console.error("Error verifying session:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
