# Kalya UI — Reusable Component Library

This directory contains the custom, reusable component system for **Kalya** (कल्य). These components are designed from scratch using React 19, Next.js 16 (App Router), Tailwind CSS v4, and Radix UI primitives.

## Brand & Design Philosophy
Kalya’s interface strives to feel **Trustworthy & Grounded**, **Clear & Instructive**, and **Modern & Premium**.

* **Color Restrictions:** Never use raw hex values in components. All styling relies on the design tokens configured in `/src/styles/globals.css`.
* **Typography Hierarchy:**
  * **Outfit** (`font-display`): Used strictly for page titles, hero headers, and major numbers (e.g. net worth hero stats).
  * **Inter** (`font-body`): Used for labels, body copy, descriptions, buttons, forms, and navigation.
  * **IBM Plex Mono** (`font-numeric` / `tabular-nums`): Used for all currency figures, interest rates, EPF/PPF balances, outstanding debt values, and tabular rows to ensure reliable scan-ability.

---

## Core Guidelines & Conventions

### 1. The `cn` Class Merger
Every component that accepts class names must merge them with our utility helper:
```typescript
import { cn } from "@/lib/utils";

// Example Usage
<div className={cn("bg-surface text-text-primary", className)} />
```

### 2. Dark Mode Selector Strategy
Dark mode styling relies on scoping variables inside the attribute selector `[data-theme="dark"]` rather than Tailwind's default class-based `.dark`. 
* Toggling is managed via `next-themes` and a custom [ThemeToggle](file:///D:/Projects/personal/kalya/src/components/ui/theme-toggle.tsx).
* Use standard Tailwind CSS class modifiers prefix `dark:` (e.g., `bg-white dark:bg-black`) which are mapped to attribute selectors via `@custom-variant dark` in [globals.css](file:///D:/Projects/personal/kalya/src/styles/globals.css).

### 3. Variant Management (CVA)
Always use `class-variance-authority` (CVA) to define semantic state combinations (colors, sizes, alignments) instead of ad-hoc strings or inline nested ternary operators.

---

## Component Catalog

### Core Primitives
* **Button** ([button.tsx](file:///D:/Projects/personal/kalya/src/components/ui/button.tsx)) — Core interactive action button with loading, active states, and custom variants (`default`, `accent`, `outline`, `ghost`, `success`, `danger`).
* **Input** ([input.tsx](file:///D:/Projects/personal/kalya/src/components/ui/input.tsx)) / **Textarea** ([textarea.tsx](file:///D:/Projects/personal/kalya/src/components/ui/textarea.tsx)) — Accessible form text entries with status helper messages, icons, clear buttons, and input validation styles.
* **Input Group** ([input-group.tsx](file:///D:/Projects/personal/kalya/src/components/ui/input-group.tsx)) — Appends prefixes/suffixes (e.g., `₹`, `%`, `per month`) cleanly to numeric inputs.
* **Field** ([field.tsx](file:///D:/Projects/personal/kalya/src/components/ui/field.tsx)) — General wrapper consolidating `Label` + input controller + auxiliary helper / validation error text.
* **Card** ([card.tsx](file:///D:/Projects/personal/kalya/src/components/ui/card.tsx)) — Box wrapper for surface content blocks with elevation transition on hover.

### Financial Primitives
* **NumericValue** ([numeric-value.tsx](file:///D:/Projects/personal/kalya/src/components/ui/numeric-value.tsx)) — Prints currency or numbers styled under Indian formatting (`en-IN` Lakhs/Crores layout). Supports positive/negative color coding (`text-success` or `text-danger`).
* **BudgetProgress** ([budget-progress.tsx](file:///D:/Projects/personal/kalya/src/components/ui/budget-progress.tsx)) — Visual indicator displaying current budget thresholds; flags warnings at 80% (`bg-warning`) and alerts overruns at 100% (`bg-danger`).
* **MetricCard** ([metric-card.tsx](file:///D:/Projects/personal/kalya/src/components/ui/metric-card.tsx)) — Layout card for high-level dashboard metrics (consolidated net worth, liability percentages).
* **EMITable** ([emi-table.tsx](file:///D:/Projects/personal/kalya/src/components/ui/emi-table.tsx)) — Monospace-aligned amortization chart with interest/principal/outstanding-balance values. Limits vertical footprint with collapsible views.

### Feedback & Overlays
* **Spinner** ([spinner.tsx](file:///D:/Projects/personal/kalya/src/components/ui/spinner.tsx)) — Indeterminate loading indicator for asynchronous content fetching.
* **Empty State** ([empty.tsx](file:///D:/Projects/personal/kalya/src/components/ui/empty.tsx)) — Clean card layout with icons and CTA actions when lists contain no records.
* **Alert** ([alert.tsx](file:///D:/Projects/personal/kalya/src/components/ui/alert.tsx)) — Non-blocking inline banner indicating validation warnings or system announcements.
* **Dialog** ([dialog.tsx](file:///D:/Projects/personal/kalya/src/components/ui/dialog.tsx)) / **Alert Dialog** ([alert-dialog.tsx](file:///D:/Projects/personal/kalya/src/components/ui/alert-dialog.tsx)) — Radix-driven modal windows for detailed workflows or blocking confirmations (e.g. destructive actions).
* **Toast** ([toast.tsx](file:///D:/Projects/personal/kalya/src/components/ui/toast.tsx)) — Transient snackbar notifications for UI events.
* **Skeleton** ([skeleton.tsx](file:///D:/Projects/personal/kalya/src/components/ui/skeleton.tsx)) — Animated layout shapes for shell loading states.

### Navigation & Layout
* **SidebarNav** ([sidebar-nav.tsx](file:///D:/Projects/personal/kalya/src/components/ui/sidebar-nav.tsx)) — App-shell navigation sidebar with active state highlights.
* **PageHeader** ([page-header.tsx](file:///D:/Projects/personal/kalya/src/components/ui/page-header.tsx)) — Standard page top title header with breadcrumbs and action triggers.
* **Pagination** ([pagination.tsx](file:///D:/Projects/personal/kalya/src/components/ui/pagination.tsx)) — Grid control for split page listings.

---

## Usage Example

```tsx
import { Card, CardContent, NumericValue, EMITable } from "@/components/ui";

const amortizationSchedule = [
  { month: 1, payment: 42500, principal: 15000, interest: 27500, outstandingBalance: 860000 },
  { month: 2, payment: 42500, principal: 15150, interest: 27350, outstandingBalance: 844850 },
];

export default function LoanSummary() {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <span className="text-text-secondary text-sm">Remaining Loan Amount</span>
          <h2 className="text-xl font-bold">
            <NumericValue value={860000} colored={false} />
          </h2>
        </div>
        <EMITable payments={amortizationSchedule} initialVisibleRows={12} />
      </CardContent>
    </Card>
  );
}
```
