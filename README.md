# Luxero Backend

Hono + MongoDB REST API for Luxero premium prize competitions.

## Setup

```bash
bun install
cp .env.example .env   # set MONGODB_URI, JWT_SECRET, RESEND_API_KEY
```

## Dev

```bash
bun run dev          # tsx watch on port 3000
bun run typecheck    # tsc --noEmit
bun run lint         # biome check
bun run format      # biome format --write
```

## Docker

```bash
docker compose up -d mongodb   # port 27018
```

## Structure

```
src/
├── index.ts           # Bun entry + Hono app
├── db.ts              # MongoDB/Mongoose connection
├── routes/            # API route handlers
├── models/            # Mongoose models
├── middleware/        # JWT auth middleware
├── lib/               # JWT, email, helpers
└── email/             # React Email templates
```

API: http://localhost:3000
