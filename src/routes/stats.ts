import { Hono } from "hono";
import dbConnect from "../db";
import { ErrorCodes } from "../lib/error-codes";
import { error, success } from "../lib/response";
import { Entry, Profile, Winner } from "../models";

const app = new Hono();

// Simple in-memory cache for stats (1 minute TTL)
let statsCache: { data: unknown; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

// GET /api/stats
app.get("/", async (c) => {
  try {
    const now = Date.now();
    if (statsCache && statsCache.expiresAt > now) {
      return success(c, statsCache.data);
    }

    await dbConnect();

    const [prizeValueResult, usersResult, entriesResult] = await Promise.all([
      Winner.aggregate([{ $group: { _id: null, total: { $sum: "$prizeValue" } } }]),
      Profile.countDocuments(),
      Entry.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]),
    ]);

    const result = {
      totalPrizeValue: prizeValueResult[0]?.total || 0,
      totalUsers: usersResult,
      totalEntries: entriesResult[0]?.total || 0,
    };

    statsCache = { data: result, expiresAt: now + CACHE_TTL_MS };

    return success(c, result);
  } catch (err) {
    console.error("Error fetching stats:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
