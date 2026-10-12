'use client';

import React from 'react';
import { CartesianChart, ChartCard, DonutChart, RadialChart } from '@/components/ui/charts';
import type { CartesianSeries } from '@/components/ui/charts';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { Badge } from '@/components/ui/data-display/badge';
import { Progress } from '@/components/ui/feedback/progress';
import { EmptyState } from '@/components/ui/states/empty-state';
import { Plus, Target, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { useRouter } from 'next/navigation';
import type {
  AssetAllocationRecord,
  BucketAllocationRecord,
  BucketTrendPoint,
  BudgetStatusRecord,
  CategoryBreakdownRecord,
  GoalStatusRecord,
  IncomeExpenseTrendPoint,
} from './types';

// ============================================================
// 1. INCOME CHART VIEW
// ============================================================

export function IncomeChartView({
  trendData,
  compareWithPrevious,
  isLoading,
}: {
  trendData: IncomeExpenseTrendPoint[];
  compareWithPrevious: boolean;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const hasData = trendData.some((d) => d.income > 0);

  if (!hasData && !isLoading) {
    return (
      <EmptyState
        icon={<Wallet className="h-6 w-6 text-text-muted" />}
        title="No income recorded"
        description="Record your income deposits to analyze earning trends."
        action={
          <Button size="sm" onClick={() => router.push('/dashboard/transactions')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Income
          </Button>
        }
      />
    );
  }

  const series: CartesianSeries<IncomeExpenseTrendPoint>[] = [
    {
      key: 'income',
      label: 'Income',
      type: 'bar',
      color: 'var(--chart-1)',
    },
  ];

  if (compareWithPrevious) {
    series.push({
      key: 'previousIncome',
      label: 'Previous Period',
      type: 'bar',
      color: 'var(--chart-1)',
      dashed: true,
    });
  }

  return (
    <ChartCard
      title="Income Inflow Trend"
      description="Total earnings tracked across each month in the selected period"
      isLoading={isLoading}
      isEmpty={!trendData.length}
    >
      <CartesianChart
        data={trendData}
        xKey="label"
        axisFormatter={formatCompactInr}
        valueFormatter={formatInr}
        series={series}
      />
    </ChartCard>
  );
}

// ============================================================
// 2. EXPENSES CHART VIEW
// ============================================================

export function ExpensesChartView({
  trendData,
  compareWithPrevious,
  isLoading,
}: {
  trendData: IncomeExpenseTrendPoint[];
  compareWithPrevious: boolean;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const hasData = trendData.some((d) => d.expense > 0);

  if (!hasData && !isLoading) {
    return (
      <EmptyState
        icon={<Wallet className="h-6 w-6 text-text-muted" />}
        title="No expenses recorded"
        description="Log your daily expenses to see your spending curve over time."
        action={
          <Button size="sm" onClick={() => router.push('/dashboard/transactions')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Expense
          </Button>
        }
      />
    );
  }

  const series: CartesianSeries<IncomeExpenseTrendPoint>[] = [
    {
      key: 'expense',
      label: 'Expenses',
      type: 'area',
      color: 'var(--chart-5)',
    },
  ];

  if (compareWithPrevious) {
    series.push({
      key: 'previousExpense',
      label: 'Previous Period',
      type: 'line',
      color: 'var(--chart-3)',
      dashed: true,
    });
  }

  return (
    <ChartCard
      title="Spending Trajectory"
      description="Living outlays and spending velocity over time"
      isLoading={isLoading}
      isEmpty={!trendData.length}
    >
      <CartesianChart
        data={trendData}
        xKey="label"
        axisFormatter={formatCompactInr}
        valueFormatter={formatInr}
        series={series}
      />
    </ChartCard>
  );
}

// ============================================================
// 3. BUCKETS CHART VIEW (50/30/20 RULE)
// ============================================================

export function BucketsChartView({
  buckets,
  trendData,
  isLoading,
}: {
  buckets: BucketAllocationRecord[];
  trendData: BucketTrendPoint[];
  isLoading?: boolean;
}) {
  const donutData = buckets.map((b) => ({
    name: b.name,
    value: b.spent,
    color: b.color,
  }));

  const totalSpent = buckets.reduce((acc, b) => acc + b.spent, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 50/30/20 Distribution Donut */}
      <ChartCard
        title="Bucket Allocation"
        description="Needs (50%), Wants (30%), Savings (20%) breakdown"
        isLoading={isLoading}
        isEmpty={totalSpent === 0}
      >
        <DonutChart
          data={donutData}
          centerLabel="Spent"
          centerValue={formatCompactInr(totalSpent)}
          valueFormatter={formatInr}
        />
      </ChartCard>

      {/* Stacked Outlay Trend */}
      <ChartCard
        title="Bucket Outlays Over Time"
        description="Historical outlays split across essential and lifestyle buckets"
        isLoading={isLoading}
        isEmpty={!trendData.length}
      >
        <CartesianChart
          data={trendData}
          xKey="label"
          axisFormatter={formatCompactInr}
          valueFormatter={formatInr}
          series={[
            { key: 'needs', label: 'Needs', type: 'bar', color: 'var(--chart-3)' },
            { key: 'wants', label: 'Wants', type: 'bar', color: 'var(--chart-5)' },
            { key: 'savings', label: 'Savings', type: 'bar', color: 'var(--chart-1)' },
          ]}
        />
      </ChartCard>
    </div>
  );
}

// ============================================================
// 4. CATEGORIES CHART VIEW
// ============================================================

export function CategoriesChartView({
  categories,
  onSelectCategory,
  isLoading,
}: {
  categories: CategoryBreakdownRecord[];
  onSelectCategory?: (category: CategoryBreakdownRecord) => void;
  isLoading?: boolean;
}) {
  const donutData = categories.slice(0, 6).map((c) => ({
    name: c.name,
    value: c.amount,
    color: c.color,
  }));

  const total = categories.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Donut Distribution */}
      <ChartCard
        title="Top Categories"
        description="Outlay distribution by spending category"
        isLoading={isLoading}
        isEmpty={categories.length === 0}
      >
        <DonutChart
          data={donutData}
          centerLabel="Total"
          centerValue={formatCompactInr(total)}
          valueFormatter={formatInr}
        />
      </ChartCard>

      {/* Ranked Horizontal Bars */}
      <ChartCard
        title="Category Leaderboard"
        description="Ranked by volume of spending in selected period"
        isLoading={isLoading}
        isEmpty={categories.length === 0}
      >
        <div className="flex flex-col gap-3 py-1">
          {categories.slice(0, 7).map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCategory?.(c)}
              className="group flex flex-col gap-1 cursor-pointer"
            >
              <div className="flex items-center justify-between text-body-sm">
                <span className="font-medium text-text-primary group-hover:text-primary transition-colors flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </span>
                <span className="font-numeric font-semibold text-text-primary">
                  {formatInr(c.amount)}
                  <span className="text-caption font-normal text-text-muted ml-1.5">
                    ({c.percent.toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-raised overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(2, c.percent))}%`,
                    backgroundColor: c.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

// ============================================================
// 5. BUDGETS CHART VIEW
// ============================================================

export function BudgetsChartView({
  budgets,
  isLoading,
}: {
  budgets: BudgetStatusRecord[];
  isLoading?: boolean;
}) {
  const router = useRouter();

  if (budgets.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={<Target className="h-6 w-6 text-text-muted" />}
        title="No budget targets found"
        description="Set monthly spending limits for buckets to track adherence."
        action={
          <Button size="sm" onClick={() => router.push('/dashboard/budgets')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Manage Budgets
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => router.push('/dashboard/budgets')}
          className="text-caption font-semibold text-primary hover:underline cursor-pointer select-none"
        >
          Manage Budgets & Limits →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const isOver = b.status === 'over';
          const isWarning = b.status === 'warning';

          return (
            <div
              key={b.id}
              onClick={() => router.push('/dashboard/budgets')}
              className="rounded-xl border border-border bg-surface p-4 shadow-card flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-body-sm text-text-primary">{b.name}</span>
                  <Badge variant={isOver ? 'danger' : isWarning ? 'warning' : 'success'} size="sm">
                    {isOver ? 'Over budget' : isWarning ? 'Caution' : 'On track'}
                  </Badge>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-text-muted">Spent</span>
                    <div className="font-numeric text-title-sm font-bold text-text-primary">
                      {formatInr(b.spent)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-text-muted">Budget</span>
                    <div className="font-numeric text-body-sm font-semibold text-text-secondary">
                      {formatInr(b.limit)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-caption text-text-muted mb-1">
                  <span>{Math.round(b.pct)}% used</span>
                  <span>
                    {b.remaining >= 0
                      ? `${formatInr(b.remaining)} left`
                      : `${formatInr(Math.abs(b.remaining))} over`}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, b.pct)}
                  variant={isOver ? 'danger' : isWarning ? 'warning' : 'success'}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 6. GOALS CHART VIEW
// ============================================================

export function GoalsChartView({
  goals,
  isLoading,
}: {
  goals: GoalStatusRecord[];
  isLoading?: boolean;
}) {
  const router = useRouter();

  if (goals.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={<Target className="h-6 w-6 text-text-muted" />}
        title="No savings goals set"
        description="Create your first financial target to visualize your runway."
        action={
          <Button size="sm" onClick={() => router.push('/dashboard/goals')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Manage Goals
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => router.push('/dashboard/goals')}
          className="text-caption font-semibold text-primary hover:underline cursor-pointer select-none"
        >
          Manage Goals & Milestones →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((g) => (
          <div
            key={g.id}
            onClick={() => router.push('/dashboard/goals')}
            className="rounded-xl border border-border bg-surface p-4 shadow-card flex flex-col items-center text-center gap-3 hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="w-full text-left">
              <span className="font-semibold text-body-sm text-text-primary block truncate">
                {g.name}
              </span>
              <span className="text-caption text-text-muted block">ETA: {g.eta}</span>
            </div>

            {/* Mini Radial Ring */}
            <div className="h-24 w-24">
              <RadialChart
                value={g.pct}
                max={100}
                color={g.color || 'var(--chart-1)'}
                height={96}
                centerText={`${Math.round(g.pct)}%`}
              />
            </div>

            <div className="w-full pt-2 border-t border-border/60 flex items-center justify-between text-caption">
              <span className="text-text-muted">Saved</span>
              <span className="font-numeric font-semibold text-text-primary">
                {formatInr(g.saved)} / {formatInr(g.target)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 7. ASSETS CHART VIEW
// ============================================================

export function AssetsChartView({
  assets,
  isLoading,
}: {
  assets: AssetAllocationRecord[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const totalValue = assets.reduce((acc, a) => acc + a.value, 0);

  const donutData = assets.map((a) => ({
    name: a.name,
    value: a.value,
    color: a.color,
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => router.push('/dashboard/assets')}
          className="text-caption font-semibold text-primary hover:underline cursor-pointer select-none"
        >
          Manage Portfolio Holdings →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Total Net Worth Card */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div
            onClick={() => router.push('/dashboard/assets')}
            className="rounded-xl border border-border bg-surface p-5 shadow-card hover:border-primary/40 transition-colors cursor-pointer"
          >
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
              Portfolio Net Worth
            </span>
            <div className="font-numeric text-title-lg font-bold text-text-primary tracking-tight mt-1">
              {formatInr(totalValue)}
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-caption">
              <span className="text-text-muted">Tracked Assets:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {assets.length} categories active
              </span>
            </div>
          </div>

          {/* Breakdown chips */}
          <div className="flex flex-col gap-2">
            {assets.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-border/70 bg-surface/80 p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-body-sm font-medium text-text-primary">{a.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-numeric text-body-sm font-semibold text-text-primary block">
                    {formatInr(a.value)}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {a.allocationPct.toFixed(1)}% of portfolio
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Allocation */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Asset Allocation"
            description="Distribution across equities, commodities, and cash"
            isLoading={isLoading}
            isEmpty={totalValue === 0}
          >
            <DonutChart
              data={donutData}
              centerLabel="Net Worth"
              centerValue={formatCompactInr(totalValue)}
              valueFormatter={formatInr}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
