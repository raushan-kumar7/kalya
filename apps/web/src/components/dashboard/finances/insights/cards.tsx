'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Percent,
  PiggyBank,
  Receipt,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { Card } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Skeleton } from '@/components/ui/states/skeleton';
import type { MetricWithChange, ReportInsight, ReportKpis, ReportTab } from './types';

// ============================================================
// 1. HONEST DELTA PILL
// ============================================================

export function HonestDeltaPill({
  metric,
  invertFavorable = false,
  fallbackLabel,
}: {
  metric: MetricWithChange;
  invertFavorable?: boolean; // if true, decrease is favorable (e.g. expenses)
  fallbackLabel?: React.ReactNode;
}) {
  if (metric.isNew) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-subtle text-primary border border-primary/20 shadow-2xs">
        <Sparkles className="h-2.5 w-2.5" />
        <span>New</span>
      </span>
    );
  }

  if (!metric.hasComparison || !Number.isFinite(metric.deltaPct)) {
    if (fallbackLabel) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
          {fallbackLabel}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-text-muted/60" />
        <span>Current period</span>
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
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-tight transition-colors shadow-2xs',
        isFavorable
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
      )}
    >
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      <span>{isUp ? `+${metric.deltaPct.toFixed(1)}%` : `${metric.deltaPct.toFixed(1)}%`}</span>
      <span className="text-[10px] opacity-75 font-normal">vs prev</span>
    </span>
  );
}

// ============================================================
// 2. MODERN CURVED AREA SPARKLINE & BENCHMARK METER
// ============================================================

