import { Hono } from "hono";
import dbConnect from "../db";
import { ErrorCodes } from "../lib/error-codes";
import { parsePagination } from "../lib/pagination";
import { error, paginated, success } from "../lib/response";
import { Competition } from "../models";

const app = new Hono();

// GET /api/competitions - list active competitions
app.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await dbConnect();

    const query: Record<string, unknown> = {};
    const status = c.req.query("status");
    if (status) {
      query.status = status;
    } else {
      query.status = "active";
    }

    const category = c.req.query("category");
    if (category) query.category = category;

    const exclude = c.req.query("exclude");
    if (exclude) query._id = { $ne: exclude };

    const [competitions, total] = await Promise.all([
      Competition.find(query).sort({ displayOrder: 1, drawDate: 1 }).skip(skip).limit(limit).lean(),
      Competition.countDocuments(query),
    ]);

    return paginated(c, competitions, total, page, limit);
  } catch (err) {
    console.error("Error fetching competitions:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/competitions/featured
app.get("/featured", async (c) => {
  try {
    await dbConnect();

    const competitions = await Competition.find({
      status: "active",
      isFeatured: true,
    })
      .sort({ displayOrder: 1, drawDate: 1 })
      .limit(6)
      .lean();

    return success(c, competitions);
  } catch (err) {
    console.error("Error fetching featured competitions:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/competitions/categories (must come before /:slug)
app.get("/categories", async (c) => {
  try {
    await dbConnect();

    const categories = await Competition.distinct("category", {
      status: "active",
    });

    return success(c, categories.filter(Boolean));
  } catch (err) {
    console.error("Error fetching categories:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/competitions/:slug
app.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    await dbConnect();

    const competition = await Competition.findOne({ slug }).lean();

    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }

    return success(c, competition);
  } catch (err) {
    console.error("Error fetching competition:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/competitions/:id/availability
app.get("/:id/availability", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    const competition = await Competition.findById(id)
      .select("maxTickets ticketsSold maxTicketsPerUser status")
      .lean();

    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }

    const ticketsSold = competition.ticketsSold ?? 0;
    const maxTickets = competition.maxTickets;

    return success(c, {
      available: maxTickets - ticketsSold,
      total: maxTickets,
      sold: ticketsSold,
      percentageSold: Math.round((ticketsSold / maxTickets) * 100),
      maxPerUser: competition.maxTicketsPerUser,
      isActive: competition.status === "active",
    });
  } catch (err) {
    console.error("Error fetching availability:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/competitions/categories
app.get("/categories", async (c) => {
  try {
    await dbConnect();

    const categories = await Competition.distinct("category", {
      status: "active",
    });

    return success(c, categories.filter(Boolean));
  } catch (err) {
    console.error("Error fetching categories:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
