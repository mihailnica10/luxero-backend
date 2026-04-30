import mongoose, { type Document, Schema } from "mongoose";

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ticketNumbers?: number[];
  answerIndex?: number;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    ticketNumbers: [{ type: Number }],
    answerIndex: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ competitionId: 1 });

export const OrderItem = mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);
