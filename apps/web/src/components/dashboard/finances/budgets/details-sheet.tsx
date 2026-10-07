'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  PieChart,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Progress,
} from '@/components/ui';
import { formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { UsageBadge, usagePct, usageStatus } from './status';
import type { BudgetRow } from './types';

export interface BudgetDetailsSheetProps {
  budget: BudgetRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (b: BudgetRow) => void;
  onDelete?: (b: BudgetRow) => void;
}

export function BudgetDetailsSheet({
  budget: b,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: BudgetDetailsSheetProps) {
  if (!b) return null;

  const pct = usagePct(b.spent, b.amount);
  const status = usageStatus(pct, b.amberThreshold, b.redThreshold);
  const remaining = b.amount - b.spent;
  const isOver = remaining < 0;
  const proj = b.projection;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="lg" className="flex flex-col">
        {/* Drawer Header */}
        <DrawerHeader className="border-b border-border/50 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs"
                style={{
                  backgroundColor: b.bucketColor ? `${b.bucketColor}15` : 'var(--primary-subtle)',
                  borderColor: b.bucketColor ? `${b.bucketColor}30` : 'var(--primary-subtle)',
                  color: b.bucketColor ?? 'var(--primary)',
                }}
              >
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <DrawerTitle className="font-display text-body-lg font-bold text-text-primary">
                  {b.bucketLabel} Budget
                </DrawerTitle>
                <DrawerDescription className="text-caption text-text-muted mt-0.5">
                  {b.targetPercent}% target allocation · {b.period.replace('_', ' ')}
                </DrawerDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <UsageBadge status={status} />
              {b.rollover && (
                <span className="rounded-full border border-border/60 bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                  Rollover
                </span>
              )}
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable Body Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Main Financial KPI Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border/50 bg-surface-raised/40 p-3">
              <span className="text-caption text-text-muted font-medium block">Budget Limit</span>
              <span className="font-display text-display-xs font-bold text-text-primary block mt-1">
                {formatInr(b.amount)}
              </span>
              <span className="text-[11px] text-text-muted mt-0.5 block">{b.period}</span>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface-raised/40 p-3">
              <span className="text-caption text-text-muted font-medium block">Total Spent</span>
              <span className="font-display text-display-xs font-bold text-text-primary block mt-1">
                {formatInr(b.spent)}
              </span>
              <span className="text-[11px] text-text-muted mt-0.5 block">Your share</span>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface-raised/40 p-3">
              <span className="text-caption text-text-muted font-medium block">
                {isOver ? 'Over By' : 'Remaining'}
              </span>
              <span
                className={cn(
                  'font-display text-display-xs font-bold block mt-1',
                  isOver ? 'text-danger' : 'text-success'
                )}
              >
                {formatInr(Math.abs(remaining))}
              </span>
              <span className="text-[11px] text-text-muted mt-0.5 block">
                {isOver ? 'Budget exceeded' : 'Available'}
              </span>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface-raised/40 p-3">
              <span className="text-caption text-text-muted font-medium block">Usage</span>
              <span
                className={cn(
                  'font-display text-display-xs font-bold block mt-1',
                  status.tone === 'danger'
                    ? 'text-danger'
                    : status.tone === 'warning'
                      ? 'text-warning'
                      : 'text-success'
                )}
              >
                {Math.round(pct)}%
              </span>
              <span className="text-[11px] text-text-muted mt-0.5 block">{status.label} limit</span>
            </div>
          </div>

          {/* Progress Bar & Thresholds */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-body-sm">
              <span className="font-medium text-text-primary">Consumption Progress</span>
              <span className="font-numeric font-bold text-text-primary">
                {formatInr(b.spent)} / {formatInr(b.amount)}
              </span>
            </div>

            <Progress value={b.spent} max={b.amount || 1} variant={status.tone} className="h-2.5" />

            <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
              <span>Warning threshold: {b.amberThreshold}%</span>
              <span>Over threshold: {b.redThreshold}%</span>
            </div>
          </div>

          {/* Pacing & Month-End Forecast */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-body-md font-semibold text-text-primary flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>Pacing &amp; Run-rate Projection</span>
              </h4>
              <span className="rounded-md bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border/40">
                Day {proj.daysElapsed} of {proj.daysInMonth}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 bg-surface-raised/40 p-3">
                <span className="text-caption text-text-muted font-medium block">
                  Safe Daily Spend Rate
                </span>
                <span className="font-numeric text-body-md font-bold text-success block mt-1">
                  {formatInr(proj.safeDailySpend)}/day
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 block">
                  for remaining {proj.daysRemaining} days
                </span>
              </div>

              <div className="rounded-lg border border-border/50 bg-surface-raised/40 p-3">
                <span className="text-caption text-text-muted font-medium block">
                  Current Daily Pace
                </span>
                <span className="font-numeric text-body-md font-bold text-text-primary block mt-1">
                  {formatInr(proj.dailyAvgSpent)}/day
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 block">
                  projected total: ~{formatInr(proj.projectedMonthEndSpent)}
                </span>
              </div>
            </div>

            {/* Smart forecast banner */}
            {isOver ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-subtle/40 p-3 text-caption text-danger">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Budget Cap Surpassed</strong>
                  <span>
                    You have spent {formatInr(Math.abs(remaining))} more than planned for this
                    cycle.
                  </span>
                </div>
              </div>
            ) : proj.runoutDay && proj.runoutDay <= proj.daysInMonth ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning-subtle/40 p-3 text-caption text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Depletion Warning</strong>
                  <span>
                    At your current pace ({formatInr(proj.dailyAvgSpent)}/day), this budget will run
                    out around day {proj.runoutDay}.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-subtle/30 p-2.5 text-caption text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Pacing within safe limits. Maintain under {formatInr(proj.safeDailySpend)}/day.
                </span>
              </div>
            )}
          </div>

          {/* Categories Inside This Bucket */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-body-md font-semibold text-text-primary flex items-center gap-1.5">
                <PieChart className="h-4 w-4 text-primary" />
                <span>Categories in {b.bucketLabel}</span>
              </h4>
              <span className="text-caption text-text-muted font-medium">
                {b.categories.length} {b.categories.length === 1 ? 'category' : 'categories'}
              </span>
            </div>

            {b.categories.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-caption text-text-muted">
                No categories assigned to this bucket yet.
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {b.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-lg border border-border/50 bg-surface-raised/30 p-2.5 transition-colors hover:bg-surface-raised/60"
                  >
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: cat.color ?? 'var(--primary)' }}
                        />
                        <span className="font-medium text-text-primary truncate">{cat.label}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-numeric font-bold text-text-primary">
                          {formatInr(cat.spent)}
                        </span>
                        <span className="min-w-10 rounded-full bg-surface-raised px-1.5 py-0.5 text-center font-numeric text-[11px] font-semibold text-text-secondary border border-border/40">
                          {cat.percent}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, cat.percent))}%`,
                          backgroundColor: cat.color ?? 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deep Navigation to Transactions */}
          <Link
            href={`/dashboard/transactions?bucketId=${b.bucketId}`}
            className="group flex items-center justify-between rounded-xl border border-primary/20 bg-primary-subtle/20 p-3.5 transition-all hover:border-primary/40 hover:bg-primary-subtle/30"
          >
            <div className="flex items-center gap-2.5">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <span className="text-body-sm font-semibold text-text-primary block">
                  View {b.bucketLabel} Transactions
                </span>
                <span className="text-caption text-text-muted">
                  Filtered to all expenses in this budget cycle
                </span>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Drawer Footer Actions */}
        <DrawerFooter className="border-t border-border/50 pt-3">
          <div className="flex items-center justify-between w-full gap-2">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(b);
                }}
                className="cursor-pointer text-danger hover:bg-danger-subtle hover:text-danger gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(b);
                  }}
                  className="cursor-pointer gap-1.5"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Budget</span>
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="default" size="sm" className="cursor-pointer">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
