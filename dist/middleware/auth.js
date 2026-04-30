import { verifyToken } from "../lib/jwt";
/**
 * Real JWT authentication middleware.
 * Reads Authorization: Bearer <token> header.
 */
export async function auth(c, next) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
        return c.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, 401);
    }
    c.set("userId", payload.userId);
    c.set("isAdmin", payload.isAdmin);
    await next();
}
/**
 * Admin-only guard. Must be used after auth middleware.
 */
export async function requireAdmin(c, next) {
    const isAdmin = c.get("isAdmin");
    if (!isAdmin) {
        return c.json({ error: { code: "FORBIDDEN", message: "Admin access required" } }, 403);
    }
    await next();
}
