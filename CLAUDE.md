# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this backend repository.

## Project Overview

Hono.js + MongoDB REST API for Luxero premium prize competitions. This is one half of a two-repo setup — see the parent directory's CLAUDE.md for the frontend repo details.

| | |
|---|---|
| Remote | `github.com/mihailnica10/luxero-backend.git` |
| Deploy | Vercel serverless (vercel.json configured) |
| Database | MongoDB via Mongoose |

## Quick Commands

```bash
bun run dev            # tsx watch on port 3000 (local dev)
bun run build          # esbuild bundle to dist/ (for Vercel)
bun run typecheck      # tsc --noEmit
bun run lint            # biome check
docker compose up -d mongodb  # local MongoDB on port 27017
```

## Environment

Copy `.env.example` to `.env` and set:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — for signing/verifying JWTs
- `RESEND_API_KEY` — for transactional email

## Structure

```
src/
├── index.ts       # Hono app entry + all route registrations
├── db.ts         # Mongoose connection
├── routes/       # API route handlers
├── models/       # Mongoose schemas
├── middleware/   # JWT auth middleware
├── lib/          # JWT, email, helpers
└── email/       # React Email templates
```

## Key Routes

| Route | Description |
|---|---|
| `GET /api/competitions` | List competitions with pagination |
| `GET /api/competitions/:slug` | Single competition detail |
| `GET /api/faq` | FAQs by category (`?category=general\|payment\|delivery`) |
| `GET /api/faq/categories` | FAQ category list |
| `GET /api/content/steps` | How It Works steps |
| `GET /api/content/features` | Why Choose Luxero features |
| `GET /api/winners` | Winner listings + stats |
| `POST /api/auth/*` | Authentication |
| `GET /api/me/*` | User-protected: orders, entries, profile |
| `GET /api/admin/*` | Admin-protected: competitions, orders, users |

## Development Notes

- Use **bun** as package manager
- CORS is open (`origin: "*"`) — admin routes require JWT in `Authorization: Bearer <token>` header
- `dist/` is gitignored but IS deployed (configured via `vercel.json` `outputDirectory`) — it is the esbuild serverless output
- MongoDB connection format: `mongodb://user:pass@host:27017/dbname?ssl=true` (Atlas/remote) or `mongodb://localhost:27017/luxero` (local)