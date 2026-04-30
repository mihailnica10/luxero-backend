import mongoose, { Schema } from "mongoose";
const InstantPrizeSchema = new Schema({
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    value: { type: Number },
    totalQuantity: { type: Number, required: true, default: 1 },
    remainingQuantity: { type: Number, required: true, default: 1 },
    winningTicketNumbers: [{ type: Number }],
    prizeType: { type: String, required: true, default: "direct" },
    prizeCompetitionId: { type: Schema.Types.ObjectId, ref: "Competition" },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
InstantPrizeSchema.index({ competitionId: 1 });
InstantPrizeSchema.index({ isActive: 1 });
export const InstantPrize = mongoose.model("InstantPrize", InstantPrizeSchema);
