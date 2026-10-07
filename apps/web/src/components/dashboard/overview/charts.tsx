'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Progress, Button } from '@/components/ui';
import {
  CartesianChart,
  ChartCard,
  DonutChart,
  RadialChart,
  SEMANTIC,
  type DonutDatum,
} from '@/components/ui/charts';
import { ChartTooltip } from '@/components/ui/charts/chart-tooltip';
import { chartColor } from '@/components/ui/charts/theme';
import type { BucketSpend } from '@/hooks/finances/overview/types';
import { formatInr, formatMonthLabel } from '@kalya/utils';
import { ArrowUpRight, ChevronRight, Target, Wallet } from 'lucide-react';
import { cn } from '@/libs/utils';

/** Budget colour rule: green < 75%, amber < 100%, red >= 100%. */
const budgetVariant = (pct: number) => (pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : 'success');

type Trend = { month: string; income: number; expense: number; savings: number };

/* ── 1. Income vs Expense Trend ────────────────────────────── */

export function IncomeExpenseTrend({ data, isLoading }: { data: Trend[]; isLoading?: boolean }) {
  const [range, setRange] = useState<'3m' | '6m'>('6m');

  const visibleData = useMemo(() => {
    if (range === '3m') {
      return data.slice(-3);
    }
    return data;
  }, [data, range]);

  const summary = useMemo(() => {
    const totalIncome = visibleData.reduce((acc, d) => acc + (d.income || 0), 0);
    const totalExpense = visibleData.reduce((acc, d) => acc + (d.expense || 0), 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
    return { totalIncome, totalExpense, netSavings, savingsRate };
  }, [visibleData]);

  return (
    <ChartCard
      title="Income vs Expense"
      description={`Cashflow trend (${range === '3m' ? 'Last 3 months' : 'Last 6 months'})`}
      isLoading={isLoading}
      isEmpty={!data.length}
      emptyMessage="No historical trend data available yet."
      className="h-full"
      action={
        <div className="flex items-center rounded-lg border border-border bg-surface-raised p-0.5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setRange('3m')}
            className={cn(
              'rounded-md px-2 py-0.5 transition-colors',
              range === '3m'
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            3M
          </button>
          <button
            type="button"
            onClick={() => setRange('6m')}
            className={cn(
              'rounded-md px-2 py-0.5 transition-colors',
              range === '6m'
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            6M
          </button>
        </div>
      }
    >
      <div className="flex flex-1 flex-col justify-between">
        {/* KPI Summary Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5">
            <span className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC.income }} />
              Inflow
            </span>
            <span className="font-numeric text-body-sm font-bold text-success block truncate mt-0.5">
              +{formatInr(summary.totalIncome)}
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5">
            <span className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: SEMANTIC.expense }}
              />
              Outflow
            </span>
            <span className="font-numeric text-body-sm font-bold text-text-primary block truncate mt-0.5">
              -{formatInr(summary.totalExpense)}
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5">
            <span className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: SEMANTIC.savings }}
              />
              Net Saved
            </span>
            <span
              className={cn(
                'font-numeric text-body-sm font-bold block truncate mt-0.5',
                summary.netSavings >= 0 ? 'text-success' : 'text-danger'
              )}
            >
              {summary.netSavings >= 0 ? '+' : ''}
              {formatInr(summary.netSavings)}
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5">
            <span className="text-[11px] text-text-muted font-medium block">Retained</span>
            <span className="font-numeric text-body-sm font-bold text-text-secondary block truncate mt-0.5">
              {summary.savingsRate}% of inflow
            </span>
          </div>
        </div>

        {/* Cartesian Chart */}
        <CartesianChart
          data={visibleData}
          xKey="month"
          height={280}
          xFormatter={formatMonthLabel}
          series={[
            { key: 'income', label: 'Income', color: SEMANTIC.income },
            { key: 'expense', label: 'Expense', color: SEMANTIC.expense },
            { key: 'savings', label: 'Net Savings', type: 'line', color: SEMANTIC.savings },
          ]}
        />

        {/* Bottom Insight Strip */}
        <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border/40 bg-surface-raised/30 px-3 py-1.5 text-[11px] text-text-muted">
          <span>
            {summary.netSavings >= 0
              ? 'Cashflow positive across period'
              : 'Net deficit across period'}
          </span>
          <span className="font-medium text-text-secondary">
            {summary.savingsRate}% retention rate
          </span>
        </div>
      </div>
    </ChartCard>
  );
}

/* ── 2. Top Categories ─────────────────────────────────────── */

export function TopCategories({
  data,
  isLoading,
  viewAllHref = '/dashboard/categories',
}: {
  data: { category: string; spent: number }[];
  isLoading?: boolean;
  viewAllHref?: string;
}) {
  return (
    <ChartCard
      title="Top categories"
      description="Highest spending areas this month"
      isLoading={isLoading}
      isEmpty={!data.length}
      emptyMessage="No categorized expenses logged this month."
      action={
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline"
        >
          <span>Categories</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
    >
      <CartesianChart
        layout="vertical"
        data={data}
        xKey="category"
        showLegend={false}
        series={[{ key: 'spent', label: 'Spent', color: SEMANTIC.expense }]}
      />
    </ChartCard>
  );
}

/* ── 3. Daily Spending ─────────────────────────────────────── */

export function DailySpending({
  data,
  isLoading,
}: {
  data: { day: string; spent: number; cumulative: number | null; isFuture?: boolean }[];
  isLoading?: boolean;
}) {
  const hasFutureDays = useMemo(() => data.some((d) => d.isFuture), [data]);
  const [viewMode, setViewMode] = useState<'mtd' | 'full'>('mtd');

  // If there are future days, MTD mode filters out future empty days to avoid empty space
  const chartData = useMemo(() => {
    if (viewMode === 'mtd' && hasFutureDays) {
      return data.filter((d) => !d.isFuture);
    }
    return data;
  }, [data, viewMode, hasFutureDays]);

  const metrics = useMemo(() => {
    const elapsedPoints = data.filter((d) => !d.isFuture);
    const totalSpent = elapsedPoints.reduce((acc, d) => acc + (d.spent || 0), 0);
    const elapsedDays = Math.max(1, elapsedPoints.length);
    const dailyAvg = Math.round(totalSpent / elapsedDays);
    const totalDays = data.length || 30;
    const projected = Math.round(dailyAvg * totalDays);
    return { totalSpent, elapsedDays, dailyAvg, totalDays, projected };
  }, [data]);

  return (
    <ChartCard
      title="Daily spending"
      description="Daily expenses and cumulative monthly burn"
      isLoading={isLoading}
      isEmpty={!data.length}
      emptyMessage="No spending recorded for this month yet."
      className="h-full"
      action={
        hasFutureDays ? (
          <div className="flex items-center rounded-lg border border-border bg-surface-raised p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setViewMode('mtd')}
              className={cn(
                'rounded-md px-2 py-0.5 transition-colors',
                viewMode === 'mtd'
                  ? 'bg-surface text-text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              MTD ({metrics.elapsedDays}d)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('full')}
              className={cn(
                'rounded-md px-2 py-0.5 transition-colors',
                viewMode === 'full'
                  ? 'bg-surface text-text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              Full Month ({metrics.totalDays}d)
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-1 flex-col justify-between">
        {/* Spend Velocity Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5">
            <span className="text-[11px] text-text-muted font-medium block">Month Spend</span>
            <span className="font-numeric text-body-sm font-bold text-text-primary block truncate mt-0.5">
              {formatInr(metrics.totalSpent)}
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5">
            <span className="text-[11px] text-text-muted font-medium block">Daily Pace</span>
            <span className="font-numeric text-body-sm font-bold text-primary block truncate mt-0.5">
              {formatInr(metrics.dailyAvg)}/day
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5">
            <span className="text-[11px] text-text-muted font-medium block">Timeline</span>
            <span className="font-numeric text-body-sm font-bold text-text-secondary block truncate mt-0.5">
              Day {metrics.elapsedDays} of {metrics.totalDays}
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5">
            <span className="text-[11px] text-text-muted font-medium block">Projected Burn</span>
            <span className="font-numeric text-body-sm font-bold text-text-secondary block truncate mt-0.5">
              ~{formatInr(metrics.projected)}
            </span>
          </div>
        </div>

        {/* Cartesian Chart */}
        <CartesianChart
          data={chartData}
          xKey="day"
          height={260}
          series={[
            { key: 'spent', label: 'Daily Spend', type: 'area', color: SEMANTIC.expense },
            {
              key: 'cumulative',
              label: 'Cumulative',
              type: 'line',
              dashed: true,
              color: SEMANTIC.neutral,
            },
          ]}
        />

        {/* Bottom Velocity Insight */}
        <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border/40 bg-surface-raised/30 px-3 py-1.5 text-[11px] text-text-muted">
          <span>
            {hasFutureDays
              ? `Day ${metrics.elapsedDays} of ${metrics.totalDays} elapsed (${Math.round((metrics.elapsedDays / metrics.totalDays) * 100)}%)`
              : 'Full month cycle completed'}
          </span>
          <span className="font-medium text-text-secondary">
            Avg run-rate: {formatInr(metrics.dailyAvg)}/day
          </span>
        </div>
      </div>
    </ChartCard>
  );
}

/* ── 4. Spending by Bucket ─────────────────────────────────── */

export function BucketDonut({
  data,
  breakdown,
  isLoading,
  viewAllHref = '/dashboard/budgets',
}: {
  /** one slice per bucket (Needs / Wants / Savings / custom) */
  data: DonutDatum[];
  breakdown?: BucketSpend[];
  isLoading?: boolean;
  viewAllHref?: string;
}) {
  const [chartType, setChartType] = useState<'donut' | 'pie'>('donut');

  const rows = useMemo(() => {
    if (breakdown && breakdown.length > 0) {
      return breakdown.map((b, i) => ({
        name: b.bucket?.label ?? (b.key === 'uncategorised' ? 'Uncategorised' : b.key),
        value: b.amount,
        percent: b.percent,
        targetPercent: b.bucket?.target_percent ? Number(b.bucket.target_percent) : undefined,
        color: b.bucket?.color ?? chartColor(i),
      }));
    }
    const sum = data.reduce((a, d) => a + (Number(d.value) || 0), 0);
    return data.map((d, i) => ({
      name: d.name,
      value: d.value,
      percent: sum > 0 ? Math.round((d.value / sum) * 100) : 0,
      targetPercent: undefined,
      color: d.color ?? chartColor(i),
    }));
  }, [breakdown, data]);

  const total = rows.reduce((a, r) => a + (Number(r.value) || 0), 0);
  const topBucket = rows[0];

  return (
    <ChartCard
      title="Spending by bucket"
      description="Needs vs Wants vs Savings distribution"
      isLoading={isLoading}
      isEmpty={total === 0}
      emptyMessage="No bucket expenses logged this month."
      className="h-full"
      action={
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-border bg-surface-raised p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setChartType('donut')}
              className={cn(
                'rounded-md px-2 py-0.5 transition-colors',
                chartType === 'donut'
                  ? 'bg-surface text-text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              Donut
            </button>
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={cn(
                'rounded-md px-2 py-0.5 transition-colors',
                chartType === 'pie'
                  ? 'bg-surface text-text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              Pie
            </button>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-0.5 text-caption font-medium text-primary hover:underline ml-1"
          >
            <span>Budgets</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      }
    >
      <div className="flex flex-1 flex-col justify-between">
        {/* Centered Pie / Donut Chart */}
        <div className="relative w-full max-w-56 mx-auto h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="name"
                innerRadius={chartType === 'donut' ? '64%' : 0}
                outerRadius="90%"
                paddingAngle={rows.length > 1 && chartType === 'donut' ? 2 : 0}
                stroke="var(--surface)"
                strokeWidth={2}
              >
                {rows.map((r) => (
                  <Cell key={r.name} fill={r.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<ChartTooltip valueFormatter={formatInr} />} />
            </PieChart>
          </ResponsiveContainer>

          {chartType === 'donut' && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                Spent
              </span>
              <span className="font-display text-display-xs font-bold text-text-primary">
                {formatInr(total)}
              </span>
            </div>
          )}
        </div>

        {/* Pie Mode Summary Strip */}
        {chartType === 'pie' && (
          <div className="mt-1 flex items-center justify-between w-full rounded-lg border border-border/60 bg-surface-raised/40 px-3 py-1 text-caption">
            <span className="text-text-muted">Total Spent</span>
            <span className="font-display font-bold text-text-primary">{formatInr(total)}</span>
          </div>
        )}

        {/* Other Information Below The Chart */}
        <div className="w-full space-y-1.5 pt-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-text-muted px-1">
            <span>Bucket Allocation</span>
            <span>Amount &amp; Share</span>
          </div>

          <div className="space-y-1.5">
            {rows.map((item) => (
              <div
                key={item.name}
                className="group rounded-lg border border-border/50 bg-surface-raised/30 p-2 transition-all hover:border-primary/30 hover:bg-surface-raised/60"
              >
                <div className="flex items-center justify-between gap-2 text-body-sm">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-surface shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-text-primary truncate text-body-sm">
                      {item.name}
                    </span>
                    {typeof item.targetPercent === 'number' && (
                      <span className="hidden sm:inline-block text-[10px] text-text-muted">
                        · Target {item.targetPercent}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-numeric font-bold text-text-primary text-body-sm">
                      {formatInr(item.value)}
                    </span>
                    <span className="min-w-9 rounded-full bg-surface-raised px-1.5 py-0.5 text-center font-numeric text-[11px] font-bold text-text-secondary border border-border/40">
                      {item.percent}%
                    </span>
                  </div>
                </div>

                {/* Progress proportion bar */}
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, item.percent))}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick summary note at bottom */}
          {topBucket && (
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary mt-1">
              <span className="truncate">
                Largest share: <strong className="text-text-primary">{topBucket.name}</strong>
              </span>
              <span className="font-numeric font-semibold text-text-primary shrink-0 ml-2">
                {topBucket.percent}% of spend
              </span>
            </div>
          )}
        </div>
      </div>
    </ChartCard>
  );
}

/* ── 5. Net Worth Donut ─────────────────────────────────────── */

export function NetWorthDonut({
  commodities,
  equities,
  isLoading,
  viewAllHref = '/dashboard/assets',
}: {
  commodities: number;
  equities: number;
  isLoading?: boolean;
  viewAllHref?: string;
}) {
  const total = commodities + equities;
  return (
    <ChartCard
      title="Net worth allocation"
      description={total > 0 ? `Total portfolio: ${formatInr(total)}` : 'Asset allocation'}
      isLoading={isLoading}
      isEmpty={total === 0}
      emptyMessage="No portfolio assets tracked yet."
      action={
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline"
        >
          <span>Assets</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
    >
      <DonutChart
        centerLabel="Portfolio"
        legendPosition="bottom"
        data={[
          { name: 'Commodities', value: commodities },
          { name: 'Equities', value: equities },
        ]}
      />
    </ChartCard>
  );
}

/* ── 6. Budget Health ──────────────────────────────────────── */

export function BudgetHealth({
  budgets,
  isLoading,
  viewAllHref = '/dashboard/budgets',
}: {
  budgets: { id: string; label: string; spent: number; amount: number }[];
  isLoading?: boolean;
  viewAllHref?: string;
}) {
  return (
    <ChartCard
      title="Budget health"
      description="Tracking against monthly limits"
      info="Green <75%, amber 75–99%, red ≥100% of the assigned budget."
      isLoading={isLoading}
      isEmpty={!budgets.length}
      emptyMessage="No active budgets set for this month."
      action={
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline"
        >
          <span>Budgets</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="space-y-4 pt-1">
        {budgets.slice(0, 4).map((b) => {
          const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
          return (
            <div key={b.id} className="space-y-1.5">
              <Progress
                label={b.label}
                value={b.spent}
                max={b.amount || 1}
                variant={budgetVariant(pct)}
                showValue
                formatValue={(v, p) => `${formatInr(v)} / ${formatInr(b.amount)} · ${p}%`}
              />
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

/* ── 7. Savings Rate Gauge ─────────────────────────────────── */

export function SavingsRateGauge({
  rate,
  income = 0,
  spent = 0,
  netSavings = 0,
  isLoading,
}: {
  rate: number;
  income?: number;
  spent?: number;
  netSavings?: number;
  isLoading?: boolean;
}) {
  const safeRate = Number.isFinite(rate) ? rate : 0;
  const isHealthy = safeRate >= 20;
  const isOptimal = safeRate >= 30;
  const targetBenchmark = 20;
  const diffFromTarget = safeRate - targetBenchmark;

  return (
    <ChartCard
      title="Savings rate"
      description="Percentage of monthly income saved"
      info="(Income − Spent) ÷ Income for the selected month. Split bills count only your share."
      isLoading={isLoading}
      className="h-full"
    >
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col items-center justify-center pt-1">
          <RadialChart
            value={Math.max(0, safeRate)}
            label="of income saved"
            color={isHealthy ? SEMANTIC.savings : SEMANTIC.neutral}
          />
          <div className="mt-2 text-center">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium',
                isOptimal
                  ? 'bg-success-subtle text-success'
                  : isHealthy
                    ? 'bg-primary-subtle text-primary'
                    : safeRate > 0
                      ? 'bg-warning-subtle text-warning'
                      : 'bg-danger-subtle text-danger'
              )}
            >
              {isOptimal
                ? 'Optimal · Above 30% goal'
                : isHealthy
                  ? 'Healthy · Standard 20% met'
                  : safeRate > 0
                    ? 'Modest · Positive cashflow'
                    : 'Deficit · Outflow > inflow'}
            </span>
          </div>
        </div>

        {/* Retention & Burn Breakdown */}
        <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span className="flex items-center gap-1 font-medium">
              <span className="h-2 w-2 rounded-full bg-success" />
              Retained: {formatInr(netSavings)} ({safeRate}%)
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="h-2 w-2 rounded-full bg-danger" />
              Spent: {formatInr(spent)} ({Math.max(0, 100 - safeRate)}%)
            </span>
          </div>

          {/* Split Proportion Bar */}
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, safeRate))}%` }}
            />
            <div
              className="h-full bg-danger/80 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, 100 - safeRate))}%` }}
            />
          </div>

          {/* Benchmark comparison card */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-surface-raised/40 px-2.5 py-1.5 text-[11px]">
            <span className="text-text-muted">
              50/30/20 Rule: <strong>20% Target</strong>
            </span>
            <span
              className={cn(
                'font-semibold font-numeric',
                safeRate >= 20 ? 'text-success' : 'text-warning'
              )}
            >
              {safeRate >= 20
                ? `+${diffFromTarget}% surplus`
                : `${Math.abs(diffFromTarget)}% deficit`}
            </span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

/* ── 8. Goals Progress ─────────────────────────────────────── */

export function GoalsProgress({
  goals,
  isLoading,
  viewAllHref = '/dashboard/goals',
}: {
  goals: { id: string; name: string; saved: number; target: number }[];
  isLoading?: boolean;
  viewAllHref?: string;
}) {
  return (
    <ChartCard
      title="Savings goals"
      description="Progress toward target milestones"
      isLoading={isLoading}
      isEmpty={!goals.length}
      emptyMessage="No active savings goals found."
      action={
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline"
        >
          <span>Goals</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="space-y-4 pt-1">
        {goals.slice(0, 4).map((g) => {
          const pct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
          return (
            <div key={g.id} className="space-y-1.5">
              <Progress
                label={g.name}
                value={g.saved}
                max={g.target || 1}
                variant="accent"
                showValue
                formatValue={(v, p) => `${formatInr(v)} / ${formatInr(g.target)} · ${p}%`}
              />
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
