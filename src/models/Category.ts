import mongoose, { type Document, Schema } from "mongoose";

export interface ICategory extends Document {
  slug: string;
  name: string;
  label: string;
  iconName: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    iconName: { type: String, required: true, default: "Trophy" },
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

CategorySchema.index({ slug: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
