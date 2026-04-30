import jwt from "jsonwebtoken";
const JWT_SECRET = (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET environment variable is required in production");
    }
    return secret || "dev-secret-do-not-use-in-production";
})();
const JWT_EXPIRY = "7d";
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
