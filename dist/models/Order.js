import mongoose, { Schema } from "mongoose";
const OrderSchema = new Schema({
    orderNumber: { type: Number, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    status: { type: String, default: "pending", index: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promoCodeId: { type: Schema.Types.ObjectId, ref: "PromoCode" },
    referralBonusTickets: { type: Number, default: 0 },
    referralBalanceUsed: { type: Number, default: 0 },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String },
    paidAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ stripeSessionId: 1 });
export const Order = mongoose.model("Order", OrderSchema);
