import { render } from "@react-email/render";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import dbConnect from "../db";
import { sendEmail } from "../email/client";
import { EmailVerificationEmail } from "../email/templates/email-verification";
import { PasswordResetEmail } from "../email/templates/password-reset";
import { ErrorCodes } from "../lib/error-codes";
import { signToken, verifyToken } from "../lib/jwt";
import { error, success } from "../lib/response";
import { Profile, User } from "../models";
const app = new Hono();
// POST /api/auth/register
app.post("/register", async (c) => {
    try {
        const { email, password, fullName } = await c.req.json();
        if (!email || !password) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Email and password are required", 400);
        }
        if (password.length < 8) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Password must be at least 8 characters", 400);
        }
        await dbConnect();
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return error(c, ErrorCodes.CONFLICT, "An account with this email already exists", 409);
        }
        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash: password,
            isVerified: false,
        });
        // Create Profile for the user
        await Profile.create({
            _id: user._id,
            email: email.toLowerCase(),
            fullName: fullName || undefined,
            country: "GB",
        });
        // Generate 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await user.setVerificationCode(code);
        // Send verification email
        const userName = fullName || email.split("@")[0];
        const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`;
        try {
            const emailHtml = await render(EmailVerificationEmail({ userName, code, verificationUrl }));
            await sendEmail({
                to: email.toLowerCase(),
                subject: "Verify your email — Luxero",
                html: emailHtml,
            });
        }
        catch (emailErr) {
            console.error("Failed to send verification email:", emailErr);
            // Don't fail registration if email fails — code is still in DB
        }
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            isAdmin: user.isAdmin,
        });
        return success(c, {
            token,
            user: { id: user._id, email: user.email, isAdmin: user.isAdmin, isVerified: user.isVerified },
        });
    }
    catch (err) {
        console.error("Register error:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/auth/login
app.post("/login", async (c) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Email and password are required", 400);
        }
        await dbConnect();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return error(c, ErrorCodes.UNAUTHORIZED, "Invalid email or password", 401);
        }
        const valid = await user.comparePassword(password);
        if (!valid) {
            return error(c, ErrorCodes.UNAUTHORIZED, "Invalid email or password", 401);
        }
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            isAdmin: user.isAdmin,
        });
        return success(c, {
            token,
            user: { id: user._id, email: user.email, isAdmin: user.isAdmin, isVerified: user.isVerified },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/auth/verify-email
app.post("/verify-email", async (c) => {
    try {
        const { email, code } = await c.req.json();
        if (!email || !code) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Email and code are required", 400);
        }
        await dbConnect();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return error(c, ErrorCodes.NOT_FOUND, "User not found", 404);
        }
        if (user.isVerified) {
            return success(c, { message: "Email already verified" });
        }
        if (!user.verificationCode || !user.verificationExpiry) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "No verification code found. Please request a new one.", 400);
        }
        if (new Date() > user.verificationExpiry) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Verification code has expired", 400);
        }
        const valid = await bcrypt.compare(code, user.verificationCode);
        if (!valid) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Invalid verification code", 400);
        }
        user.isVerified = true;
        user.clearVerificationCode();
        await user.save();
        return success(c, { message: "Email verified successfully" });
    }
    catch (err) {
        console.error("Verify email error:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/auth/resend-verification
app.post("/resend-verification", async (c) => {
    try {
        const { email } = await c.req.json();
        if (!email) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Email is required", 400);
        }
        await dbConnect();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal whether user exists
            return success(c, { message: "If an account exists, a new verification code has been sent" });
        }
        if (user.isVerified) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Email is already verified", 400);
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await user.setVerificationCode(code);
        // Get user's fullName from Profile if available
        let userName = email.split("@")[0];
        try {
            const profile = await Profile.findById(user._id).lean();
            if (profile?.fullName)
                userName = profile.fullName;
        }
        catch { }
        const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`;
        try {
            const emailHtml = await render(EmailVerificationEmail({ userName, code, verificationUrl }));
            await sendEmail({
                to: email.toLowerCase(),
                subject: "Resend: Verify your email — Luxero",
                html: emailHtml,
            });
        }
        catch (emailErr) {
            console.error("Failed to send verification email:", emailErr);
        }
        return success(c, { message: "If an account exists, a new verification code has been sent" });
    }
    catch (err) {
        console.error("Resend verification error:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/auth/forgot-password
app.post("/forgot-password", async (c) => {
    try {
        const { email } = await c.req.json();
        if (!email) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Email is required", 400);
        }
        await dbConnect();
        const user = await User.findOne({ email: email.toLowerCase() });
        // Always return success to prevent email enumeration attacks
        if (!user) {
            return success(c, { message: "If an account exists, a reset email has been sent" });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await user.setResetCode(code);
        await user.save();
        // Get user's fullName from Profile if available
        let userName = email.split("@")[0];
        try {
            const profile = await Profile.findById(user._id).lean();
            if (profile?.fullName)
                userName = profile.fullName;
        }
        catch { }
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/reset-password?email=${encodeURIComponent(email)}&code=${code}`;
        try {
            const emailHtml = await render(PasswordResetEmail({ userName, code, resetUrl }));
            await sendEmail({
                to: email.toLowerCase(),
                subject: "Reset your password — Luxero",
                html: emailHtml,
            });
        }
        catch (emailErr) {
            console.error("Failed to send password reset email:", emailErr);
        }
        return success(c, { message: "If an account exists, a reset email has been sent" });
    }
    catch (err) {
        console.error("Forgot password error:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// POST /api/auth/reset-password
app.post("/reset-password", async (c) => {
    try {
        const { email, code, newPassword } = await c.req.json();
        if (!email || !code || !newPassword) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Email, code, and newPassword are required", 400);
        }
        if (newPassword.length < 8) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Password must be at least 8 characters", 400);
        }
        await dbConnect();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return error(c, ErrorCodes.NOT_FOUND, "User not found", 404);
        }
        if (!user.resetCode || !user.resetExpiry) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "No reset code found. Please request a new one.", 400);
        }
        if (new Date() > user.resetExpiry) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Reset code has expired", 400);
        }
        const valid = await bcrypt.compare(code, user.resetCode);
        if (!valid) {
            return error(c, ErrorCodes.VALIDATION_ERROR, "Invalid reset code", 400);
        }
        user.passwordHash = newPassword;
        user.clearResetCode();
        await user.save();
        return success(c, { message: "Password reset successfully" });
    }
    catch (err) {
        console.error("Reset password error:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
// GET /api/auth/me — protected
app.get("/me", async (c) => {
    try {
        const authHeader = c.req.header("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return error(c, ErrorCodes.UNAUTHORIZED, "Authentication required", 401);
        }
        const token = authHeader.slice(7);
        const payload = verifyToken(token);
        if (!payload) {
            return error(c, ErrorCodes.UNAUTHORIZED, "Invalid or expired token", 401);
        }
        await dbConnect();
        const user = await User.findById(payload.userId).lean();
        if (!user) {
            return error(c, ErrorCodes.NOT_FOUND, "User not found", 404);
        }
        return success(c, {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
        });
    }
    catch (err) {
        console.error("Get me error:", err);
        return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
});
export default app;
