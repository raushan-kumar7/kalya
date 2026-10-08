'use client';

import React, { useState } from 'react';
import {
  CartesianChart,
  ChartCard,
  DonutChart,
  SEMANTIC,
  CHART_COLORS,
  chartColor,
} from '@/components/ui/charts';
import { formatCompactInr, formatInr, formatPercent } from '@kalya/utils';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Flame,
  Info,
  Layers,
  Minus,
  Receipt,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import type {
  BucketAllocationPoint,
  CashflowTrendPoint,
  CategoryBreakdownItem,
  CategoryTrendPoint,
  DailyHeatmapCell,
  FrequentMerchantItem,
  PaymentMethodItem,
  TopExpenseItem,
  WeekdaySpendPoint,
} from './types';

const pctFmt = (v: number) => `${Math.round(v)}%`;

/* ------------------------------------------------------------------ */
/* 1. Cash Flow Charts                                                 */
/* ------------------------------------------------------------------ */

export function CashflowTrendChart({
  data,
  isLoading,
}: {
  data: CashflowTrendPoint[];
  isLoading?: boolean;
}) {
  return (
    <ChartCard
      title="Income vs Expenses"
      description="Monthly comparison with net savings trajectory"
      info="Green bar shows total earnings; red bar shows all living expenses. The purple line shows net cash savings."
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="label"
        series={[
          { key: 'income', label: 'Income', type: 'bar', color: 'var(--chart-1)' },
          { key: 'expense', label: 'Expenses', type: 'bar', color: 'var(--chart-5)' },
          { key: 'savings', label: 'Net Savings', type: 'line', color: 'var(--chart-2)' },
        ]}
      />
    </ChartCard>
  );
}

export function SavingsRateChart({
  data,
  targetRate = 30,
  isLoading,
}: {
  data: CashflowTrendPoint[];
  targetRate?: number;
  isLoading?: boolean;
}) {
  return (
    <ChartCard
      title="Savings Rate Trend"
      description="Percentage of income saved each month"
      info="Calculated as (Net Savings / Total Income) * 100. Target line indicates benchmark goal."
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="label"
        axisFormatter={pctFmt}
        valueFormatter={pctFmt}
        referenceLines={[
          {
            y: targetRate,
            label: `Target (${targetRate}%)`,
            color: 'var(--chart-3)',
          },
        ]}
        series={[
          {
            key: 'savingsRate',
            label: 'Savings Rate',
            type: 'line',
            color: 'var(--chart-2)',
          },
        ]}
      />
    </ChartCard>
  );
}

