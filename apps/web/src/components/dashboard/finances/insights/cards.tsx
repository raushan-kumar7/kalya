'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Flame,
  Minus,
  Percent,
  PiggyBank,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { formatInr } from '@kalya/utils';
import { Button } from '@/components/ui/forms/button';
import { KpiCard, KpiGrid } from '@/components/shared';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import type { ReportInsight, ReportKpis } from './types';

interface ComparisonBadgeProps {
  deltaPct: number;
  isPositiveGood?: boolean;
  previousFormatted?: string;
  showVsLabel?: boolean;
}

export function ComparisonBadge({
  deltaPct,
  isPositiveGood = true,
  previousFormatted,
  showVsLabel = true,
}: ComparisonBadgeProps) {
  if (!Number.isFinite(deltaPct) || deltaPct === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted">
        <Minus className="h-3 w-3" />
        <span>0% change</span>
      </span>
    );
  }

  const isUp = deltaPct > 0;
  // If positive is good (like income or savings), up = success, down = danger.
  // If positive is bad (like expenses), up = danger, down = success.
  const isFavorable = isPositiveGood ? isUp : !isUp;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-tight',
          isFavorable
            ? 'bg-success-subtle text-success border border-success/20'
            : 'bg-danger-subtle text-danger border border-danger/20'
        )}
      >
        {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span>{isUp ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`}</span>
      </span>
      {showVsLabel && (
        <span className="text-caption text-text-muted truncate">
          vs prev {previousFormatted ? `(${previousFormatted})` : ''}
        </span>
      )}
    </div>
  );
}

interface ReportKpiStripProps {
  kpis: ReportKpis;
  isLoading?: boolean;
  compareWithPrevious?: boolean;
  onDrilldownExpense?: () => void;
}

export function ReportKpiStrip({
  kpis,
  isLoading,
  compareWithPrevious = true,
  onDrilldownExpense,
}: ReportKpiStripProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Primary KPI Strip */}
      <KpiGrid cols={4}>
        {/* Income */}
        <KpiCard
          title="Total Income"
          value={kpis.income.formatted}
          icon={Wallet}
          tone="default"
          isLoading={isLoading}
          trend={
            compareWithPrevious && !isLoading && Number.isFinite(kpis.income.deltaPct)
              ? {
                  value: kpis.income.deltaPct,
                  label: kpis.income.previousFormatted
                    ? `vs ${kpis.income.previousFormatted}`
                    : 'vs prev',
                  invert: false,
                }
              : undefined
          }
        />

        {/* Spent */}
        <KpiCard
          title="Spent (Your Share)"
          value={kpis.spent.formatted}
          icon={Receipt}
          tone="negative"
          isLoading={isLoading}
          trend={
            compareWithPrevious && !isLoading && Number.isFinite(kpis.spent.deltaPct)
              ? {
                  value: kpis.spent.deltaPct,
                  label: kpis.spent.previousFormatted
                    ? `vs ${kpis.spent.previousFormatted}`
                    : 'vs prev',
                  invert: true,
                }
              : undefined
          }
        />

        {/* Net Savings */}
        <KpiCard
          title="Net Savings"
          value={kpis.netSavings.formatted}
          icon={PiggyBank}
          tone={kpis.netSavings.value >= 0 ? 'positive' : 'negative'}
          isLoading={isLoading}
          trend={
            compareWithPrevious && !isLoading && Number.isFinite(kpis.netSavings.deltaPct)
              ? {
                  value: kpis.netSavings.deltaPct,
                  label: kpis.netSavings.previousFormatted
                    ? `vs ${kpis.netSavings.previousFormatted}`
                    : 'vs prev',
                  invert: false,
                }
              : undefined
          }
        />

        {/* Savings Rate */}
        <KpiCard
          title="Savings Rate"
          value={kpis.savingsRate.formatted}
          icon={Percent}
          tone="accent"
          isLoading={isLoading}
          trend={
            compareWithPrevious && !isLoading && Number.isFinite(kpis.savingsRate.deltaPct)
              ? {
                  value: kpis.savingsRate.deltaPct,
                  label: kpis.savingsRate.previousFormatted
                    ? `vs ${kpis.savingsRate.previousFormatted}`
                    : 'vs prev',
                  invert: false,
                }
              : undefined
          }
        />
      </KpiGrid>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Average Daily Spend */}
        <div className="rounded-lg border border-border/80 bg-surface/60 px-4 py-2.5 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Avg Daily Spend
            </span>
            <div className="font-numeric text-body-md font-semibold text-text-primary">
              {isLoading ? '—' : kpis.avgDailySpend.formatted}
            </div>
          </div>
          <Flame className="h-4 w-4 text-warning opacity-70 shrink-0" />
        </div>

        {/* Largest Single Expense */}
        <div
          onClick={onDrilldownExpense}
          className={cn(
            'rounded-lg border border-border/80 bg-surface/60 px-4 py-2.5 flex items-center justify-between group transition-colors',
            onDrilldownExpense && 'cursor-pointer hover:border-primary/40 hover:bg-surface'
          )}
        >
          <div className="min-w-0 pr-2">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Largest Expense
            </span>
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="font-numeric text-body-md font-semibold text-text-primary">
                {isLoading ? '—' : kpis.largestExpense.formatted}
              </span>
              <span className="text-caption text-text-muted truncate">
                {isLoading ? '' : `• ${kpis.largestExpense.description || 'N/A'}`}
              </span>
            </div>
          </div>
          <Receipt className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </div>

        {/* Total Transactions */}
        <div className="rounded-lg border border-border/80 bg-surface/60 px-4 py-2.5 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Transactions Tracked
            </span>
            <div className="flex items-center gap-2">
              <span className="font-numeric text-body-md font-semibold text-text-primary">
                {isLoading ? '—' : kpis.transactionCount.value}
              </span>
              {compareWithPrevious && !isLoading && (
                <span className="text-caption text-text-muted">
                  ({kpis.transactionCount.deltaPct >= 0 ? '+' : ''}
                  {kpis.transactionCount.deltaPct.toFixed(0)}% vs prev)
                </span>
              )}
            </div>
          </div>
          <Calendar className="h-4 w-4 text-primary opacity-70 shrink-0" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Insights Panel                                                     */
/* ------------------------------------------------------------------ */

interface ReportInsightsPanelProps {
  insights: ReportInsight[];
  onActionClick?: (insight: ReportInsight) => void;
  onDismiss?: (id: string) => void;
}

export function ReportInsightsPanel({
  insights,
  onActionClick,
  onDismiss,
}: ReportInsightsPanelProps) {
  if (!insights.length) return null;

  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((item) => {
        const isPositive = item.tone === 'positive';
        const isWarning = item.tone === 'warning';
        const isNegative = item.tone === 'negative';

        return (
          <div
            key={item.id}
            className={cn(
              'group relative flex items-start justify-between gap-3 rounded-xl border p-3.5 shadow-2xs transition-all',
              isPositive && 'border-success/30 bg-success-subtle/30 text-text-primary',
              isWarning && 'border-warning/30 bg-warning-subtle/30 text-text-primary',
              isNegative && 'border-danger/30 bg-danger-subtle/30 text-text-primary',
              !isPositive && !isWarning && !isNegative && 'border-border bg-surface-raised/60'
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  isPositive && 'bg-success text-on-success shadow-xs',
                  isWarning && 'bg-warning text-on-warning shadow-xs',
                  isNegative && 'bg-danger text-on-danger shadow-xs',
                  !isPositive && !isWarning && !isNegative && 'bg-primary text-on-primary shadow-xs'
                )}
              >
                {isPositive ? (
                  <Sparkles className="h-4 w-4" />
                ) : isNegative ? (
                  <AlertCircle className="h-4 w-4" />
                ) : isWarning ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
              </span>

              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display text-body-sm font-semibold text-text-primary truncate">
                    {item.title}
                  </h4>
                  {item.metric && (
                    <span className="text-[11px] font-semibold text-text-muted">
                      • {item.metric}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-caption text-text-secondary leading-snug line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-center">
              {item.actionLabel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onActionClick?.(item)}
                  className="gap-1 text-caption font-medium h-7 px-2.5 bg-surface/90 hover:bg-surface border-border/80"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}

              {onDismiss && (
                <button
                  type="button"
                  onClick={() => onDismiss(item.id)}
                  className="h-6 w-6 inline-flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                  aria-label="Dismiss insight"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
