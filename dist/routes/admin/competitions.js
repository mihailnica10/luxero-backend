import { Hono } from "hono";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import { Competition, Entry, Winner } from "../../models";
const app = new Hono();
app.use("*", requireAdmin);
// GET /api/admin/competitions
app.get("/", async (c) => {
    try {
        const { limit, page, skip } = parsePagination(c);
        await dbConnect();
        const query = {};
        const status = c.req.query("status");
        if (status)
            query.status = status;
        const [competitions, total] = await Promise.all([
            Competition.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Competition.countDocuments(query),
        ]);
        return paginated(c, competitions, total, page, limit);
    }
    catch (err) {
        console.error("Error listing competitions:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// GET /api/admin/competitions/:id
app.get("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const competition = await Competition.findById(id).lean();
        if (!competition) {
            return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
        }
        return success(c, competition);
    }
    catch (err) {
        console.error("Error fetching competition:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/admin/competitions
app.post("/", async (c) => {
    try {
        const body = await c.req.json();
        await dbConnect();
        const competition = await Competition.create(body);
        return success(c, competition);
    }
    catch (err) {
        console.error("Error creating competition:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// PUT /api/admin/competitions/:id
app.put("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        await dbConnect();
        const competition = await Competition.findByIdAndUpdate(id, body, { new: true }).lean();
        if (!competition) {
            return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
        }
        return success(c, competition);
    }
    catch (err) {
        console.error("Error updating competition:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// DELETE /api/admin/competitions/:id
app.delete("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const competition = await Competition.findByIdAndDelete(id);
        if (!competition) {
            return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
        }
        return success(c, { success: true });
    }
    catch (err) {
        console.error("Error deleting competition:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/admin/competitions/:id/draw
app.post("/:id/draw", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const competition = await Competition.findById(id).lean();
        if (!competition) {
            return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
        }
        if (competition.status !== "ended") {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Competition must be ended to draw a winner", 400);
        }
        const entries = await Entry.find({ competitionId: id }).lean();
        if (entries.length === 0) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "No entries found for this competition", 400);
        }
        const randomIndex = Math.floor(Math.random() * entries.length);
        const winningEntry = entries[randomIndex];
        const winner = await Winner.create({
            competitionId: competition._id,
            userId: winningEntry.userId,
            entryId: winningEntry._id,
            drawnAt: new Date(),
        });
        await Competition.findByIdAndUpdate(id, { status: "drawn" });
        return success(c, { winner, competition, winningEntry });
    }
    catch (err) {
        console.error("Error drawing winner:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
export default app;