export function CumulativeSavingsChart({
  data,
  isLoading,
}: {
  data: CashflowTrendPoint[];
  isLoading?: boolean;
}) {
  return (
    <ChartCard
      title="Cumulative Savings"
      description="Total net capital accumulated across the selected timeline"
      info="Sum of all net positive cash flows over time."
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="label"
        series={[
          {
            key: 'cumulativeSavings',
            label: 'Cumulative Wealth Saved',
            type: 'area',
            color: 'var(--chart-1)',
          },
        ]}
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Spending Tab: Category Breakdown with Table                      */
/* ------------------------------------------------------------------ */

interface CategoryBreakdownSectionProps {
  categories: CategoryBreakdownItem[];
  totalSpent: number;
  isLoading?: boolean;
  onSelectCategory?: (category: CategoryBreakdownItem) => void;
}

export function CategoryBreakdownSection({
  categories,
  totalSpent,
  isLoading,
  onSelectCategory,
}: CategoryBreakdownSectionProps) {
  const donutData = categories.slice(0, 7).map((c, idx) => ({
    name: c.name,
    value: c.amount,
    color: c.color || chartColor(idx),
  }));

  // If more than 7, group remaining in "Other"
  if (categories.length > 7) {
    const otherSum = categories.slice(7).reduce((acc, c) => acc + c.amount, 0);
    if (otherSum > 0) {
      donutData.push({
        name: 'Other Categories',
        value: otherSum,
        color: 'var(--text-muted)',
      });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Donut Chart */}
      <div className="lg:col-span-5">
        <ChartCard
          title="Category Distribution"
          description="Share of total expenditure by category"
          info="Click on any category in the table to drill down into its individual expenses."
          isLoading={isLoading}
          isEmpty={!categories.length}
        >
          <DonutChart
            data={donutData}
            centerLabel="Total Spent"
            centerValue={formatCompactInr(totalSpent)}
            legendPosition="bottom"
            height={240}
          />
        </ChartCard>
      </div>

      {/* Detail Table */}
      <div className="lg:col-span-7 flex flex-col rounded-xl border border-border bg-surface shadow-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display text-body-md font-semibold text-text-primary">
              Category Spending Breakdown
            </h3>
            <p className="text-caption text-text-muted">
              {categories.length} categories tracked in this period
            </p>
          </div>
        </div>

        {/* Table content */}
        <div className="flex-1 overflow-x-auto min-h-0">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">% of Total</th>
                <th className="py-2.5 px-3 text-right">vs Previous</th>
                <th className="py-2.5 px-3 text-right">Count</th>
                <th className="py-2.5 px-2 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {categories.map((c, i) => {
                const isUp = c.changePct > 0;
                const isZero = c.changePct === 0;

                return (
                  <tr
                    key={c.id || i}
                    onClick={() => onSelectCategory?.(c)}
                    className="hover:bg-surface-raised/80 group cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color || chartColor(i) }}
                      />
                      <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
                        {c.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-numeric font-semibold text-text-primary">
                      {formatInr(c.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-numeric text-text-secondary">
                      {formatPercent(c.percent, 1)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isZero ? (
                        <span className="text-[11px] text-text-muted">0%</span>
                      ) : (
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded',
                            isUp ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'
                          )}
                        >
                          {isUp ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {isUp ? `+${c.changePct.toFixed(0)}%` : `${c.changePct.toFixed(0)}%`}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-numeric text-text-muted">
                      {c.count}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <ExternalLink className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Category Trend Over Time (Stacked Bars)                          */
/* ------------------------------------------------------------------ */

export function CategoryTrendChart({
  data,
  categoryKeys,
  isLoading,
}: {
  data: CategoryTrendPoint[];
  categoryKeys: { key: string; label: string; color: string }[];
  isLoading?: boolean;
}) {
  return (
    <ChartCard
      title="Category Spending Over Time"
      description="Monthly breakdown across top expenditure categories"
      info="Shows how each category's spend changes from month to month."
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="label"
        series={categoryKeys.map((c) => ({
          key: c.key,
          label: c.label,
          type: 'bar',
          stackId: 'catStack',
          color: c.color,
        }))}
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 50/30/20 Target vs Actual Allocation                            */
/* ------------------------------------------------------------------ */

export function BucketAllocationOverTime({
  data,
  isLoading,
}: {
  data: BucketAllocationPoint[];
  isLoading?: boolean;
}) {
  return (
    <ChartCard
      title="50/30/20 Rule: Actual vs Target"
      description="Share of total income allocated to Needs (50%), Wants (30%), and Savings (20%)"
      info="Recommended benchmark: Needs ≤ 50%, Wants ≤ 30%, Savings ≥ 20% of net monthly income."
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="label"
        axisFormatter={pctFmt}
        valueFormatter={pctFmt}
        series={[
          { key: 'needsActual', label: 'Needs (Actual %)', type: 'bar', color: 'var(--chart-3)' },
          { key: 'wantsActual', label: 'Wants (Actual %)', type: 'bar', color: 'var(--chart-5)' },
          {
            key: 'savingsActual',
            label: 'Savings (Actual %)',
            type: 'bar',
            color: 'var(--chart-1)',
          },
        ]}
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Weekday Spend Patterns                                          */
/* ------------------------------------------------------------------ */

export function WeekdaySpendChart({
  data,
  isLoading,
}: {
  data: WeekdaySpendPoint[];
  isLoading?: boolean;
}) {
  return (
    <ChartCard
      title="Spending by Day of the Week"
      description="Average expenditure across Monday through Sunday"
      info="Identifies which days of the week incur the highest outflows (e.g. weekend shopping or dining)."
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="shortDay"
        series={[
          { key: 'total', label: 'Total Spent', type: 'bar', color: 'var(--chart-2)' },
          { key: 'average', label: 'Daily Average', type: 'line', color: 'var(--chart-4)' },
        ]}
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Calendar Spend Heatmap                                          */
/* ------------------------------------------------------------------ */

export function SpendHeatmap({
  cells,
  isLoading,
}: {
  cells: DailyHeatmapCell[];
  isLoading?: boolean;
}) {
  // 5 intensity levels:
  // 0 = zero / no spend
  // 1 = light spend
  // 2 = moderate spend
  // 3 = high spend
  // 4 = very high spend
  const LEVEL_CLASSES = [
    'bg-surface-raised border border-border/50 text-text-muted',
    'bg-primary/20 border border-primary/30 text-primary',
    'bg-primary/40 border border-primary/50 text-primary-foreground font-medium',
    'bg-primary/70 border border-primary/80 text-white font-medium',
    'bg-primary border border-primary text-white font-bold',
  ];

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ChartCard
      title="Daily Spend Heatmap"
      description="Visual intensity of daily outlays across the period"
      info="Darker green blocks indicate days with higher spending volume."
      isLoading={isLoading}
      isEmpty={!cells.length || cells.every((c) => c.amount === 0)}
    >
      <div className="flex flex-col gap-3 py-2">
        <TooltipProvider>
          <div className="flex flex-wrap gap-1.5 justify-start">
            {cells.map((cell) => {
              const dateObj = new Date(cell.date);
              const dayStr = dateObj.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              return (
                <Tooltip key={cell.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'h-7 w-7 rounded-md flex items-center justify-center text-[10px] cursor-pointer transition-all hover:scale-115 hover:z-10 shadow-2xs',
                        LEVEL_CLASSES[cell.level]
                      )}
                    >
                      {cell.dayOfMonth}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="text-caption">
                      <div className="font-semibold">{dayStr}</div>
                      <div className="text-text-muted">
                        Spent:{' '}
                        <span className="font-numeric text-white">{formatInr(cell.amount)}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 text-caption text-text-muted pt-2 border-t border-border/60">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-surface-raised border border-border" />
            <span className="h-3 w-3 rounded bg-primary/20" />
            <span className="h-3 w-3 rounded bg-primary/40" />
            <span className="h-3 w-3 rounded bg-primary/70" />
            <span className="h-3 w-3 rounded bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Payment Methods Distribution                                    */
/* ------------------------------------------------------------------ */

export function PaymentMethodChart({
  methods,
  isLoading,
}: {
  methods: PaymentMethodItem[];
  isLoading?: boolean;
}) {
  const donutData = methods.map((m, i) => ({
    name: m.label,
    value: m.amount,
    color: m.color || chartColor(i),
  }));

  const total = methods.reduce((acc, m) => acc + m.amount, 0);

  return (
    <ChartCard
      title="Payment Channels"
      description="Expenditure split by payment instrument (UPI, Card, Cash)"
      isLoading={isLoading}
      isEmpty={!methods.length}
    >
      <DonutChart
        data={donutData}
        centerLabel="Total Volume"
        centerValue={formatCompactInr(total)}
        height={220}
        legendPosition="right"
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Top 10 Expenses & Most Frequent Merchants                       */
/* ------------------------------------------------------------------ */

export function TopExpensesCard({
  topExpenses,
  frequentMerchants,
  isLoading,
  onSelectExpense,
}: {
  topExpenses: TopExpenseItem[];
  frequentMerchants: FrequentMerchantItem[];
  isLoading?: boolean;
  onSelectExpense?: (exp: TopExpenseItem) => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState<'top' | 'frequent'>('top');

  return (
    <section className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-card">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-body-md font-semibold text-text-primary">
            {activeSubTab === 'top' ? 'Top 10 Outlays' : 'Most Frequent Spends'}
          </h3>
          <p className="text-caption text-text-muted">
            {activeSubTab === 'top'
              ? 'Largest single transactions recorded in this period'
              : 'Merchants and categories where you spend most often'}
          </p>
        </div>
        <div className="inline-flex rounded-lg bg-surface-raised p-1 border border-border/80">
          <button
            type="button"
            onClick={() => setActiveSubTab('top')}
            className={cn(
              'rounded-md px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer',
              activeSubTab === 'top'
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            Largest Spends
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('frequent')}
            className={cn(
              'rounded-md px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer',
              activeSubTab === 'frequent'
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            Most Frequent
          </button>
        </div>
      </header>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto max-h-75">
        {activeSubTab === 'top' ? (
          topExpenses.length === 0 ? (
            <div className="py-8 text-center text-caption text-text-muted">
              No expenses recorded in this period.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {topExpenses.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  onClick={() => onSelectExpense?.(exp)}
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-surface-raised/70 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="font-numeric text-caption font-bold text-text-muted w-5 text-right">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-body-sm text-text-primary truncate group-hover:text-primary transition-colors">
                        {exp.description}
                      </p>
                      <div className="flex items-center gap-2 text-caption text-text-muted mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: exp.categoryColor || 'var(--primary)' }}
                          />
                          {exp.categoryName}
                        </span>
                        <span>•</span>
                        <span>{exp.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-numeric font-bold text-body-sm text-text-primary">
                      {formatInr(exp.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : frequentMerchants.length === 0 ? (
          <div className="py-8 text-center text-caption text-text-muted">
            No recurring merchant spends found in this period.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {frequentMerchants.map((item, idx) => (
              <div
                key={item.description + idx}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-surface-raised/70 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="font-numeric text-caption font-bold text-text-muted w-5 text-right">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-body-sm text-text-primary truncate">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-caption text-text-muted mt-0.5">
                      <span>{item.categoryName}</span>
                      <span>•</span>
                      <span>{item.count} transactions</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-numeric font-bold text-body-sm text-text-primary">
                    {formatInr(item.totalAmount)}
                  </div>
                  <div className="text-[11px] text-text-muted font-numeric">
                    avg {formatInr(item.avgAmount)}/ea
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
