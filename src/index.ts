import { Hono } from "hono";
import { cors } from "hono/cors";
import adminCategories from "./routes/admin/categories";
import adminCompetitions from "./routes/admin/competitions";
import adminInstantPrizes from "./routes/admin/instant-prizes";
import adminLanguages from "./routes/admin/languages";
import adminOrders from "./routes/admin/orders";
import adminPromoCodes from "./routes/admin/promo-codes";
import adminReferralPurchases from "./routes/admin/referral-purchases";
import adminUsers from "./routes/admin/users";
import auth from "./routes/auth";
import categories from "./routes/categories";
import competitions from "./routes/competitions";
import contact from "./routes/contact";
import content from "./routes/content";
import faq from "./routes/faq";
import meEntries from "./routes/me/entries";
import meOrders from "./routes/me/orders";
import meProfile from "./routes/me/profile";
import meReferrals from "./routes/me/referrals";
import payments from "./routes/payments";
import promoCodes from "./routes/promo-codes";
import stats from "./routes/stats";
import winners from "./routes/winners";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Public
app.route("/api/competitions", competitions);
app.route("/api/categories", categories);
app.route("/api/winners", winners);
app.route("/api/promo-codes", promoCodes);
app.route("/api/stats", stats);
app.route("/api/payments", payments);
app.route("/api/auth", auth);
app.route("/api/contact", contact);
app.route("/api/faq", faq);
app.route("/api/content", content);

// User-protected
app.route("/api/me/orders", meOrders);
app.route("/api/me/entries", meEntries);
app.route("/api/me/profile", meProfile);
app.route("/api/me/referrals", meReferrals);

// Admin
app.route("/api/admin/competitions", adminCompetitions);
app.route("/api/admin/categories", adminCategories);
app.route("/api/admin/orders", adminOrders);
app.route("/api/admin/users", adminUsers);
app.route("/api/admin/promo-codes", adminPromoCodes);
app.route("/api/admin/instant-prizes", adminInstantPrizes);
app.route("/api/admin/referral-purchases", adminReferralPurchases);
app.route("/api/admin/languages", adminLanguages);

export default app;
