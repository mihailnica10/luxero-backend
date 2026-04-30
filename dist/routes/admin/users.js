import { Hono } from "hono";
import dbConnect from "../../db";
import { Profile } from "../../models";
const app = new Hono();
// List all profiles
app.get("/", async (c) => {
    try {
        const limit = parseInt(c.req.query("limit") || "50", 10);
        const page = parseInt(c.req.query("page") || "1", 10);
        const skip = (page - 1) * limit;
        await dbConnect();
        const [profiles, total] = await Promise.all([
            Profile.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Profile.countDocuments(),
        ]);
        return c.json({
            profiles,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.error("Error listing profiles:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});
// Get profile by ID
app.get("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const profile = await Profile.findById(id).lean();
        if (!profile) {
            return c.json({ error: "Profile not found" }, 404);
        }
        return c.json(profile);
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});
// Update profile
app.put("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        await dbConnect();
        const profile = await Profile.findByIdAndUpdate(id, body, { new: true }).lean();
        if (!profile) {
            return c.json({ error: "Profile not found" }, 404);
        }
        return c.json(profile);
    }
    catch (error) {
        console.error("Error updating profile:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});
// Delete profile
app.delete("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        await dbConnect();
        const profile = await Profile.findByIdAndDelete(id);
        if (!profile) {
            return c.json({ error: "Profile not found" }, 404);
        }
        return c.json({ success: true });
    }
    catch (error) {
        console.error("Error deleting profile:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});
export default app;
