# @kalya/web

Modern, privacy-focused, and beautifully designed personal finance web application for the Kalya platform. Built with Next.js 16 App Router, React 19, Tailwind CSS v4, TanStack Query, and Zustand.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Directory Structure](#-directory-structure)
- [Application Modules & Pages](#-application-modules--pages)
  - [1. Marketing & Public Experience](#1-marketing--public-experience)
  - [2. Authentication & Identity](#2-authentication--identity)
  - [3. Financial Overview & KPI Deck](#3-financial-overview--kpi-deck)
  - [4. Transactions & Ledger](#4-transactions--ledger)
  - [5. Budgets & Allocation Buckets (50/30/20)](#5-budgets--allocation-buckets-503020)
  - [6. Collaborative Bill Splitting & Settlements](#6-collaborative-bill-splitting--settlements)
  - [7. Financial Goals & Timeline Pacing](#7-financial-goals--timeline-pacing)
  - [8. Multi-Asset Portfolio Tracker](#8-multi-asset-portfolio-tracker)
  - [9. Insights, Statements & Document Exports](#9-insights-statements--document-exports)
  - [10. Notification Center & Web Push Engine](#10-notification-center--web-push-engine)
  - [11. User Profile, Sessions & Account Governance](#11-user-profile-sessions--account-governance)
- [Design System & Styling](#-design-system--styling)
- [State Management & Data Layer](#-state-management--data-layer)
- [Environment Variables](#-environment-variables)
- [Development & Scripts](#-development--scripts)

---

## 🚀 Overview

`@kalya/web` is the primary web client for the Kalya financial ecosystem. Designed from the ground up for speed, privacy, and visual polish, it delivers a fluid, desktop-class experience for managing personal budgets, tracking expenditures, splitting bills with peers, monitoring digital and equity investments, and generating immutable financial statements.

Key Highlights:

- **Next.js 16 App Router & React 19**: Leverage React Server Components for optimal initial page loads and deep client component boundaries for rich interactivity.
- **Tailwind CSS v4 with Glassmorphism**: Clean semantic tokens, full dark/light/system theme switching via `next-themes`, and fluid layout responsiveness.
- **Client-Side Document Generation**: Dynamic PDF statement rendering via `@react-pdf/renderer` and formatted multi-tab spreadsheet exports via `exceljs`.
- **Browser Web Push**: Real-time push notification support using native Service Workers and VAPID key handshake.
- **Resilient Network Layer**: Centralized Axios client with request/response interceptors, RFC 7807 problem details error mapping, and interactive toast alerts.

---

## 🛠 Architecture & Tech Stack

| Domain                       | Technology / Library                                                       | Purpose                                                                   |
| ---------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Framework & Runtime**      | [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/)         | App Router, React Server Components, streaming SSR, metadata optimization |
| **Language**                 | [TypeScript](https://www.typescriptlang.org/) (strict mode)                | End-to-end type safety and compile-time contract enforcement              |
| **Styling & Theming**        | [Tailwind CSS v4](https://tailwindcss.com/) + `next-themes`                | Mobile-first utility styling, dark/light modes, CSS variables             |
| **UI Primitives**            | [Radix UI](https://www.radix-ui.com/) primitives                           | Accessible, unstyled primitives (Dialog, Popover, Select, Tabs, Tooltip)  |
| **Icons & Motion**           | [Lucide React](https://lucide.dev/) + [Framer Motion](https://motion.dev/) | Vector icons and silky smooth micro-interactions                          |
| **Server State & Caching**   | [TanStack React Query v5](https://tanstack.com/query)                      | Optimistic updates, background caching, query key factories               |
| **Client State**             | [Zustand v5](https://zustand.docs.pmnd.rs/)                                | Lightweight reactive stores for session, sidebar, and local UI state      |
| **Forms & Validation**       | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)  | Schema-driven form validation shared with `@kalya/validations`            |
| **Data Tables**              | [TanStack React Table v9](https://tanstack.com/table)                      | Column sorting, filtering, row selection, and pagination for ledgers      |
| **Charts & Visualizations**  | [Recharts v3](https://recharts.org/)                                       | Donut charts, budget consumption meters, and monthly cash flow metrics    |
| **Document & Excel Exports** | `@react-pdf/renderer` + `exceljs`                                          | In-browser branded PDF monthly statements and XLSX spreadsheet exports    |
| **Web Push Notifications**   | Browser Service Worker API + VAPID subscription lifecycle                  | Native desktop/mobile browser push alert reception                        |
| **Shared Packages**          | `@kalya/types`, `@kalya/validations`, `@kalya/utils`                       | Shared domain models, validation schemas, and financial math utilities    |

---

## 📂 Directory Structure

```text
apps/web/
├── public/                     # Static assets, fonts, icons, manifest
├── src/
│   ├── api/                    # Internal Next.js edge route handlers (if needed)
│   ├── app/                    # Next.js 16 App Router hierarchy
│   │   ├── (auth)/             # Authentication routes (sign-in, sign-up, passwords)
│   │   ├── (dashboard)/        # Authenticated dashboard application
│   │   │   ├── alerts/         # Notification center & delivery settings
│   │   │   ├── assets/         # Commodities & equities portfolio tracker
│   │   │   ├── budgets/        # 50/30/20 allocation buckets & spending caps
│   │   │   ├── goals/          # Savings goals & timeline pacing meters
│   │   │   ├── insights/       # Analytics, financial statements & exports
│   │   │   ├── settings/       # Profile, security, sessions & account governance
│   │   │   ├── splits/         # Split contacts, pending obligations & settlements
│   │   │   ├── transactions/   # Expense & income transaction ledgers
│   │   │   ├── layout.tsx      # Dashboard sidebar, topbar & auth guard shell
│   │   │   └── page.tsx        # High-level financial overview & KPI deck
│   │   ├── about/              # About Kalya product & team
│   │   ├── contact/            # Support and inquiry channels
│   │   ├── privacy/            # Privacy Policy & GDPR statements
│   │   ├── terms/              # Terms of Service & usage conditions
│   │   ├── error.tsx           # Global error fallback boundary
│   │   ├── layout.tsx          # Root HTML layout, ThemeProvider & fonts
│   │   ├── loading.tsx         # Global streaming suspense skeleton
│   │   ├── manifest.ts         # PWA Web App Manifest
│   │   ├── metadata.ts         # Dynamic OpenGraph & SEO metadata
│   │   ├── not-found.tsx       # Standard 404 page
│   │   ├── page.tsx            # High-conversion marketing landing page
│   │   ├── robots.ts           # SEO crawlers configuration
│   │   └── sitemap.ts          # Automated sitemap generation
│   ├── components/
│   │   ├── dashboard/          # Dashboard compound views (overview, finances, sidebar, topbar)
│   │   ├── forms/              # Domain modal forms (expenses, budgets, splits, assets, goals)
│   │   ├── landing/            # Landing page sections (hero, features, FAQ, pricing, trust)
│   │   ├── legal/              # Legal document renderers
│   │   ├── notifications/      # Notification popover, alert feeds & preference forms
│   │   ├── shared/             # Reusable compound UI (KPI cards, empty states, modals, confirm dialogs)
│   │   └── ui/                 # Design system primitives (Button, Input, Select, Badge, Card, Avatar)
│   ├── hooks/                  # TanStack Query & browser custom hooks
│   │   ├── auth/               # Session queries & login/logout mutations
│   │   ├── finances/           # Hooks for buckets, categories, income, budgets, expenses, splits, assets, goals
│   │   ├── users/              # Profile, avatar, session list & deletion hooks
│   │   ├── use-sidebar.tsx     # Responsive sidebar collapse state hook
│   │   ├── use-web-push.ts     # Web Push subscription registration & permission manager
│   │   └── use-tooltip.tsx     # Radix tooltip wrapper hook
│   ├── layouts/                # Stateful layout wrappers (`dashboard-client.tsx`, `auth-client.tsx`)
│   ├── libs/
│   │   ├── api/                # HTTP client instance with Axios interceptors & typed verbs
│   │   ├── run-actions.ts      # Helper for executing actions with automated toast notifications
│   │   └── utils.ts            # UI helper functions (`cn`, Tailwind merge, formatters)
│   ├── providers/              # Root React context providers (Query, Auth, Theme, Table)
│   ├── stores/                 # Zustand client stores (auth, users, finances, sidebar)
│   └── styles/
│       └── globals.css         # Tailwind CSS v4 root tokens, glassmorphism, and color variables
├── .env.example                # Frontend environment template
├── next.config.ts              # Next.js configuration (images, headers, build rules)
├── package.json
└── tsconfig.json
```

---

## 🧩 Application Modules & Pages

### 1. Marketing & Public Experience

Accessible without authentication at the root path `/`.

- **Landing Page (`src/app/page.tsx` & `src/components/landing/`)**:
  - **Dynamic Hero Section**: Compelling value proposition with floating interactive UI widgets, micro-animations, and call-to-action buttons.
  - **Trust Strip**: Highlights zero-data-selling guarantee, local SQLite storage architecture, and end-to-end security.
  - **Features Circle Showcase**: Interactive rotary feature browser highlighting 50/30/20 budgeting, split expenses, portfolio tracking, and financial statements.
  - **Product Live Preview**: High-fidelity interactive mockup demonstrating real-world dashboard KPIs, charts, and transaction ledgers.
  - **Free-For-Now Guarantee & Comparison Matrix**: Transparent comparison detailing free community access vs legacy paid alternatives.
  - **Interactive FAQ**: Accordion-based answers to frequently asked user questions.
- **Public & Legal Pages**:
  - `/about`: Company philosophy, privacy-first commitment, and team values.
  - `/contact`: Direct feedback and support communication channels.
  - `/terms`: Comprehensive Terms of Service and acceptable use policies.
  - `/privacy`: GDPR-compliant Privacy Policy detailing user data isolation and deletion guarantees.

### 2. Authentication & Identity

Implemented in `src/app/auth/` and wrapped with `src/layouts/auth-client.tsx`.

- **Sign In (`/auth/sign-in`)**:
  - Dual-mode authentication: standard email/password credentials or 1-click **Google OAuth 2.0**.
  - Automatic account linking if the email was previously registered via credentials.
- **Sign Up (`/auth/sign-up`)**:
  - Account registration with real-time password strength validation and automatic unique username generation.
- **Credential Recovery**:
  - `/auth/forgot-password`: Generates secure password reset links dispatched via the backend mail service.
  - `/auth/reset-password`: Validates security token and safely applies new password.
  - `/auth/verify-email`: Handles one-time verification tokens sent after account registration.

### 3. Financial Overview & KPI Deck

Implemented in `src/app/dashboard/page.tsx` and `src/components/dashboard/overview/`.

- **Monthly Performance Cards**:
  - **Net Income**: Total earned for the active month, including freelance revenue and previous month carryover.
  - **Total Expenses**: Real-time expenditure aggregate across all categories.
  - **Net Savings & Savings Rate**: Derived net cash surplus/deficit and percentage of income retained.
  - **Budget Adherence**: Percentage score evaluating total spending against active budget limits.
  - **Unsettled Splits**: Outstanding receivables owed to the user vs payables owed to peers.
- **Visual Analytics**:
  - Interactive Recharts cash flow comparison (Monthly Income vs Total Spending).
  - Categorical expense breakdown chart with category color swatches.
  - Live activity feed showing the most recent transactions and settlements.

### 4. Transactions & Ledger

Implemented in `src/app/dashboard/transactions/`.

- **Expenditure & Income Ledgers**:
  - View, filter, and paginate past transactions by category, allocation bucket, date range, or payment method (`upi`, `gpay`, `phonepe`, `paytm`, `debit_card`, `credit_card`).
  - Search transactions instantly by description or merchant name.
- **Transaction Entry Modal**:
  - Log expenses with minor-unit financial rounding (`roundMoney`).
  - Optional split bill toggle: seamlessly attach split shares with contacts directly during transaction creation.

### 5. Budgets & Allocation Buckets (50/30/20)

Implemented in `src/app/dashboard/budgets/`.

- **50/30/20 Principle Allocation**:
  - Pre-seeded or customizable buckets: **Needs (50%)**, **Wants (30%)**, and **Savings (20%)**.
  - Dynamic category assignment under parent buckets with customizable icon keys and hex color themes.
- **Real-Time Health Meters**:
  - Visual consumption progress bars calculating real-time percentage spent against allocated caps.
  - Automated status badges: **Safe** (< 80%), **Warning** (80% - 99%), and **Exceeded** (>= 100%).

### 6. Collaborative Bill Splitting & Settlements

Implemented in `src/app/dashboard/splits/`.

- **Contact Directory & Identity Linking**:
  - Manage split contacts with name, email, and phone number.
  - **Intelligent Linking Suggestions**: Suggests matching registered Kalya user accounts.
  - **Invitations Flow**: Send and accept/decline reciprocal link invitations between Kalya users.
- **Split Expense Settlement Engine**:
  - Track equal or custom weighted share obligations.
  - Direct settlement modal allowing partial or full payment recording with auto debt reconciliation.
  - Cascading reciprocal split deletion protection ensuring database consistency across both parties.

### 7. Financial Goals & Timeline Pacing

Implemented in `src/app/dashboard/goals/`.

- **Savings Targets**:
  - Create targeted savings milestones linked to allocation buckets (e.g., Emergency Fund, Vacation, Down Payment).
  - Set target amounts, planned monthly contributions, and target completion dates.
- **Timeline Pacing Indicator**:
  - Automatically compares current accumulated savings against timeline progress, indicating whether the goal is on track, behind pace, or ahead of schedule.

### 8. Multi-Asset Portfolio Tracker

Implemented in `src/app/dashboard/assets/`.

- **Digital Commodities Tracker**:
  - Track Gold and Silver purchases with weight in grams, platform identifier, and automated **3% GST calculation**.
- **Equities Holdings Portfolio**:
  - Log stock holdings across NSE and BSE exchanges with company name, number of shares, and purchase price.
- **Portfolio Summary Deck**:
  - Real-time aggregated net worth calculation combining physical/digital commodities and equity investments.

### 9. Insights, Statements & Document Exports

Implemented in `src/app/dashboard/insights/`.

- **In-Depth Financial Statements**:
  - Monthly statement snapshots capturing immutable financial overviews, category breakdowns, and split histories.
- **Branded Client-Side Exports**:
  - **PDF Statements**: Built using `@react-pdf/renderer` for crisp, vector-rendered, printable monthly reports with Kalya brand styling.
  - **Excel Spreadsheets**: Formatted `.xlsx` exports via `exceljs` featuring multiple sheets (Summary, Expenses, Income, Splits, Portfolio).

### 10. Notification Center & Web Push Engine

Implemented in `src/app/dashboard/alerts/` and `src/components/notifications/`.

- **In-App Notification Feed**:
  - Filter notifications by category (`budget_alerts`, `split_reminders`, `statement`, `system`).
  - Real-time unread badge counters, single mark-as-read, and bulk mark-all-read operations.
- **Granular Delivery Matrix**:
  - Configure preferences per category across **Email** and **Push** channels.
  - Choose delivery frequency: `immediate`, `daily`, `weekly`, `monthly`, or `custom` cron schedule.
- **Web Push Management**:
  - Toggle browser push notifications via native Service Worker registration.
  - One-click diagnostic test push to verify browser alert reception.

### 11. User Profile, Sessions & Account Governance

Implemented in `src/app/dashboard/settings/`.

- **Profile Customization**:
  - Update display name, bio, language, locale, and preferred timezone.
  - Change unique handle with real-time availability checks.
  - Avatar management: Client-side image cropping and multi-part upload optimized into WebP via Sharp.
- **Active Sessions & Device Management**:
  - Review all active login sessions with IP address, browser, OS, and location telemetry.
  - Revoke individual sessions or terminate all other sessions in a single click.
- **Account Deletion with Grace Period**:
  - Request account deletion with an automated **14-day grace window**.
  - One-click cancellation during the grace period to immediately restore full account status.

---

## 🎨 Design System & Styling

- **Tailwind CSS v4 Configuration**:
  - Defined in `src/styles/globals.css` with CSS custom properties for seamless dark/light mode transitions.
  - Curated semantic tokens: `primary`, `accent`, `surface`, `surface-raised`, `border-subtle`, `text-primary`, `text-muted`.
- **Accessibility & Motion**:
  - Built on WAI-ARIA compliant Radix UI primitives.
  - Respects user motion preferences (`prefers-reduced-motion`) while offering subtle Framer Motion micro-interactions.

---

## ⚡ State Management & Data Layer

- **Network Requests via `src/libs/api`**:
  - Centralized Axios client (`http.get`, `http.post`, `http.patch`, `http.delete`).
  - Pre-configured `withCredentials: true` for secure Better-Auth session cookie exchange.
  - Interceptors automatically catch RFC 7807 error responses and trigger informative user toasts via `react-hot-toast`.
- **Server State (TanStack Query)**:
  - Strict separation: server-fetched data is managed entirely in TanStack Query hooks under `src/hooks/`.
  - Deterministic query keys ensure accurate cache invalidation on mutations.
- **Client State (Zustand)**:
  - Lightweight, persistent stores in `src/stores/` manage ephemeral client state (sidebar expanded/collapsed, active UI modal open states, session tokens).

---

## 🔧 Environment Variables

Create `.env` in `apps/web/` using `.env.example`:

```bash
cp .env.example .env
```

| Variable                  | Default Value           | Description                                          |
| ------------------------- | ----------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`     | `http://localhost:3600` | Fastify backend API server URL                       |
| `NEXT_PUBLIC_API_VERSION` | `v1`                    | API version prefix used in network calls (`/api/v1`) |
| `NEXT_PUBLIC_APP_URL`     | `http://localhost:3000` | Canonical public URL of the web frontend application |

---

## 💻 Development & Scripts

All commands can be executed from the repository root using `pnpm` filter or directly in `apps/web`:

| Command          | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| `pnpm dev`       | Starts Next.js development server with Turbopack (port `3000`)   |
| `pnpm build`     | Creates an optimized production build of the Next.js application |
| `pnpm start`     | Starts the built production server                               |
| `pnpm lint`      | Runs ESLint checks across all TypeScript and React files         |
| `pnpm typecheck` | Validates TypeScript types across the web app (`tsc --noEmit`)   |

### Monorepo Workflows

```bash
# Run web application in development
pnpm --filter @kalya/web dev

# Typecheck web app
pnpm --filter @kalya/web exec tsc --noEmit

# Lint web app
pnpm --filter @kalya/web lint
```
