import mongoose, { type Document, Schema } from "mongoose";

export interface IEntry extends Document {
  userId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  ticketNumbers: number[];
  quantity: number;
  answerIndex?: number;
  answerCorrect?: boolean;
  createdAt: Date;
}

const EntrySchema = new Schema<IEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    ticketNumbers: [{ type: Number }],
    quantity: { type: Number, required: true },
    answerIndex: { type: Number },
    answerCorrect: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

EntrySchema.index({ userId: 1, competitionId: 1 });
EntrySchema.index({ orderId: 1 });

export const Entry = mongoose.model<IEntry>("Entry", EntrySchema);
