# Kalya (कल्य)

**Ready for tomorrow.**
A comprehensive personal finance management app for India — income, expenses, budgets, goals, assets, liabilities, insurance, and retirement (EPF/PPF/NPS) in one calm, automated dashboard.

For the full product spec, brand voice, and design tokens, see [`docs/OVERVIEW.md`](./docs/OVERVIEW.md) and [`docs/BRAND.md`](./docs/BRAND.md).

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components)
- **Database:** SQLite via `better-sqlite3`
- **ORM:** Drizzle ORM
- **Auth:** BetterAuth
- **Server state:** TanStack Query
- **Client state:** Zustand
- **Styling:** Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Animation:** Framer Motion
- **Email:** React Email + Nodemailer (dev) / Resend (prod)

Full rationale for each choice is in [`docs/OVERVIEW.md`](./docs/OVERVIEW.md#5-technology-stack).

## Prerequisites

- Node.js 20+
- pnpm 10+

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# fill in: database path, email provider (dev: Nodemailer / prod: Resend),
# Cloudinary credentials (prod only)

# Run database migrations
pnpm db:migrate

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and register a new account.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format the codebase with Prettier |
| `pnpm format:check` | Check formatting without writing changes |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm test` | Run the Vitest test suite |

> Some scripts above (`db:migrate`, `test`) may need to be added to `package.json` if not already present — check before relying on them.

## Project Structure

```
kalya/
├── docs/
│   ├── OVERVIEW.md       # Product spec, brand, tech stack, architecture
│   └── BRAND.md          # Full brand blueprint & design tokens
├── src/
│   ├── app/               # Next.js App Router routes & layouts
│   ├── styles/            # globals.css, kalya.css (design tokens)
│   ├── schema/             # Drizzle table schemas
│   ├── queries/            # Read-only DB queries
│   ├── actions/            # Server actions (mutations)
│   ├── stores/              # Zustand stores
│   ├── hooks/                # TanStack Query hooks, shared client hooks
│   └── components/           # UI component library
├── drizzle.config.ts
├── eslint.config.mjs
├── .prettierrc.json
└── package.json
```

## Code Quality

- **ESLint** (`eslint-config-next` + `eslint-config-prettier`) for linting
- **Prettier** (with `prettier-plugin-tailwindcss`) for formatting
- **Husky + lint-staged** run linting and formatting automatically on commit

## Architecture Principles

- **Server-first** — data fetching and mutations happen via server actions and route handlers; client components are added only where interactivity is genuinely needed.
- **User-scoped data** — every financial table carries a `userId` foreign key with `CASCADE` delete.
- **Modular layers** — schema, queries, actions, stores, hooks, and components are kept strictly separate.

See [`docs/OVERVIEW.md`](./docs/OVERVIEW.md#6-architecture-principles) for details.

## License

MIT — see [`LICENSE`](./LICENSE) for details.