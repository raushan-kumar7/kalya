'use client';

import { CartesianChart, ChartCard, SEMANTIC } from '@/components/ui/charts';
import { formatMonthLabel } from '@kalya/utils';
import type { BudgetRow, HistoryPoint, PacePoint } from './types';

const pctFmt = (v: number) => `${Math.round(v)}%`;

/** Budget vs spent, one group per bucket. */
export function BudgetVsActualChart({
  budgets,
  isLoading,
}: {
  budgets: BudgetRow[];
  isLoading?: boolean;
}) {
  const data = budgets.map((b) => ({ bucket: b.bucketLabel, budget: b.amount, spent: b.spent }));
  return (
    <ChartCard
      title="Budget vs actual"
      description="Per bucket, selected month"
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="bucket"
        series={[
          { key: 'budget', label: 'Budget', color: SEMANTIC.neutral },
          { key: 'spent', label: 'Spent', color: SEMANTIC.expense },
        ]}
      />
    </ChartCard>
  );
}

/** Target share of income vs actual share, e.g. Needs 50% target, 58% actual. */
export function AllocationChart({
  budgets,
  totalIncome,
  isLoading,
}: {
  budgets: BudgetRow[];
  totalIncome: number;
  isLoading?: boolean;
}) {
  const data = budgets.map((b) => ({
    bucket: b.bucketLabel,
    target: b.targetPercent,
    actual: totalIncome > 0 ? (b.spent / totalIncome) * 100 : 0,
  }));
  return (
    <ChartCard
      title="Allocation"
      description="Target vs actual share of income"
      info="Actual = spent in the bucket ÷ income for the month."
      isLoading={isLoading}
      isEmpty={!data.length || totalIncome <= 0}
      emptyMessage="Log income to compare against your 50/30/20 targets."
    >
      <CartesianChart
        data={data}
        xKey="bucket"
        axisFormatter={pctFmt}
        valueFormatter={pctFmt}
        series={[
          { key: 'target', label: 'Target', color: SEMANTIC.muted },
          { key: 'actual', label: 'Actual', color: SEMANTIC.savings },
        ]}
      />
    </ChartCard>
  );
}

/** Cumulative spend against an even-burn line and the total budget. */
export function SpendPaceChart({
  data,
  totalBudget,
  isLoading,
}: {
  data: PacePoint[];
  totalBudget: number;
  isLoading?: boolean;
}) {
  return (
    <ChartCard
      title="Spend pace"
      description="Cumulative spend vs even pace"
      info="The dashed line is the budget spread evenly across the month. Above it means you are spending faster than planned."
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="day"
        referenceLines={[{ y: totalBudget, label: 'Budget', color: SEMANTIC.expense }]}
        series={[
          { key: 'cumulative', label: 'Spent', type: 'area', color: SEMANTIC.expense },
          { key: 'ideal', label: 'Even pace', type: 'line', dashed: true, color: SEMANTIC.neutral },
          {
            key: 'projected',
            label: 'Projected',
            type: 'line',
            dashed: true,
            color: SEMANTIC.savings,
          },
        ]}
      />
    </ChartCard>
  );
}

/** Last 6 months: budget bar + spent bar. */
export function BudgetHistoryChart({
  data,
  isLoading,
}: {
  data: HistoryPoint[];
  isLoading?: boolean;
}) {
  return (
    <ChartCard
      title="History"
      description="Last 6 months"
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <CartesianChart
        data={data}
        xKey="month"
        xFormatter={formatMonthLabel}
        series={[
          { key: 'budget', label: 'Budget', color: SEMANTIC.neutral },
          { key: 'spent', label: 'Spent', color: SEMANTIC.expense },
        ]}
      />
    </ChartCard>
  );
}
