import { Hono } from "hono";
import dbConnect from "../../db";
import { ReferralPurchase } from "../../models";

const app = new Hono();

// List all referral purchases
app.get("/", async (c) => {
  try {
    const referredBy = c.req.query("referredBy");
    const limit = parseInt(c.req.query("limit") || "50", 10);
    const page = parseInt(c.req.query("page") || "1", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (referredBy) query.referredBy = referredBy;

    const [referralPurchases, total] = await Promise.all([
      ReferralPurchase.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ReferralPurchase.countDocuments(query),
    ]);

    return c.json({
      referralPurchases,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error listing referral purchases:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get referral purchase by ID
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const referralPurchase = await ReferralPurchase.findById(id).lean();

    if (!referralPurchase) {
      return c.json({ error: "ReferralPurchase not found" }, 404);
    }

    return c.json(referralPurchase);
  } catch (error) {
    console.error("Error fetching referral purchase:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete referral purchase
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const referralPurchase = await ReferralPurchase.findByIdAndDelete(id);

    if (!referralPurchase) {
      return c.json({ error: "ReferralPurchase not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting referral purchase:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
