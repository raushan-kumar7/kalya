import type { Bucket } from '@kalya/types';
import type { TransactionSummaryMetrics } from '../transactions/types';

export interface OverviewKpis extends TransactionSummaryMetrics {
  /** Whole percent of income kept. Can be negative when you overspend. */
  savingsRate: number;
}

/** One point of the "Income vs Expense" chart (oldest -> newest). */
export interface MonthlyTrendPoint {
  month: string; // 'YYYY-MM'
  label: string; // 'May 2026', ready for the chart axis
  income: number;
  expense: number;
  savings: number;
}

/** One slice of "Spending by bucket". `bucket` is undefined for uncategorised spend. */
export interface BucketSpend {
  key: string;
  bucket?: Bucket;
  amount: number;
  percent: number;
}

/** One day of "Daily spending" (every day of the month, gaps filled with 0). */
export interface DailySpendPoint {
  date: string; // 'YYYY-MM-DD'
  day: number;
  spent: number;
  cumulative: number | null;
  isFuture?: boolean;
}

/** Top spending category summary item. */
export interface TopCategorySpend {
  category: string;
  spent: number;
  percent: number;
}
