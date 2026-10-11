---
name: kalya-api-server
description: Build and modify the Kalya backend in apps/api-server (TypeScript/Node/Fastify, port 3600, SQLite via Drizzle in packages/db). Use this skill whenever the task involves API endpoints, routes, controllers, services, middleware, auth/JWT, request validation, database queries or migrations, file uploads, logging, env config, or backend errors — even if the user only says "add an endpoint", "save this to the DB", "fix the 500", or "the frontend can't reach the API".
---

# Kalya API Server Skill (`apps/api-server`)

Workflows and architectural standards for `apps/api-server` (Fastify, TypeScript, Node.js, Drizzle ORM SQLite, Zod validation, port 3600).

---

## Architecture: The Strict 4-Layer Rule

Keep backend layers completely segregated:

```txt
HTTP Request
     │
     ▼
[ 1. Routes (Fastify) ]       ── Parse, authenticate, apply Zod request/response schema validation
     │
     ▼
[ 2. Controllers ]            ── Extract params/auth context, invoke service, envelope response
     │
     ▼
[ 3. Services ]               ── Pure business logic, authorization ownership assertions, transactions
     │
     ▼
[ 4. Database Client (Drizzle) ] ── Execute SQL queries against packages/db SQLite instance
```

> **Rules**:
>
> - Routes never query the database directly.
> - Services never touch Fastify `request` or `reply` objects.
> - Services throw typed domain errors (e.g. `BadRequestError`, `NotFoundError`, `UnauthorizedError`).

---

## Directory Map (`apps/api-server/src`)

```txt
src/
├── app.ts                    # Fastify instance builder & plugin registrations
├── index.ts                  # Server entry point listening on port 3600
├── errors/                   # Typed application error classes (AppError, NotFoundError, etc.)
├── libs/
│   ├── mail/                 # Email dispatcher
│   └── storage/              # Local disk & Cloudinary storage drivers
├── modules/
│   ├── auth/                 # Better Auth / JWT authentication routes & hooks
│   ├── finances/             # Budgets, expenses, buckets, categories, splits
│   ├── notifications/        # Alerts dispatcher & notification preferences
│   └── users/                # User directory search, avatars, sessions, profile
└── responses/                # Standardized ApiResponse envelopes (ok, created, error)
```

---

## Standard Error Response Envelopes

Every API endpoint must respond in the standard Kalya envelope:

- **Success (200 / 201)**:

  ```json
  {
    "data": { ... },
    "message": "Entity retrieved or created successfully",
    "timestamp": "2026-10-11T20:20:00.000Z"
  }
  ```

- **Error (400 / 401 / 403 / 404 / 409 / 500)**:

  ```json
  {
    "error": {
      "code": "BAD_REQUEST",
      "message": "Human readable explanation",
      "details": [ ... ]
    },
    "timestamp": "2026-10-11T20:20:00.000Z"
  }
  ```

---

## Workflow: Adding a New Endpoint

1. **Define / Update Validation Schemas**:
   - Add input/output schemas in `packages/validations/src/` (request params, query string, request body).
   - Export corresponding TypeScript interfaces in `packages/types/src/`.
2. **Database Changes (if needed)**:
   - Modify tables in `packages/db/src/schemas/`.
   - Run `pnpm --filter @kalya/db db:generate` followed by `pnpm --filter @kalya/db db:migrate`.
3. **Implement Service Method**:
   - Add business logic in `src/modules/<feature>/<feature>.service.ts`.
   - Assert ownership using `assertEntityOwnership()` to prevent IDOR vulnerabilities.
4. **Implement Controller Action**:
   - Extract user identity: `const userId = this.assertAuthenticatedUserId(request)`.
   - Call service and format response with `ApiResponse.ok(reply, result)` or `ApiResponse.created(reply, result)`.
5. **Register Route**:
   - Declare endpoint in `src/modules/<feature>/<feature>.routes.ts` with Fastify Type Provider Zod schema.
6. **Verify with Typecheck & Tests**:
   - `pnpm --filter @kalya/api-server exec tsc --noEmit`.

---

## Database & Query Guidelines

- **Always Scope by User**: Every financial entity query **must** filter by `userId` to strictly isolate multi-tenant user accounts.
- **Transactions for Multi-Row Writes**: Use `this.db.transaction(async (tx) => { ... })` whenever updating multiple tables (e.g. split expenses + notifications).
- **Rounding Monies**: Always pass amounts through `roundMoney(amount)` from `@kalya/utils` to maintain 2-decimal precision.
- **Never Hand-Edit DB**: Never write directly to `data/kalya.db`. Always use Drizzle migrations.

---

## Verification & Commands

Run from repository root:

```bash
# Typecheck API server
pnpm --filter @kalya/api-server exec tsc --noEmit

# Lint API server
pnpm --filter @kalya/api-server lint

# Start server in dev mode
pnpm --filter @kalya/api-server dev
```
