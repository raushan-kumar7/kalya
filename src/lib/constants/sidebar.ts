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
  /** Short one-line subtitle shown under the page title in Top.tsx */
  description?: string;
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
      {
        href: "/dashboard",
        label: "Overview",
        icon: LayoutGrid,
        description: "Here's where your finances stand today.",
      },
      {
        href: "/dashboard/wallet",
        label: "Wallet",
        icon: CreditCard,
        description: "Your accounts, cards, and balances.",
      },
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: BarChart3,
        description: "Spending trends and cash flow over time.",
      },
      {
        href: "/dashboard/schedule",
        label: "Schedule",
        icon: Calendar,
        description: "Upcoming bills, transfers, and reminders.",
      },
      {
        href: "/dashboard/clients",
        label: "Clients",
        icon: Users,
        description: "Manage the people you work with.",
      },
      {
        href: "/dashboard/reports",
        label: "Reports",
        icon: ClipboardList,
        description: "Generate and export financial reports.",
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: Settings,
        description: "Manage your profile, security, and preferences.",
      },
      { href: "/sign-out", label: "Sign out", icon: LogOut },
    ],
  },
];
