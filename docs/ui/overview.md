# Kalya UI Components — Overview & Guidelines

Source of truth for building and maintaining Kalya's (कल्य) reusable UI components. All components must align with Kalya's brand pillars: **Trustworthy & Grounded**, **Clear & Instructive**, **Empowering & Calm**, and **Modern & Premium**.

---

## 1. Technology Stack

* **Framework**: React 19 / Next.js 16 (App Router)
* **Styling**: Tailwind CSS v4 (`@theme` directive in [globals.css](file:///D:/Projects/personal/kalya/src/styles/globals.css))
* **Primitives**: Radix UI (or Base UI) — headless, unstyled, accessible-by-default
* **Variant Management**: `class-variance-authority` (CVA)
* **Class merging**: `clsx` + `tailwind-merge`
* **Animation**: Framer Motion for state transitions (loading, open/close, error)
* **Distribution model**: components are copied into the repo (shadcn-style ownership), not installed as a dependency — we own the code and any bugs, and must manually port upstream fixes.

### 1.1 The `cn` Helper
Required in every reusable component that accepts a `className` prop.

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 2. Design Tokens & Color Mapping

All tokens live in [globals.css](file:///D:/Projects/personal/kalya/src/styles/globals.css). **Never hardcode raw hex codes** (e.g. `#0D3E26`, `#B8912E`) inside components — always use the mapped Tailwind v4 class.

| Design Token | CSS Variable | Tailwind v4 Class | Core UI Application |
|---|---|---|---|
| Deep Emerald | `--color-primary` | `bg-primary`, `text-primary` | Primary buttons, nav, brand marks |
| Satin Gold | `--color-accent` | `bg-accent`, `text-accent` | **Moment color**: milestones, achievements — not a workhorse color |
| Alabaster | `--color-bg` | `bg-bg` | App canvas / page background |
| Pure White | `--color-surface` | `bg-surface` | Cards, sheets, dialogs, modals |
| — | `--color-surface-raised` | `bg-surface-raised` | Hover/elevated surface |
| — | `--color-border` | `border-border` | Dividers, card outlines |
| Text Primary | `--color-text-primary` | `text-text-primary` | Titles, body text, labels |
| Text Secondary | `--color-text-secondary` | `text-text-secondary` | Subtitles, metadata |
| Text Muted | `--color-text-muted` | `text-text-muted` | Placeholders, disabled states, dates |

### 2.1 Semantic Financial States (strict usage)
Keep these rare and meaningful — do not use them for generic UI/system errors.

* 🟩 **Success** (`bg-success` / `text-success`) — positive net worth trend, income, asset appreciation
* 🟨 **Warning** (`bg-warning` / `text-warning`) — EMI due soon, budget ≥ 80%
* 🟥 **Danger** (`bg-danger` / `text-danger`) — liabilities, overspend, overdue bills. Never for standard non-financial errors.
* 🟦 **Info** (`bg-info` / `text-info`) — neutral tips, insights, tax information

---

## 3. Typography Rules

```
┌────────────────────────────────────────────────────────┐
│                      TYPOGRAPHY                        │
├─────────────────┬─────────────────┬────────────────────┤
│     Outfit      │      Inter      │   IBM Plex Mono    │
│  (font-display) │   (font-body)   │   (font-numeric)   │
├─────────────────┼─────────────────┼────────────────────┤
│  Hero Numbers   │   Body Copy     │  Currency Amounts  │
│  Page Titles    │   Form Labels   │  Account Balances  │
│  Onboarding     │   Nav & Buttons │  EMI / Schedules   │
└─────────────────┴─────────────────┴────────────────────┘
```

1. **Outfit** (`font-display`) — reserved strictly for hero stats, page titles, onboarding banners. Never body copy or tables.
2. **Inter** (`font-body`) — interface copy, forms, buttons, nav.
3. **IBM Plex Mono** (`font-numeric`) — **all** financial figures: currency, balances, EMI schedules, tabular data. Tabular alignment gives Kalya its "precision instrument" feel.

---

## 4. Light / Dark / System Theme Support

* **Selector strategy**: `data-theme` attribute — **not** class-based `.dark`, since `globals.css` scopes dark tokens under `[data-theme="dark"]`.
* **Hydration protection**: `suppressHydrationWarning` on `<html>` in `layout.tsx` to prevent flash-of-wrong-theme.
* **No-flash setup**: wrap the app in a `ThemeProvider` using `next-themes` with `attribute="data-theme"`, `defaultTheme="system"`, `enableSystem`.

```tsx
// src/components/theme-provider.tsx
"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

---

## 5. Component Composition with CVA

Use CVA for variant/size APIs instead of string interpolation or nested ternaries.

```tsx
// src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-text-primary hover:bg-primary-hover",
        accent: "bg-accent text-bg hover:opacity-90",
        outline: "border border-border bg-surface text-text-primary hover:bg-surface-raised",
        ghost: "text-text-secondary hover:bg-primary-subtle hover:text-primary",
        success: "bg-success text-white hover:opacity-95",
        danger: "bg-danger text-white hover:opacity-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

---

## 6. What the Primitive Layer Owns vs. What We Own

Radix/Base UI solves the hard, generic edge cases *once, correctly, per component*. Understanding this split prevents us from re-solving problems that are already handled, and flags what genuinely remains our job.

**Handled by Radix/Base UI (don't reimplement):**
- Focus trapping + focus return (Dialog, Sheet, AlertDialog)
- Roving tabindex (Tabs, Menu, RadioGroup)
- Full keyboard interaction patterns (arrow-nav, Escape-to-close, type-ahead)
- Portal + collision/auto-flip handling (Popover, Tooltip, DropdownMenu)
- Controlled/uncontrolled duality (`value`/`onValueChange` vs `defaultValue`)
- ARIA wiring: roles, `aria-*`, label↔control associations
- Composable trigger elements via `Slot` (avoids nested-interactive-element a11y violations)

**Still our responsibility, even when built on Radix:**
- IME composition handling in text inputs
- Double-submit guards / debounce on form actions
- Visual states via Tailwind + CVA (variant/size/loading/disabled styling)
- Domain-specific composition (e.g. `Field` = label + control + helper + error)
- Indian currency formatting, financial color semantics, EMI/table alignment

---

## 7. Interaction, Accessibility & Performance

### 7.1 Interactive States
* All interactive components must support visible focus: `focus-visible:ring-primary`.
* Micro-interactions: subtle scale on active (`active:scale-[0.98]`), 150ms transitions (`transition-colors duration-150`).
* Hover states required for all surface changes (e.g. `hover:bg-surface-raised`).

### 7.2 Accessibility Rules
1. Use Radix/Base UI primitives as the semantic foundation for complex components (Dialog, Popover, Dropdown) — don't hand-roll ARIA.
2. Every focusable element must be reachable via Tab. Use semantic elements (`<button>`, not `<div onClick>`).
3. Icon-only buttons require `aria-label`.
4. Add `aria-live` regions for dynamic content (toasts, inline validation).
5. Verify color contrast meets WCAG AA — check brand Emerald (`#0D3E26`) and Gold (`#B8912E`) specifically against both light and dark surfaces.

### 7.3 Performance
* All interactive components are `"use client"` — appropriate given their interactivity.
* Lazy-load heavy components (Chart, Data Table) rather than bundling them eagerly.
* Use `React.memo` where re-renders are demonstrably costly — not by default.

---

## 8. API Consistency Standards

Every component should share a predictable prop surface:
* `className` — always accepted, always merged via `cn`, never overwritten.
* `disabled` — consistent behavior/styling across Button, Input, Select, etc.
* `id` / `htmlFor` — correct label↔control association.
* Consistent event handler naming (`onChange`, `onClick`, `onValueChange` for Radix-pattern components).
* Controlled/uncontrolled duality wherever the component holds state (`value`/`onChange` or `defaultValue`).

---

## 9. Current Component Inventory vs. Target Catalog

Existing components (`src/components/ui/`): `button`, `checkbox`, `combobox`, `date-picker`, `input`, `radio`, `select`, `switch`, `textarea`, `badge`, `skeleton`, `toast`, `tooltip`, `dialog`, `dropdown-menu`, `modal`, `avatar`, `card`, `image`, `accordion`, `link-btn`, `username-field`.

> Note: `modal` and `dialog` appear to be duplicates — consolidate into one during the next pass.

### 9.1 Priority Gaps for a Finance Application
Ranked by how directly they unblock dashboard/transaction/reporting screens:

1. **Data Table** — transaction lists, account summaries (TanStack Table)
2. **Chart** — trend/allocation visualization (Recharts wrapper)
3. **Sidebar** — primary app-shell navigation
4. **Tabs** — accounts / transactions / reports switching
5. **Input Group** — currency prefix/suffix inputs
6. **Field** — label + control + helper + error composition (reduces boilerplate seen in `Input.tsx` today)
7. **Alert** — validation messages, system notices
8. **Pagination** — large transaction/EMI datasets

### 9.2 Full Missing-Component Reference
Kept for planning purposes — not all of these are near-term priorities.

| Category | Missing |
|---|---|
| Form & Input | Button Group, Input Group, Input OTP, Slider, standalone Calendar, standalone Label, Field, Toggle/Toggle Group, Native Select |
| Feedback & Status | Alert, Alert Dialog, Progress, standalone Spinner, Empty |
| Overlay & Navigation | Sheet, Drawer, Popover, Hover Card, Context Menu, Menubar, Navigation Menu, Command, Breadcrumb, Pagination, Sidebar, Tabs, Collapsible |
| Layout & Display | Table, Data Table, Aspect Ratio, Separator, Scroll Area, Resizable, Carousel, Item, Kbd, Typography, Direction |
| Chat Primitives (low priority — not core to Kalya) | Message Scroller, Message, Bubble, Attachment, Marker |

---

## 10. Theming Improvement Plan

1. Keep semantic tokens centralized in `globals.css`; avoid re-introducing raw hex values in component files.
2. If theming needs grow beyond CSS variables (e.g. white-label variants), introduce `src/theme/index.ts` mapping semantic names to token values, consumed via `cn`/`twMerge` helpers — but don't add this layer speculatively before it's needed.
3. Dark mode ships via the `data-theme` attribute strategy in Section 4, not Tailwind's `dark:` class variant.

---

## 11. Testing & Documentation Standards

* Unit test each new component with **Vitest + React Testing Library**; snapshot rendered output to catch regressions.
* JSDoc on all exported components and props.
* Full TypeScript strict-mode coverage; avoid `any`.
* Consider Storybook for visual documentation once the core primitive set stabilizes — not a blocker for shipping components.

---

## 12. Extending the Library

* **New component**: create `src/components/ui/MyComponent.tsx`, export from `src/components/ui/index.ts`, follow the pattern above (`cn`, `className` passthrough, typed props, CVA variants where applicable).
* **Modifying an existing component**: edit directly — the source is owned locally, so changes don't need to round-trip through an upstream package.
* **Import pattern**:
  ```ts
  import { Button, Input, Dialog } from "@/components/ui";
  ```

---

## 13. Non-Negotiables Checklist (quick reference)

- [ ] No raw hex codes in component files — use token classes.
- [ ] `cn` used for all `className` merging.
- [ ] `data-theme` (not `.dark`) drives theme switching.
- [ ] IBM Plex Mono for every currency/numeric value.
- [ ] `danger` reserved for liabilities/overspend only.
- [ ] `accent` (gold) used sparingly — moments, not workhorse UI.
- [ ] Radix/Base UI primitive underlies any focus-trapping or keyboard-nav component.
- [ ] Icon-only buttons have `aria-label`.
- [ ] Controlled/uncontrolled duality on any stateful input component.