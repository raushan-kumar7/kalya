import { useMemo } from 'react';
import { useFinanceFeed } from '../feed/use-finance-feed';
import { getItemMonth } from '../transactions/date';
import { usePortfolioSummaryQuery } from '../use-assets';
import { useBudgetsQuery } from '../use-budgets';
import { useGoalsQuery } from '../use-goals';
import { useMonthNavigation } from '../use-month-navigation';
import { computeBucketBreakdown } from './breakdown';
import { computeTopCategories } from './categories';
import { computeDailySpending } from './daily';
import { computeOverviewKpis } from './kpis';
import { computeMonthlyTrend } from './trend';

const TREND_MONTHS = 6;

/**
 * Wiring hook for the Overview page: feed -> aggregate.
 * `month` carries the picker state + controls (label, prev / next / current).
 */
export function useOverview() {
  const month = useMonthNavigation();
  const { selectedMonth } = month;

  const feed = useFinanceFeed();
  const portfolioQuery = usePortfolioSummaryQuery();
  const budgetsQuery = useBudgetsQuery();
  const goalsQuery = useGoalsQuery();
  const { items } = feed;

  // Filtered ONCE, shared by every month-scoped chart.
  const monthItems = useMemo(
    () => items.filter((item) => getItemMonth(item) === selectedMonth),
    [items, selectedMonth]
  );

  const kpis = useMemo(() => computeOverviewKpis(items, selectedMonth), [items, selectedMonth]);
  const trend = useMemo(
    () => computeMonthlyTrend(items, selectedMonth, TREND_MONTHS),
    [items, selectedMonth]
  );
  const bucketBreakdown = useMemo(() => computeBucketBreakdown(monthItems), [monthItems]);
  const topCategories = useMemo(() => computeTopCategories(monthItems), [monthItems]);
  const dailySpending = useMemo(
    () => computeDailySpending(monthItems, selectedMonth),
    [monthItems, selectedMonth]
  );

  return {
    month,
    selectedMonth,
    items,
    monthItems,
    categories: feed.categories,
    buckets: feed.buckets,
    contacts: feed.contacts,
    kpis,
    trend,
    bucketBreakdown,
    topCategories,
    dailySpending,
    isEmpty: monthItems.length === 0,

    // Budgets & Goals
    budgets: budgetsQuery.data ?? [],
    isBudgetsLoading: budgetsQuery.isLoading,
    goals: goalsQuery.data ?? [],
    isGoalsLoading: goalsQuery.isLoading,

    // Net worth card
    portfolio: portfolioQuery.data,
    isPortfolioLoading: portfolioQuery.isLoading,

    isLoading: feed.isLoading || budgetsQuery.isLoading || goalsQuery.isLoading,
    isError: feed.isError || budgetsQuery.isError || goalsQuery.isError,
    error: feed.error || budgetsQuery.error?.message || goalsQuery.error?.message,
    refetch: async () => {
      await Promise.all([
        feed.refetch(),
        portfolioQuery.refetch(),
        budgetsQuery.refetch(),
        goalsQuery.refetch(),
      ]);
    },
  };
}

export * from './types';
export * from './breakdown';
export * from './categories';
export * from './daily';
export * from './kpis';
export * from './trend';
