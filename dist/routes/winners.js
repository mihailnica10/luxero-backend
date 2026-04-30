import { Hono } from "hono";
import dbConnect from "../db";
import { ErrorCodes } from "../lib/error-codes";
import { parsePagination } from "../lib/pagination";
import { error, paginated, success } from "../lib/response";
import { Winner } from "../models";
const app = new Hono();
// GET /api/winners - recent winners
app.get("/", async (c) => {
    try {
        const { limit, page, skip } = parsePagination(c);
        await dbConnect();
        const [winners, total] = await Promise.all([
            Winner.find()
                .sort({ drawnAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Winner.countDocuments(),
        ]);
        return paginated(c, winners, total, page, limit);
    }
    catch (err) {
        console.error("Error fetching winners:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// GET /api/winners/competition/:competitionId
app.get("/competition/:competitionId", async (c) => {
    try {
        const competitionId = c.req.param("competitionId");
        await dbConnect();
        const winners = await Winner.find({ competitionId })
            .populate("userId", "fullName avatarUrl")
            .lean();
        return success(c, winners);
    }
    catch (err) {
        console.error("Error fetching competition winners:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// GET /api/winners/stats
app.get("/stats", async (c) => {
    try {
        await dbConnect();
        const winnersCount = await Winner.countDocuments();
        const prizeAgg = await Winner.aggregate([
            { $group: { _id: null, total: { $sum: "$prizeValue" } } },
        ]).exec();
        return success(c, {
            totalWinners: winnersCount,
            totalPrizeValue: prizeAgg[0]?.total || 0,
            totalWinnersAllTime: winnersCount,
        });
    }
    catch (err) {
        console.error("Error fetching winner stats:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
export default app;
