# Kalya UI & Reusable Components — TODO

Consolidated task list for global styles, theme setup, and the reusable component system. Follows [overview.md](file:///D:/Projects/personal/kalya/docs/components/ui/overview.md). Supersedes the two earlier separate checklists.

---

## 1. Setup & Styling Configuration

- [x] Install variant management package — `pnpm add class-variance-authority`
- [x] Create `src/lib/utils.ts` with the `cn` helper (`clsx` + `tailwind-merge`)
- [x] Delete unused `src/app/globals.css` boilerplate (initial Next.js template) to avoid style conflicts
- [x] Confirm `layout.tsx` imports only `@/styles/globals.css`
- [x] Verify Outfit (`--font-display`), Inter (`--font-body`), and IBM Plex Mono (`--font-numeric`) load correctly with no layout shift (CLS)

---

## 2. Light / Dark / System Theme Integration

- [x] Create `src/components/theme-provider.tsx` wrapping `next-themes` (`attribute="data-theme"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`)
- [x] Wrap `ThemeProvider` around children in `src/app/layout.tsx`
- [x] Add `suppressHydrationWarning` to `<html>` in `layout.tsx` to prevent flash-of-wrong-theme
- [x] Refactor `<body>` styling in `layout.tsx` to use token classes instead of hardcoded hex:
  ```tsx
  className="bg-bg text-text-primary min-h-full flex flex-col transition-colors duration-200"
  ```
- [x] Build `ThemeToggle` (`src/components/ui/theme-toggle.tsx`) — light/dark/system switch via `useTheme()`, with a subtle micro-animation on toggle

---

## 3. Core Primitive Components (`src/components/ui/`)

Build/refactor with CVA + Radix (or Base UI) primitives where keyboard nav or focus management is involved.

- [x] **Button** (`button.tsx`) — variants: `default` (emerald), `accent` (gold), `outline`, `ghost`, `success`, `danger`; loading state; disabled pointer-events handling
- [x] **Input** (`input.tsx`) — leading/trailing icons, clearable, loading, password reveal, helper/error text, hover/focus-visible states
- [x] **Textarea** (`textarea.tsx`) — resizing, error states, consistent API with Input
- [x] **Card** (`card.tsx`) — `bg-surface` / `border-border`, optional `hover:bg-surface-raised` elevation transition
- [x] **Badge / Chip** (`badge.tsx`) — semantic variants: `success`, `warning`, `danger`, `info`
- [x] **Tabs** (`tabs.tsx`) — segmented view switcher (e.g. Asset Classes, Monthly Budgets, Accounts/Transactions/Reports)
- [x] **Dialog / Modal** (`dialog.tsx`) — Radix-based, Framer Motion backdrop fade + scale-up entrance; **consolidate the existing duplicate `modal.tsx` into this**
- [x] **Tooltip** (`tooltip.tsx`) — for explaining financial terms on hover (e.g. NPS Tier 1 vs Tier 2)
- [x] **Field** (`field.tsx`) — composed label + control + helper + error wrapper, generalizing the pattern already proven in `Input.tsx`
- [x] **Input Group** (`input-group.tsx`) — prefix/suffix support for currency symbols and units

---

## 4. Financial & Analytics Components

- [x] **NumericValue** (`numeric-value.tsx`) — IBM Plex Mono, Indian numbering format (Lakhs/Crores, e.g. `12,00,000` not `1,200,000`); auto-color: green for positive, red for negative, neutral otherwise
- [x] **BudgetProgress** (`budget-progress.tsx`) — progress bar; `bg-warning` at ≥80%, `bg-danger` at ≥100%
- [x] **MetricCard** (`metric-card.tsx`) — dashboard stat card: Outfit for the headline figure, IBM Plex Mono for sub-label/trend %
- [x] **ChartWrapper** (`chart-wrapper.tsx`) — theme-responsive Recharts wrapper bound to `--color-primary` etc. across light/dark
- [x] **EMITable** (`emi-table.tsx`) — monospace-aligned interest/principal/outstanding-balance columns

---

## 5. Navigation & Layout Components

- [x] **PageHeader** (`page-header.tsx`) — Outfit display title, optional breadcrumbs, primary action slot
- [x] **SidebarNav** (`sidebar-nav.tsx`) — sticky side nav, emerald brand coloring for active state

---

## 6. Near-Term Priority Additions (from gap analysis)

Not yet scheduled into a section above — pull into Sections 3–5 as needed:

- [x] **Data Table** — transaction lists, account summaries (TanStack Table)
- [x] **Alert** — inline validation/system messages
- [x] **Alert Dialog** — blocking confirmation for destructive actions (e.g. delete account/transaction)
- [x] **Pagination** — large transaction/EMI datasets
- [x] **Standalone Spinner** — async operations where Skeleton isn't the right fit
- [x] **Empty state** — no-data/no-results placeholder for lists/tables

---

## 7. Verification & Testing

- [ ] **Hydration check** — no flash-of-wrong-theme on initial load in System/Dark mode
- [ ] **Contrast verification** — Emerald (`#0D3E26`) and Gold (`#B8912E`) meet WCAG AA on both light and dark surfaces
- [ ] **Keyboard navigation** — Dialogs, buttons, and form inputs fully Tab-navigable
- [ ] **Screen reader pass** — icon-only buttons have `aria-label`; dynamic content (toasts, inline errors) uses `aria-live`
- [ ] Unit tests (Vitest + React Testing Library) for each new component, with rendered-output snapshots

---

## 8. Backlog / Later

Lower priority — revisit once the core + financial component sets are stable:

- [ ] Button Group, Input OTP, Slider, standalone Label, Toggle/Toggle Group, Native Select
- [x] standalone Calendar (`calendar.tsx`)
- [x] Popover (`popover.tsx`)
- [x] Table (`table.tsx`)
- [ ] Sheet, Drawer, Hover Card, Context Menu, Menubar, Navigation Menu, Command, Breadcrumb, Collapsible
- [ ] Aspect Ratio, Separator, Scroll Area, Resizable, Carousel, Item, Kbd, Typography, Direction
- [ ] Storybook setup for visual documentation/regression testing
- [ ] `src/theme/index.ts` abstraction layer — only if white-labeling or multi-brand theming becomes a real requirement
- [ ] Chat interface primitives (Message Scroller, Message, Bubble, Attachment, Marker) — not core to Kalya's roadmap today; revisit only if an in-app assistant/chat feature is planned

---

*Reference: [overview.md](file:///D:/Projects/personal/kalya/docs/components/ui/overview.md) for full guidelines, token mapping, and sample code.*


agy --conversation=f66db4d7-32c3-436d-8358-275c92b96172