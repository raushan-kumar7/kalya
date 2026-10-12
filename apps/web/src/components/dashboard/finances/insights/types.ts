import type { Bucket, Category, Decimal, Expense, Income, MonthString } from '@kalya/types';

export type ReportRangePreset =
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'last_12_months'
  | 'financial_year'
  | 'custom';

export type ReportTab =
  'cashflow' | 'spending' | 'budgets' | 'splits' | 'wealth' | 'goals' | 'statements';

export interface ReportFilterState {
  preset: ReportRangePreset;
  customStart?: string;
  customEnd?: string;
  compareWithPrevious: boolean;
  activeTab: ReportTab;
}

export interface DateRangePeriod {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  label: string;
  months: string[]; // ['2026-08', '2026-09', '2026-10']
}

export interface MetricWithChange {
  value: number;
  formatted: string;
  previousValue: number;
  previousFormatted: string;
  deltaPct: number; // e.g. +14.2 or -5.1
  isPositiveGood?: boolean; // income: positive is good; expense: negative is good
}

export interface ReportKpis {
  income: MetricWithChange;
  spent: MetricWithChange;
  netSavings: MetricWithChange;
  savingsRate: MetricWithChange;
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
  };
}

export interface CashflowTrendPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  cumulativeSavings: number;
}

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  color: string;
  amount: number;
  percent: number;
  count: number;
  previousAmount: number;
  changePct: number;
  bucketName?: string;
}

export interface CategoryTrendPoint {
  month: string;
  label: string;
  [categoryKey: string]: string | number;
}

export interface BucketAllocationPoint {
  month: string;
  label: string;
  needsActual: number;
  needsTarget: number;
  wantsActual: number;
  wantsTarget: number;
  savingsActual: number;
  savingsTarget: number;
  totalIncome: number;
}

export interface WeekdaySpendPoint {
  day: string;
  dayIndex: number;
  shortDay: string;
  total: number;
  average: number;
  count: number;
}

export interface DailyHeatmapCell {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sun .. 6=Sat
  dayOfMonth: number;
  monthKey: string;
  amount: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface PaymentMethodItem {
  method: string;
  label: string;
  amount: number;
  count: number;
  percent: number;
  color?: string;
}

export interface TopExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryName: string;
  categoryColor: string;
  paymentMethod?: string | null;
}

export interface FrequentMerchantItem {
  description: string;
  count: number;
  totalAmount: number;
  avgAmount: number;
  categoryName: string;
}

export interface BudgetHeatCell {
  month: string;
  monthLabel: string;
  budgeted: number;
  spent: number;
  pct: number;
  status: 'within' | 'warning' | 'over' | 'unbudgeted';
}

export interface BudgetHeatRow {
  bucketId: string;
  bucketName: string;
  bucketType: 'needs' | 'wants' | 'savings' | 'custom';
  color: string;
  cells: BudgetHeatCell[];
  monthsOverBudget: number;
  averageAdherencePct: number;
}

export interface SplitFriendBalance {
  contactId: string;
  name: string;
  avatar?: string;
  totalPaidForThem: number;
  owedToYou: number;
  youOwe: number;
  netBalance: number; // positive = they owe you, negative = you owe them
  settledAmount: number;
  settledTransactionsCount: number;
  pendingTransactionsCount: number;
}

export interface SplitReportTotals {
  paidForFriends: number;
  owedToYou: number;
  youOwe: number;
  settled: number;
}

export interface ReportInsight {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'negative' | 'neutral';
  metric?: string;
  actionLabel?: string;
  filterKey?: 'category' | 'bucket' | 'month';
  filterValue?: string;
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

export interface DrilldownTarget {
  type: 'category' | 'bucket' | 'month';
  id?: string;
  title: string;
  subtitle?: string;
}
