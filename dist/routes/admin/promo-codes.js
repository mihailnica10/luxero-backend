import { Hono } from "hono";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import { PromoCode } from "../../models";
const app = new Hono();
app.use("*", requireAdmin);
// GET /api/admin/promo-codes
app.get("/", async (c) => {
    try {
        const { limit, page, skip } = parsePagination(c);
        await dbConnect();
        const query = {};
        const isActive = c.req.query("isActive");
        if (isActive !== undefined)
            query.isActive = isActive === "true";
        const [promoCodes, total] = await Promise.all([
            PromoCode.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            PromoCode.countDocuments(query),
        ]);
        return paginated(c, promoCodes, total, page, limit);
    }
    catch (err) {
        console.error("Error listing promo codes:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// GET /api/admin/promo-codes/:id
app.get("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const promoCode = await PromoCode.findById(id).lean();
        if (!promoCode) {
            return error(c, ErrorCodes.NOT_FOUND, "Promo code not found", 404);
        }
        return success(c, promoCode);
    }
    catch (err) {
        console.error("Error fetching promo code:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/admin/promo-codes
app.post("/", async (c) => {
    try {
        const body = await c.req.json();
        await dbConnect();
        const promoCode = await PromoCode.create(body);
        return success(c, promoCode);
    }
    catch (err) {
        console.error("Error creating promo code:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// PUT /api/admin/promo-codes/:id
app.put("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        await dbConnect();
        const promoCode = await PromoCode.findByIdAndUpdate(id, body, { new: true }).lean();
        if (!promoCode) {
            return error(c, ErrorCodes.NOT_FOUND, "Promo code not found", 404);
        }
        return success(c, promoCode);
    }
    catch (err) {
        console.error("Error updating promo code:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// DELETE /api/admin/promo-codes/:id
app.delete("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const promoCode = await PromoCode.findByIdAndDelete(id);
        if (!promoCode) {
            return error(c, ErrorCodes.NOT_FOUND, "Promo code not found", 404);
        }
        return success(c, { success: true });
    }
    catch (err) {
        console.error("Error deleting promo code:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
export default app;
