'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Minus,
  Percent,
  PiggyBank,
  Receipt,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { Card } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import { Skeleton } from '@/components/ui/states/skeleton';
import { RadialChart } from '@/components/ui/charts/radial-chart';
import type { MetricWithChange, ReportInsight, ReportKpis, ReportTab } from './types';

// ============================================================
// 1. HONEST DELTA PILL
// ============================================================

export function HonestDeltaPill({
  metric,
  invertFavorable = false,
}: {
  metric: MetricWithChange;
  invertFavorable?: boolean; // if true, decrease is favorable (e.g. expenses)
}) {
  if (metric.isNew) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-primary-subtle text-primary border border-primary/20">
        New
      </span>
    );
  }

  if (!metric.hasComparison || !Number.isFinite(metric.deltaPct)) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
        <Minus className="h-3 w-3" />
        <span>—</span>
      </span>
    );
  }

  const isUp = metric.deltaPct > 0;
  // If invertFavorable is false (income): up = positive, down = negative
  // If invertFavorable is true (spent): down = positive, up = negative
  const isFavorable = invertFavorable ? !isUp : isUp;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-tight',
        isFavorable
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
      )}
    >
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      <span>{isUp ? `+${metric.deltaPct.toFixed(1)}%` : `${metric.deltaPct.toFixed(1)}%`}</span>
    </span>
  );
}

// ============================================================
// 2. HONEST MINI SPARKLINE
// ============================================================

export function MiniSparkline({
  points,
  color = 'var(--primary)',
}: {
  points: number[];
  color?: string;
}) {
  if (!points || points.length === 0) return null;

  // Honest data states: single data point renders as a clean bar
  if (points.length === 1) {
    return (
      <div className="h-8 flex items-end">
        <div className="w-4 rounded-t bg-primary/40 h-5" style={{ backgroundColor: color }} />
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className="shrink-0 flex items-center">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.join(' ')}
          className="opacity-80"
        />
      </svg>
    </div>
  );
}

// ============================================================
// 3. KPI HERO DECK
// ============================================================

interface ReportKpiDeckProps {
  kpis: ReportKpis;
  isLoading?: boolean;
  onSelectTab: (tab: ReportTab) => void;
  onDrilldownExpense?: () => void;
}

