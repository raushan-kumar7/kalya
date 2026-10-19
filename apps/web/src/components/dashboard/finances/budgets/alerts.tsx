'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { formatInr } from '@kalya/utils';
import { usagePct } from './status';
import type { BudgetAlertItem, BudgetRow } from './types';

export interface BudgetAlertsCardProps {
  alerts: BudgetAlertItem[];
  insights: string[];
  budgets?: BudgetRow[];
  onSelectBudget?: (budgetId: string) => void;
  className?: string;
}

export function BudgetAlertsCard({
  alerts,
  insights,
  budgets = [],
  onSelectBudget,
  className,
}: BudgetAlertsCardProps) {
  const hasAlerts = alerts.length > 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-4.5 shadow-card flex flex-col gap-4.5',
        className
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border',
              hasAlerts
                ? 'bg-warning-subtle text-warning border-warning/30'
                : 'bg-success-subtle text-success border-success/30'
            )}
          >
            {hasAlerts ? (
              <AlertTriangle className="h-4.5 w-4.5" />
            ) : (
              <CheckCircle2 className="h-4.5 w-4.5" />
            )}
          </span>
          <div>
            <h3 className="font-display text-body-md font-bold text-text-primary">
              Budget Alerts &amp; Pacing Intelligence
            </h3>
            <p className="text-caption text-text-muted mt-0.5">
              {hasAlerts
                ? `${alerts.length} ${alerts.length === 1 ? 'bucket requires' : 'buckets require'} review`
                : 'All buckets pacing within safe allocation targets'}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-caption font-semibold border',
            hasAlerts
              ? 'bg-warning-subtle text-warning border-warning/40'
              : 'bg-success-subtle text-success border-success/40'
          )}
        >
          {hasAlerts ? `${alerts.length} active` : 'Optimal Discipline'}
        </span>
      </header>

      {/* Alerts list if any */}
      {hasAlerts ? (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const isDanger = alert.tone === 'danger';
            return (
              <div
                key={alert.id}
                onClick={onSelectBudget ? () => onSelectBudget(alert.id) : undefined}
                className={cn(
                  'group flex items-center justify-between gap-3 rounded-lg border p-3 transition-all',
                  isDanger
                    ? 'border-danger/30 bg-danger-subtle/30 hover:bg-danger-subtle/50'
                    : 'border-warning/30 bg-warning-subtle/30 hover:bg-warning-subtle/50',
                  onSelectBudget && 'cursor-pointer'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-caption font-bold',
                      isDanger ? 'bg-danger text-surface' : 'bg-warning text-surface'
                    )}
                  >
                    {isDanger ? '!' : '▲'}
                  </span>
                  <div className="min-w-0">
                    <span className="text-body-sm font-semibold text-text-primary truncate block">
                      {alert.bucketLabel} · {alert.pct}% utilized
                    </span>
                    <span className="text-caption text-text-muted truncate block">
                      {alert.message}
                    </span>
                  </div>
                </div>

                {onSelectBudget && (
                  <div className="flex items-center gap-1 text-caption font-semibold text-primary shrink-0 transition-transform group-hover:translate-x-0.5">
                    <span>Inspect</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-lg border border-success/30 bg-success-subtle/20 p-3 text-caption text-success font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Great discipline this month! All active buckets are running below warning thresholds.
          </span>
        </div>
      )}

      {/* Pacing & Run-rate Intelligence Grid */}
      {budgets.length > 0 ? (
        <div className="space-y-2.5 border-t border-border/50 pt-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Safe Daily Burn Rate &amp; Forecast</span>
            </span>
            <span className="text-[11px] text-text-muted">Click any bucket for full breakdown</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => {
              const remaining = b.amount - b.spent;
              const over = remaining < 0;
              const pct = Math.round(usagePct(b.spent, b.amount));

              return (
                <div
                  key={b.id}
                  onClick={onSelectBudget ? () => onSelectBudget(b.id) : undefined}
                  className={cn(
                    'group flex flex-col justify-between rounded-xl border border-border/70 bg-surface-raised/40 p-3.5 transition-all hover:border-primary/40 hover:bg-surface-raised hover:shadow-xs',
                    onSelectBudget && 'cursor-pointer'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: b.bucketColor ?? 'var(--primary)' }}
                      />
                      <span className="font-display text-body-sm font-semibold text-text-primary truncate">
                        {b.bucketLabel}
                      </span>
                    </div>
                    <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-text-muted border border-border/40">
                      {b.targetPercent}% target
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="flex items-baseline gap-1 font-numeric">
                      <span
                        className={cn(
                          'text-body-lg font-bold',
                          over ? 'text-danger' : 'text-text-primary'
                        )}
                      >
                        {over
                          ? `Exceeded`
                          : b.projection.safeDailySpend > 0
                            ? formatInr(b.projection.safeDailySpend)
                            : '₹0'}
                      </span>
                      {!over && (
                        <span className="text-caption text-text-muted font-normal">/ day safe</span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-secondary mt-0.5 block truncate">
                      {over
                        ? `Over by ${formatInr(Math.abs(remaining))}`
                        : b.projection.daysRemaining > 0
                          ? `${b.projection.daysRemaining} days remaining in cycle`
                          : 'Cycle complete'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                    <span className="text-text-muted font-numeric">
                      {formatInr(b.spent)} ({pct}%)
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-2 border-t border-border/50 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-warning" />
            <span>Pacing &amp; Run-rate Intelligence</span>
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {insights.slice(0, 4).map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface-raised/40 p-2.5 text-caption text-text-secondary"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
