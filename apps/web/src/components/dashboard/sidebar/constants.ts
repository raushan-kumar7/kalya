import {
  BarChart3,
  Bell,
  Coins,
  Contact,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  PiggyBank,
  Receipt,
  Repeat,
  SlidersHorizontal,
  Tags,
  Target,
  TrendingUp,
  UserCircle,
  Users2,
  Wallet,
} from 'lucide-react';

/**
 * Known dynamic badge identifiers mapped to reactive data sources
 * (e.g. notifications, alert counters, unread items).
 */
export type BadgeKey = 'alerts' | 'insights' | string;

/**
 * Navigation item representing a single route or collapsible group.
 */
export interface NavItem {
  /** Display label for the navigation item */
  label: string;
  /** Destination route path or external URL */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional nested sub-navigation items */
  children?: NavItem[];
  /** Whether the item is disabled (e.g. roadmap items or permission gated) */
  disabled?: boolean;
  /** Explanatory description for tooltips, preview popovers, or assistive text */
  description?: string;
  /** Whether the link points to an external site */
  external?: boolean;
  /** Key to resolve real-time counts/badges dynamically from global stores */
  badgeKey?: BadgeKey;
  /** Static badge text or numeric pill (e.g. 'Soon', 'Beta', 'New', 3) */
  badge?: string | number;
  /**
   * Route matching behavior:
   * - `true`: Matches only when `currentPath === href` (useful for root `/dashboard`).
   * - `false`: Matches when `currentPath === href` or `currentPath.startsWith(`${href}/`)`.
   * - `undefined`: Automatically defaults to `true` for root `/dashboard`, `false` otherwise.
   */
  exact?: boolean;
  /** Optional keyboard shortcut hint (e.g. 'G O') */
  shortcut?: string;
}

/**
 * Group of navigation items displayed under a common section header.
 */
export interface NavSection {
  /** Optional section header label (e.g. 'Money', 'Activity', 'Configuration') */
  label?: string;
  /** Navigation items belonging to this section */
  items: NavItem[];
}

/**
 * Extension for items that support collapsible sub-navigation in the sidebar.
 */
export interface NavCollapsable extends Omit<NavItem, 'children'> {
  /** Default open state when first rendered */
  defaultOpen?: boolean;
  /** Whether the section can be collapsed by the user */
  collapsable?: boolean;
  /** Sub-navigation child items (required for collapsible items) */
  children: NavItem[];
}

/**
 * Account dropdown navigation item.
 */
export interface AccountNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'danger';
}

/**
 * Centralized navigation configuration for the Kalya dashboard sidebar.
 * Structured into logical sections: Overview, Money, Activity, and Configuration.
 */
export const SIDEBAR_NAVS_ITEMS: NavSection[] = [
  {
    items: [
      {
        label: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        exact: true,
        description: "Here's where your finances stand today.",
      },
    ],
  },
  {
    label: 'Money',
    items: [
      {
        label: 'Transactions',
        href: '/dashboard/transactions',
        icon: Receipt,
        description: 'Every rupee in and out, day by day.',
      },
      {
        label: 'Budgets',
        href: '/dashboard/budgets',
        icon: PiggyBank,
        description: 'Track 50/30/20 and category spending limits.',
      },
      {
        label: 'Split Bills',
        href: '/dashboard/splits',
        icon: Users2,
        description: 'Track shared expenses, balances, and settlements.',
        children: [
          {
            label: 'Balances & Settle',
            href: '/dashboard/splits',
            icon: Users2,
            exact: true,
            description: 'See who owes you and settle via UPI.',
          },
          {
            label: 'Contacts Directory',
            href: '/dashboard/splits/contacts',
            icon: Contact,
            description: 'Friends and groups you split with.',
          },
        ],
      },
      {
        label: 'Goals',
        href: '/dashboard/goals',
        icon: Target,
        description: 'Savings milestones and sinking fund progress.',
      },
      {
        label: 'Assets & Wealth',
        href: '/dashboard/assets',
        icon: Coins,
        description: 'Gold, silver, mutual funds, and equities.',
        children: [
          {
            label: 'Gold & Silver',
            href: '/dashboard/assets/gold-silver',
            icon: Coins,
            description: 'Physical & digital bullion holdings with live rates.',
          },
          {
            label: 'Equities',
            href: '/dashboard/assets/equity',
            icon: TrendingUp,
            description: 'Shares, SIPs, and mutual fund portfolio.',
          },
        ],
      },
      {
        label: 'Reports & Analytics',
        href: '/dashboard/reports',
        icon: BarChart3,
        description: 'Monthly expense snapshots and trend analysis.',
      },
      // Phase 2 roadmap items — kept in the nav (disabled) so the
      // information architecture is visible while the backend/API
      // routes are still being built out.
      // {
      //   label: 'Accounts',
      //   href: '/dashboard/accounts',
      //   icon: Wallet,
      //   disabled: true,
      //   badge: 'Soon',
      //   description: 'Bank, cash, and virtual account balances (Coming soon).',
      // },
      // {
      //   label: 'Recurring Bills',
      //   href: '/dashboard/recurring',
      //   icon: Repeat,
      //   disabled: true,
      //   badge: 'Soon',
      //   description: 'Subscriptions and automated EMIs (Coming soon).',
      // },
    ],
  },
  {
    label: 'Activity',
    items: [
      {
        label: 'Alerts & Feed',
        href: '/dashboard/alerts',
        icon: Bell,
        badgeKey: 'alerts',
        description: 'Budget warnings, bill reminders, and notifications.',
      },
    ],
  },
  {
    label: 'Configuration',
    items: [
      {
        label: 'Categories & Rules',
        href: '/dashboard/settings/finance',
        icon: SlidersHorizontal,
        description: 'Buckets, categories, and financial taxonomies.',
        children: [
          {
            label: 'Buckets',
            href: '/dashboard/settings/buckets',
            icon: Tags,
            description: 'Manage high-level budget allocations.',
          },
          {
            label: 'Categories',
            href: '/dashboard/settings/categories',
            icon: FolderKanban,
            description: 'Custom income and expense tags.',
          },
        ],
      },
    ],
  },
];

