import { Hono } from "hono";
import dbConnect from "../../db";
import { ErrorCodes } from "../../lib/error-codes";
import { parsePagination } from "../../lib/pagination";
import { error, paginated, success } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import { Category } from "../../models";

const app = new Hono();

app.use("*", requireAdmin);

// GET /api/admin/categories
app.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await dbConnect();

    const query: Record<string, unknown> = {};
    const isActive = c.req.query("isActive");
    if (isActive !== undefined) query.isActive = isActive === "true";

    const [categories, total] = await Promise.all([
      Category.find(query).sort({ displayOrder: 1 }).skip(skip).limit(limit).lean(),
      Category.countDocuments(query),
    ]);

    return paginated(c, categories, total, page, limit);
  } catch (err) {
    console.error("Error listing categories:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/admin/categories/:id
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const category = await Category.findById(id).lean();

    if (!category) {
      return error(c, ErrorCodes.NOT_FOUND, "Category not found", 404);
    }

    return success(c, category);
  } catch (err) {
    console.error("Error fetching category:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// POST /api/admin/categories
app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    await dbConnect();

    const category = await Category.create(body);
    return success(c, category);
  } catch (err) {
    console.error("Error creating category:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// PUT /api/admin/categories/:id
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    await dbConnect();

    const category = await Category.findByIdAndUpdate(id, body, { new: true }).lean();

    if (!category) {
      return error(c, ErrorCodes.NOT_FOUND, "Category not found", 404);
    }

    return success(c, category);
  } catch (err) {
    console.error("Error updating category:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// DELETE /api/admin/categories/:id
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return error(c, ErrorCodes.NOT_FOUND, "Category not found", 404);
    }

    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