export function ReportKpiDeck({
  kpis,
  isLoading,
  onSelectTab,
  onDrilldownExpense,
}: ReportKpiDeckProps) {
  const [showSecondaryStats, setShowSecondaryStats] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Primary 4 Cards: 4 across, 2x2 tablet, stacked mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Income */}
        <Card
          onClick={() => onSelectTab('income')}
          className="p-4 bg-surface border-border hover:border-emerald-500/40 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
              Income
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28 my-1" />
            ) : (
              <div className="font-numeric text-title-md font-bold text-text-primary tracking-tight">
                {kpis.income.formatted}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
            <HonestDeltaPill metric={kpis.income} invertFavorable={false} />
            <MiniSparkline points={kpis.income.sparkline} color="var(--chart-1)" />
          </div>
        </Card>

        {/* Card 2: Spent */}
        <Card
          onClick={() => onSelectTab('expenses')}
          className="p-4 bg-surface border-border hover:border-rose-500/40 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
              Spent
            </span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Receipt className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28 my-1" />
            ) : (
              <div className="font-numeric text-title-md font-bold text-text-primary tracking-tight">
                {kpis.spent.formatted}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
            {/* Decrease in spending is favorable (green) */}
            <HonestDeltaPill metric={kpis.spent} invertFavorable={true} />
            <MiniSparkline points={kpis.spent.sparkline} color="var(--chart-5)" />
          </div>
        </Card>

        {/* Card 3: Net Savings */}
        <Card
          onClick={() => onSelectTab('income')}
          className="p-4 bg-surface border-border hover:border-primary/40 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
              Net Savings
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary">
              <PiggyBank className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28 my-1" />
            ) : (
              <div
                className={cn(
                  'font-numeric text-title-md font-bold tracking-tight',
                  kpis.netSavings.value >= 0
                    ? 'text-text-primary'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {kpis.netSavings.formatted}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
            <HonestDeltaPill metric={kpis.netSavings} invertFavorable={false} />
            <MiniSparkline points={kpis.netSavings.sparkline} color="var(--chart-2)" />
          </div>
        </Card>

        {/* Card 4: Savings Rate */}
        <Card
          onClick={() => onSelectTab('budgets')}
          className="p-4 bg-surface border-border hover:border-accent/40 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Savings Rate
              </span>
              <Badge variant="subtle" size="sm" className="text-[10px] px-1 py-0 font-medium">
                Target: {kpis.savingsRate.targetBenchmark}%
              </Badge>
            </div>
            <div className="h-7 w-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Percent className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            {isLoading ? (
              <Skeleton className="h-8 w-20 my-1" />
            ) : (
              <div className="font-numeric text-title-md font-bold text-text-primary tracking-tight">
                {kpis.savingsRate.formatted}
              </div>
            )}

            {/* Mini Progress Ring */}
            <div className="h-10 w-10">
              <RadialChart
                value={kpis.savingsRate.value}
                max={100}
                color={kpis.savingsRate.value >= 20 ? 'var(--chart-1)' : 'var(--chart-5)'}
                height={40}
                centerText=""
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
            <HonestDeltaPill metric={kpis.savingsRate} invertFavorable={false} />
            <span className="text-[11px] text-text-muted">
              {kpis.savingsRate.value >= 20 ? 'Above target' : 'Below target'}
            </span>
          </div>
        </Card>
      </div>

      {/* Secondary Stats Slim Strip / Expander */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setShowSecondaryStats((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer select-none"
          >
            <span>{showSecondaryStats ? 'Hide details' : 'More stats'}</span>
            {showSecondaryStats ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {showSecondaryStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2 animate-in fade-in-50 duration-200">
            <div className="rounded-lg border border-border/70 bg-surface/60 px-3.5 py-2 flex items-center justify-between">
              <span className="text-caption text-text-secondary">Avg Daily Spend</span>
              <span className="font-numeric text-body-sm font-semibold text-text-primary flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-warning" />
                {isLoading ? '—' : kpis.avgDailySpend.formatted}
              </span>
            </div>

            <div
              onClick={onDrilldownExpense}
              className="rounded-lg border border-border/70 bg-surface/60 px-3.5 py-2 flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer"
            >
              <span className="text-caption text-text-secondary">Largest Outlay</span>
              <span className="font-numeric text-body-sm font-semibold text-text-primary truncate max-w-37.5">
                {isLoading
                  ? '—'
                  : `${kpis.largestExpense.formatted} (${kpis.largestExpense.description})`}
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-surface/60 px-3.5 py-2 flex items-center justify-between">
              <span className="text-caption text-text-secondary">Tracked Transactions</span>
              <span className="font-numeric text-body-sm font-semibold text-text-primary">
                {isLoading ? '—' : `${kpis.transactionCount.value} items`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 4. INSIGHTS STRIP (Max 3, Collapsible)
// ============================================================

interface ReportInsightsStripProps {
  insights: ReportInsight[];
  onActionClick: (insight: ReportInsight) => void;
}

export function ReportInsightsStrip({ insights, onActionClick }: ReportInsightsStripProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleInsights = insights.filter((i) => !dismissedIds.includes(i.id));
  if (visibleInsights.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-semibold bg-primary-subtle text-primary border border-primary/20 hover:bg-primary-subtle/80 transition-colors cursor-pointer"
        >
          <Sparkles className="h-3 w-3" />
          <span>{visibleInsights.length} insights available</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Key Insights ({visibleInsights.length})</span>
        </span>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="text-[11px] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          Collapse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {visibleInsights.map((ins) => {
          const isWarning = ins.severity === 'warning';
          const isPositive = ins.severity === 'positive';

          return (
            <div
              key={ins.id}
              className={cn(
                'relative flex flex-col justify-between p-3 rounded-xl border text-body-sm transition-all',
                isWarning &&
                  'bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-100',
                isPositive &&
                  'bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-100',
                !isWarning && !isPositive && 'bg-surface border-border text-text-primary'
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 pr-4">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isWarning && <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />}
                    {isPositive && <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    {!isWarning && !isPositive && (
                      <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <span className="font-semibold text-caption truncate">{ins.title}</span>
                  </div>
                </div>

                <p className="text-caption text-text-secondary mt-1 line-clamp-2">
                  {ins.description}
                </p>
              </div>

              <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                {ins.actionLabel ? (
                  <button
                    type="button"
                    onClick={() => onActionClick(ins)}
                    className="font-semibold text-primary hover:underline cursor-pointer select-none"
                  >
                    {ins.actionLabel} →
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={() => setDismissedIds((prev) => [...prev, ins.id])}
                  className="text-text-muted hover:text-text-primary p-0.5 rounded cursor-pointer"
                  title="Dismiss insight"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
