import type { MonthString } from '@kalya/types';

export type ReportRangePreset =
  'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'custom';

export type ReportTab =
  'income' | 'expenses' | 'buckets' | 'categories' | 'budgets' | 'goals' | 'assets';

export type ViewMode = 'chart' | 'table';

export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface DateRangePeriod {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  label: string;
  comparisonLabel?: string;
  months: string[]; // ['2026-08', '2026-09', '2026-10']
}

export interface MetricWithChange {
  value: number;
  formatted: string;
  previousValue: number;
  previousFormatted: string;
  deltaPct: number; // e.g. +14.2 or -5.1
  hasComparison: boolean;
  isNew: boolean;
  isPositiveGood?: boolean; // income: positive is good; expense: negative is good
  sparkline: number[];
}

export interface ReportKpis {
  income: MetricWithChange;
  spent: MetricWithChange;
  netSavings: MetricWithChange;
  savingsRate: MetricWithChange & {
    targetBenchmark: number; // e.g. 20%
  };
  avgDailySpend: { value: number; formatted: string };
  largestExpense: {
    amount: number;
    formatted: string;
    description: string;
    date: string;
    category?: string;
  };
  transactionCount: {
    value: number;
    previousValue: number;
    deltaPct: number;
    hasComparison: boolean;
  };
}

export type InsightSeverity = 'warning' | 'info' | 'positive';

export interface ReportInsight {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  metric?: string;
  actionLabel?: string;
  targetTab?: ReportTab;
  filterKey?: 'category' | 'bucket' | 'month';
  filterValue?: string;
}

// ── Tab Data Models ──────────────────────────────────────────

export interface IncomeTableRecord {
  id: string;
  date: string;
  source: string;
  account: string;
  amount: number;
}

export interface ExpenseTableRecord {
  id: string;
  date: string;
  merchant: string;
  category: string;
  categoryColor: string;
  bucket: string;
  amount: number;
}

export interface BucketAllocationRecord {
  id: string;
  name: string;
  type: 'needs' | 'wants' | 'savings' | 'custom';
  color: string;
  allocated: number;
  spent: number;
  remaining: number;
  pct: number;
  targetPct: number;
}

export interface CategoryBreakdownRecord {
  id: string;
  name: string;
  color: string;
  amount: number;
  percent: number;
  count: number;
  previousAmount: number;
  changePct: number;
  hasComparison: boolean;
}

export interface BudgetStatusRecord {
  id: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  pct: number;
  status: 'within' | 'warning' | 'over' | 'unbudgeted';
}

export interface GoalStatusRecord {
  id: string;
  name: string;
  target: number;
  saved: number;
  pct: number;
  eta: string;
  color?: string;
}

export interface AssetAllocationRecord {
  id: string;
  name: string;
  value: number;
  allocationPct: number;
  change: number;
  color: string;
}

// ── Chart Trend Points ───────────────────────────────────────

export interface IncomeExpenseTrendPoint {
  periodKey: string;
  label: string;
  income: number;
  expense: number;
  previousIncome?: number;
  previousExpense?: number;
}

export interface BucketTrendPoint {
  periodKey: string;
  label: string;
  needs: number;
  wants: number;
  savings: number;
}

export interface NetWorthTrendPoint {
  label: string;
  netWorth: number;
}

export interface StatementSummaryRecord {
  id: string;
  month: MonthString;
  periodStart: string;
  periodEnd: string;
  totalSpent: number;
  generatedAt: string;
  bucketTotals: Record<string, { spent: number; budgeted: number; status: string }>;
  categoryTotals: Record<string, { spent: number }>;
}
