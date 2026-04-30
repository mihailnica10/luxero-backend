import mongoose, { Schema } from "mongoose";
const EntrySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    ticketNumbers: [{ type: Number }],
    quantity: { type: Number, required: true },
    answerIndex: { type: Number },
    answerCorrect: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
EntrySchema.index({ userId: 1, competitionId: 1 });
EntrySchema.index({ orderId: 1 });
export const Entry = mongoose.model("Entry", EntrySchema);
