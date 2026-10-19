import type { DonutDatum } from '@/components/ui/charts';
import type { Budget, Bucket, Goal } from '@kalya/types';
import { roundMoney } from '@kalya/utils';
import type {
  OverviewKpis,
  BucketSpend,
  DailySpendPoint,
  TopCategorySpend,
} from '@/hooks/finances/overview/types';
import type { UnifiedTransactionItem } from '@/hooks/finances/transactions/types';

/* ── Recent Transactions Types ─────────────────────────────── */

export interface RecentRow {
  id: string;
  description: string;
  subtitle: string;
  date: string;
  amount: number;
  isIncome: boolean;
  category?: string;
  kind: 'personal_expense' | 'split_bill' | 'income';
}

/* ── Month picker ──────────────────────────────────────────── */

export function toMonthControls(m?: {
  monthLabel?: string;
  isCurrentMonth?: boolean;
  goToPrevMonth?: () => void;
  goToNextMonth?: () => void;
  goToCurrentMonth?: () => void;
}) {
  return {
    label: m?.monthLabel ?? '',
    isCurrent: m?.isCurrentMonth ?? true,
    onPrevious: m?.goToPrevMonth ?? (() => {}),
    onNext: m?.goToNextMonth ?? (() => {}),
    onCurrent: m?.goToCurrentMonth ?? (() => {}),
  };
}

/* ── KPIs ──────────────────────────────────────────────────── */

export function toKpiValues(kpis: OverviewKpis) {
  const totalIncome = Number(kpis.totalIncome ?? 0);
  const netSavings = Number(kpis.netCashflow ?? 0);
  const totalSpent = Number(kpis.totalSpentPersonal ?? Math.max(0, totalIncome - netSavings));
  const savingsRate = Number(kpis.savingsRate ?? 0);
  const youOwe = Number(kpis.youOwe ?? 0);
  const friendsOweYou = Number(kpis.friendsOweYou ?? 0);

  return {
    totalIncome,
    totalSpent,
    netSavings,
    savingsRate,
    youOwe,
    friendsOweYou,
  };
}

/* ── Charts ────────────────────────────────────────────────── */

export function toBucketDonut(rows: BucketSpend[]): DonutDatum[] {
  return rows.map((r) => ({
    name: r.bucket?.label ?? 'Uncategorised',
    value: r.amount,
  }));
}

/** DailySpending chart expects `day` as a string axis key. */
export function toDailyChart(points: DailySpendPoint[]) {
  return points.map((p) => ({
    day: String(p.day),
    spent: p.spent,
    cumulative: p.cumulative,
    isFuture: p.isFuture ?? false,
  }));
}

/** Top categories formatted for Cartesian horizontal bar chart. */
export function toTopCategoriesChart(categories: TopCategorySpend[]) {
  return categories.map((c) => ({
    category: c.category,
    spent: c.spent,
  }));
}

/* ── Net worth ─────────────────────────────────────────────── */

export function toNetWorth(portfolio?: unknown) {
  const p = (portfolio ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

  const commodities = num(p.total_commodities_value ?? p.commodities ?? p.commoditiesValue);
  const equities = num(p.total_equities_value ?? p.equities ?? p.equitiesValue);
  const total = num(p.total_portfolio_net_worth ?? p.total ?? commodities + equities);

  return { commodities, equities, total };
}

/* ── Budgets Health ────────────────────────────────────────── */

export function toBudgetHealth(
  budgets: Budget[],
  bucketBreakdown: BucketSpend[],
  buckets: Bucket[] = []
): { id: string; label: string; spent: number; amount: number }[] {
  const bucketMap = new Map(buckets.map((b) => [b.id, b]));
  const spendByBucket = new Map(bucketBreakdown.map((b) => [b.bucket?.id ?? b.key, b.amount]));

  return budgets.map((b) => {
    const bucket = bucketMap.get(b.bucket_id);
    const label = bucket?.label ?? 'Budget';
    const spent = spendByBucket.get(b.bucket_id) ?? 0;
    const amount = Number(b.amount) || 0;

    return {
      id: b.id,
      label,
      spent: roundMoney(spent),
      amount: roundMoney(amount),
    };
  });
}

/* ── Goals Progress ────────────────────────────────────────── */

export function toGoalsProgress(
  goals: Goal[]
): { id: string; name: string; saved: number; target: number }[] {
  return goals.map((g) => ({
    id: g.id,
    name: g.name,
    saved: roundMoney(Number(g.current_progress ?? 0)),
    target: roundMoney(Number(g.target_amount ?? 0)),
  }));
}

/* ── Recent Transactions ───────────────────────────────────── */

export function toRecentRows(items: UnifiedTransactionItem[], limit = 5): RecentRow[] {
  const sorted = [...items].sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt || 0).getTime();
    const timeB = new Date(b.date || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return sorted.slice(0, limit).map((item) => {
    if (item.kind === 'income') {
      return {
        id: item.id,
        description: item.description || 'Monthly Salary & Inflow',
        subtitle: 'Income inflow',
        date: item.date,
        amount: item.amount,
        isIncome: true,
        kind: 'income',
      };
    }

    if (item.kind === 'split_bill') {
      return {
        id: item.id,
        description: item.description || 'Shared Expense',
        subtitle: item.pendingDuesNarration || (item.category?.label ?? 'Split Bill'),
        date: item.date,
        amount: item.yourShare,
        isIncome: false,
        category: item.category?.label,
        kind: 'split_bill',
      };
    }

    return {
      id: item.id,
      description: item.description || 'Personal Expense',
      subtitle: item.category?.label || item.bucket?.label || 'General Expense',
      date: item.date,
      amount: item.amount,
      isIncome: false,
      category: item.category?.label,
      kind: 'personal_expense',
    };
  });
}