export function MiniSparkline({
  points,
  color = '#10b981',
  gradientId = 'sparkline-grad',
}: {
  points: number[];
  color?: string;
  gradientId?: string;
}) {
  if (!points || points.length === 0) return null;

  const width = 84;
  const height = 28;
  const paddingX = 4;
  const paddingY = 4;

  // Single point or all identical values: render clean dashed line with glowing end dot
  const allIdentical = points.every((p) => p === points[0]);
  if (allIdentical) {
    const midY = height / 2;
    return (
      <div className="shrink-0 flex items-center opacity-75 group-hover:opacity-100 transition-opacity">
        <svg width={width} height={height} className="overflow-visible">
          <line
            x1={paddingX}
            y1={midY}
            x2={width - paddingX}
            y2={midY}
            stroke={color}
            strokeWidth="1.75"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
          <circle cx={width - paddingX} cy={midY} r="2.5" fill={color} />
          <circle cx={width - paddingX} cy={midY} r="5" fill={color} opacity="0.25" />
        </svg>
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const coords = points.map((val, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * innerWidth;
    const y = height - paddingY - ((val - min) / range) * innerHeight;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  // Build smooth curve path
  const linePath = coords.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = coords[idx - 1];
    const midX = (prev.x + curr.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const last = coords[coords.length - 1];
  const first = coords[0];
  const areaPath = `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;

  const uniqueId = `${gradientId}-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="shrink-0 flex items-center group-hover:scale-105 transition-transform duration-200">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
          <filter id={`${uniqueId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor={color} floodOpacity="0.3" />
          </filter>
        </defs>
        <path d={areaPath} fill={`url(#${uniqueId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${uniqueId}-glow)`}
        />
        <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
        <circle
          cx={last.x}
          cy={last.y}
          r="5"
          fill={color}
          opacity="0.25"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

export function MiniBenchmarkMeter({ value, target = 20 }: { value: number; target?: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const isAbove = value >= target;

  return (
    <div className="w-21 h-7 flex flex-col justify-center gap-1 shrink-0 group-hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between text-[10px] font-numeric text-text-muted">
        <span>Target {target}%</span>
        <span
          className={cn(
            'font-semibold text-[10px]',
            isAbove
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
          )}
        >
          {isAbove ? 'Pass' : 'Low'}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border/80 overflow-hidden relative">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isAbove
              ? 'bg-linear-to-r from-emerald-500 to-emerald-400'
              : 'bg-linear-to-r from-amber-500 to-amber-400'
          )}
          style={{ width: `${clamped}%` }}
        />
        {/* Target 20% benchmark needle pin */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-text-primary z-10 opacity-70"
          style={{ left: `${target}%` }}
          title={`Target benchmark: ${target}%`}
        />
      </div>
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
  const netSavingsColor = kpis.netSavings.value >= 0 ? '#10b981' : '#f43f5e';

  return (
    <div className="flex flex-col gap-3.5">
      {/* Primary 4 Cards: 4 across, 2x2 tablet, stacked mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Income */}
        <Card
          onClick={() => onSelectTab('income')}
          className="relative p-4.5 rounded-2xl bg-surface border-border/80 hover:border-emerald-500/50 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-500/5 group-hover:bg-emerald-500/12 transition-all duration-300 pointer-events-none blur-xl" />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/50 transition-all duration-300" />

          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider font-body">
              Income
            </span>
            <div className="h-8.5 w-8.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all">
              <Wallet className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-28 my-1" />
            ) : (
              <div className="font-numeric text-title-md sm:text-title-lg font-bold text-text-primary tracking-tight">
                {kpis.income.formatted}
              </div>
            )}
          </div>

          <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-border/50">
            <HonestDeltaPill
              metric={kpis.income}
              invertFavorable={false}
              fallbackLabel={
                <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Active Inflow</span>
                </span>
              }
            />
            <MiniSparkline points={kpis.income.sparkline} color="#10b981" gradientId="inc-spark" />
          </div>
        </Card>

        {/* Card 2: Spent */}
        <Card
          onClick={() => onSelectTab('expenses')}
          className="relative p-4.5 rounded-2xl bg-surface border-border/80 hover:border-rose-500/50 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-rose-500/5 group-hover:bg-rose-500/12 transition-all duration-300 pointer-events-none blur-xl" />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-rose-500/0 to-transparent group-hover:via-rose-500/50 transition-all duration-300" />

          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider font-body">
              Spent
            </span>
            <div className="h-8.5 w-8.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs group-hover:scale-105 group-hover:bg-rose-500/20 transition-all">
              <Receipt className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-28 my-1" />
            ) : (
              <div className="font-numeric text-title-md sm:text-title-lg font-bold text-text-primary tracking-tight">
                {kpis.spent.formatted}
              </div>
            )}
          </div>

          <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-border/50">
            {/* Decrease in spending is favorable (green) */}
            <HonestDeltaPill
              metric={kpis.spent}
              invertFavorable={true}
              fallbackLabel={
                <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>
                    {kpis.transactionCount.value > 0
                      ? `Avg ${kpis.avgDailySpend.formatted}/day`
                      : 'No expenses'}
                  </span>
                </span>
              }
            />
            <MiniSparkline points={kpis.spent.sparkline} color="#f43f5e" gradientId="exp-spark" />
          </div>
        </Card>

        {/* Card 3: Net Savings */}
        <Card
          onClick={() => onSelectTab('income')}
          className="relative p-4.5 rounded-2xl bg-surface border-border/80 hover:border-primary/50 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/12 transition-all duration-300 pointer-events-none blur-xl" />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-300" />

          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider font-body">
              Net Savings
            </span>
            <div className="h-8.5 w-8.5 rounded-xl bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary shadow-xs group-hover:scale-105 group-hover:bg-primary-subtle/80 transition-all">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-28 my-1" />
            ) : (
              <div
                className={cn(
                  'font-numeric text-title-md sm:text-title-lg font-bold tracking-tight',
                  kpis.netSavings.value >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {kpis.netSavings.formatted}
              </div>
            )}
          </div>

          <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-border/50">
            <HonestDeltaPill
              metric={kpis.netSavings}
              invertFavorable={false}
              fallbackLabel={
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{kpis.savingsRate.formatted} of income saved</span>
                </span>
              }
            />
            <MiniSparkline
              points={kpis.netSavings.sparkline}
              color={netSavingsColor}
              gradientId="net-spark"
            />
          </div>
        </Card>

        {/* Card 4: Savings Rate */}
        <Card
          onClick={() => onSelectTab('budgets')}
          className="relative p-4.5 rounded-2xl bg-surface border-border/80 hover:border-accent/50 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-accent/5 group-hover:bg-accent/12 transition-all duration-300 pointer-events-none blur-xl" />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-accent/0 to-transparent group-hover:via-accent/50 transition-all duration-300" />

          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider font-body">
              Savings Rate
            </span>
            <div className="h-8.5 w-8.5 rounded-xl bg-accent-subtle border border-accent/20 flex items-center justify-center text-accent-strong shadow-xs group-hover:scale-105 transition-all">
              <Percent className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-20 my-1" />
            ) : (
              <div className="flex items-baseline justify-between">
                <div className="font-numeric text-title-md sm:text-title-lg font-bold text-accent-strong tracking-tight">
                  {kpis.savingsRate.formatted}
                </div>
                <Badge
                  variant={kpis.savingsRate.value >= 20 ? 'success' : 'warning'}
                  size="sm"
                  className="text-[10px] px-2 py-0.5 font-semibold"
                >
                  {kpis.savingsRate.value >= 20 ? 'Above 20% Goal' : 'Below 20% Goal'}
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-border/50">
            <HonestDeltaPill
              metric={kpis.savingsRate}
              invertFavorable={false}
              fallbackLabel={
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Beating target</span>
                </span>
              }
            />
            <MiniBenchmarkMeter
              value={kpis.savingsRate.value}
              target={kpis.savingsRate.targetBenchmark || 20}
            />
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
