import mongoose, { Schema } from "mongoose";
const LanguageSchema = new Schema({
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    nativeName: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
LanguageSchema.index({ code: 1 }, { unique: true });
export const Language = mongoose.model("Language", LanguageSchema);
