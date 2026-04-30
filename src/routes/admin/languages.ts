import { Hono } from "hono";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import { Language } from "../../models";

const app = new Hono();

app.use("*", requireAdmin);

// GET /api/admin/languages
app.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await dbConnect();

    const query: Record<string, unknown> = {};
    const isActive = c.req.query("isActive");
    if (isActive !== undefined) query.isActive = isActive === "true";

    const [languages, total] = await Promise.all([
      Language.find(query as any)
        .sort({ displayOrder: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Language.countDocuments(query as any),
    ]);

    return paginated(c, languages, total, page, limit);
  } catch (err) {
    console.error("Error listing languages:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/admin/languages/:id
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const language = await Language.findById(id).lean();

    if (!language) {
      return error(c, ErrorCodes.NOT_FOUND, "Language not found", 404);
    }

    return success(c, language);
  } catch (err) {
    console.error("Error fetching language:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// POST /api/admin/languages
app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    await dbConnect();

    const language = await Language.create(body);
    return success(c, language);
  } catch (err) {
    console.error("Error creating language:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// PUT /api/admin/languages/:id
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    await dbConnect();

    const language = await Language.findByIdAndUpdate(id, body as any, { new: true }).lean();

    if (!language) {
      return error(c, ErrorCodes.NOT_FOUND, "Language not found", 404);
    }

    return success(c, language);
  } catch (err) {
    console.error("Error updating language:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// DELETE /api/admin/languages/:id
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const language = await Language.findByIdAndDelete(id);

    if (!language) {
      return error(c, ErrorCodes.NOT_FOUND, "Language not found", 404);
    }

    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting language:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
