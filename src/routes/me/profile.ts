import { Hono } from "hono";
import mongoose from "mongoose";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { auth } from "../../middleware/auth";
import { Profile, User } from "../../models";

const app = new Hono();

app.use("*", auth);

// GET /api/me/profile
app.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    await dbConnect();

    let profile = await Profile.findById(userId).lean();
    // If no profile exists (legacy user), create one on-demand
    if (!profile) {
      const user = await User.findById(userId).lean();
      if (!user) {
        return error(c, ErrorCodes.NOT_FOUND, "User not found", 404);
      }
      profile = await Profile.create({
        _id: userId,
        email: user.email,
        country: "GB",
      });
    }

    return success(c, profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// PUT /api/me/profile
app.put("/", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    await dbConnect();

    const allowedFields = [
      "fullName",
      "phone",
      "dateOfBirth",
      "addressLine1",
      "addressLine2",
      "city",
      "postcode",
      "country",
      "marketingConsent",
      "instagram",
      "facebook",
      "twitter",
      "tiktok",
      "youtube",
      "websiteUrl",
      "showLastName",
      "showLocation",
      "showSocials",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const profile = await Profile.findByIdAndUpdate(userId, updateData as any, {
      new: true,
      runValidators: true,
    }).lean();

    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    return success(c, profile);
  } catch (err) {
    console.error("Error updating profile:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/me/wins - user's wins (via Winner model linked to their Profile)
app.get("/wins", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    const userId = c.get("userId");
    await dbConnect();

    const [wins, total] = await Promise.all([
      mongoose
        .model("Winner")
        .find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate("competitionId", "title prizeTitle prizeImageUrl drawDate")
        .sort({ drawnAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      mongoose.model("Winner").countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
    ]);

    return paginated(c, wins, total, page, limit);
  } catch (err) {
    console.error("Error fetching wins:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/me/stats - quick stats for dashboard
app.get("/stats", async (c) => {
  try {
    const userId = c.get("userId");
    await dbConnect();

    const profile = await Profile.findById(userId).lean();
    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    const entriesCount = await mongoose
      .model("Entry")
      .countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    const winsCount = await mongoose
      .model("Winner")
      .countDocuments({ userId: new mongoose.Types.ObjectId(userId) });

    return success(c, {
      activeEntries: entriesCount,
      totalWins: winsCount,
      totalSpent: profile.totalSpent || 0,
      totalEntries: profile.totalEntries || 0,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
