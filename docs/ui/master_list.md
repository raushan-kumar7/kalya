# Kalya — Master Component List (Build-From-Scratch)

Complete list of every reusable component required for Kalya. **Nothing has been built yet** — this replaces the earlier version, which incorrectly assumed some components already existed. Every item below starts at ❌ and needs to be created in `src/components/ui/`.

**Legend:** ❌ Not built · 🔲 Foundation (non-component, blocks everything else)

---

## 0. Foundation — Build Before Any Component (blocking)

Nothing in Sections 1–6 can be built cleanly until these exist.

| # | Item | File | Status |
|---|---|---|---|
| A | `cn` class-merge helper | `src/lib/utils.ts` | ✅ |
| B | Theme Provider (`next-themes`, `data-theme` attribute) | `src/components/theme-provider.tsx` | ✅ |
| C | Root layout hydration guard (`suppressHydrationWarning`) | `src/app/layout.tsx` | ✅ |
| D | `class-variance-authority`, `clsx`, `tailwind-merge` installed | `package.json` | ✅ |
| E | Radix UI / Base UI primitives installed as needed per component | `package.json` | ✅ |

---

## 1. Core Primitives

| # | Component | File | Status | Priority | Purpose |
|---|---|---|---|---|---|
| 1 | Button | `button.tsx` | ✅ | **P0** | Primary actions; variants: default (emerald), accent (gold), outline, ghost, success, danger |
| 2 | Input | `input.tsx` | ✅ | **P0** | Text entry; icons, clearable, loading, password reveal |
| 3 | Textarea | `textarea.tsx` | ✅ | **P0** | Multi-line text entry |
| 4 | Card | `card.tsx` | ✅ | **P0** | Content container (header/body/footer) |
| 5 | Label | `label.tsx` | ✅ | **P0** | Standalone accessible field label — needed before `Field` |
| 6 | Checkbox | `checkbox.tsx` | ✅ | P1 | Boolean / multi-select in lists |
| 7 | Radio Group | `radio.tsx` | ✅ | P1 | Single choice from a visible set |
| 8 | Switch | `switch.tsx` | ✅ | P1 | Boolean toggle (settings-style) |
| 9 | Select | `select.tsx` | ✅ | P1 | Dropdown single choice |
| 10 | Combobox | `combobox.tsx` | ✅ | P1 | Searchable, filter-as-you-type select |
| 11 | Date Picker | `date-picker.tsx` | ✅ | P1 | Calendar-based date selection |
| 12 | Field | `field.tsx` | ✅ | **P1** | Composed label + control + helper + error wrapper |
| 13 | Input Group | `input-group.tsx` | ✅ | **P1** | Currency prefix/suffix (₹, %, etc.) |
| 14 | Avatar | `avatar.tsx` | ❌ | P2 | User/entity image with fallback initials |
| 15 | Accordion | `accordion.tsx` | ❌ | P2 | Expand/collapse sections |
| 16 | Image | `image.tsx` | ❌ | P2 | Custom image wrapper |
| 17 | Link Button | `link-btn.tsx` | ❌ | P2 | Styled link-as-button |
| 18 | Username Field | `username-field.tsx` | ❌ | P2 | Specialized input — build on `Field` pattern from the start |
| 19 | Slider | `slider.tsx` | ❌ | P2 | Numeric range selection (e.g. budget limits) |
| 20 | Toggle / Toggle Group | `toggle.tsx` | ❌ | P3 | Pressed/unpressed, segmented single/multi toggle |
| 21 | Collapsible | `collapsible.tsx` | ❌ | P3 | Single expand/collapse region (Accordion's atomic unit) |
| 22 | Calendar (standalone) | `calendar.tsx` | ✅ | P3 | Plain calendar display / range picker |
| 23 | Native Select | `native-select.tsx` | ❌ | P3 | Browser `<select>` fallback for mobile perf/UX |
| 24 | Button Group | `button-group.tsx` | ❌ | P3 | Grouped/segmented action sets |
| 25 | Input OTP | `input-otp.tsx` | ❌ | P3 | Verification code entry (2FA, login) |

---

## 2. Feedback & Status

| # | Component | File | Status | Priority | Purpose |
|---|---|---|---|---|---|
| 26 | Toast / Sonner | `toast.tsx` | ✅ | **P1** | Transient notification |
| 27 | Skeleton | `skeleton.tsx` | ✅ | **P1** | Loading placeholder shape |
| 28 | Tooltip | `tooltip.tsx` | ✅ | **P1** | Contextual label on hover/focus |
| 29 | Badge | `badge.tsx` | ✅ | **P1** | Status tag, count, label chip |
| 30 | Alert | `alert.tsx` | ✅ | **P1** | Inline static message (info/warning/error banners) |
| 31 | Alert Dialog | `alert-dialog.tsx` | ✅ | **P1** | Blocking confirmation for destructive actions (delete account, transaction) |
| 32 | Progress | `progress.tsx` | ❌ | P2 | Determinate progress bar |
| 33 | Spinner | `spinner.tsx` | ✅ | P2 | Indeterminate loading indicator |
| 34 | Empty State | `empty.tsx` | ✅ | P2 | No-data / no-results placeholder |

---

## 3. Overlay & Navigation

| # | Component | File | Status | Priority | Purpose |
|---|---|---|---|---|---|
| 35 | Dialog | `dialog.tsx` | ✅ | **P1** | Modal window — build once, no separate `Modal` component |
| 36 | Dropdown Menu | `dropdown-menu.tsx` | ✅ | **P1** | Action menu anchored to trigger |
| 37 | Tabs | `tabs.tsx` | ✅ | **P1** | Switch between sibling views (Accounts/Transactions/Reports) |
| 38 | Sidebar | `sidebar-nav.tsx` | ✅ | **P1** | Collapsible app-shell side navigation |
| 39 | Pagination | `pagination.tsx` | ✅ | **P1** | Page navigation for large transaction/EMI lists |
| 40 | Popover | `popover.tsx` | ✅ | P2 | Non-modal floating content anchored to trigger |
| 41 | Sheet | `sheet.tsx` | ❌ | P2 | Slide-in panel (desktop-oriented drawer) |
| 42 | Breadcrumb | `breadcrumb.tsx` | ❌ | P2 | Hierarchical location trail |
| 43 | Drawer | `drawer.tsx` | ❌ | P3 | Bottom-sheet overlay (mobile-oriented) |
| 44 | Hover Card | `hover-card.tsx` | ❌ | P3 | Preview card on hover |
| 45 | Context Menu | `context-menu.tsx` | ❌ | P3 | Right-click menu |
| 46 | Menubar | `menubar.tsx` | ❌ | P3 | Persistent top-level app menu |
| 47 | Navigation Menu | `navigation-menu.tsx` | ❌ | P3 | Primary nav with flyouts |
| 48 | Command | `command.tsx` | ❌ | P3 | ⌘K-style command palette |

---

## 4. Layout & Display

| # | Component | File | Status | Priority | Purpose |
|---|---|---|---|---|---|
| 49 | Page Header | `page-header.tsx` | ✅ | **P1** | Section wrapper: display title, breadcrumbs, primary action |
| 50 | Data Table | `data-table.tsx` | ✅ | **P1** | Table + sort/filter/pagination (TanStack Table) — transaction lists, account summaries |
| 51 | Chart | `chart-wrapper.tsx` | ✅ | **P1** | Theme-responsive Recharts wrapper (trends, allocations) |
| 52 | Table | `table.tsx` | ✅ | P2 | Static tabular data |
| 53 | Separator | `separator.tsx` | ❌ | P2 | Visual divider line |
| 54 | Typography | `typography.tsx` | ❌ | P2 | Prose/heading style presets |
| 55 | Aspect Ratio | `aspect-ratio.tsx` | ❌ | P3 | Fixed width:height ratio for media |
| 56 | Scroll Area | `scroll-area.tsx` | ❌ | P3 | Custom-styled scrollable region |
| 57 | Resizable | `resizable.tsx` | ❌ | P3 | Draggable resizable panes |
| 58 | Carousel | `carousel.tsx` | ❌ | P3 | Swipeable item slider |
| 59 | Item | `item.tsx` | ❌ | P3 | Generic list-row primitive (icon + text + action) |
| 60 | Kbd | `kbd.tsx` | ❌ | P3 | Styled keyboard-shortcut key display |
| 61 | Direction (RTL/LTR) | `direction.tsx` | ❌ | P3 | Direction context provider |

---

## 5. Kalya-Specific Financial Components

*Not in shadcn/ui — unique to Kalya's domain. Depend on Core Primitives (Section 1) being done first.*

| # | Component | File | Status | Priority | Purpose |
|---|---|---|---|---|---|
| 62 | ThemeToggle | `theme-toggle.tsx` | ✅ | **P0** | Light/Dark/System switch via `next-themes` — needed immediately after the Theme Provider |
| 63 | NumericValue | `numeric-value.tsx` | ✅ | **P1** | IBM Plex Mono, Indian numbering (Lakhs/Crores), auto green/red/neutral coloring |
| 64 | BudgetProgress | `budget-progress.tsx` | ✅ | **P1** | Progress bar → warning at 80%, danger at 100%+ |
| 65 | MetricCard | `metric-card.tsx` | ✅ | **P1** | Dashboard stat card (net worth, assets, EPF/PPF/NPS) |
| 66 | EMITable | `emi-table.tsx` | ✅ | P2 | Monospace-aligned interest/principal/balance columns |

---

## 6. Chat Interface Primitives

*Only relevant if an in-app assistant/chat feature is planned. Not scheduled unless that roadmap item is confirmed.*

| # | Component | File | Status | Priority |
|---|---|---|---|---|
| 67 | Message Scroller | `message-scroller.tsx` | ❌ | Backlog |
| 68 | Message | `message.tsx` | ❌ | Backlog |
| 69 | Bubble | `bubble.tsx` | ❌ | Backlog |
| 70 | Attachment | `attachment.tsx` | ❌ | Backlog |
| 71 | Marker | `marker.tsx` | ❌ | Backlog |

---

## Summary Counts

| Status | Count |
|---|---|
| ❌ Must be created | 68 |
| 🔲 Foundation items (non-component) | 5 |
| **Total items in scope** | **76** |

---

## Build Order (from a completely empty component library)

### Step 0 — Foundation (do first, nothing else works without this)
`cn` helper → install CVA/clsx/tailwind-merge → Theme Provider → `suppressHydrationWarning` on root layout

### P0 — Absolute First Components (6)
`Button` · `Input` · `Textarea` · `Card` · `Label` · `ThemeToggle`

*(These are the atoms everything else composes from — you cannot build `Field`, `Dialog`, or any form without `Input`/`Label`, and you cannot verify the theme system works end-to-end without `ThemeToggle`.)*

### P1 — Core Application Shell + Forms + Financial Display (23)
**Forms:** `Field` · `Input Group` · `Checkbox` · `Radio Group` · `Switch` · `Select` · `Combobox` · `Date Picker`
**Feedback:** `Toast` · `Skeleton` · `Tooltip` · `Badge` · `Alert` · `Alert Dialog`
**Navigation/Overlay:** `Dialog` · `Dropdown Menu` · `Tabs` · `Sidebar` · `Pagination`
**Layout:** `Page Header` · `Data Table` · `Chart`
**Financial:** `NumericValue` · `BudgetProgress` · `MetricCard`

*(This tier is what turns the app from a blank shell into a working dashboard: navigation, forms that submit safely, tables that display transactions, and the financial primitives that make numbers actually look like Kalya.)*

### P2 — Build Next (18)
`Avatar` · `Accordion` · `Image` · `Link Button` · `Username Field` · `Slider` · `Progress` · `Spinner` · `Empty State` · `Popover` · `Sheet` · `Breadcrumb` · `Table` · `Separator` · `Typography` · `EMITable`

### P3 — Backlog (24)
`Toggle/Toggle Group` · `Collapsible` · `Calendar` · `Native Select` · `Button Group` · `Input OTP` · `Drawer` · `Hover Card` · `Context Menu` · `Menubar` · `Navigation Menu` · `Command` · `Aspect Ratio` · `Scroll Area` · `Resizable` · `Carousel` · `Item` · `Kbd` · `Direction`

### Deferred (5)
Chat primitives — build only if an in-app assistant feature is confirmed on the roadmap.

---

*Reference: [overview.md](file:///D:/Projects/personal/kalya/docs/components/ui/overview.md) for token mapping, CVA patterns, and accessibility rules. Reference: [TODO.md](file:///D:/Projects/personal/kalya/docs/components/ui/TODO.md) for sequencing and setup tasks.*