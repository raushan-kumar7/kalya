'use client';

import {
  AlertTriangle,
  ChevronRight,
  PiggyBank,
  Receipt,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import { Progress } from '@/components/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import { CreateEntityCard, EntityCard, FooterRow } from '@/components/shared';
import { KpiCard } from '@/components/shared';
import { UsageBadge, usagePct, usageStatus } from './status';
import { cn } from '@/libs/utils';
import { formatInr } from '@kalya/utils';
import type { BudgetRow, BudgetTotals } from './types';

/* ------------------------------------------------------------------ */
/* Summary strip                                                       */
/* ------------------------------------------------------------------ */

export function BudgetSummaryStrip({
  totals,
  isLoading,
}: {
  totals: BudgetTotals;
  isLoading?: boolean;
}) {
  const overall = usageStatus(totals.usedPct);
  const tone = { success: 'positive', warning: 'warning', danger: 'negative' } as const;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <KpiCard
        title="Budgeted"
        value={formatInr(totals.budgeted)}
        icon={Target}
        isLoading={isLoading}
      />
      <KpiCard
        title="Spent"
        value={formatInr(totals.spent)}
        icon={Receipt}
        hint="Your share only"
        isLoading={isLoading}
      />
      <KpiCard
        title="Remaining"
        value={formatInr(Math.abs(totals.remaining))}
        hint={totals.remaining < 0 ? 'Over budget' : 'Left to spend'}
        icon={Wallet}
        tone={totals.remaining < 0 ? 'negative' : 'positive'}
        isLoading={isLoading}
      />
      <KpiCard
        title="Used"
        value={`${Math.round(totals.usedPct)}%`}
        hint={overall.label}
        icon={PiggyBank}
        tone={tone[overall.tone]}
        isLoading={isLoading}
      />
      <KpiCard
        title="Needs attention"
        value={String(totals.alertCount)}
        hint={totals.alertCount === 1 ? 'budget at warning or over' : 'budgets at warning or over'}
        icon={AlertTriangle}
        tone={totals.alertCount > 0 ? 'warning' : 'default'}
        isLoading={isLoading}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Budget card                                                         */
/* ------------------------------------------------------------------ */

export interface BudgetCardProps {
  budget: BudgetRow;
  onClick?: (b: BudgetRow) => void;
  onEdit?: (b: BudgetRow) => void;
  onDelete?: (b: BudgetRow) => void;
  className?: string;
}

export function BudgetCard({ budget: b, onClick, onEdit, onDelete, className }: BudgetCardProps) {
  const pct = usagePct(b.spent, b.amount);
  const status = usageStatus(pct, b.amberThreshold, b.redThreshold);
  const remaining = b.amount - b.spent;
  const over = remaining < 0;
  const proj = b.projection;

  return (
    <EntityCard
      color={b.bucketColor ?? 'var(--accent)'}
      className={cn(
        'w-full max-w-none cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md',
        className
      )}
      onClick={onClick ? () => onClick(b) : undefined}
      icon={<Wallet size={20} strokeWidth={2} />}
      title={b.bucketLabel}
      subtitle={
        <span className="mt-0.5 block truncate text-caption text-text-muted capitalize">
          {b.targetPercent}% target · {b.period.replace('_', ' ')}
        </span>
      }
      badges={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <UsageBadge status={status} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Warning at {b.amberThreshold}%, over at {b.redThreshold}%
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {b.rollover && (
              <span className="inline-flex items-center rounded-full border border-border/50 bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-muted">
                Rollover
              </span>
            )}
          </div>

          {proj.safeDailySpend > 0 && !over ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-subtle/30 px-2 py-0.5 text-[11px] font-semibold text-success">
              <Sparkles className="h-3 w-3" />
              <span>{formatInr(proj.safeDailySpend)}/day safe</span>
            </span>
          ) : over ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger-subtle/30 px-2 py-0.5 text-[11px] font-semibold text-danger">
              <span>Cap exceeded</span>
            </span>
          ) : null}
        </div>
      }
      progress={
        <div className="space-y-2.5">
          {/* Numbers: Spent / Budget with Percentage */}
          <div className="flex items-baseline justify-between text-caption">
            <div className="flex items-baseline gap-1.5 font-numeric">
              <span className="text-body-md font-bold text-text-primary">{formatInr(b.spent)}</span>
              <span className="text-text-muted text-caption">/ {formatInr(b.amount)}</span>
            </div>
            <span
              className={cn(
                'font-numeric text-caption font-bold',
                status.tone === 'danger'
                  ? 'text-danger'
                  : status.tone === 'warning'
                    ? 'text-warning'
                    : 'text-text-secondary'
              )}
            >
              {Math.round(pct)}%
            </span>
          </div>

          {/* Progress bar */}
          <Progress value={b.spent} max={b.amount || 1} variant={status.tone} className="h-2" />

          {/* Category preview chips or timeframe info */}
          {b.categories.length > 0 ? (
            <div className="flex items-center gap-1.5 pt-0.5 overflow-hidden">
              <span className="text-[11px] text-text-muted shrink-0">Top:</span>
              <div className="flex items-center gap-1 overflow-hidden truncate">
                {b.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-text-secondary border border-border/40 truncate max-w-24 shrink-0"
                    title={`${cat.label}: ${formatInr(cat.spent)} (${cat.percent}%)`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color ?? 'var(--primary)' }}
                    />
                    <span className="truncate">{cat.label}</span>
                  </span>
                ))}
                {b.categories.length > 3 && (
                  <span className="text-[10px] text-text-muted shrink-0">
                    +{b.categories.length - 3}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-text-muted pt-0.5">
              <span>{proj.daysRemaining} days remaining in cycle</span>
            </div>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 font-numeric text-caption">
            <span className="text-text-muted">{over ? 'Over by:' : 'Remaining:'}</span>
            <span className={cn('font-bold', over ? 'text-danger' : 'text-text-primary')}>
              {formatInr(Math.abs(remaining))}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline group-hover:translate-x-0.5 transition-transform">
            <span>Inspect details</span>
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      }
      menuLabel={`Actions for ${b.bucketLabel} budget`}
      onEdit={onEdit ? () => onEdit(b) : undefined}
      onDelete={onDelete ? () => onDelete(b) : undefined}
    />
  );
}

export function CreateBudgetCard({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <CreateEntityCard
      icon={<Target size={22} strokeWidth={2.25} />}
      title="Create budget"
      description="Set a limit for a bucket"
      onClick={onClick}
      className={className}
    />
  );
}

export function BudgetCardSkeleton() {
  return (
    <div
      className={cn('flex flex-col overflow-hidden rounded-xl border border-border bg-surface')}
      aria-hidden
    >
      <div className="h-1 w-full bg-border/70" />
      <div className="flex items-center gap-3 p-5 pb-4">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-surface-raised" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-raised" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-raised" />
        </div>
      </div>
      <div className="mt-auto space-y-2 border-t border-border px-5 py-3">
        <div className="h-2 w-full animate-pulse rounded bg-surface-raised" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-raised" />
      </div>
    </div>
  );
}
