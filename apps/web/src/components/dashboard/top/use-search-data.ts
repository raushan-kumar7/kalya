'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Coins,
  FolderKanban,
  LayoutDashboard,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Sparkles,
  Sun,
  Tags,
  Target,
  TrendingUp,
  UserCircle,
  Users2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { formatInr } from '@kalya/utils';
import { useTheme } from '@/components/ui';
import {
  useBudgetsQuery,
  useCategoriesQuery,
  useFinanceFeed,
  useFinanceModal,
  useGoalsQuery,
} from '@/hooks/finances';

export type SearchCategory =
  'all' | 'pages' | 'actions' | 'transactions' | 'budgets' | 'goals' | 'categories';

export interface SearchItem {
  id: string;
  category: Exclude<SearchCategory, 'all'>;
  title: string;
  subtitle?: string;
  description?: string;
  icon: LucideIcon;
  iconTone?: 'default' | 'positive' | 'negative' | 'warning' | 'info' | 'accent';
  amount?: string;
  amountTone?: 'positive' | 'negative' | 'neutral';
  badge?: string;
  href?: string;
  onSelect?: () => void;
  keywords?: string[];
}

export interface SearchGroup {
  category: Exclude<SearchCategory, 'all'>;
  label: string;
  items: SearchItem[];
}

export interface UseSearchDataReturn {
  query: string;
  setQuery: (q: string) => void;
  selectedCategory: SearchCategory;
  setSelectedCategory: (cat: SearchCategory) => void;
  groups: SearchGroup[];
  flatItems: SearchItem[];
  categoryCounts: Record<SearchCategory, number>;
  totalCount: number;
}

