# Kalya Monorepo — Developer & AI Agent Guidelines (`AGENTS.md`)

Welcome to the **Kalya** personal finance platform repository. This file defines global architectural rules, workspace conventions, and available skills for developers and AI agents working anywhere in this repository.

---

## 1. Monorepo Architecture Map

```txt
kalya/
├── apps/
│   ├── web/             # Next.js 16 App Router, React 19, Tailwind CSS v4, TanStack Query
│   ├── api-server/      # Fastify, TypeScript, Node.js REST API (Port 3600)
│   └── mobile/          # React Native mobile client
├── packages/
│   ├── db/              # Drizzle ORM schema, migrations, SQLite client
│   ├── types/           # Shared domain models, DTOs, interfaces
│   ├── validations/     # Shared Zod validation schemas
│   ├── utils/           # Shared financial math, date, and string utilities
│   ├── env/             # Type-safe environment variables
│   └── email/           # Email templates & React Email components
├── .agents/skills/      # Antigravity Workspace Skills
└── .claude/skills/      # Claude Code Workspace Skills
```

---

## 2. Workspace Skills Quick Reference

When performing specific tasks in this monorepo, reference the corresponding workspace skill:

| Skill                  | Location                                                                                        | Scope & Activation                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **`kalya-web`**        | [kalya-web](file:///d:/Projects/personal/kalya/.agents/skills/kalya-web/SKILL.md)               | Pages, App Router, React components, forms, Tailwind v4 styling, TanStack Query, and frontend API calls in `apps/web`.   |
| **`kalya-api-server`** | [kalya-api-server](file:///d:/Projects/personal/kalya/.agents/skills/kalya-api-server/SKILL.md) | Routes, controllers, services, authentication, Fastify plugins, error envelopes, and API endpoints in `apps/api-server`. |
| **`kalya-db`**         | [kalya-db](file:///d:/Projects/personal/kalya/.agents/skills/kalya-db/SKILL.md)                 | Drizzle ORM schemas, SQLite tables, columns, relations, migrations, and Drizzle Studio in `packages/db`.                 |

---

## 3. Global Development Rules

1. **Package Imports**:
   - Always import shared code via package specifiers (`@kalya/db`, `@kalya/types`, `@kalya/validations`, `@kalya/utils`, `@kalya/env`).
   - **Never deep-import across package source boundaries** (e.g. avoid `import from '../../packages/db/src/...'`).
2. **Strict Layer Separation**:
   - In `apps/web`: Keep page wrappers as Server Components. Place interactive state in client components under `components/`. All network requests go through `libs/api`.
   - In `apps/api-server`: Strict **Route → Controller → Service → Database** separation. Routes parse and validate; services contain business logic; controllers envelope responses.
3. **Financial Precision**:
   - Always sanitize monetary values with `roundMoney()` from `@kalya/utils` to maintain 2-decimal consistency.
4. **TypeScript Strictness**:
   - Zero `any` types. Ensure `pnpm --filter @kalya/web exec tsc --noEmit` and `pnpm --filter @kalya/api-server exec tsc --noEmit` pass with zero errors.
5. **Database Integrity**:
   - Never edit SQLite database files directly. Schema modifications must be performed via Drizzle migrations in `packages/db`.

---

## 4. Key Commands (Repository Root)

```bash
# Start all development services
pnpm dev

# Inspect SQLite database in GUI
pnpm --filter @kalya/db db:studio

# Run migrations
pnpm --filter @kalya/db db:generate
pnpm --filter @kalya/db db:migrate

# Typecheck applications
pnpm --filter @kalya/web exec tsc --noEmit
pnpm --filter @kalya/api-server exec tsc --noEmit
```
