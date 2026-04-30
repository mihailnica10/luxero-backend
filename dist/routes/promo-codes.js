import { Hono } from "hono";
import dbConnect from "../db";
import { ErrorCodes } from "../lib/error-codes";
import { error, success } from "../lib/response";
import { PromoCode } from "../models";
const app = new Hono();
// POST /api/promo-codes/validate
app.post("/validate", async (c) => {
    try {
        const { code, subtotal } = await c.req.json();
        if (!code) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Promo code is required", 400);
        }
        await dbConnect();
        const promoCode = await PromoCode.findOne({
            code: code.toUpperCase(),
            isActive: true,
        }).lean();
        if (!promoCode) {
            return success(c, { valid: false, error: "Invalid promo code" });
        }
        const now = new Date();
        if (promoCode.validFrom && promoCode.validFrom > now) {
            return success(c, { valid: false, error: "Promo code is not yet valid" });
        }
        if (promoCode.validUntil && promoCode.validUntil < now) {
            return success(c, { valid: false, error: "Promo code has expired" });
        }
        if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
            return success(c, { valid: false, error: "Promo code has reached maximum uses" });
        }
        if (promoCode.minOrderValue && subtotal < promoCode.minOrderValue) {
            return success(c, {
                valid: false,
                error: `Minimum order value is £${promoCode.minOrderValue}`,
            });
        }
        return success(c, {
            valid: true,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue,
        });
    }
    catch (err) {
        console.error("Error validating promo code:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
export default app;
