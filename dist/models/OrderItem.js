import mongoose, { Schema } from "mongoose";
const OrderItemSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    ticketNumbers: [{ type: Number }],
    answerIndex: { type: Number },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ competitionId: 1 });
export const OrderItem = mongoose.model("OrderItem", OrderItemSchema);
