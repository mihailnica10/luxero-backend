import mongoose, { Schema } from "mongoose";
const InstantPrizeWinSchema = new Schema({
    instantPrizeId: {
        type: Schema.Types.ObjectId,
        ref: "InstantPrize",
        required: true,
        index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    entryId: { type: Schema.Types.ObjectId, ref: "Entry" },
    ticketNumber: { type: Number },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    shippingAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        postcode: String,
        country: String,
    },
    wonAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
InstantPrizeWinSchema.index({ userId: 1 });
InstantPrizeWinSchema.index({ instantPrizeId: 1 });
export const InstantPrizeWin = mongoose.model("InstantPrizeWin", InstantPrizeWinSchema);
