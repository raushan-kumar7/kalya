# Kalya

> Modern, privacy-first, and beautifully engineered personal finance, budgeting, and collaborative bill-splitting platform.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5-black.svg)](https://fastify.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-SQLite-brightgreen.svg)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444.svg)](https://turbo.build/)
[![Docker](https://img.shields.io/badge/Docker-Infrastructure-2496ed.svg)](https://www.docker.com/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Monorepo Architecture](#-monorepo-architecture)
- [Technology Stack](#-technology-stack)
- [Service Map & Endpoints](#-service-map--endpoints)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Workspace Packages](#-workspace-packages)
- [Root Scripts & Commands](#-root-scripts--commands)
- [Observability & Local Infrastructure](#-observability--local-infrastructure)
- [Architectural Standards](#-architectural-standards)
- [License](#-license)

---

## 🚀 Overview

**Kalya** is a comprehensive, production-grade personal finance ecosystem designed for individuals and groups who care deeply about privacy, transparency, and design excellence. Instead of relying on proprietary cloud services that sell user financial data, Kalya is built on an isolated, local-first database architecture powered by SQLite and Drizzle ORM, paired with a blazing-fast Fastify REST API and an elegant Next.js 16 App Router frontend.

Whether you are tracking day-to-day expenses using the **50/30/20 rule**, splitting dinner bills and rent obligations with friends, monitoring digital gold/silver and equity investments, or exporting branded PDF monthly financial statements, Kalya gives you total control over your financial health.

---

## ✨ Key Features

### 💰 50/30/20 Budgeting & Allocation Engine

- **Structured Buckets**: Allocate net income across **Needs (50%)**, **Wants (30%)**, and **Savings (20%)** allocation buckets.
- **Categorical Hierarchy**: Nested expenditure categories with customizable UI icon keys and hex color themes.
- **Real-Time Health Meters**: Dynamic consumption progress bars evaluating spending against allocated caps with **Safe (< 80%)**, **Warning (80% - 99%)**, and **Exceeded (>= 100%)** visual thresholds.

### 📊 Cash Flow Insights & Monthly KPI Deck

- **Executive Overview**: Instant insight into Net Monthly Income, Total Expenditures, Net Savings, and Savings Rate percentage.
- **Interactive Visualizations**: Interactive Recharts breakdown of monthly cash flow (income vs expenses) and category spending donut charts.
- **Immutable Statement Snapshots**: Generate historical monthly statement snapshots capturing point-in-time financial summaries.

### 🤝 Collaborative Bill Splitting & Settlements

- **Contact Directory**: Manage peers with contact cards and transaction histories.
- **Intelligent User Linking**: Automatically detects matching registered Kalya users and provides seamless account link invitations.
- **Debt Obligations Ledger**: Track equal or custom split shares, pending debts owed to you or by you, and partial or complete settlement recordings.
- **Reciprocal Integrity**: Cascading split protection ensures database consistency across both parties if an expense is modified or deleted.

### 🪙 Multi-Asset Portfolio Tracker

- **Digital Commodities**: Track Gold and Silver purchases with weight in grams, platform vendor, and automated **3% GST valuation**.
- **Equities Holdings Portfolio**: Track stock holdings across NSE and BSE exchanges with company name, number of shares, and purchase price.
- **Unified Net Worth**: Real-time aggregated portfolio valuation combining commodity holdings and equity investments.

### 📄 Branded Client-Side Exports

- **Vector PDF Statements**: High-resolution, vector-rendered printable PDF financial statements generated entirely in-browser via `@react-pdf/renderer`.
- **Formatted Excel Spreadsheets**: Comprehensive multi-tab `.xlsx` workbooks generated via `exceljs` (Summary, Expenses, Income, Splits, Portfolio).

### 🔔 Multi-Channel Alert Dispatcher & Web Push

- **Multi-Channel Dispatch**: Deliver alerts via in-app notification center, transactional emails, or browser Web Push.
- **Native Browser Web Push**: Zero-dependency VAPID cryptographic key handshake and Service Worker subscription management.
- **Delivery Preferences Matrix**: Fine-grained category-by-category control (`statement`, `budget_alerts`, `split_reminders`, `marketing`) with customizable cron delivery schedules.

### ⏱️ Asynchronous Durable Job Queue & Schedulers

- **Durable Task Queue**: SQLite-backed persistent FIFO task queue with execution attempts, failure logs, and exponential retry backoff.
- **Instant Event-Driven Worker**: Background worker wakes up immediately on job enqueue via event listeners, eliminating polling delay.
- **Autonomous Evaluators**: Background crons continuously evaluate budget threshold warnings and trigger gentle split debt reminders.

### 🛡️ Privacy, Security & GDPR Compliance

- **Session Authentication**: Better-Auth session-based security with Google OAuth 2.0 social identity federation and automatic account linking.
- **Telemetry & Bot Detection**: In-memory user-agent parsing (`ua-parser-js` v2), Windows 11 client hint detection, and IP bogon filtering (`geoip-lite`).
- **Account Governance**: Remote session revocation, profile customization, and a GDPR-compliant **14-day account deletion grace period**.

### 📈 Full-Stack Observability

- **Prometheus Metrics**: Exposes runtime, heap, and request duration histograms at `GET /metrics`.
- **Grafana Dashboards**: Pre-provisioned Dockerized monitoring dashboard visualizing API throughput and system health.
- **OpenAPI 3.1 Swagger UI**: Interactive API documentation and test harness served at `GET /docs`.

---

## 🏗 Monorepo Architecture

```text
kalya/
├── apps/
│   ├── web/                    # Next.js 16 App Router, React 19, Tailwind CSS v4, TanStack Query (Port 3000)
│   ├── api-server/             # Fastify v5, TypeScript, Better-Auth, REST API, Job Worker (Port 3600)
│   └── mobile/                 # React Native mobile client (planned)
├── packages/
│   ├── db/                     # Drizzle ORM schemas, SQLite client, migrations, Drizzle Studio
│   ├── types/                  # Shared TypeScript domain models, DTOs, interfaces
│   ├── validations/            # Shared Zod validation schemas
│   ├── utils/                  # Shared financial math (roundMoney), date & string helpers
│   ├── env/                    # Type-safe, validated environment configuration
│   ├── email/                  # Transactional React-Email templates & preview server (Port 3001)
│   ├── eslint-config/          # Shared ESLint configuration
│   ├── prettier-config/        # Shared Prettier formatting rules
│   └── typescript-config/      # Shared tsconfig bases
├── infra/
│   ├── prometheus/             # Prometheus scrape configuration
│   └── grafana/                # Grafana datasources & dashboard provisioning
├── scripts/                    # Workspace management & generator scripts
├── docker-compose.yml          # Local infra services (MailDev, Prometheus, Grafana)
├── pnpm-workspace.yaml         # PNPM monorepo definition
└── turbo.json                  # Turborepo task pipeline configuration
```

---

## 🛠 Technology Stack

| Layer                     | Technologies                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Frontend Client**       | Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Framer Motion, Radix UI Primitives |
| **Frontend State & Data** | TanStack React Query v5, Zustand v5, React Hook Form, TanStack Table v9, Recharts v3                 |
| **Document Export**       | `@react-pdf/renderer` (PDF generation), `exceljs` (XLSX spreadsheets)                                |
| **Backend API Server**    | Fastify v5, TypeScript, Better-Auth v1.7+, Zod Type Provider, Winston Logger, Sharp                  |
| **Database & ORM**        | SQLite (WAL Mode), Drizzle ORM, Drizzle Kit                                                          |
| **Background Queue**      | SQLite Durable FIFO Queue, Event-driven worker, Cron Schedulers                                      |
| **Push Notifications**    | `web-push` (VAPID keypair), Browser Service Worker API, Expo Push Token SDK                          |
| **Email Subsystem**       | `@kalya/email` (React-Email), Resend, Nodemailer / SMTP (MailDev for local dev)                      |
| **Monitoring & Metrics**  | `prom-client`, Prometheus, Grafana, OpenAPI 3.1 Swagger UI                                           |
| **Monorepo Tooling**      | PNPM Workspaces, Turborepo, Husky, Lint-Staged, Prettier, ESLint                                     |

---

## 📡 Service Map & Endpoints

When running locally, Kalya services are exposed on the following ports:

| Service             | URL / Port                      | Credentials / Access                               | Description                                                  |
| ------------------- | ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| **Web Application** | `http://localhost:3000`         | Public / Authenticated                             | Next.js 16 Web Dashboard & Landing Page                      |
| **Backend API**     | `http://localhost:3600`         | Public / Authenticated                             | Fastify REST API                                             |
| **OpenAPI Docs**    | `http://localhost:3600/docs`    | Public                                             | Interactive Swagger UI API documentation                     |
| **Metrics Scrape**  | `http://localhost:3600/metrics` | Public                                             | Prometheus formatted runtime & HTTP metrics                  |
| **Email Previewer** | `http://localhost:3001`         | Public                                             | React-Email live development server (`pnpm dev:email`)       |
| **MailDev Web UI**  | `http://localhost:1080`         | Public                                             | Local transactional email inbox (SMTP on port `1025`)        |
| **Prometheus**      | `http://localhost:9090`         | Public                                             | Prometheus metrics dashboard & query console                 |
| **Grafana**         | `http://localhost:3100`         | `admin` / `admin` (Anonymous admin access enabled) | Monitoring dashboards (overview throughput, latency, memory) |
| **Drizzle Studio**  | `https://local.drizzle.studio`  | Local session token                                | Interactive SQLite database visual editor                    |

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later (LTS recommended)
- **PNPM**: `v10.x` or later (`corepack enable && corepack use pnpm@10.28.2`)
- **Docker**: (Optional but recommended) for running local MailDev, Prometheus, and Grafana containers

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/raushan-kumar7/kalya.git
cd kalya
```

#### 2. Install Monorepo Dependencies

```bash
pnpm install
```

#### 3. Configure Environment Variables

Both `apps/api-server` and `apps/web` require local environment files. Templates are provided via `.env.example`:

```bash
# Configure Backend API Server
cp apps/api-server/.env.example apps/api-server/.env

# Configure Frontend Web App
cp apps/web/.env.example apps/web/.env
```

Review the values in `apps/api-server/.env` (e.g. generate a secure `KALYA_AUTH.SECRET_KEY` and optionally configure Google OAuth credentials).

#### 4. Run Database Migrations

Apply database schemas to the local SQLite database (`data/kalya.db`):

```bash
pnpm --filter @kalya/db db:migrate
```

To visually inspect or manipulate the SQLite database via GUI:

```bash
pnpm --filter @kalya/db db:studio
```

#### 5. Start Local Infrastructure (Docker)

Spin up MailDev (SMTP mail catcher), Prometheus, and Grafana:

```bash
pnpm docker:up
```

#### 6. Start Development Servers

Launch all applications in parallel using Turborepo:

```bash
pnpm dev
```

Visit **`http://localhost:3000`** in your browser to start using Kalya!

---

## 📦 Workspace Packages

Shared functionality is modularized into workspace packages under `packages/`:

| Package                      | Purpose                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **`@kalya/db`**              | SQLite database client (`better-sqlite3`), Drizzle ORM schema definitions, relations, and migration files. |
| **`@kalya/types`**           | Shared domain TypeScript interfaces, DTOs, enum definitions, and type contracts.                           |
| **`@kalya/validations`**     | Shared Zod validation schemas for request validation and React Hook Form integration.                      |
| **`@kalya/utils`**           | Precision financial arithmetic (`roundMoney`), date utilities, slug generators, and currency formatters.   |
| **`@kalya/env`**             | Type-safe, centralized environment variable validation with dotenv loading.                                |
| **`@kalya/email`**           | React-Email transactional email templates (`NewDeviceLogin`, `ResetPassword`, `AccountDeletion`, etc.).    |
| **`@kalya/eslint-config`**   | Shared ESLint rules across applications and packages.                                                      |
| **`@kalya/prettier-config`** | Standardized code formatting configuration.                                                                |

> **Development Rule**: Always import shared code via package specifiers (e.g. `import { roundMoney } from '@kalya/utils'`). Never deep-import across workspace source boundaries.

---

## ⌨️ Root Scripts & Commands

All development tasks can be run directly from the repository root:

```bash
# ---- Development ----
pnpm dev              # Starts all services (web, api-server) via Turborepo
pnpm dev:web          # Starts only Next.js web application
pnpm dev:api          # Starts only Fastify API server
pnpm dev:email        # Starts React-Email development preview server

# ---- Building ----
pnpm build            # Builds all applications and packages
pnpm build:web        # Builds Next.js production bundle
pnpm build:api        # Compiles Fastify TypeScript backend

# ---- Code Quality ----
pnpm typecheck        # Runs TypeScript type checks across all workspaces
pnpm lint             # Runs ESLint checks across all workspaces
pnpm format           # Formats codebase with Prettier
pnpm format:check     # Verifies formatting compliance

# ---- Database Management ----
pnpm --filter @kalya/db db:generate  # Generates SQL migrations from schema
pnpm --filter @kalya/db db:migrate   # Applies pending migrations to SQLite DB
pnpm --filter @kalya/db db:studio    # Opens Drizzle Studio database GUI

# ---- Local Infrastructure (Docker) ----
pnpm docker:up        # Starts MailDev, Prometheus, and Grafana containers
pnpm docker:down      # Stops and removes Docker containers
pnpm docker:logs      # Tails container logs in real time

# ---- Pre-Deployment Gate ----
pnpm predeploy        # Runs format:check, lint, typecheck, and build in sequence
```

---

## 🔍 Observability & Local Infrastructure

Kalya includes a complete local monitoring and diagnostics stack:

```text
[Fastify API (:3600)] ─── /metrics ───> [Prometheus (:9090)] ───> [Grafana (:3100)]
         │
         ├─── SMTP (:1025) ─────────────> [MailDev (:1080)]
         │
         └─── OpenAPI (/docs) ──────────> [Interactive Swagger UI]
```

1. **Prometheus (`http://localhost:9090`)**: Scrapes Fastify runtime and HTTP metrics every 15 seconds.
2. **Grafana (`http://localhost:3100`)**: Pre-configured with the Prometheus data source and an interactive **Kalya Overview** dashboard tracking request rate, p95/p99 latencies, error distributions, and Node.js process memory.
3. **MailDev (`http://localhost:1080`)**: Intercepts all transactional emails sent by the backend during development so you can inspect email templates without configuring real third-party SMTP credentials.

---

## 📐 Architectural Standards

1. **Financial Precision**:
   - Monetary values must always be sanitized and rounded using `roundMoney()` from `@kalya/utils` to maintain 2-decimal consistency.
2. **Layer Separation**:
   - **Frontend**: Server Components by default; interactive client components push `"use client"` deep into the tree. All network requests go through `src/libs/api`.
   - **Backend**: Strict **Route → Controller → Service → Database** layering. Controller envelopes all responses in standardized ApiResponse shapes.
3. **Strict TypeScript**:
   - Zero `any` types. Zero unchecked type assertions.
4. **Database Safety**:
   - Never modify SQLite database files directly. All schema evolution must be versioned through Drizzle migrations in `packages/db`.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
