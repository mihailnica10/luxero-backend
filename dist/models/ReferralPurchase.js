import mongoose, { Schema } from "mongoose";
const ReferralPurchaseSchema = new Schema({
    referrerId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    purchasedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
ReferralPurchaseSchema.index({ referrerId: 1, purchasedAt: 1 });
export const ReferralPurchase = mongoose.model("ReferralPurchase", ReferralPurchaseSchema);
