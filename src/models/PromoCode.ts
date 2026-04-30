import mongoose, { type Document, Schema } from "mongoose";

export type DiscountType = "percentage" | "fixed";

export interface IPromoCode extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  currentUses: number;
  maxUsesPerUser: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  createdAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, index: true },
    discountType: { type: String, required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number },
    maxUses: { type: Number },
    currentUses: { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 1 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

PromoCodeSchema.index({ code: 1 }, { unique: true });
PromoCodeSchema.index({ isActive: 1 });

export const PromoCode = mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);
