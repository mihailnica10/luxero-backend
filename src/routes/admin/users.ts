import { Hono } from "hono";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { error, success } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import { Profile } from "../../models";

const app = new Hono();

app.use("*", requireAdmin);

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

    return success(c, { profiles, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("Error listing profiles:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// Get profile by ID
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const profile = await Profile.findById(id).lean();

    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    return success(c, profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
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
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    return success(c, profile);
  } catch (err) {
    console.error("Error updating profile:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// Delete profile
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const profile = await Profile.findByIdAndDelete(id);

    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting profile:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;