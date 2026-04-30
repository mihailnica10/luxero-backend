import mongoose, { type Document, Schema } from "mongoose";

export interface IWinner extends Document {
  competitionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  entryId?: mongoose.Types.ObjectId;
  ticketNumber: number;
  prizeTitle?: string;
  prizeValue?: number;
  prizeImageUrl?: string;
  displayName?: string;
  location?: string;
  testimonial?: string;
  winnerPhotoUrl?: string;
  showFullName: boolean;
  claimed: boolean;
  claimedAt?: Date;
  drawnAt: Date;
  createdAt: Date;
}

const WinnerSchema = new Schema<IWinner>(
  {
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
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

WinnerSchema.index({ competitionId: 1 });
WinnerSchema.index({ userId: 1 });

export const Winner = mongoose.model<IWinner>("Winner", WinnerSchema);
