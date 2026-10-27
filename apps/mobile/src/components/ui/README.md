# Kalya Mobile Reusable UI Component Library (`apps/mobile/src/components/ui/*`)

Architectural specification, component catalog, props interfaces, and interaction standards for the reusable UI component library of `@kalya/mobile`.

> **Source of Truth:** [`kalya-mobile-ui-components.xlsx`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/kalya-mobile-ui-components.xlsx) & [`UI.md`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/UI.md)  
> Designed to transcend the **"Commodity Ceiling"** (Tim Gabe) through high-craft tactile mechanics, fluid connective tissue, and resilient service recovery.

---

## 1. Design System Foundations

All components are built strictly on the Kalya Sovereign Design System defined in `apps/mobile/tailwind.config.js`:

| Token Category            | Values & Utilities                                                                                                                                                                                              | Usage Rules                                                                                                                                                                                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Typography**            | `font-outfit`, `font-outfit-bold`, `font-inter`, `font-inter-bold`, `font-ibm-plex`, `font-ibm-plex-bold`                                                                                                       | `Outfit` for display headings and titles; `Inter` for interface labels and body copy; `IBM Plex Mono` exclusively for financial numerals, percentages, and hashes.                                                                                                                           |
| **Brand Colors**          | `kalya-primary` (`#0d3e26`), `kalya-primary-dark` (`#072617`), `kalya-primary-light` (`#1b5e3a`), `kalya-gold` (`#d4af37`), `kalya-gold-warm` (`#b8912e`), `kalya-mint` (`#a3e6be`), `kalya-canvas` (`#edfdf2`) | Sovereign Emerald is the dominant grounding hue; Radiant Gold highlights high-value states, CTAs, and Pro badges.                                                                                                                                                                            |
| **Liquid Glass**          | `bg-kalya-glass-ultra-thin` (40%), `bg-kalya-glass-base` (65%), `bg-kalya-glass-thick` (82%), `bg-kalya-glass-emerald`, `border-kalya-glass-border`                                                             | Translucent depth layered over canvas washes with specular inner bevels.                                                                                                                                                                                                                     |
| **Financial Allocations** | `kalya-needs` (50%), `kalya-wants` (30%), `kalya-savings` (20%), `kalya-inflow` (Green), `kalya-outflow` (Crimson)                                                                                              | Standardized 50/30/20 tripartite color coding across all badges, bars, and chips.                                                                                                                                                                                                            |
| **Radii**                 | `rounded-kalya-xs` (6px), `kalya-sm` (10px), `kalya-md` (16px), `kalya-lg` (24px), `kalya-xl` (32px), `kalya-pill` (9999px)                                                                                     | Interactive controls use `pill` or `md`; cards use `lg` or `xl`.                                                                                                                                                                                                                             |
| **Tactile Haptics**       | `selectionAsync`, `impactAsync(Light/Medium/Heavy)`, `notificationAsync(Success/Warning/Error)`                                                                                                                 | Every interactive component triggers physical tactile resonance on touch down via `expo-haptics`.                                                                                                                                                                                            |
| **Core Utilities**        | `@kalya/utils`                                                                                                                                                                                                  | Shared core package powering all date operations (`buildMonthGrid`, `formatCardDate`), month shifting (`formatMonthLabel`, `shiftMonth`), timestamps (`formatRelativeTime`, `formatDateTime`, `formatTime`), timing (`debounce`), and currency formatting (`formatInr`, `formatInrPrecise`). |
| **Charting Engine**       | `react-native-gifted-charts`                                                                                                                                                                                    | Native mobile charting engine delivering GPU-accelerated interactive Donut, Bar, and Line visualizations with tactile touch points.                                                                                                                                                          |

---

## 2. Component Organization by Concern Folders

Components are grouped into dedicated concern subdirectories under `apps/mobile/src/components/ui/`:

### [`primitives/`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/) (10 Components)

