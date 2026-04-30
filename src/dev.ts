import { serve } from "@hono/node-server";
import app from "./index.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

console.log(`Server running on http://localhost:${PORT}`);
serve({ port: PORT, fetch: app.fetch });
