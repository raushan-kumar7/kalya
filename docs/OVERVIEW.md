# Kalya — Project Overview

**Ready for tomorrow.**
A personal finance command center for India, built to consolidate income, expenses, assets, liabilities, budgets, goals, insurance, and retirement funds into one clear, calm dashboard.

---

## 1. What This Is

Kalya (formerly "Kaalbyte Finance") is a comprehensive personal finance management application for individuals in India, with an architecture designed to extend to other regions. It replaces the fragmented experience of tracking bank accounts, gold/equity holdings, loans, EMIs, insurance policies, and retirement funds (EPF, PPF, NPS) across a dozen apps and spreadsheets — with a single, automated, insight-driven system.

**Positioning:** Trustworthy and secure, but not corporate or boring. Clear and instructive, but not a spreadsheet dump. Empowering and calm — Kalya reframes daily budgeting as "financial fitness," not a chore.

## 2. Target Audience

**"The Conscious Builder"** — young professionals, salaried individuals, and early-stage families in India, ages 25–45. They earn well, hold fragmented assets and liabilities, and want retirement and family protection sorted — but feel overwhelmed switching between banking apps, broker apps, and insurance portals.

## 3. Core Features

| Area | What it does |
|---|---|
| **Authentication** | Email/password + username sign-up, email verification, password reset, sign-in alerts |
| **Income & Expense Tracking** | Daily transactions, split expenses, recurring expenses, monthly summaries |
| **Budgeting** | Category/bucket-level monthly budgets, overspending alerts |
| **Goals** | Define and track progress toward financial goals (vacation, down payment, etc.) |
| **Assets** | Physical assets (gold, silver) and equity investments |
| **Liabilities** | Loans, credit card debt, EMI calculation, amortization schedules |
| **Insurance & Retirement** | Policy details, EPF/PPF/NPS balances |
| **Accounts** | Bank, cash, wallet, and credit card balance tracking |
| **Reports & Insights** | Auto-generated expense trackers, net worth snapshots, spending trends, budget status, goal progress |
| **Alerts & Notifications** | Budget thresholds, bill due dates, goal milestones, newly detected recurring charges |
| **Data Export/Import** | CSV/OFX export and import *(planned)* |
| **Extensibility** | Custom buckets and asset types for user-defined categorization |

## 4. Brand

- **Name:** Kalya (कल्य) — Sanskrit for "healthy/fit" and "ready for tomorrow, dawn."
- **Metaphor:** Financial health as fitness — daily discipline (cash flow), balance (assets vs. liabilities), and readiness (retirement, insurance).
- **Voice:** Trustworthy & grounded, clear & instructive, empowering & calm, modern & premium. Never bureaucratic, never panic-inducing, never game-like.
- **Taglines:** *"Kalya: Ready for tomorrow."* · *"Consolidate your wealth. Secure your tomorrow."* · *"Your financial fitness command center."*
- **Domains (target):** `kalya.io` / `kalya.finance` primary; `kalya.in` region-specific; `getkalya.com` / `usekalya.com` as launch alternates.
- **Trademark:** No conflicting Class 36 (financial affairs) marks found in India as of this writing — verify with a formal IP India search before filing. Avoid phonetic overlap with "Kalyan Jewellers" / "Kalyan Mutual Fund"; keep spelling strictly **Kalya**.

### Visual Identity

**Fonts**
| Role | Typeface | Notes |
|---|---|---|
| Display | Outfit (600/700) | Hero numbers, page titles, onboarding only |
| Body / UI | Inter (400/500/600) | Everything else — labels, forms, nav |
| Numeric / Data | IBM Plex Mono | All currency amounts, balances, tables — tabular figures for scannability |

**Colors — Light mode**
| Token | Hex | Use |
|---|---|---|
| Primary (Deep Emerald) | `#0D3E26` | Brand, primary actions, nav |
| Accent (Satin Gold) | `#B8912E` | Milestones, goal completion — used sparingly |
| Background | `#F9F8F6` | App canvas |
| Surface | `#FFFFFF` | Cards, sheets, modals |
| Text primary | `#16241D` | Body copy |
| Text secondary | `#4E5D6C` | Labels, meta |
| Success | `#1E7A4C` | Positive net worth trend, income |
| Warning | `#C9862B` | EMI due soon, budget nearing limit |
| Danger | `#B3432D` | Overspend, overdue, liability spike |
| Info | `#3E6B8A` | Neutral insights |

**Colors — Dark mode**
| Token | Hex |
|---|---|
| Background | `#0B1410` |
| Surface | `#131F19` |
| Primary | `#3FA873` |
| Accent | `#E8C468` |
| Text primary | `#F4F2EC` |

Full token set (including subtle/tint variants) lives in `kalya-design-tokens.css`, structured as a Tailwind CSS 4 `@theme` block with a `[data-theme="dark"]` override.

