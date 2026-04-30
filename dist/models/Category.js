import mongoose, { Schema } from "mongoose";
const CategorySchema = new Schema({
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    iconName: { type: String, required: true, default: "Trophy" },
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
CategorySchema.index({ slug: 1 }, { unique: true });
export const Category = mongoose.model("Category", CategorySchema);
