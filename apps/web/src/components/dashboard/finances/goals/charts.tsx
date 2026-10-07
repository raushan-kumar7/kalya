'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react';
import {
  CartesianChart,
  ChartCard,
  DonutChart,
  SEMANTIC,
  chartColor,
} from '@/components/ui/charts';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/libs/utils';
import type { GoalContributionMonthPoint, GoalRow, ProjectionTimelinePoint } from './types';
import { generateMonthlyContributionHistory, generateProjectionTimeline } from './helper';

/* ------------------------------------------------------------------ */
/* 1. Progress Per Goal Chart (Horizontal Bars)                       */
/* ------------------------------------------------------------------ */

export function GoalsProgressChart({
  goals,
  isLoading,
}: {
  goals: GoalRow[];
  isLoading?: boolean;
}) {
  const data = goals.map((g) => ({
    name: g.name.length > 26 ? `${g.name.slice(0, 24)}…` : g.name,
    saved: g.current_progress,
    target: g.target_amount,
  }));

  return (
    <ChartCard
      title="Goal Progress Comparison"
      description="Saved amount vs target across goals"
      isLoading={isLoading}
      isEmpty={!data.length}
      emptyMessage="No goals available to compare."
    >
      <CartesianChart
        data={data}
        xKey="name"
        layout="vertical"
        categoryAxisWidth={175}
        series={[
          { key: 'saved', label: 'Saved', color: SEMANTIC.savings },
          { key: 'target', label: 'Target', color: SEMANTIC.neutral },
        ]}
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Savings Projection Line Chart                                   */
/* ------------------------------------------------------------------ */

export function GoalProjectionChart({
  goals,
  isLoading,
}: {
  goals: GoalRow[];
  isLoading?: boolean;
}) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id ?? '');

  const activeGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];
  const timelineData: ProjectionTimelinePoint[] = activeGoal
    ? generateProjectionTimeline(activeGoal)
    : [];

  return (
    <ChartCard
      title="Savings Projection"
      description={
        activeGoal
          ? `Projected timeline for "${activeGoal.name}" based on monthly contribution`
          : 'Projected timeline based on monthly savings plan'
      }
      info="Shows cumulative accumulation if you maintain your planned monthly contribution against the target."
      isLoading={isLoading}
      isEmpty={!timelineData.length}
      emptyMessage="Create a savings goal with monthly plan to see future projections."
      action={
        goals.length > 1 ? (
          <select
            value={activeGoal?.id ?? ''}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="h-8 rounded-md border border-border bg-surface px-2.5 text-caption font-medium text-text-primary shadow-xs outline-none focus:border-primary"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        ) : undefined
      }
    >
      <CartesianChart
        data={timelineData}
        xKey="label"
        series={[
          {
            key: 'projected',
            label: 'Projected Path',
            type: 'area',
            color: SEMANTIC.savings,
          },
          {
            key: 'recommended',
            label: 'Required Pace',
            type: 'line',
            dashed: true,
            color: SEMANTIC.neutral,
          },
          {
            key: 'target',
            label: 'Target Line',
            type: 'line',
            color: 'var(--accent)',
          },
        ]}
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Contribution History Chart (Monthly Bars)                       */
/* ------------------------------------------------------------------ */

export function ContributionHistoryChart({
  goals,
  isLoading,
}: {
  goals: GoalRow[];
  isLoading?: boolean;
}) {
  const historyData: GoalContributionMonthPoint[] = generateMonthlyContributionHistory(goals);
  const totalContributed = historyData.reduce((sum, h) => sum + h.amount, 0);

  return (
    <ChartCard
      title="Monthly Contributions History"
      description={`Total added across goals: ${formatInr(totalContributed)}`}
      info="Monthly breakdown of money deposited across all savings goals."
      isLoading={isLoading}
      isEmpty={!historyData.length || totalContributed === 0}
      emptyMessage="No contribution records logged yet. Add money to track contribution history."
    >
      <CartesianChart
        data={historyData}
        xKey="monthLabel"
        series={[
          {
            key: 'amount',
            label: 'Contributed',
            type: 'bar',
            color: SEMANTIC.savings,
          },
        ]}
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Goal Allocation Donut Chart                                     */
/* ------------------------------------------------------------------ */

export function GoalAllocationChart({
  goals,
  isLoading,
}: {
  goals: GoalRow[];
  isLoading?: boolean;
}) {
  const data = goals
    .filter((g) => g.current_progress > 0)
    .map((g, idx) => ({
      name: g.name,
      value: g.current_progress,
      color: g.bucketColor || chartColor(idx),
    }));

  const totalSaved = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Goal Fund Allocation"
      description="Distribution of saved capital across goals"
      isLoading={isLoading}
      isEmpty={!data.length}
      emptyMessage="No funds saved in goals yet."
    >
      <DonutChart
        data={data}
        centerLabel="Total Saved"
        centerValue={formatCompactInr(totalSaved)}
        legendPosition="right"
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Composed Charts Section Component with Toggle                   */
/* ------------------------------------------------------------------ */

export function GoalsChartsSection({
  goals,
  isLoading,
}: {
  goals: GoalRow[];
  isLoading?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'projections'>('overview');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-2xs">
      {/* Section Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-display text-body-md font-semibold text-text-primary">
            Analytics & Projections
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs */}
          <div className="flex items-center rounded-lg bg-surface-raised p-0.5 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1 text-caption font-medium transition-all',
                activeTab === 'overview'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Progress & Allocation</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('projections')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1 text-caption font-medium transition-all',
                activeTab === 'projections'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <LineChartIcon className="h-3.5 w-3.5" />
              <span>Projection & History</span>
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8 p-0 text-text-muted"
            aria-label={collapsed ? 'Expand charts' : 'Collapse charts'}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      {!collapsed && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 pt-1">
          {activeTab === 'overview' ? (
            <>
              <GoalsProgressChart goals={goals} isLoading={isLoading} />
              <GoalAllocationChart goals={goals} isLoading={isLoading} />
            </>
          ) : (
            <>
              <GoalProjectionChart goals={goals} isLoading={isLoading} />
              <ContributionHistoryChart goals={goals} isLoading={isLoading} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
