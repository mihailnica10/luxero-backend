import { Hono } from "hono";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import { Order } from "../../models";

const app = new Hono();

app.use("*", requireAdmin);

// GET /api/admin/orders
app.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await dbConnect();

    const query: Record<string, unknown> = {};
    const status = c.req.query("status");
    const userId = c.req.query("userId");
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const [orders, total] = await Promise.all([
      Order.find(query as any)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query as any),
    ]);

    return paginated(c, orders, total, page, limit);
  } catch (err) {
    console.error("Error listing orders:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/admin/orders/:id
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const order = await Order.findById(id).lean();

    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }

    return success(c, order);
  } catch (err) {
    console.error("Error fetching order:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// PATCH /api/admin/orders/:id/status
app.patch("/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    await dbConnect();

    const order = await Order.findByIdAndUpdate(id, { status } as any, { new: true }).lean();

    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }

    return success(c, order);
  } catch (err) {
    console.error("Error updating order status:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// DELETE /api/admin/orders/:id
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }

    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting order:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
