import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationExpiry: { type: Date },
    resetCode: { type: String },
    resetExpiry: { type: Date },
}, { timestamps: true });
UserSchema.pre("save", async function () {
    if (this.isModified("passwordHash") && !this.passwordHash.startsWith("$2")) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    }
});
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};
UserSchema.methods.setVerificationCode = async function (code) {
    const hash = await bcrypt.hash(code, 10);
    this.verificationCode = hash;
    this.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
};
UserSchema.methods.clearVerificationCode = function () {
    this.verificationCode = undefined;
    this.verificationExpiry = undefined;
};
UserSchema.methods.setResetCode = async function (code) {
    const hash = await bcrypt.hash(code, 10);
    this.resetCode = hash;
    this.resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
};
UserSchema.methods.clearResetCode = function () {
    this.resetCode = undefined;
    this.resetExpiry = undefined;
};
export const User = mongoose.model("User", UserSchema);
