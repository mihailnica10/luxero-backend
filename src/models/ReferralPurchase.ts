import mongoose, { type Document, Schema } from "mongoose";

export interface IReferralPurchase extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  purchasedAt: Date;
  createdAt: Date;
}

const ReferralPurchaseSchema = new Schema<IReferralPurchase>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    purchasedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

ReferralPurchaseSchema.index({ referrerId: 1, purchasedAt: 1 });

export const ReferralPurchase = mongoose.model<IReferralPurchase>(
  "ReferralPurchase",
  ReferralPurchaseSchema
);
