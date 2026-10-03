# @kalya/api-server

High-performance, secure, and production-ready Fastify backend API for the Kalya platform. Built with TypeScript, Drizzle ORM, Better-Auth, and React-Email.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Directory Structure](#-directory-structure)
- [Core Architecture & Subsystems](#-core-architecture--subsystems)
  - [1. Authentication & Security Engine](#1-authentication--security-engine)
  - [2. Client Intelligence & Telemetry](#2-client-intelligence--telemetry)
  - [3. User Profile & Compliance Subsystem](#3-user-profile--compliance-subsystem)
  - [4. Transactional Mail Service](#4-transactional-mail-service)
  - [5. Media & Storage Abstraction](#5-media--storage-abstraction)
  - [6. Health & Observability](#6-health--observability)
  - [7. Error Handling & Standard Responses](#7-error-handling--standard-responses)
  - [8. Personal Finances Engine](#8-personal-finances-engine)
  - [9. Notifications & Alert Dispatch Engine](#9-notifications--alert-dispatch-engine)
- [API Route Reference](#-api-route-reference)
  - [Health & Monitoring](#health--monitoring)
  - [Authentication](#authentication-apiv1auth)
  - [User Profile & Account Management](#user-profile--account-management-apiv1users)
  - [Personal Finances](#personal-finances-apiv1finances)
  - [Notifications & Alerts](#notifications--alerts-apiv1notifications)
- [Environment Variables](#-environment-variables)
- [Development & Scripts](#-development--scripts)

---

## 🚀 Overview

`@kalya/api-server` is the central API service powering Kalya web and mobile clients. It enforces type safety from HTTP request boundaries down to database persistence, provides real-time client telemetry, automated email triggers for critical user security events, and handles GDPR-compliant data operations such as scheduled account deletions with grace periods. It also serves as the host for the complete personal finance engine (budgeting, categories, split expenses, multi-asset portfolio tracking, financial summaries) and user-configurable alert notifications.

---

## 🛠 Architecture & Tech Stack

| Domain                           | Technology / Library                                                                     | Purpose                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Runtime & Framework**          | [Node.js](https://nodejs.org/) + [Fastify v5](https://fastify.dev/)                      | High-throughput asynchronous HTTP API server                               |
| **Language**                     | [TypeScript](https://www.typescriptlang.org/) (strict mode)                              | End-to-end type safety                                                     |
| **Validation & Schemas**         | [Zod](https://zod.dev/) + `fastify-type-provider-zod`                                    | Runtime schema validation and typed request/response contracts             |
| **Authentication**               | [Better-Auth v1.7+](https://www.better-auth.com/)                                        | Session-based authentication with Drizzle SQLite adapter                   |
| **Database & ORM**               | [SQLite](https://sqlite.org/) + [Drizzle ORM](https://orm.drizzle.team/) via `@kalya/db` | ACID transactions, WAL mode, migrations, typed queries                     |
| **Finance Utilities**            | `@kalya/utils`                                                                           | Minor-unit currency rounding, split arithmetic, valuations & goal pacing   |
| **Client Intelligence**          | `ua-parser-js` v2 + `geoip-lite` + Client Hints                                          | Real-time browser, OS, hardware, bot/crawler detection, and IP geolocation |
| **Email Subsystem**              | `@kalya/email` (React-Email) + Resend / Nodemailer                                       | Transactional email templates with dynamic provider fallback               |
| **Storage & Image Optimization** | Local disk / Cloudinary + [Sharp](https://sharp.pixelplumbing.com/)                      | Avatar upload, resize, WebP conversion, and asset distribution             |
| **Logging & Diagnostics**        | [Winston](https://github.com/winstonjs/winston) + `winston-daily-rotate-file`            | Structured JSON and colored console logging with daily file rotation       |

---

## 📂 Directory Structure

```text
apps/api-server/
├── src/
│   ├── app.ts                  # Fastify application factory & plugin bootloader
│   ├── index.ts                # Server entrypoint, process lifecycle & graceful shutdown
│   ├── constants/              # HTTP status codes & shared server constants
│   ├── errors/                 # Standardized AppError hierarchy (4xx/5xx)
│   ├── libs/
│   │   ├── mail/               # Mail abstraction (MailerService, Resend & SMTP providers)
│   │   └── storage/            # Media storage engine (Local disk, Cloudinary, Sharp)
│   ├── logger/                 # Winston logger with rotation & console formatters
│   ├── modules/
│   │   ├── auth/               # Better-Auth integration, routes, controller, & lifecycle hooks
│   │   │   ├── hooks/          # Security event triggers (new device, password, email)
│   │   │   ├── auth.instance.ts# Better-Auth initialization & DB hooks
│   │   │   ├── auth.service.ts # Availability checks & username generation
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.plugin.ts  # Fastify auth decorators & preHandler guards
│   │   │   └── auth.routes.ts  # Better-Auth wildcard & custom auth endpoints
│   │   ├── users/              # User profile, sessions, deletion, email change, policy broadcast
│   │   ├── finances/           # Personal finance engine (9 modular domains)
│   │   │   ├── common/         # BaseFinanceService (ownership assertion & relation guards)
│   │   │   ├── buckets/        # Allocation buckets (Needs/Wants/Savings)
│   │   │   ├── categories/     # Nested expense categories with theme & icons
│   │   │   ├── income/         # Monthly income tracking & carryover calculation
│   │   │   ├── budgets/        # Budget plans, real-time health & threshold alerting
│   │   │   ├── expenses/       # Transaction logging & atomic split management
│   │   │   ├── splits/         # Contact directory & share obligation settlement
│   │   │   ├── goals/          # Savings targets & timeline pacing metrics
│   │   │   ├── assets/         # Commodities & equities portfolio valuation
│   │   │   ├── summaries/      # Dashboard KPI overview & monthly statements
│   │   │   ├── finances.plugin.ts # Mounts all finance domain routes
│   │   │   └── index.ts        # Module export
│   │   ├── notifications/      # Notification & alert dispatch subsystem
│   │   │   ├── alert-dispatcher.service.ts # Multi-channel preference-aware dispatcher
│   │   │   ├── alerts/         # In-app alerts, unread counters & batch operations
│   │   │   ├── preferences/    # Channel & frequency delivery preference matrix
│   │   │   ├── notifications.plugin.ts # Mounts notification routes & decorates dispatcher
│   │   │   └── index.ts        # Module export
│   │   ├── health/             # Liveness, readiness, and subsystem diagnostics
│   │   ├── helpers/            # Client intelligence, username generators, formatters
│   │   └── index.ts            # Root module aggregator plugin
│   ├── plugins/                # Core Fastify infrastructure plugins
│   │   ├── db-plugin.ts        # Database client decoration (`fastify.db`, `request.db`)
│   │   ├── err_handler-plugin.ts # Global error interceptor & RFC 7807 formatting
│   │   ├── multipart-plugin.ts # File upload handling (@fastify/multipart)
│   │   ├── req_logs-plugin.ts  # HTTP request/response observability hook
│   │   ├── security-plugin.ts  # Helmet security headers & policies
│   │   └── static-plugin.ts    # Static file serving for local uploads
│   ├── responses/              # Standard envelope response builder (`ApiResponse.ok`)
│   └── types/                  # Fastify module augmentation (`fastify.d.ts`)
├── .env.example                # Canonical environment variable template
├── package.json
└── tsconfig.json
```

---

## 🧩 Core Architecture & Subsystems

### 1. Authentication & Security Engine

Implemented in [`src/modules/auth/`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/auth).

- **Better-Auth Integration**: Powered by Better-Auth with the Drizzle SQLite adapter. Supports email/password, Google OAuth 2.0 social identity federation, session management, and credential updates.
- **Google OAuth 2.0 & Identity Federation**:
  - Configured via `socialProviders.google` with `['email', 'profile']` scopes.
  - **Account Linking**: Enabled with `trustedProviders: ['google']`, allowing returning users with pre-existing email/password accounts to seamlessly sign in with Google without duplicate account errors or account locking.
  - **Automated OAuth Provisioning Hook**: In `databaseHooks.user.create.before`, extracts `first_name` and `last_name` from Google's profile name and automatically invokes `generateUniqueUsername(db, ...)` to generate a collision-free username for newly provisioned OAuth users.
- **Fastify Decorators & Guards**:
  - `fastify.authenticate`: Verifies active session token from cookie/headers; populates `request.user` and `request.session`.
  - `fastify.requireVerifiedEmail`: Guard ensuring the authenticated user has verified their primary email address.
- **Lifecycle Database Hooks**:
  - `on-new-device.ts`: Attached to `databaseHooks.session.create.after`. Detects if the session IP has not been seen before across active sessions. Skips automated bot logins, resolves client telemetry (OS, browser, city/country), and dispatches the `NewDeviceLogin` React-Email alert.
  - `on-password-reset.ts`: Attached to `databaseHooks.account.update.after` and Better-Auth reset workflows. Dispatches `ResetPassword` with token link, and `PasswordChangedNotice` with device context upon credential mutation.
  - `on-email-change.ts`: Handles transactional verification for sign-up (`VerifyEmail`) and primary address updates (`VerifyEmailChange`).

### 2. Client Intelligence & Telemetry

Implemented in [`src/modules/helpers/client-info.ts`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/helpers/client-info.ts) and decorated onto every request via [`clientInfoPlugin`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/helpers/client-info.plugin.ts).

- **High-Performance Parsing**: Combines `ua-parser-js` v2 and `geoip-lite` entirely in-memory with zero external network latency.
- **Client Hints Extraction**: Injects `Accept-CH` headers (`Sec-CH-UA-Platform-Version`, `Sec-CH-UA-Model`, `Sec-CH-UA-Arch`, `Sec-CH-UA-Bitness`).
- **Windows 11 Differentiation**: Accurately detects Windows 11 vs Windows 10 by evaluating `Sec-CH-UA-Platform-Version >= 13.0.0` (which Chromium reports as Windows 10 in standard User-Agent strings).
- **Physical Device & CPU Architecture**: Resolves device models (e.g., Pixel 8, iPhone) and CPU architectures (`arm64`, `x86_64`).
- **Native Bot & AI Crawler Detection**: Uses `ua-parser-js/bot-detection` to categorize traffic into `isBot`, `isAICrawler` (e.g., GPTBot, ClaudeBot), and `isAIAssistant`.
- **IP Normalization & Geolocation**:
  - Extracts real IP prioritizing edge CDN headers (`cf-connecting-ip`, `x-real-ip`, `x-forwarded-for`).
  - Strips IPv4-mapped IPv6 prefixes (`::ffff:`).
  - Validates against bogon/private ranges (`127.*`, `10.*`, `192.168.*`, `172.16-31.*`) returning clean `"Unknown"` or `"Local Network"` location data instead of corrupt lookups.

### 3. User Profile & Compliance Subsystem

Implemented in [`src/modules/users/`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/users).

- **Profile Management**: Fetch and patch profile attributes (name, bio, timezone, language, locale).
- **Collision-Resistant Username Engine**: [`username.ts`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/helpers/username.ts) generates clean slugs using `@kalya/utils` and automatically increments numeric suffixes when collisions occur in the database.
- **Avatar Media Pipeline**: Multi-part upload with Sharp optimization (resized to 256x256, 82% WebP quality, stripped metadata). Configurable between local disk or Cloudinary CDN.
- **Session Management**: Lists all active sessions for the current user, allows revoking individual sessions or bulk-revoking all other sessions with a single action.
- **Account Deletion & Grace Period**:
  - `POST /schedule-deletion`: Enforces a 14-day grace period. Sets `sync_status = 'PENDING'` and dispatches `AccountDeletionNotice` email.
  - `POST /cancel-deletion`: Restores active status during the grace window.
- **Primary Email Change**: Generates secure verification token and sends `VerifyEmailChange` template to the requested new address.
- **Admin Policy Broadcast**: Broadcasts updated Terms of Service or Privacy Policy notifications (`PolicyUpdateNotice`) to all verified users in memory-safe batches of 50 with rate-limited delays.

### 4. Transactional Mail Service

Implemented in [`src/libs/mail/`](file:///d:/Projects/personal/kalya/apps/api-server/src/libs/mail).

- **Provider Agnostic**: Unified `MailerService` interface allowing switching between **Resend** (`ResendMailProvider`) and **SMTP / Nodemailer** (`SmtpMailProvider`) via environment configuration (`KALYA_MAIL.PROVIDER`).
- **React-Email Integration**: Direct compilation of templates from `@kalya/email` (`sendTemplate`) with automatic plain-text fallback generation.
- **Reliability & Resilience**: Input normalization (handles strings and arrays of recipients), recipient deduplication, connection verification on startup, and graceful transporter teardown.
- **Local Mail Testing (MailDev)**: Run `pnpm docker:up` from the root to spin up MailDev on port `1025` (SMTP) with a web inbox at `http://localhost:1080`.

### 5. Media & Storage Abstraction

Implemented in [`src/libs/storage/`](file:///d:/Projects/personal/kalya/apps/api-server/src/libs/storage).

- **Providers Supported**:
  - `local`: Writes optimized files to local disk (`uploads/avatars/`), served statically via `@fastify/static`.
  - `cloudinary`: Uploads optimized buffers to Cloudinary CDN with automatic remote deletion of old assets.
- **Optimization Pipeline**: Powered by `sharp` with automatic orientation correction, dimension clamping, and WebP conversion.

### 6. Health & Observability

Implemented in [`src/modules/health/`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/health) and [`src/logger/`](file:///d:/Projects/personal/kalya/apps/api-server/src/logger).

- **Probes**:
  - `GET /health/live`: Fast liveness probe confirming Node.js event loop responsiveness.
  - `GET /health/ready`: Readiness probe verifying critical upstream dependencies (SQLite connectivity and memory limits). Returns `200 OK` or `503 Service Unavailable`.
  - `GET /health`: Comprehensive subsystem diagnostics with memory, uptime, and database latency.
- **Structured Logging**: Winston logger with daily rotation (`logs/app-YYYY-MM-DD.log`, `logs/error-YYYY-MM-DD.log`), custom error serializer, and HTTP request access logging.

### 7. Error Handling & Standard Responses

Implemented in [`src/errors/`](file:///d:/Projects/personal/kalya/apps/api-server/src/errors) and [`src/responses/`](file:///d:/Projects/personal/kalya/apps/api-server/src/responses).

- **Error Hierarchy**: Strongly typed `AppError` subclasses:
  - `BadRequestError` (400)
  - `UnauthorizedError` (401)
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `ConflictError` (409)
  - `InternalServerError` (500)
  - `ServiceUnavailableError` (503)
- **Standard Envelope**:
  - **Success**: `{ "success": true, "data": T, "meta": { "timestamp": "...", "requestId": "..." } }`
  - **Failure**: `{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }`

### 8. Personal Finances Engine

Implemented in [`src/modules/finances/`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/finances).

- **Shared Domain Foundation**:
  - [`BaseFinanceService`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/finances/common/base-finance.service.ts) provides strict tenant boundary isolation via `assertEntityOwnership` (protects against accessing or mutating another user's records) and `verifyParentExists` (verifies existence and user-ownership of parent entities like buckets and categories before child inserts).
- **Sub-Modules Breakdown**:
  - **Buckets (`buckets/`)**: Allocation categories aligned with budgeting principles (Needs, Wants, Savings). Features automated default seeding for the 50/30/20 rule, origin classification (`built-in` vs `custom`), and deletion guards protecting built-in buckets or those with active categories.
  - **Categories (`categories/`)**: Hierarchical expenditure categories attached to parent allocation buckets, configured with UI icon keys and hex color themes.
  - **Income Tracking (`income/`)**: Monthly income records capturing primary salary, secondary/freelance income, and previous-month carryover with automated `calculateNetIncome` derivation.
  - **Budgets & Real-Time Health (`budgets/`)**: Period-based expenditure caps (monthly, quarterly, annual) with real-time health checks (`calculateBudgetStatus`). Evaluates percentage consumed, remaining allowance, and amber (default 80%) / red (default 100%) alert thresholds.
  - **Expenses & Split Processing (`expenses/`)**: Transaction tracking with payment methods (`upi`, `phonepe`, `paytm`, `gpay`, `debit_card`, `credit_card`) and atomic split transaction creation in SQLite transactions.
  - **Expense Splits (`splits/`)**: Split contact management, pending obligation tracking, and partial or complete debt settlement calculations with debt validation.
  - **Goals (`goals/`)**: Savings goals with target dates, progress tracking, timeline pace evaluation (`calculateGoalPace`), and monthly planned contribution monitoring.
  - **Multi-Class Assets (`assets/`)**: Digital commodity tracking (gold/silver, grams, platform, 3% GST calculation) and equities (NSE/BSE, company, shares, purchase price), along with aggregated portfolio valuation summaries.
  - **Summaries (`summaries/`)**: Real-time financial dashboard metrics (total income, expenses, net savings, savings rate, adherence %, unsettled splits) and immutable monthly statement snapshot generation.

### 9. Notifications & Alert Dispatch Engine

Implemented in [`src/modules/notifications/`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/notifications).

- **Preference-Aware Alert Dispatcher**:
  - [`AlertDispatcherService`](file:///d:/Projects/personal/kalya/apps/api-server/src/modules/notifications/alert-dispatcher.service.ts) coordinates notification routing by inspecting the user's `notification_preference` table. If a category is muted or disabled, dispatch is gracefully bypassed.
  - Decorated onto the Fastify instance as `fastify.alertDispatcher` for cross-domain alert triggering.
- **In-App Notification Feed (`alerts/`)**:
  - Polymorphic reference tracking (`referenceType`, `referenceId`), structured JSON metadata, unread count caching, single mark-as-read, and batch mark-as-read operations.
- **Delivery Preferences Matrix (`preferences/`)**:
  - Granular control over categories (`statement`, `budget_alerts`, `split_reminders`, `marketing`) and channels (`email`, `push`).
  - Supports multiple delivery frequencies: `immediate`, `daily`, `weekly`, `monthly`, or `custom` cron expressions validated via `cron-parser`.

---

## 📡 API Route Reference

### Health & Monitoring

| Method | Endpoint        | Auth   | Description                                    |
| ------ | --------------- | ------ | ---------------------------------------------- |
| `GET`  | `/health/live`  | Public | Liveness probe (event loop responsiveness)     |
| `GET`  | `/health/ready` | Public | Readiness probe (database connection & memory) |
| `GET`  | `/health`       | Public | Detailed operational subsystem report          |

### Authentication (`/api/v1/auth/*`)

| Method | Endpoint                          | Auth        | Description                                                                                    |
| ------ | --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `ALL`  | `/api/v1/auth/*`                  | Better-Auth | Better-Auth core wildcard handler (sign-in, sign-up, sign-out, session retrieval)              |
| `POST` | `/api/v1/auth/sign-in/social`     | Public      | Initiates Google OAuth consent flow; sets CSRF/state cookies and returns `{ url, redirect }`   |
| `GET`  | `/api/v1/auth/callback/google`    | Better-Auth | Google OAuth callback; exchanges code, links/creates user, sets session cookies, and redirects |
| `GET`  | `/api/v1/auth/check-availability` | Public      | Query check for username or email availability (`?email=...` or `?username=...`)               |

### User Profile & Account Management (`/api/v1/users/*`)

| Method   | Endpoint                               | Auth Guard     | Description                                                  |
| -------- | -------------------------------------- | -------------- | ------------------------------------------------------------ |
| `GET`    | `/api/v1/users`                        | `authenticate` | List or search platform users (`?q=`, `?search=`, `?limit=`) |
| `GET`    | `/api/v1/users/me`                     | `authenticate` | Retrieve authenticated user profile                          |
| `PATCH`  | `/api/v1/users/`                       | `authenticate` | Update current user profile fields                           |
| `PATCH`  | `/api/v1/users/username`               | `authenticate` | Change unique username handle                                |
| `GET`    | `/api/v1/users/suggest-username`       | `authenticate` | Suggest available unique username derived from name          |
| `POST`   | `/api/v1/users/avatar`                 | `authenticate` | Upload and optimize user profile avatar (multipart)          |
| `DELETE` | `/api/v1/users/avatar`                 | `authenticate` | Remove user profile avatar                                   |
| `GET`    | `/api/v1/users/sessions`               | `authenticate` | List all active sessions with device & IP info               |
| `DELETE` | `/api/v1/users/sessions/:sessionId`    | `authenticate` | Revoke a specific active session                             |
| `POST`   | `/api/v1/users/sessions/revoke-others` | `authenticate` | Revoke all other active sessions except current              |
| `POST`   | `/api/v1/users/schedule-deletion`      | `authenticate` | Schedule account deletion (14-day grace window)              |
| `POST`   | `/api/v1/users/cancel-deletion`        | `authenticate` | Cancel pending account deletion                              |
| `POST`   | `/api/v1/users/request-email-change`   | `authenticate` | Initiate primary email address change with verification link |
| `POST`   | `/api/v1/users/admin/broadcast-policy` | `authenticate` | Admin: broadcast legal policy updates to all verified users  |

### Personal Finances (`/api/v1/finances/*`)

All finance routes require the `authenticate` preHandler guard.

#### Allocation Buckets (`/api/v1/finances/buckets`)

| Method   | Endpoint                                 | Description                                                      |
| -------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `GET`    | `/api/v1/finances/buckets`               | List all allocation buckets for current user                     |
| `POST`   | `/api/v1/finances/buckets/seed-defaults` | Seed standard default allocation buckets (Needs, Wants, Savings) |
| `GET`    | `/api/v1/finances/buckets/:id`           | Retrieve bucket details by ID                                    |
| `POST`   | `/api/v1/finances/buckets`               | Create custom allocation bucket (`CreateBucketSchema`)           |
| `PATCH`  | `/api/v1/finances/buckets/:id`           | Update allocation bucket details (`UpdateBucketSchema`)          |
| `DELETE` | `/api/v1/finances/buckets/:id`           | Delete custom bucket (fails if built-in or contains categories)  |

#### Expense Categories (`/api/v1/finances/categories`)

| Method   | Endpoint                                    | Description                                                      |
| -------- | ------------------------------------------- | ---------------------------------------------------------------- |
| `GET`    | `/api/v1/finances/categories`               | List categories with optional bucket filter (`?bucket_id=`)      |
| `POST`   | `/api/v1/finances/categories/seed-defaults` | Seed curated standard categories nested under allocation buckets |
| `GET`    | `/api/v1/finances/categories/:id`           | Retrieve category by ID                                          |
| `POST`   | `/api/v1/finances/categories`               | Create expense category under bucket (`CreateCategorySchema`)    |
| `PATCH`  | `/api/v1/finances/categories/:id`           | Update category details (`UpdateCategorySchema`)                 |
| `DELETE` | `/api/v1/finances/categories/:id`           | Delete expense category                                          |

#### Monthly Income (`/api/v1/finances/income`)

| Method   | Endpoint                      | Description                                                       |
| -------- | ----------------------------- | ----------------------------------------------------------------- |
| `GET`    | `/api/v1/finances/income`     | List income records with optional query filters (`month`, `year`) |
| `GET`    | `/api/v1/finances/income/:id` | Retrieve monthly income entry by ID                               |
| `POST`   | `/api/v1/finances/income`     | Register monthly income with auto net calculation                 |
| `PATCH`  | `/api/v1/finances/income/:id` | Update income entry and recalculate derived total                 |
| `DELETE` | `/api/v1/finances/income/:id` | Delete income entry                                               |

#### Budget Plans (`/api/v1/finances/budgets`)

| Method   | Endpoint                              | Description                                                         |
| -------- | ------------------------------------- | ------------------------------------------------------------------- |
| `GET`    | `/api/v1/finances/budgets`            | List budget plans with filters (`bucket_id`, `income_id`, `status`) |
| `GET`    | `/api/v1/finances/budgets/:id`        | Retrieve budget plan by ID                                          |
| `GET`    | `/api/v1/finances/budgets/:id/health` | Recompute real-time budget consumption, status & remaining          |
| `POST`   | `/api/v1/finances/budgets`            | Create budget plan for bucket & income allocation                   |
| `PATCH`  | `/api/v1/finances/budgets/:id`        | Update budget parameters and thresholds                             |
| `DELETE` | `/api/v1/finances/budgets/:id`        | Delete budget plan                                                  |

#### Expenses (`/api/v1/finances/expenses`)

| Method   | Endpoint                        | Description                                                                   |
| -------- | ------------------------------- | ----------------------------------------------------------------------------- |
| `GET`    | `/api/v1/finances/expenses`     | List expenses with filters (`category_id`, `from`, `to`, `is_split`, `limit`) |
| `GET`    | `/api/v1/finances/expenses/:id` | Get expense by ID (including nested splits if split expense)                  |
| `POST`   | `/api/v1/finances/expenses`     | Log new expense with atomic split share creation                              |
| `PATCH`  | `/api/v1/finances/expenses/:id` | Update expense details                                                        |
| `DELETE` | `/api/v1/finances/expenses/:id` | Delete expense and cascade delete linked split expenses                       |

#### Split Contacts & Obligations (`/api/v1/finances/splits`)

| Method  | Endpoint                                    | Description                                     |
| ------- | ------------------------------------------- | ----------------------------------------------- |
| `GET`   | `/api/v1/finances/splits/contacts`          | List user split contacts                        |
| `POST`  | `/api/v1/finances/splits/contacts`          | Register new split contact member               |
| `PATCH` | `/api/v1/finances/splits/contacts/:id`      | Update split contact details                    |
| `GET`   | `/api/v1/finances/splits/shares/pending`    | List unsettled split shares owed to user        |
| `POST`  | `/api/v1/finances/splits/shares/:id/settle` | Settle split share obligation (partial or full) |

#### Financial Goals (`/api/v1/finances/goals`)

| Method   | Endpoint                     | Description                                                    |
| -------- | ---------------------------- | -------------------------------------------------------------- |
| `GET`    | `/api/v1/finances/goals`     | List goals with timeline pace evaluation (`calculateGoalPace`) |
| `GET`    | `/api/v1/finances/goals/:id` | Get goal details by ID with calculated pace                    |
| `POST`   | `/api/v1/finances/goals`     | Create new savings goal linked to bucket                       |
| `PATCH`  | `/api/v1/finances/goals/:id` | Update goal progress or parameters                             |
| `DELETE` | `/api/v1/finances/goals/:id` | Delete savings goal                                            |

#### Multi-Class Assets (`/api/v1/finances/assets`)

| Method | Endpoint                          | Description                                                 |
| ------ | --------------------------------- | ----------------------------------------------------------- |
| `GET`  | `/api/v1/finances/assets/digital` | List digital commodities (gold, silver)                     |
| `POST` | `/api/v1/finances/assets/digital` | Log digital commodity purchase with auto GST valuation      |
| `GET`  | `/api/v1/finances/assets/equity`  | List equity holdings                                        |
| `POST` | `/api/v1/finances/assets/equity`  | Log equity share purchase with valuation                    |
| `GET`  | `/api/v1/finances/assets/summary` | Get aggregated portfolio valuation (commodities + equities) |

#### Dashboard Summaries (`/api/v1/finances/summaries`)

| Method | Endpoint                                         | Description                                             |
| ------ | ------------------------------------------------ | ------------------------------------------------------- |
| `GET`  | `/api/v1/finances/summaries/overview`            | Retrieve dashboard metrics for month (`?month=YYYY-MM`) |
| `POST` | `/api/v1/finances/summaries/statements/generate` | Generate immutable monthly statement snapshot           |

### Notifications & Alerts (`/api/v1/notifications/*`)

All notification routes require the `authenticate` preHandler guard.

#### In-App Alerts (`/api/v1/notifications/alerts`)

| Method   | Endpoint                                    | Description                                      |
| -------- | ------------------------------------------- | ------------------------------------------------ |
| `GET`    | `/api/v1/notifications/alerts`              | List user in-app alerts with filter & pagination |
| `GET`    | `/api/v1/notifications/alerts/unread-count` | Get total unread alert count                     |
| `PATCH`  | `/api/v1/notifications/alerts/:id/read`     | Mark a single alert notification as read         |
| `POST`   | `/api/v1/notifications/alerts/mark-read`    | Batch mark alerts as read (`alert_ids` or `all`) |
| `DELETE` | `/api/v1/notifications/alerts/:id`          | Dismiss/delete an alert notification             |

#### Notification Preferences (`/api/v1/notifications/preferences`)

| Method  | Endpoint                                | Description                                                       |
| ------- | --------------------------------------- | ----------------------------------------------------------------- |
| `GET`   | `/api/v1/notifications/preferences`     | List notification channel and category preferences                |
| `PUT`   | `/api/v1/notifications/preferences`     | Upsert delivery preference for channel and category               |
| `PATCH` | `/api/v1/notifications/preferences/:id` | Partially update preference (enabled status, frequency, schedule) |

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` in `apps/api-server/` before starting:

```bash
cp .env.example .env
```

### Configuration Sections

```ini
# ---- Application ----
KALYA_APP.NAME=Kalya
KALYA_APP.API_VERSION=v1
KALYA_APP.CLIENT_URL=http://localhost:3000

# ---- Primary Environment ----
# Allowed: local | development | staging | production
KALYA_PRIMARY.ENV=local

# ---- Server Configuration ----
KALYA_SERVER.HOST=0.0.0.0
KALYA_SERVER.PORT=3600
KALYA_SERVER.READ_TIMEOUT=30
KALYA_SERVER.WRITE_TIMEOUT=30
KALYA_SERVER.IDLE_TIMEOUT=60
KALYA_SERVER.CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
KALYA_SERVER.CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS

# ---- Database ----
KALYA_DATABASE.URL="./data/kalya.db"

# ---- Authentication & Sessions ----
KALYA_AUTH.SECRET_KEY=your-secure-random-secret-key-min-32-chars
KALYA_AUTH.BASE_URL=http://localhost:3600
KALYA_AUTH.ACCESS_TOKEN_EXPIRES_LIFE=15m
KALYA_AUTH.REFRESH_TOKEN_EXPIRES_LIFE=7d

# ---- Google OAuth 2.0 ----
KALYA_AUTH.GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
KALYA_AUTH.GOOGLE_CLIENT_SECRET=your-google-client-secret

# ---- Cookies ----
KALYA_COOKIE.DOMAIN=
KALYA_COOKIE.SAME_SITE=lax

# ---- Observability & Logging ----
KALYA_OBSERVABILITY.SERVICE_NAME=kalya-api
KALYA_OBSERVABILITY.ENVIRONMENT=local
KALYA_OBSERVABILITY.LOGGING.LEVEL=debug
KALYA_OBSERVABILITY.LOGGING.FORMAT=console
KALYA_OBSERVABILITY.LOGGING.SLOW_QUERY_THRESHOLD=500ms
KALYA_OBSERVABILITY.HEALTH_CHECKS.ENABLED=true
KALYA_OBSERVABILITY.HEALTH_CHECKS.INTERVAL=30s
KALYA_OBSERVABILITY.HEALTH_CHECKS.TIMEOUT=5s
KALYA_OBSERVABILITY.HEALTH_CHECKS.CHECKS=database,memory

# ---- Transactional Mail ----
# Provider: smtp | resend
KALYA_MAIL.PROVIDER=smtp
KALYA_MAIL.FROM=Kalya <noreply@kalya.io>

# SMTP Configuration
KALYA_SMTP.HOST=smtp.mailtrap.io
KALYA_SMTP.PORT=2525
KALYA_SMTP.SECURE=false
KALYA_SMTP.USER=your-smtp-user
KALYA_SMTP.PASSWORD=your-smtp-password
KALYA_SMTP.EMAIL=noreply@kalya.io

# Resend Configuration (used if KALYA_MAIL.PROVIDER=resend)
KALYA_MAIL.RESEND_API_KEY=re_123456789

# ---- Storage ----
# Provider: local | cloudinary
KALYA_STORAGE.PROVIDER=local
KALYA_STORAGE.LOCAL_UPLOAD_DIR=./uploads
KALYA_STORAGE.LOCAL_BASE_URL=http://localhost:3600/uploads

# Cloudinary Configuration (used if KALYA_STORAGE.PROVIDER=cloudinary)
KALYA_STORAGE.CLOUDINARY_CLOUD_NAME=
KALYA_STORAGE.CLOUDINARY_API_KEY=
KALYA_STORAGE.CLOUDINARY_API_SECRET=
KALYA_STORAGE.CLOUDINARY_FOLDER=kalya
```

---

## 💻 Development & Scripts

All commands can be executed from the monorepo root using `pnpm` filter or directly within `apps/api-server`.

| Command            | Description                                                           |
| ------------------ | --------------------------------------------------------------------- |
| `pnpm dev`         | Starts API server with hot-reload via `tsx watch`                     |
| `pnpm build`       | Compiles TypeScript to JavaScript in `dist/`                          |
| `pnpm start`       | Runs the compiled production server (`node dist/index.js`)            |
| `pnpm typecheck`   | Validates TypeScript types across the package (`tsc --noEmit`)        |
| `pnpm lint`        | Runs ESLint analysis across all source files                          |
| `pnpm docker:up`   | Starts local infrastructure (MailDev web at `:1080`, SMTP at `:1025`) |
| `pnpm docker:down` | Stops and tears down local Docker containers                          |
| `pnpm docker:logs` | Tails Docker container logs in real time                              |

### Monorepo Workflows

```bash
# From workspace root:
pnpm --filter @kalya/api-server dev
pnpm --filter @kalya/api-server typecheck
pnpm --filter @kalya/api-server lint
```