1. **[`Typo`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/typo.tsx)** — Typography primitive (`Typo`, aliased as `Text`) with dynamic font mapping (Inter, Outfit, IBM Plex Mono) and semantic/scale variants.
2. **[`Button`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/button.tsx)** — 7 variants (primary, gold, glass, glass-emerald, outline, ghost, destructive), sizes, loading state, icon slots, and spring physics.
3. **[`IconButton`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/button.tsx)** — Icon-only button enforcing accessible $\ge 44\text{px}$ touch boundary.
4. **[`Icon`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/icon.tsx)** — Unified wrapper around `lucide-react-native` with size and color tokens.
5. **[`Pressable`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/pressable.tsx)** — Tactile pressable base with Reanimated spring scaling (`withSpring`) and calibrated haptics.
6. **[`HapticTouchable`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/haptic-touchable.tsx)** — Pressable surface with preset haptic tiers (`selection`, `light`, `medium`, `heavy`, `success`, `warning`, `error`).
7. **[`Divider`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/divider.tsx)** — Horizontal or vertical hairline separator.
8. **[`Badge`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/badge.tsx)** — Status label (success, warning, danger, neutral, 50/30/20, and live sync).
9. **[`Avatar`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/avatar.tsx)** — Remote image or initials fallback for contacts and profile screens.
10. **[`Chip`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/chip.tsx)** — Selectable pill for filters, categories, and payment methods.
11. **[`Spacer`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/primitives/spacer.tsx)** — Standardized spatial gap helper.

### [`layout/`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/) (9 Components)

12. **[`Screen`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/screen.tsx)** — SafeAreaView, scrollable, pull-to-refresh, keyboard avoiding, and status bar.
13. **[`Stack` & `Row`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/stack.tsx)** — Flex layout helpers (`VStack`, `HStack`, `Row`) with gap support.
14. **[`Card`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/card.tsx)** — Surface container with `CardHeader`, `CardBody`, and `CardFooter` slots.
15. **[`GlassView`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/glass-view.tsx)** — Specular liquid glass backdrop container with calibrated translucency.
16. **[`Section`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/section.tsx)** — Titled group with optional header action button ("See all").
17. **[`Header`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/header.tsx)** — Top navigation bar with title, back button, status pill, and right actions.
18. **[`ListItem`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/list-item.tsx)** — Standard row with leading icon/avatar, title, subtitle, trailing value, and chevron.
19. **[`SwipeableRow`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/swipeable-row.tsx)** — Swipe actions (delete, edit) for list items.
20. **[`FAB`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/layout/fab.tsx)** — Floating action button for quick transaction logging.

### [`forms/`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/) (16 Components)

21. **[`FormField`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/form-field.tsx)** — Shared label, required asterisk, helper text, and error wrapper.
22. **[`TextField` / `Input`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/text-field.tsx)** — Input with focus glow (`emerald`/`gold`), clear button, and error states.
23. **[`PasswordField`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/password-field.tsx)** — Secure text entry with eye show/hide toggle.
24. **[`AmountInput`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/amount-input.tsx)** — Currency input paired with numeric keypad, storing integer paise.
25. **[`CurrencyInput`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/currency-input.tsx)** — Indian numbering system currency readout with minor units (paise).
26. **[`Numpad`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/numpad.tsx)** — Financial keypad with quick preset amount chips (`+₹500`, `+₹1,000`, `+₹5,000`).
27. **[`SearchInput`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/search-input.tsx)** — Debounced search input using `debounce` from `@kalya/utils`.
28. **[`DatePicker`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/date-picker.tsx)** — Calendar picker powered by `buildMonthGrid`, `formatCardDate`, `WEEKDAYS`, `MONTHS` from `@kalya/utils`.
29. **[`MonthPicker`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/month-picker.tsx)** — Month switcher in `YYYY-MM` format using `formatMonthLabel` and `shiftMonth` from `@kalya/utils`.
30. **[`Select`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/select.tsx)** — Accessible bottom sheet option picker.
31. **[`SegmentedControl`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/segmented-control.tsx)** — Sliding spring tab switcher with selection haptics.
32. **[`Switch`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/switch.tsx)** — Animated toggle with spring physics and tactile clicks.
33. **[`Checkbox` & `RadioGroup`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/checkbox.tsx)** — Multi-select and single-choice inputs.
34. **[`Slider`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/slider.tsx)** — Percentage slider for bucket budget targets.
35. **[`OTPInput`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/forms/otp-input.tsx)** — 6-digit verification code boxes for Better-Auth.

### [`feedback/`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/) (11 Components)

