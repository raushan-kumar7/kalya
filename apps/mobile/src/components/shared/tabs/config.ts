import type { Href } from 'expo-router';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  LayoutDashboard,
  PieChart,
  ReceiptText,
  ScanLine,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import type { TabRoute, QuickActionType } from '@/stores/tabs';

/* ---------- Layout Constants ---------- */
export const TAB_BAR_HEIGHT = 64; // Excludes bottom safe area inset
export const FAB_SIZE = 56;
export const FAB_MARGIN = 16;
/** Safe bottom padding for scrollable content to clear the FAB */
export const FAB_CLEARANCE = FAB_SIZE + FAB_MARGIN * 2;

export const TAB_ACTIVE_COLOR = '#0d3e26';
export const TAB_INACTIVE_COLOR = '#5d8a72';

/* ---------- Tab Definitions ---------- */
export interface TabDefinition {
  name: TabRoute;
  title: string;
  Icon: LucideIcon;
}

export const TABS: TabDefinition[] = [
  { name: 'index', title: 'Dashboard', Icon: LayoutDashboard },
  { name: 'history', title: 'History', Icon: ReceiptText },
  { name: 'budgets', title: 'Budgets', Icon: PieChart },
  { name: 'splits', title: 'Splits', Icon: Users },
  { name: 'portfolio', title: 'Portfolio', Icon: TrendingUp },
];

export const TAB_BY_NAME = Object.fromEntries(TABS.map((t) => [t.name, t])) as Record<
  TabRoute,
  TabDefinition
>;

/* ---------- Quick Action Definitions ---------- */
export interface QuickAction {
  type: QuickActionType;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  color: string;
  tint: string;
  href?: Href;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    type: 'expense',
    title: 'Record Expense',
    subtitle: 'Track spending, bills and outflows',
    Icon: ArrowUpRight,
    color: '#c83535',
    tint: 'bg-red-50 dark:bg-red-950/40',
  },
  {
    type: 'income',
    title: 'Log Income',
    subtitle: 'Salary, dividends or other inflows',
    Icon: ArrowDownLeft,
    color: '#1b8a51',
    tint: 'bg-kalya-mint-subtle',
  },
  {
    type: 'split',
    title: 'Split a Bill',
    subtitle: 'Divide shared costs with your groups',
    Icon: Users,
    color: '#0d3e26',
    tint: 'bg-kalya-mint-subtle',
    href: '/(tabs)/splits',
  },
  {
    type: 'transfer',
    title: 'Transfer Money',
    subtitle: 'Move funds between accounts',
    Icon: ArrowLeftRight,
    color: '#9a741c',
    tint: 'bg-amber-50 dark:bg-amber-950/40',
    href: '/(tabs)/portfolio',
  },
  {
    type: 'scan',
    title: 'Scan Receipt',
    subtitle: 'Extract a bill from a photo with AI',
    Icon: ScanLine,
    color: '#0d3e26',
    tint: 'bg-kalya-mint-subtle',
  },
];
