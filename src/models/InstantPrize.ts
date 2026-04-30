import mongoose, { type Document, Schema } from "mongoose";

export type InstantPrizeType = "direct" | "competition_ticket";

export interface IInstantPrize extends Document {
  competitionId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;
  value?: number;
  totalQuantity: number;
  remainingQuantity: number;
  winningTicketNumbers: number[];
  prizeType: InstantPrizeType;
  prizeCompetitionId?: mongoose.Types.ObjectId;
  isActive: boolean;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstantPrizeSchema = new Schema<IInstantPrize>(
  {
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
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

InstantPrizeSchema.index({ competitionId: 1 });
InstantPrizeSchema.index({ isActive: 1 });

export const InstantPrize = mongoose.model<IInstantPrize>("InstantPrize", InstantPrizeSchema);