**Design rules:** Gold is a *moment* color (achievements only) — overuse turns the app into a rewards app rather than a wealth command center. Danger red is reserved strictly for liabilities/overspend so it stays meaningful.

## 5. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router, React Server Components) | Server-first rendering, colocated route handlers/server actions, minimal client JS |
| **Database** | SQLite | Zero-ops, file-based, sufficient for single-tenant personal finance data; simple backup/restore |
| **ORM** | Drizzle ORM | Type-safe schema-first queries, lightweight migrations, first-class SQLite support |
| **Auth** | BetterAuth (SQLite adapter) | Modern, type-safe auth with email/password, verification, and session/alert hooks out of the box |
| **Server State** | TanStack Query (React Query) | Caching, refetching, and optimistic updates for server-derived data (transactions, balances, reports) |
| **Client State** | Zustand | Lightweight local/UI state (modals, filters, form drafts) that doesn't belong on the server |
| **Global State** | React Context | Cross-cutting concerns (theme, user session shape) not owned by TanStack Query or Zustand |
| **Styling** | Tailwind CSS 4 | Custom design tokens via `@theme`, utility-first, fast iteration |
| **UI Primitives** | Radix / Base UI (custom wrapped component library) | Accessible, composable primitives as the foundation for Kalya's own component system |
| **Forms** | React Hook Form + Zod | Performant form state + schema validation shared between client and server |
| **Charts** | Recharts (wrapped in a custom `Chart` component) | Net worth trends, spending breakdowns, budget progress visualizations |
| **Animation** | Framer Motion | Deliberate, restrained motion — page transitions, milestone reveals |
| **Email** | React Email + Nodemailer (dev) / Resend (prod) | Verification, password reset, alert emails with a consistent templated design |
| **File Upload** | Local storage (dev) / Cloudinary (prod), behind an abstraction | Insurance documents, asset photos, receipts |
| **i18n** | Next.js built-in i18n | English-first with structure ready for regional language expansion |
| **Tooling** | TypeScript, ESLint, Prettier, Husky, lint-staged, Vitest/Playwright (test skeleton) | Type safety and consistent code quality gates pre-commit |

## 6. Architecture Principles

- **Server-first.** Data fetching and mutations happen on the server via route handlers and server actions. UI is primarily server components; client interactivity is added only where genuinely needed (forms, charts, real-time filters).
- **User-scoped data.** Every financial table carries a `userId` foreign key with `CASCADE` delete — full data isolation per user, and clean account deletion.
- **Modular layers.** Clear separation between schema, queries, actions, Zustand stores, TanStack Query hooks, and UI components — each layer has one job.
- **Extensibility by design.** Custom buckets and asset types, pluggable insight/alert generators, and straightforward Drizzle migrations mean new financial instruments (e.g., a new retirement scheme or asset class) don't require architectural rework.

## 7. Project Setup Log

**Actual versions in use:** Next.js `16.2.10`, React `19.2.4`, Tailwind CSS `4.3.2`.

**Folder structure note:** The project was scaffolded *without* `--src-dir`, so the app lives at `kalya/app/` rather than `kalya/src/app/`. The "modular layers" from Section 6 (`schema/`, `queries/`, `actions/`, `stores/`, `hooks/`, `components/`) sit at the project root alongside `app/`, not nested under `src/`. Keep this consistent across the codebase.

### 7.1 Scaffold the project

```bash
pnpm create next-app@latest . --yes
```

This installs `next`, `react`, `react-dom` as dependencies, and `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `tailwindcss`, `typescript` as dev dependencies, using the `app-tw` template (App Router + Tailwind CSS 4 preconfigured).

### 7.2 Install the rest of the stack

```bash
# Drizzle ORM + SQLite driver
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3

# BetterAuth
pnpm add better-auth

# TanStack Query
pnpm add @tanstack/react-query

# Zustand
pnpm add zustand

# Forms + validation
pnpm add react-hook-form zod @hookform/resolvers

# Charts + animation
pnpm add recharts framer-motion

# Email
pnpm add react-email nodemailer resend

# Dev tooling
pnpm add -D prettier husky lint-staged vitest @playwright/test
```

### 7.3 Initialize Drizzle

```bash
pnpm dlx drizzle-kit init
```

Generates `drizzle.config.ts` and a starter `schema.ts`. Core tables (users, accounts, transactions, budgets, goals, assets, liabilities, insurance policies, retirement funds) follow the `userId` + `CASCADE` pattern from Section 6.

### 7.4 Configure environment

```bash
cp .env.example .env
# fill in: database path, email provider (dev: Nodemailer / prod: Resend),
# Cloudinary credentials (prod only)
```

### 7.5 Run migrations and start the dev server

```bash
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000` and register a new account to get started.

## 8. License

MIT — see `LICENSE` file for details.

---

*This document consolidates the product spec, brand blueprint, and technical architecture as of July 2026. Update alongside major schema, brand, or stack changes.*