36. **[`Skeleton`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/skeleton.tsx)** — Specular shimmer placeholder eliminating layout shifts.
37. **[`Spinner`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/spinner.tsx)** — Inline and full-screen loading indicators.
38. **[`Snackbar` / `UndoSnackBar`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/undo-snack-bar.tsx)** — 5-second destructive undo pill with SVG countdown timer.
39. **[`Banner`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/banner.tsx)** — Persistent notices (`offline`, `warning`, `session expired`).
40. **[`EmptyState`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/empty-state.tsx)** — Contextual empty state with 1-tap call to action.
41. **[`ErrorState` / `ErrorCard`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/error-card.tsx)** — Diagnostic failure cards with retry actions.
42. **[`ProgressBar`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/progress-bar.tsx)** — Budget bar with amber warning (80%) and red overrun (100%) thresholds.
43. **[`ProgressRing`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/progress-ring.tsx)** — Circular progress gauge for goals.
44. **[`Alert`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/feedback/alert.tsx)** — Contextual inline callout (info, success, warning, error).

### [`overlays/`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/overlays/) (5 Components)

45. **[`BottomSheet`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/overlays/bottom-sheet.tsx)** — Gesture-dismissible bottom surface with grab handle.
46. **[`Modal`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/overlays/modal.tsx)** — Centered dialog overlay.
47. **[`ConfirmDialog`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/overlays/confirm-dialog.tsx)** — Clear destructive confirmation dialog.
48. **[`ActionSheet`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/overlays/action-sheet.tsx)** — Modal menu triggered by long-press or overflow menus.
49. **[`Tabs`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/overlays/tabs.tsx)** — In-screen tabs with line or pill active indicators.

### [`data-display/`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/data-display/) (7 Components)

50. **[`MoneyText`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/data-display/money-text.tsx)** — Formats paise to ₹ currency with `formatInr` and `formatInrPrecise` from `@kalya/utils`.
51. **[`DateText`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/data-display/date-text.tsx)** — Relative and absolute formatting powered by `formatRelativeTime`, `formatDateTime`, `formatTime`, `formatCardDate` from `@kalya/utils`.
52. **[`StatCard`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/data-display/stat-card.tsx)** — Dashboard metric tile with trend percentages.
53. **[`Legend`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/data-display/legend.tsx)** — Chart legend indicator.
54. **[`GroupedList`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/data-display/grouped-list.tsx)** — SectionList wrapper with sticky headers, skeletons, and empty state.
55. **[`KeyValueRow`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/data-display/key-value-row.tsx)** — Detail screen label/value pairs.
56. **[`Timeline`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/data-display/timeline.tsx)** — Chronological audit trail using `@kalya/utils` timestamp formatting.

### [`charts/`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/charts/) (Native Financial Charts)

57. **[`DonutChart`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/charts/donut-chart.tsx)** — Circular allocation chart for 50/30/20 buckets and categories with center typography and haptic slice selection.
58. **[`FinancialBarChart`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/charts/bar-chart.tsx)** — Inflow vs outflow comparisons and monthly spending bars with rounded top caps and emerald gradients.
59. **[`FinancialLineChart`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/charts/line-chart.tsx)** — Net worth trajectory and wealth curves with smooth bezier lines and translucent area fills.

---

## 3. Unified Barrel Import

All components and their associated TypeScript types are exported through [`apps/mobile/src/components/ui/index.ts`](file:///Users/raushankumar/Workspace/Projects/Personal/kalya/apps/mobile/src/components/ui/index.ts):

```typescript
import {
  Text,
  Button,
  Screen,
  Card,
  ListItem,
  Icon,
  AmountInput,
  MoneyText,
  DateText,
  DatePicker,
  MonthPicker,
  SearchInput,
  Timeline,
  Select,
  Switch,
  Skeleton,
  UndoSnackBar,
  StatusPill,
  DonutChart,
  FinancialBarChart,
  FinancialLineChart,
} from '@/components/ui';
```

Or imported directly from their respective concern folders:

```typescript
import { Button, Text, Badge } from '@/components/ui/primitives';
import { Card, Screen, Header } from '@/components/ui/layout';
import { DatePicker, SearchInput } from '@/components/ui/forms';
import { Skeleton, UndoSnackBar } from '@/components/ui/feedback';
import { BottomSheet, Modal } from '@/components/ui/overlays';
import { MoneyText, DateText, Timeline } from '@/components/ui/data-display';
import { DonutChart, FinancialBarChart, FinancialLineChart } from '@/components/ui/charts';
```
