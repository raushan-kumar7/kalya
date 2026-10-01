# `@kalya/web` UI Component Library

Welcome to the **Kalya UI Component Library**. This directory contains the reusable, atomic building blocks powering the `@kalya/web` frontend, adhering strictly to **Atomic Design Principles**, **Radix UI Primitives**, **Tailwind CSS v4 Tokens**, and UXPin's _Essential Design System Components Specification_.

> **Full Design System Specification**:  
> For complete architecture guidelines, atomic design rules, token usage, accessibility requirements, and the 10 essential components breakdown, see:  
> 📖 **[`UI.md`](file:///d:/Projects/personal/kalya/UI.md)** and **[`ui.txt`](file:///d:/Projects/personal/kalya/ui.txt)** in the project root.

---

## 📁 Sub-Directory Taxonomy

Components are organized into **7 domain sub-directories**:

| Domain              | Path             | Primary Role                                 | Key Primitives                                                                                                                                                                                            |
| :------------------ | :--------------- | :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`forms/`**        | `./forms`        | Input entry, selection, and action triggers  | `Button`, `Input`, `Field`, `InputGroup`, `Select`, `Combobox`, `MultiSelect`, `Checkbox`, `CheckboxField`, `CheckboxGroup`, `RadioGroup`, `RadioField`, `RadioCard`, `Switch`, `SwitchField`, `Textarea` |
| **`overlays/`**     | `./overlays`     | Floating windows, modals, popovers, drawers  | `Dialog`, `AlertDialog`, `Modal`, `Drawer`, `Popover`, `Tooltip`, `AnimatedTooltip`                                                                                                                       |
| **`data-display/`** | `./data-display` | Content containers, cards, tables, avatars   | `Card`, `ExpandableCard`, `Badge`, `Table`, `DataTable`, `Avatar`, `AvatarGroup`, `Accordion`                                                                                                             |
| **`navigation/`**   | `./navigation`   | Route tracking, view switching, paginators   | `Tabs`, `Breadcrumb`, `Pagination`, `ResponsivePagination`, `Sidebar`                                                                                                                                     |
| **`feedback/`**     | `./feedback`     | Banners, alerts, toasts, progress bars       | `Alert`, `Toast`, `Progress`, `Banner`                                                                                                                                                                    |
| **`states/`**       | `./states`       | Async loaders, empty and error boundaries    | `Skeleton`, `EmptyState`, `Spinner`, `ErrorState`                                                                                                                                                         |
| **`utilities/`**    | `./utilities`    | Dividers, theme switchers, portal containers | `Separator`, `ThemeToggle`, `Portal`, `AspectRatio`                                                                                                                                                       |

---

## 🎯 The 10 Essential Design System Components (ui.txt Guidelines)

| Component                            | Implemented File                                                         | Supported Variants & Sizes                                                                                                                                              | Supported States & Features                                                                                                                        |
| :----------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Buttons**                       | `forms/button.tsx`                                                       | `primary`, `secondary`, `tertiary/ghost`, `destructive`, `link`, `outline`, `subtle`, `accent`, `success` — Sizes: `xs`, `sm`, `md`, `lg`, `xl`, `icon-xs` to `icon-xl` | Default, Hover, Active (`scale-0.98`), Focus-Visible, Disabled, Loading (`Spinner` + `aria-busy`), Leading/Trailing Icons                          |
| **2. Text Inputs**                   | `forms/input.tsx`, `textarea.tsx`, `field.tsx`                           | Single-line, Multi-line (`Textarea`), Password, Search — Sizes: `xs`, `sm`, `md`, `lg`, `xl`                                                                            | Success, Warning, Error validation messages, Character counter (`showCount`), Clearable button (`clearable`), Affixes (`prefixText`, `suffixText`) |
| **3. Checkboxes & Radios**           | `forms/checkbox.tsx`, `forms/radio.tsx`                                  | Sizes: `sm`, `md`, `lg`                                                                                                                                                 | Checked, Unchecked, Indeterminate (`Minus` icon), Disabled, `CheckboxField`, `CheckboxGroup`, `RadioField`, `RadioCard`, `RadioGroupField`         |
| **4. Toggles (Switches)**            | `forms/switch.tsx`                                                       | Sizes: `sm`, `md`, `lg`                                                                                                                                                 | Clear On/Off visuals, `stateLabel` ("Enabled" / "Disabled"), `SwitchField` with instant effect                                                     |
| **5. Dropdowns (Select & Combobox)** | `forms/select.tsx`, `combobox.tsx`                                       | Single-select, Multi-select                                                                                                                                             | Category groups with headers & dividers, instant search fuzzy filtering, `MultiSelect` tag chips, clearing, disabled options                       |
| **6. Cards**                         | `data-display/card.tsx`                                                  | `default`, `raised`, `outlined`, `glass`, `interactive`                                                                                                                 | `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardMedia`, `ExpandableCard`, hover lift                               |
| **7. Modals (Dialogs)**              | `overlays/modal.tsx`, `dialog.tsx`, `alert-dialog.tsx`                   | `sm`, `md`, `lg`, `xl`, `full`                                                                                                                                          | Focus trapping (Radix FocusScope), backdrop blur, Esc to close, scrollable body, confirmation dialogs (`AlertDialog`)                              |
| **8. Navigation**                    | `navigation/tabs.tsx`, `breadcrumb.tsx`, `pagination.tsx`, `sidebar.tsx` | Tabs: `pill`, `underline`, `enclosed` (Horizontal & Vertical)                                                                                                           | Icons, badges, animated indicators, clickable breadcrumbs, smart ellipsis pagination, collapsible multi-level sidebar                              |
| **9. Alerts & Notifications**        | `feedback/alert.tsx`, `toast.tsx`, `banner.tsx`                          | `info`, `success`, `warning`, `danger`, `default`, `accent`                                                                                                             | Inline dismissible alerts, auto-dismiss toasts with countdown, page-level announcement `Banner`                                                    |
| **10. Data Tables**                  | `data-display/table.tsx`                                                 | Full enterprise ledger                                                                                                                                                  | Multi-column sorting, search filter, bulk row selection with indeterminate checkbox, responsive pagination, loading skeleton, empty & error states |

---

## 🚀 Quick Usage

### Master Barrel Import

```tsx
import {
  Button,
  Input,
  Card,
  Badge,
  Table,
  DataTable,
  Tabs,
  Breadcrumb,
  Dialog,
  Modal,
} from '@/components/ui';
```

### Domain-Specific Imports

```tsx
import {
  Button,
  Input,
  Field,
  SwitchField,
  CheckboxField,
  RadioCard,
  MultiSelect,
} from '@/components/ui/forms';
import { Card, Badge, DataTable, Avatar, Accordion } from '@/components/ui/data-display';
import { Tabs, Breadcrumb, ResponsivePagination, Sidebar } from '@/components/ui/navigation';
import { Dialog, AlertDialog, Modal, Drawer } from '@/components/ui/overlays';
import { Alert, Banner, Progress, toast } from '@/components/ui/feedback';
```

---

## 🎨 Design Tokens & Shared Constants

Centralized size scales, focus ring utilities, interaction states, and transition presets are exported from:

- [`constants.ts`](file:///d:/Projects/personal/kalya/apps/web/src/components/ui/constants.ts)
- Global Tailwind CSS v4 design tokens: [`src/styles/globals.css`](file:///d:/Projects/personal/kalya/apps/web/src/styles/globals.css)
