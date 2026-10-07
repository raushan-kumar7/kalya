/**
 * View model for the Budgets page.
 */
export interface BudgetCategoryBreakdown {
  id: string;
  label: string;
  color?: string;
  spent: number;
  percent: number;
}

export interface BudgetProjection {
  daysInMonth: number;
  daysElapsed: number;
  daysRemaining: number;
  dailyAvgSpent: number;
  safeDailySpend: number;
  projectedMonthEndSpent: number;
  projectedOverspend: number;
  runoutDay?: number;
}

export interface BudgetRow {
  id: string;
  bucketId: string;
  incomeId: string;
  bucketKey: string;
  bucketLabel: string; // "Needs"
  bucketColor?: string;
  targetPercent: number; // 50
  period: 'monthly' | 'quarterly' | 'annual' | 'financial_year';
  amount: number; // budgeted
  spent: number;
  rollover: boolean;
  amberThreshold: number; // default 80
  redThreshold: number; // default 100
  categories: BudgetCategoryBreakdown[];
  projection: BudgetProjection;
}

export interface BudgetTotals {
  budgeted: number;
  spent: number;
  remaining: number;
  usedPct: number;
  alertCount: number;
}

export interface PacePoint {
  day: string; // "1".."31"
  cumulative?: number; // actual, undefined for future days
  ideal: number; // straight-line budget burn
  projected?: number; // from today to month end
}

export interface HistoryPoint {
  month: string; // "YYYY-MM"
  budget: number;
  spent: number;
}

export interface BudgetAlertItem {
  id: string;
  bucketLabel: string;
  bucketColor?: string;
  spent: number;
  amount: number;
  pct: number;
  tone: 'warning' | 'danger';
  remaining: number;
  message: string;
}

export interface BudgetsView {
  rows: BudgetRow[];
  totals: BudgetTotals;
  totalIncome: number;
  pace: PacePoint[];
  history: HistoryPoint[];
  alerts: BudgetAlertItem[];
  insights: string[];
}
