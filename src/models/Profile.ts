import mongoose, { type Document, Schema } from "mongoose";

export interface IProfile extends Document {
  email: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: Date;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country: string;
  isAdmin: boolean;
  isVerified: boolean;
  marketingConsent: boolean;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  websiteUrl?: string;
  showLastName: boolean;
  showLocation: boolean;
  showSocials: boolean;
  totalEntries: number;
  totalSpent: number;
  winsCount: number;
  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId;
  referralCount: number;
  referralBalance: number;
  referralPayout: number;
  referralTierPendingTickets: number;
  referralTierAwardedTickets: number;
  referralTierLastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    email: { type: String, required: true, index: true },
    fullName: { type: String },
    avatarUrl: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    postcode: { type: String },
    country: { type: String, default: "GB" },
    isAdmin: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: false },
    marketingConsent: { type: Boolean, default: false },
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
    websiteUrl: { type: String },
    showLastName: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: false },
    showSocials: { type: Boolean, default: false },
    totalEntries: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    winsCount: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "Profile", index: true },
    referralCount: { type: Number, default: 0 },
    referralBalance: { type: Number, default: 0 },
    referralPayout: { type: Number, default: 0 },
    referralTierPendingTickets: { type: Number, default: 0 },
    referralTierAwardedTickets: { type: Number, default: 0 },
    referralTierLastUpdated: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

ProfileSchema.index({ email: 1 });
ProfileSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
