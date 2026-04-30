import mongoose, { Schema } from "mongoose";
const WinnerSchema = new Schema({
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    entryId: { type: Schema.Types.ObjectId, ref: "Entry" },
    ticketNumber: { type: Number, required: true },
    prizeTitle: { type: String },
    prizeValue: { type: Number },
    prizeImageUrl: { type: String },
    displayName: { type: String },
    location: { type: String },
    testimonial: { type: String },
    winnerPhotoUrl: { type: String },
    showFullName: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    drawnAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
WinnerSchema.index({ competitionId: 1 });
WinnerSchema.index({ userId: 1 });
export const Winner = mongoose.model("Winner", WinnerSchema);
