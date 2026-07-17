import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  CreditCard,
  BarChart3,
  Calendar,
  Users,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

export interface SidebarNavItem {
  /** Unique key for React lists + active-state matching */
  href: string;
  /** Visible label — shown expanded, and as the Tooltip content when collapsed */
  label: string;
  /** lucide-react icon component, rendered at size=18 in the sidebar */
  icon: LucideIcon;
  /** Optional badge, e.g. unread count — rendered via your Badge component */
  badge?: string | number;
  /** Marks item as disabled (greyed out, non-interactive) */
  disabled?: boolean;
}

export interface SidebarNavItems {
  /** Section heading — not rendered visually in the icon rail, but used for
   *  aria-labelling the group and for a future expanded/"labeled" layout mode */
  group: string;
  items: SidebarNavItem[];
}

export const SIDEBAR_NAVIGATIONS: SidebarNavItems[] = [
  {
    group: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutGrid },
      { href: "/dashboard/wallet", label: "Wallet", icon: CreditCard },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/schedule", label: "Schedule", icon: Calendar },
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/reports", label: "Reports", icon: ClipboardList },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/sign-out", label: "Sign out", icon: LogOut },
    ],
  },
];
