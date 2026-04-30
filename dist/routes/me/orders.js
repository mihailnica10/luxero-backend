import { Hono } from "hono";
import mongoose from "mongoose";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { auth } from "../../middleware/auth";
import { Order } from "../../models";
const app = new Hono();
app.use("*", auth);
// GET /api/me/orders - user's own orders
app.get("/", async (c) => {
    try {
        const { limit, page, skip } = parsePagination(c);
        const userId = c.get("userId");
        await dbConnect();
        const [orders, total] = await Promise.all([
            Order.find({ userId: new mongoose.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
        ]);
        return paginated(c, orders, total, page, limit);
    }
    catch (err) {
        console.error("Error fetching orders:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// GET /api/me/orders/:id - user's specific order
app.get("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const userId = c.get("userId");
        await dbConnect();
        const order = await Order.findOne({
            _id: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
        }).lean();
        if (!order) {
            return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
        }
        return success(c, order);
    }
    catch (err) {
        console.error("Error fetching order:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
export default app;
