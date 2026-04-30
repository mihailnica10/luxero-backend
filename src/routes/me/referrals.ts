import { Hono } from "hono";
import mongoose from "mongoose";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { error, success } from "../../lib/response";
import { auth } from "../../middleware/auth";
import { Profile, ReferralPurchase } from "../../models";

const app = new Hono();

app.use("*", auth);

// GET /api/me/referrals
app.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    await dbConnect();

    const profile = await Profile.findById(userId).lean();
    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    // Get total referral count from profile
    const totalReferralCount = profile.referralCount || 0;

    // Get active referrals (purchases in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activePurchases = await ReferralPurchase.find({
      referrerId: new mongoose.Types.ObjectId(userId),
      purchasedAt: { $gte: thirtyDaysAgo },
    }).lean();

    const activeReferralCount = activePurchases.length;

    // Calculate tier (5=2tix, 10=5tix, 15=10tix)
    let tierTickets = 0;
    if (activeReferralCount >= 15) tierTickets = 10;
    else if (activeReferralCount >= 10) tierTickets = 5;
    else if (activeReferralCount >= 5) tierTickets = 2;

    const referralsToNextTier =
      activeReferralCount < 5 ? 5 - activeReferralCount
      : activeReferralCount < 10 ? 10 - activeReferralCount
      : activeReferralCount < 15 ? 15 - activeReferralCount
      : 0;

    // Get recent referrals (profiles referred by this user)
    const recentReferrals = await Profile.find({ referredBy: userId })
      .select("fullName email createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get top referrers leaderboard
    const leaderboard = await Profile.find({ referralCount: { $gt: 0 } })
      .select("fullName email referralCount")
      .sort({ referralCount: -1 })
      .limit(10)
      .lean();

    return success(c, {
      referralCode: profile.referralCode || null,
      totalReferralCount,
      activeReferralCount,
      tierTickets,
      referralsToNextTier,
      pendingTickets: profile.referralTierPendingTickets || 0,
      totalAwardedTickets: profile.referralTierAwardedTickets || 0,
      recentReferrals: recentReferrals.map((r) => ({
        id: r._id.toString(),
        name: r.fullName || r.email?.split("@")[0] || "Anonymous",
        email: r.email,
        joinedAt: r.createdAt,
      })),
      leaderboard: leaderboard.map((l, i) => ({
        rank: i + 1,
        name: l.fullName || l.email?.split("@")[0] || "Anonymous",
        count: l.referralCount,
      })),
    });
  } catch (err) {
    console.error("Error fetching referrals:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;