export function useSearchData(onClose?: () => void): UseSearchDataReturn {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { openModal } = useFinanceModal();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');

  // Live queries from finance feeds and resources
  const feed = useFinanceFeed();
  const { data: budgetsData } = useBudgetsQuery();
  const { data: goalsData } = useGoalsQuery();
  const { data: categoriesData } = useCategoriesQuery();

  // 1. Navigation Pages
  const pages: SearchItem[] = useMemo(
    () => [
      {
        id: 'page-overview',
        category: 'pages',
        title: 'Financial Overview',
        subtitle: 'Cashflow, net worth & monthly analytics',
        icon: LayoutDashboard,
        iconTone: 'accent',
        href: '/dashboard',
        keywords: ['home', 'dashboard', 'summary', 'cashflow', 'net worth'],
      },
      {
        id: 'page-transactions',
        category: 'pages',
        title: 'Transactions Ledger',
        subtitle: 'Personal expenses, split bills & inflows',
        icon: Receipt,
        iconTone: 'default',
        href: '/dashboard/transactions',
        keywords: ['expenses', 'income', 'spend', 'history', 'payments'],
      },
      {
        id: 'page-budgets',
        category: 'pages',
        title: 'Budgets & Envelopes',
        subtitle: 'Monthly spending caps and threshold alerts',
        icon: Target,
        iconTone: 'warning',
        href: '/dashboard/budgets',
        keywords: ['limits', 'caps', 'allocations', 'warnings', 'alerts'],
      },
      {
        id: 'page-splits',
        category: 'pages',
        title: 'Split Bills & Groups',
        subtitle: 'Friend balances, IOUs & settlements',
        icon: Users2,
        iconTone: 'info',
        href: '/dashboard/splits',
        keywords: ['friends', 'shared', 'roommates', 'settle', 'balances', 'owe'],
      },
      {
        id: 'page-goals',
        category: 'pages',
        title: 'Savings Goals',
        subtitle: 'Milestone tracking & monthly savings pace',
        icon: PiggyBank,
        iconTone: 'positive',
        href: '/dashboard/goals',
        keywords: ['target', 'savings', 'emergency fund', 'vacation', 'progress'],
      },
      {
        id: 'page-equities',
        category: 'pages',
        title: 'Equities & Stocks',
        subtitle: 'Demat holdings, stocks & mutual fund portfolio',
        icon: TrendingUp,
        iconTone: 'positive',
        href: '/dashboard/assets/equity',
        keywords: ['shares', 'mutual funds', 'portfolio', 'investments', 'demat'],
      },
      {
        id: 'page-bullion',
        category: 'pages',
        title: 'Gold & Silver',
        subtitle: 'Physical bullion, digital gold & precious metals',
        icon: Coins,
        iconTone: 'warning',
        href: '/dashboard/assets/bullion',
        keywords: ['commodities', 'metal', 'sovereign', 'bullion'],
      },
      {
        id: 'page-insights',
        category: 'pages',
        title: 'Financial Insights',
        subtitle: 'Detailed breakdowns, monthly deltas, trends & statements',
        icon: BarChart3,
        iconTone: 'accent',
        href: '/dashboard/insights',
        keywords: [
          'insights',
          'financial insights',
          'reports',
          'analytics',
          'charts',
          'analysis',
          'deltas',
          'statements',
          'statistics',
        ],
      },
      {
        id: 'page-notifications-settings',
        category: 'pages',
        title: 'Notification Settings',
        subtitle: 'Alert preferences, web push & communication channels',
        icon: Bell,
        iconTone: 'warning',
        href: '/dashboard/settings/account?tab=notification',
        keywords: ['notifications', 'alerts', 'push', 'preferences', 'settings'],
      },
      {
        id: 'page-categories',
        category: 'pages',
        title: 'Categories & Rules',
        subtitle: 'Transaction labels and categorization rules',
        icon: Tags,
        iconTone: 'default',
        href: '/dashboard/categories',
        keywords: ['tags', 'classification', 'taxonomy', 'labels'],
      },
      {
        id: 'page-buckets',
        category: 'pages',
        title: 'Allocation Buckets',
        subtitle: '50-30-20 Needs, Wants & Savings envelope rule',
        icon: FolderKanban,
        iconTone: 'info',
        href: '/dashboard/buckets',
        keywords: ['50-30-20', 'needs', 'wants', 'savings', 'allocations'],
      },
      {
        id: 'page-account',
        category: 'pages',
        title: 'Account & Security',
        subtitle: 'Profile credentials, preferences & active sessions',
        icon: UserCircle,
        iconTone: 'default',
        href: '/dashboard/settings/account',
        keywords: ['profile', 'password', 'security', 'preferences', 'settings'],
      },
    ],
    []
  );

  // 2. Quick Actions
  const actions: SearchItem[] = useMemo(
    () => [
      {
        id: 'action-add-expense',
        category: 'actions',
        title: 'Add New Expense',
        subtitle: 'Record personal spend or bill',
        badge: 'Action',
        icon: Plus,
        iconTone: 'negative',
        onSelect: () => {
          router.push('/dashboard/transactions');
          openModal('add-expense');
        },
        keywords: ['spend', 'new expense', 'record transaction', 'paid'],
      },
      {
        id: 'action-add-income',
        category: 'actions',
        title: 'Record Inflow / Income',
        subtitle: 'Salary, freelance, dividend or bonus',
        badge: 'Action',
        icon: ArrowDownLeft,
        iconTone: 'positive',
        onSelect: () => {
          router.push('/dashboard/transactions');
          openModal('add-income');
        },
        keywords: ['salary', 'earnings', 'revenue', 'deposit', 'bonus'],
      },
      {
        id: 'action-create-budget',
        category: 'actions',
        title: 'Create Budget Envelope',
        subtitle: 'Set a monthly cap for a bucket or category',
        badge: 'Action',
        icon: Target,
        iconTone: 'warning',
        onSelect: () => {
          router.push('/dashboard/budgets');
          openModal('add-budget');
        },
        keywords: ['new budget', 'set limit', 'cap spending'],
      },
      {
        id: 'action-create-goal',
        category: 'actions',
        title: 'Create Savings Goal',
        subtitle: 'Set target amount and target date',
        badge: 'Action',
        icon: Sparkles,
        iconTone: 'accent',
        onSelect: () => {
          router.push('/dashboard/goals');
          openModal('add-goal');
        },
        keywords: ['target', 'new goal', 'save money'],
      },
      {
        id: 'action-split-bill',
        category: 'actions',
        title: 'Split a Bill with Friends',
        subtitle: 'Divide dinner, rent or travel expenses',
        badge: 'Action',
        icon: Users2,
        iconTone: 'info',
        onSelect: () => {
          router.push('/dashboard/splits');
        },
        keywords: ['split bill', 'group', 'share', 'friends'],
      },
      {
        id: 'action-toggle-theme',
        category: 'actions',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: `Currently using ${theme || 'system'} appearance`,
        badge: 'Theme',
        icon: theme === 'dark' ? Sun : Moon,
        iconTone: 'warning',
        onSelect: () => {
          toggleTheme();
        },
        keywords: ['dark mode', 'light mode', 'color theme', 'toggle theme', 'appearance'],
      },
    ],
    [router, openModal, theme, toggleTheme]
  );

  // 3. Transactions from live feed
  const transactions: SearchItem[] = useMemo(() => {
    const rawItems = feed.items || [];
    return rawItems.map((item) => {
      const isIncome = item.kind === 'income';
      const isSplit = item.kind === 'split_bill';
      const formattedAmount = `${isIncome ? '+' : '-'}${formatInr(item.amount)}`;
      const itemCategory = 'category' in item ? item.category : undefined;
      const itemBucket = 'bucket' in item ? item.bucket : undefined;

      const subtitleParts = [
        item.date,
        itemCategory?.label || (isIncome ? 'Income' : 'General'),
        isSplit ? 'Split Bill' : isIncome ? 'Income' : 'Personal',
      ].filter(Boolean);

      return {
        id: `tx-${item.id}`,
        category: 'transactions' as const,
        title: item.description || (isIncome ? 'Income Inflow' : 'Expense'),
        subtitle: subtitleParts.join(' • '),
        icon: isIncome ? ArrowDownLeft : isSplit ? Users2 : ArrowUpRight,
        iconTone: isIncome
          ? ('positive' as const)
          : isSplit
            ? ('info' as const)
            : ('negative' as const),
        amount: formattedAmount,
        amountTone: isIncome ? ('positive' as const) : ('negative' as const),
        badge: itemCategory?.label,
        href: `/dashboard/transactions?q=${encodeURIComponent(item.description || '')}`,
        keywords: [
          item.description || '',
          itemCategory?.label || '',
          itemBucket?.label || '',
          String(item.amount),
          item.date,
        ],
      };
    });
  }, [feed.items]);

  // 4. Budgets
  const budgets: SearchItem[] = useMemo(() => {
    const rawBudgets = budgetsData || [];
    const bucketsMap = new Map((feed.buckets || []).map((b) => [b.id, b.label]));

    return rawBudgets.map((b) => {
      const bucketName = bucketsMap.get(b.bucket_id) || 'Budget';
      return {
        id: `budget-${b.id}`,
        category: 'budgets' as const,
        title: `${bucketName} Allocation`,
        subtitle: `Monthly cap • Alert threshold: ${b.alert_threshold_amber || 80}%`,
        icon: Target,
        iconTone: 'warning' as const,
        amount: formatInr(Number(b.amount)),
        amountTone: 'neutral' as const,
        href: '/dashboard/budgets',
        keywords: [bucketName, String(b.amount), 'budget', 'envelope'],
      };
    });
  }, [budgetsData, feed.buckets]);

  // 5. Goals
  const goals: SearchItem[] = useMemo(() => {
    const rawGoals = goalsData || [];
    return rawGoals.map((g) => {
      const target = Number(g.target_amount) || 0;
      const current = Number(g.current_progress) || 0;
      const progressPct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

      return {
        id: `goal-${g.id}`,
        category: 'goals' as const,
        title: g.name,
        subtitle: `Target: ${formatInr(target)} • ${progressPct}% completed`,
        icon: PiggyBank,
        iconTone: 'positive' as const,
        amount: `${progressPct}%`,
        amountTone: progressPct >= 80 ? ('positive' as const) : ('neutral' as const),
        badge: g.status || 'Active',
        href: '/dashboard/goals',
        keywords: [g.name, String(target), 'savings goal', 'target'],
      };
    });
  }, [goalsData]);

  // 6. Categories
  const categories: SearchItem[] = useMemo(() => {
    const rawCats = categoriesData || feed.categories || [];
    return rawCats.map((cat) => {
      return {
        id: `cat-${cat.id || cat.key}`,
        category: 'categories' as const,
        title: cat.label,
        subtitle: `Category Tag • ${cat.key}`,
        icon: Tags,
        iconTone: 'default' as const,
        badge: 'Category',
        href: '/dashboard/categories',
        keywords: [cat.label, cat.key, 'category', 'tag'],
      };
    });
  }, [categoriesData, feed.categories]);

  // Combined searchable collection with fuzzy scoring & ranking
  const { groups, flatItems, categoryCounts, totalCount } = useMemo(() => {
    const cleanQ = query.trim().toLowerCase();

    // Helper to calculate match score
    const scoreItem = (item: SearchItem): number => {
      if (!cleanQ) return 1;

      const title = item.title.toLowerCase();
      const subtitle = (item.subtitle || '').toLowerCase();
      const keywords = (item.keywords || []).map((k) => k.toLowerCase());

      if (title === cleanQ) return 100;
      if (title.startsWith(cleanQ)) return 80;
      if (title.includes(cleanQ)) return 60;
      if (keywords.some((k) => k === cleanQ || k.startsWith(cleanQ))) return 50;
      if (keywords.some((k) => k.includes(cleanQ))) return 40;
      if (subtitle.includes(cleanQ)) return 30;

      return 0;
    };

    const filterList = (list: SearchItem[], limit = 8): SearchItem[] => {
      if (!cleanQ) return list.slice(0, limit);
      return list
        .map((item) => ({ item, score: scoreItem(item) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry) => entry.item);
    };

    const filteredPages = filterList(pages, cleanQ ? 10 : 8);
    const filteredActions = filterList(actions, 6);
    const filteredTransactions = filterList(transactions, cleanQ ? 12 : 5);
    const filteredBudgets = filterList(budgets, 6);
    const filteredGoals = filterList(goals, 6);
    const filteredCategories = filterList(categories, 8);

    const counts: Record<SearchCategory, number> = {
      all: 0,
      pages: filteredPages.length,
      actions: filteredActions.length,
      transactions: filteredTransactions.length,
      budgets: filteredBudgets.length,
      goals: filteredGoals.length,
      categories: filteredCategories.length,
    };
    counts.all =
      counts.pages +
      counts.actions +
      counts.transactions +
      counts.budgets +
      counts.goals +
      counts.categories;

    // Group assembly based on active tab
    const assembledGroups: SearchGroup[] = [];

    if (
      (selectedCategory === 'all' || selectedCategory === 'actions') &&
      filteredActions.length > 0
    ) {
      assembledGroups.push({
        category: 'actions',
        label: 'Quick Actions',
        items: filteredActions,
      });
    }

    if ((selectedCategory === 'all' || selectedCategory === 'pages') && filteredPages.length > 0) {
      assembledGroups.push({
        category: 'pages',
        label: 'Pages & Navigation',
        items: filteredPages,
      });
    }

    if (
      (selectedCategory === 'all' || selectedCategory === 'transactions') &&
      filteredTransactions.length > 0
    ) {
      assembledGroups.push({
        category: 'transactions',
        label: 'Transactions',
        items: filteredTransactions,
      });
    }

    if (
      (selectedCategory === 'all' || selectedCategory === 'budgets') &&
      filteredBudgets.length > 0
    ) {
      assembledGroups.push({
        category: 'budgets',
        label: 'Budgets',
        items: filteredBudgets,
      });
    }

    if ((selectedCategory === 'all' || selectedCategory === 'goals') && filteredGoals.length > 0) {
      assembledGroups.push({
        category: 'goals',
        label: 'Savings Goals',
        items: filteredGoals,
      });
    }

    if (
      (selectedCategory === 'all' || selectedCategory === 'categories') &&
      filteredCategories.length > 0
    ) {
      assembledGroups.push({
        category: 'categories',
        label: 'Categories & Tags',
        items: filteredCategories,
      });
    }

    const flat = assembledGroups.flatMap((g) => g.items);

    return {
      groups: assembledGroups,
      flatItems: flat,
      categoryCounts: counts,
      totalCount: counts.all,
    };
  }, [query, selectedCategory, pages, actions, transactions, budgets, goals, categories]);

  return {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    groups,
    flatItems,
    categoryCounts,
    totalCount,
  };
}
