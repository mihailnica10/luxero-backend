import { Hono } from "hono";
import mongoose from "mongoose";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { auth } from "../../middleware/auth";
import { Entry } from "../../models";

const app = new Hono();

app.use("*", auth);

// GET /api/me/entries - user's all entries
app.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    const userId = c.get("userId");
    await dbConnect();

    const [entries, total] = await Promise.all([
      Entry.find({ userId: new mongoose.Types.ObjectId(userId) } as any)
        .populate("competitionId", "title prizeTitle prizeImageUrl status drawDate")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Entry.countDocuments({ userId: new mongoose.Types.ObjectId(userId) } as any),
    ]);

    return paginated(c, entries, total, page, limit);
  } catch (err) {
    console.error("Error fetching entries:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/me/entries/competition/:competitionId - user's entries for a competition
app.get("/competition/:competitionId", async (c) => {
  try {
    const competitionId = c.req.param("competitionId");
    const userId = c.get("userId");
    await dbConnect();

    const entries = await Entry.find({
      userId: new mongoose.Types.ObjectId(userId),
      competitionId: new mongoose.Types.ObjectId(competitionId),
    } as any).lean();

    const totalTickets = entries.reduce((sum, e) => sum + e.quantity, 0);
    const ticketNumbers = entries.flatMap((e) => e.ticketNumbers || []);

    return success(c, { entries, totalTickets, ticketNumbers });
  } catch (err) {
    console.error("Error fetching entries:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
