'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  PiggyBank,
  RotateCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { formatInr, formatPercent } from '@kalya/utils';
import { useOverview } from '@/hooks/finances';
import { Button } from '@/components/ui';
import { MonthSwitcher } from '@/components/shared';
import { cn } from '@/libs/utils';
import { KpiCard } from './card';
import { RecentTransactions } from './recents';
import {
  BucketDonut,
  BudgetHealth,
  DailySpending,
  GoalsProgress,
  IncomeExpenseTrend,
  NetWorthDonut,
  SavingsRateGauge,
  TopCategories,
} from './charts';
import {
  toBucketDonut,
  toBudgetHealth,
  toDailyChart,
  toGoalsProgress,
  toKpiValues,
  toMonthControls,
  toNetWorth,
  toRecentRows,
  toTopCategoriesChart,
} from './helper';

/** Route links for deep-navigation across finance modules */
const ROUTES = {
  transactions: '/dashboard/transactions',
  splits: '/dashboard/splits',
  budgets: '/dashboard/budgets',
  goals: '/dashboard/goals',
  categories: '/dashboard/categories',
  assets: '/dashboard/assets',
};

export function DashboardOverview() {
  const o = useOverview();

  const month = toMonthControls(o.month);
  const kpi = useMemo(() => toKpiValues(o.kpis), [o.kpis]);
  const bucketDonut = useMemo(() => toBucketDonut(o.bucketBreakdown), [o.bucketBreakdown]);
  const daily = useMemo(() => toDailyChart(o.dailySpending), [o.dailySpending]);
  const netWorth = useMemo(() => toNetWorth(o.portfolio), [o.portfolio]);
  const topCategoriesChart = useMemo(
    () => toTopCategoriesChart(o.topCategories),
    [o.topCategories]
  );
  const budgetHealth = useMemo(
    () => toBudgetHealth(o.budgets, o.bucketBreakdown, o.buckets),
    [o.budgets, o.bucketBreakdown, o.buckets]
  );
  const goalsProgress = useMemo(() => toGoalsProgress(o.goals), [o.goals]);
  const recentItems = useMemo(
    () => toRecentRows(o.monthItems.length ? o.monthItems : o.items),
    [o.monthItems, o.items]
  );

  const hasOpenSplits = kpi.friendsOweYou > 0 || kpi.youOwe > 0;

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-12">
      {/* Header & Month Navigation */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-display-md text-text-primary">Financial Overview</h2>
          <p className="text-body-sm text-text-secondary mt-1">
            {month.label
              ? `${month.label} cashflow & analytics summary`
              : 'Cashflow & analytics summary'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <MonthSwitcher
            monthLabel={month.label}
            isCurrentMonth={month.isCurrent}
            onPreviousMonth={month.onPrevious}
            onNextMonth={month.onNext}
            onGoToCurrentMonth={month.onCurrent}
            resetLabel="This Month"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => o.refetch()}
            disabled={o.isLoading}
            className="gap-1.5"
            aria-label="Refresh financial overview"
          >
            <RotateCw size={15} className={cn('shrink-0', o.isLoading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Split dues notification banner if active dues exist */}
      {hasOpenSplits && (
        <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary-subtle/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <Users size={14} />
            </div>
            <p className="text-caption sm:text-body-sm text-text-primary truncate">
              {kpi.friendsOweYou > 0 && (
                <span>
                  Friends owe you{' '}
                  <strong className="font-semibold text-success">
                    {formatInr(kpi.friendsOweYou)}
                  </strong>
                </span>
              )}
              {kpi.friendsOweYou > 0 && kpi.youOwe > 0 && <span> · </span>}
              {kpi.youOwe > 0 && (
                <span>
                  You owe{' '}
                  <strong className="font-semibold text-danger">{formatInr(kpi.youOwe)}</strong>
                </span>
              )}
            </p>
          </div>

          <Link href={ROUTES.splits}>
            <Button variant="outline" size="sm" className="h-7 text-caption gap-1 shrink-0">
              <span>View Balances</span>
              <ArrowUpRight size={12} />
            </Button>
          </Link>
        </div>
      )}

      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          title="Income"
          value={`+${formatInr(kpi.totalIncome)}`}
          hint="Total inflow received"
          icon={TrendingUp}
          tone="positive"
          isLoading={o.isLoading}
        />
        <KpiCard
          title="Spent (your share)"
          value={`-${formatInr(kpi.totalSpent)}`}
          hint="Personal + split shares"
          icon={TrendingDown}
          tone="default"
          isLoading={o.isLoading}
        />
        <KpiCard
          title="Net cashflow"
          value={formatInr(kpi.netSavings)}
          hint={`Savings rate ${formatPercent(kpi.savingsRate)}`}
          badge={kpi.savingsRate ? `${kpi.savingsRate}%` : undefined}
          icon={PiggyBank}
          tone={kpi.netSavings < 0 ? 'negative' : 'positive'}
          isLoading={o.isLoading}
        />
        <KpiCard
          title="Net worth"
          value={formatInr(netWorth.total)}
          hint="Commodities + equities"
          icon={Wallet}
          tone="default"
          isLoading={o.isPortfolioLoading}
        />
      </div>

      {/* Primary Analytics: Trend + Buckets */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col">
          <IncomeExpenseTrend data={o.trend} isLoading={o.isLoading} />
        </div>
        <div className="flex flex-col">
          <BucketDonut data={bucketDonut} breakdown={o.bucketBreakdown} isLoading={o.isLoading} />
        </div>
      </div>

      {/* Spend Trajectory: Daily Burn + Savings Rate Gauge */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col">
          <DailySpending data={daily} isLoading={o.isLoading} />
        </div>
        <div className="flex flex-col">
          <SavingsRateGauge
            rate={kpi.savingsRate}
            income={kpi.totalIncome}
            spent={kpi.totalSpent}
            netSavings={kpi.netSavings}
            isLoading={o.isLoading}
          />
        </div>
      </div>

      {/* Operational Strip: Categories, Budgets, Goals */}
      <div className="grid gap-5 lg:grid-cols-3">
        <TopCategories
          data={topCategoriesChart}
          isLoading={o.isLoading}
          viewAllHref={ROUTES.categories}
        />
        <BudgetHealth
          budgets={budgetHealth}
          isLoading={o.isBudgetsLoading || o.isLoading}
          viewAllHref={ROUTES.budgets}
        />
        <GoalsProgress
          goals={goalsProgress}
          isLoading={o.isGoalsLoading}
          viewAllHref={ROUTES.goals}
        />
      </div>

      {/* Bottom Strip: Recent Activity + Portfolio Allocation */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions
            items={recentItems}
            isLoading={o.isLoading}
            viewAllHref={ROUTES.transactions}
          />
        </div>
        <NetWorthDonut
          commodities={netWorth.commodities}
          equities={netWorth.equities}
          isLoading={o.isPortfolioLoading}
          viewAllHref={ROUTES.assets}
        />
      </div>
    </section>
  );
}

export default DashboardOverview;