/**
 * Standard account and profile dropdown items.
 */
export const DEFAULT_ACCOUNT_NAV: AccountNavItem[] = [
  {
    label: 'View Profile',
    href: '/dashboard/settings/account',
    icon: UserCircle,
  },
  {
    label: 'Sign Out',
    href: '/sign-out',
    icon: LogOut,
    variant: 'danger',
  },
];

/** Convenient aliases */
export const NAV_SECTIONS = SIDEBAR_NAVS_ITEMS;
export const sidebarNav = SIDEBAR_NAVS_ITEMS;
export const accountNav = DEFAULT_ACCOUNT_NAV;

// ---------------------------------------------------------------------------
// HELPER UTILITIES
// ---------------------------------------------------------------------------

/**
 * Determines whether a navigation item or route is considered active given the current pathname.
 * Handles exact root matching, object NavItems, and nested path prefix matching.
 *
 * @param pathname Current active pathname (e.g. from usePathname())
 * @param target Navigation item object or string href
 * @returns boolean
 */
export function isNavItemActive(pathname: string, target: NavItem | string): boolean {
  if (!pathname || !target) return false;

  const href = typeof target === 'string' ? target : target.href;
  if (!href) return false;

  const cleanCurrent = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const cleanTarget = href.length > 1 ? href.replace(/\/+$/, '') : href;

  const isExact =
    typeof target === 'object'
      ? (target.exact ?? cleanTarget === '/dashboard')
      : cleanTarget === '/dashboard';

  if (isExact) {
    return cleanCurrent === cleanTarget;
  }

  return cleanCurrent === cleanTarget || cleanCurrent.startsWith(`${cleanTarget}/`);
}

/**
 * Checks if any direct or descendant child of a navigation item is currently active.
 *
 * @param pathname Current active pathname
 * @param item Navigation item containing children
 * @returns boolean
 */
export function hasActiveChild(pathname: string, item: NavItem): boolean {
  if (!item.children || item.children.length === 0) return false;

  return item.children.some(
    (child) => isNavItemActive(pathname, child) || hasActiveChild(pathname, child)
  );
}

/**
 * Checks whether the item itself or any of its children is active.
 *
 * @param pathname Current active pathname
 * @param item Navigation item to test
 * @returns boolean
 */
export function isNavItemOrChildActive(pathname: string, item: NavItem): boolean {
  return isNavItemActive(pathname, item) || hasActiveChild(pathname, item);
}

/**
 * Flattens all navigation items across sections and nested children into a single flat array.
 * Useful for quick-search command palettes (CMD+K), route auditing, and breadcrumbs.
 *
 * @param sections List of navigation sections
 * @returns Flat array of NavItem
 */
export function flattenNavItems(sections: readonly NavSection[] = SIDEBAR_NAVS_ITEMS): NavItem[] {
  const result: NavItem[] = [];

  function traverse(items: readonly NavItem[]) {
    for (const item of items) {
      result.push(item);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }

  for (const section of sections) {
    traverse(section.items);
  }

  return result;
}

/**
 * Resolves the active navigation item, parent group, and enclosing section for a given pathname.
 *
 * @param pathname Current active pathname
 * @param sections List of navigation sections
 * @returns Matched navigation context or undefined
 */
export function findActiveNavContext(
  pathname: string,
  sections: readonly NavSection[] = SIDEBAR_NAVS_ITEMS
): { section?: NavSection; parentItem?: NavItem; activeItem?: NavItem } | undefined {
  for (const section of sections) {
    for (const item of section.items) {
      // Check direct children first for deeper matches
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (isNavItemActive(pathname, child)) {
            return { section, parentItem: item, activeItem: child };
          }
        }
      }

      // Check root level item
      if (isNavItemActive(pathname, item)) {
        return { section, activeItem: item };
      }
    }
  }

  return undefined;
}
