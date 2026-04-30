import { Hono } from "hono";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import { InstantPrize } from "../../models";
const app = new Hono();
app.use("*", requireAdmin);
// GET /api/admin/instant-prizes
app.get("/", async (c) => {
    try {
        const { limit, page, skip } = parsePagination(c);
        await dbConnect();
        const query = {};
        const isActive = c.req.query("isActive");
        if (isActive !== undefined)
            query.isActive = isActive === "true";
        const [instantPrizes, total] = await Promise.all([
            InstantPrize.find(query)
                .sort({ displayOrder: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            InstantPrize.countDocuments(query),
        ]);
        return paginated(c, instantPrizes, total, page, limit);
    }
    catch (err) {
        console.error("Error listing instant prizes:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// GET /api/admin/instant-prizes/:id
app.get("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const instantPrize = await InstantPrize.findById(id).lean();
        if (!instantPrize) {
            return error(c, ErrorCodes.NOT_FOUND, "Instant prize not found", 404);
        }
        return success(c, instantPrize);
    }
    catch (err) {
        console.error("Error fetching instant prize:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/admin/instant-prizes
app.post("/", async (c) => {
    try {
        const body = await c.req.json();
        await dbConnect();
        const instantPrize = await InstantPrize.create(body);
        return success(c, instantPrize);
    }
    catch (err) {
        console.error("Error creating instant prize:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// PUT /api/admin/instant-prizes/:id
app.put("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        await dbConnect();
        const instantPrize = await InstantPrize.findByIdAndUpdate(id, body, {
            new: true,
        }).lean();
        if (!instantPrize) {
            return error(c, ErrorCodes.NOT_FOUND, "Instant prize not found", 404);
        }
        return success(c, instantPrize);
    }
    catch (err) {
        console.error("Error updating instant prize:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// DELETE /api/admin/instant-prizes/:id
app.delete("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const instantPrize = await InstantPrize.findByIdAndDelete(id);
        if (!instantPrize) {
            return error(c, ErrorCodes.NOT_FOUND, "Instant prize not found", 404);
        }
        return success(c, { success: true });
    }
    catch (err) {
        console.error("Error deleting instant prize:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
export default app;
