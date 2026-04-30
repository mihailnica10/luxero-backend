import { Hono } from "hono";
import dbConnect from "../db";
import { ErrorCodes } from "../lib/error-codes";
import { error, success } from "../lib/response";
import { Category } from "../models";
const app = new Hono();
// GET /api/categories - list all active categories
app.get("/", async (c) => {
    try {
        await dbConnect();
        const categories = await Category.find({ isActive: true })
            .sort({ displayOrder: 1 })
            .lean();
        return success(c, categories);
    }
    catch (err) {
        console.error("Error fetching categories:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
export default app;
