'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  EllipsisVertical,
  Layers,
  Pause,
  Pencil,
  PiggyBank,
  Play,
  Plus,
  Receipt,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatInr, roundMoney } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { Card } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Progress } from '@/components/ui/feedback/progress';
import { Button } from '@/components/ui/forms/button';
import { Skeleton } from '@/components/ui/states/skeleton';
import { KpiCard } from '@/components/shared';
import { DeadlineCountdownBadge, GoalStatusBadge, OnTrackIndicator } from './status';
import type { GoalRow, GoalTotals } from './types';

/* ------------------------------------------------------------------ */
/* 1. Summary Strip (KPI cards)                                       */
/* ------------------------------------------------------------------ */

export function GoalsSummaryStrip({
  totals,
  isLoading,
}: {
  totals: GoalTotals;
  isLoading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        title="Total Saved"
        value={formatInr(totals.totalSaved)}
        hint={`${Math.round(totals.overallProgressPct)}% of total target`}
        icon={PiggyBank}
        tone="positive"
        isLoading={isLoading}
      />
      <KpiCard
        title="Total Target"
        value={formatInr(totals.totalTarget)}
        hint="Across all savings goals"
        icon={Target}
        isLoading={isLoading}
      />
      <KpiCard
        title="Overall Progress"
        value={`${Math.round(totals.overallProgressPct)}%`}
        hint={`${formatInr(Math.max(0, totals.totalTarget - totals.totalSaved))} remaining`}
        icon={TrendingUp}
        tone={totals.overallProgressPct >= 70 ? 'positive' : 'default'}
        isLoading={isLoading}
      />
      <KpiCard
        title="Active Goals"
        value={String(totals.activeGoalsCount)}
        hint={`${totals.completedCount} completed • ${totals.pausedCount} paused`}
        icon={Wallet}
        isLoading={isLoading}
      />
      <KpiCard
        title="On Track / Behind"
        value={`${totals.onTrackCount} / ${totals.behindCount}`}
        hint={
          totals.behindCount > 0
            ? `${totals.behindCount} goal${totals.behindCount > 1 ? 's' : ''} behind pace`
            : 'All active goals on pace!'
        }
        icon={CheckCircle2}
        tone={totals.behindCount > 0 ? 'warning' : 'positive'}
        isLoading={isLoading}
      />
      <KpiCard
        title="Monthly Needed"
        value={formatInr(totals.totalMonthlyPlanNeeded)}
        hint={`Planned: ${formatInr(totals.totalMonthlyPlanConfigured)}/mo`}
        icon={Coins}
        isLoading={isLoading}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Goal Card (Main Grid View)                                       */
/* ------------------------------------------------------------------ */

export interface GoalCardProps {
  goal: GoalRow;
  onClick?: (goal: GoalRow) => void;
  onAddMoney?: (goal: GoalRow) => void;
  onEdit?: (goal: GoalRow) => void;
  onTogglePause?: (goal: GoalRow) => void;
  onMarkComplete?: (goal: GoalRow) => void;
  onDelete?: (goal: GoalRow) => void;
  className?: string;
}

export function GoalCard({
  goal: g,
  onClick,
  onAddMoney,
  onEdit,
  onTogglePause,
  onMarkComplete,
  onDelete,
  className,
}: GoalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const pct = Math.min(100, Math.max(0, g.pace.progressPercentage));
  const isCompleted = g.status === 'completed' || pct >= 100;
  const isPaused = g.status === 'paused';

  const progressVariant = isCompleted
    ? 'success'
    : g.pace.isOverdue
      ? 'danger'
      : g.pace.isOnTrack
        ? 'success'
        : 'warning';

  return (
    <Card
      onClick={() => onClick?.(g)}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card cursor-pointer',
        className
      )}
    >
      {/* Top Bucket Accent Line with Smooth Gradient */}
      <div
        className="h-1 w-full opacity-90 transition-opacity group-hover:opacity-100"
        style={{
          background: g.bucketColor
            ? `linear-gradient(90deg, ${g.bucketColor} 0%, ${g.bucketColor}aa 50%, transparent 100%)`
            : 'var(--primary)',
        }}
      />

      {/* Card Content */}
      <div className="flex flex-col gap-3.5 p-5">
        {/* Top Header: Bucket & Status Badges + Action Menu */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            {/* Bucket Badge */}
            <Badge
              variant="outline"
              size="sm"
              className="max-w-32.5 font-medium text-[11px] border shadow-2xs transition-colors"
              style={{
                backgroundColor: g.bucketColor ? `${g.bucketColor}14` : undefined,
                borderColor: g.bucketColor ? `${g.bucketColor}33` : undefined,
                color: g.bucketColor ?? undefined,
              }}
              leadingIcon={
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: g.bucketColor ?? 'var(--primary)' }}
                />
              }
            >
              <span className="truncate">{g.bucketLabel}</span>
            </Badge>

            {/* Status badge */}
            <GoalStatusBadge status={g.status} />
          </div>

          {/* Action Menu Trigger */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-label={`Actions for ${g.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              <EllipsisVertical className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-raised"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onAddMoney?.(g);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-text-primary transition-colors hover:bg-primary-subtle hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span>Add Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit?.(g);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-text-primary transition-colors hover:bg-primary-subtle hover:text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit Goal</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onTogglePause?.(g);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-text-primary transition-colors hover:bg-primary-subtle hover:text-primary"
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-3.5 w-3.5 text-success" />
                        <span>Resume Goal</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-3.5 w-3.5 text-warning" />
                        <span>Pause Goal</span>
                      </>
                    )}
                  </button>

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onMarkComplete?.(g);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-success transition-colors hover:bg-success-subtle"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}

                  <div className="h-px w-full bg-border" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete?.(g);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-danger transition-colors hover:bg-danger-subtle"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Goal Title */}
        <div>
          <h3 className="font-display text-body-md font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {g.name}
          </h3>
        </div>

        {/* Progress & Amount Hero Section */}
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="font-numeric text-body-lg font-bold text-text-primary tracking-tight">
                {formatInr(g.current_progress)}
              </span>
              <span className="ml-1.5 font-numeric text-caption text-text-muted">
                of {formatInr(g.target_amount)}
              </span>
            </div>
            <Badge
              variant={isCompleted ? 'success' : 'secondary'}
              size="sm"
              className="font-numeric font-bold shadow-2xs"
            >
              {Math.round(pct)}%
            </Badge>
          </div>

          <Progress
            value={pct}
            size="md"
            variant={progressVariant}
            className="h-2 bg-surface-raised border border-border/60 shadow-2xs"
          />

          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>
              {isCompleted ? (
                <span className="text-success font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Target achieved!</span>
                </span>
              ) : (
                <>
                  <span className="font-numeric font-semibold text-text-primary">
                    {formatInr(g.pace.remainingAmount)}
                  </span>{' '}
                  <span className="text-text-muted">remaining</span>
                </>
              )}
            </span>
            <DeadlineCountdownBadge targetDate={g.target_date} pace={g.pace} />
          </div>
        </div>

        {/* Clean Metadata Micro-Row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 text-caption">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-medium text-text-muted flex items-center gap-1">
              <Calendar className="h-3 w-3 text-text-muted shrink-0" />
              <span>
                Target:{' '}
                {new Date(g.target_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </span>
            <div className="font-numeric text-caption font-semibold text-text-primary truncate">
              Plan: {formatInr(g.monthly_contribution_plan)}/mo
            </div>
          </div>

          <div className="shrink-0 pl-2">
            <OnTrackIndicator pace={g.pace} monthlyPlan={g.monthly_contribution_plan} />
          </div>
        </div>
      </div>

      {/* Card Quick Action Footer */}
      <div className="flex items-center justify-between border-t border-border/60 bg-surface/50 px-5 py-2.5 transition-colors group-hover:bg-surface">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddMoney?.(g);
          }}
          className="gap-1.5 text-caption hover:border-primary/50 hover:bg-primary-subtle hover:text-primary transition-colors h-7.5 px-2.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Money</span>
        </Button>

        <span className="flex items-center gap-1 text-caption font-medium text-text-muted group-hover:text-primary transition-colors">
          <span>Details</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Goal Compact Row (Table / Dense View)                           */
/* ------------------------------------------------------------------ */

export function GoalCompactRow({
  goal: g,
  onClick,
  onAddMoney,
  onEdit,
  onTogglePause,
  onDelete,
}: {
  goal: GoalRow;
  onClick?: (goal: GoalRow) => void;
  onAddMoney?: (goal: GoalRow) => void;
  onEdit?: (goal: GoalRow) => void;
  onTogglePause?: (goal: GoalRow) => void;
  onDelete?: (goal: GoalRow) => void;
}) {
  const pct = Math.min(100, Math.max(0, g.pace.progressPercentage));
  const isCompleted = g.status === 'completed' || pct >= 100;
  const progressVariant = isCompleted
    ? 'success'
    : g.pace.isOverdue
      ? 'danger'
      : g.pace.isOnTrack
        ? 'success'
        : 'warning';

  return (
    <div
      onClick={() => onClick?.(g)}
      className="group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-surface-raised cursor-pointer shadow-2xs"
    >
      {/* Title & Bucket */}
      <div className="flex items-center gap-3.5 min-w-64">
        <div
          className="h-10 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: g.bucketColor || 'var(--primary)' }}
        />
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-body-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
              {g.name}
            </h4>
            <GoalStatusBadge status={g.status} />
          </div>
          <Badge
            variant="outline"
            size="sm"
            className="text-[11px] font-medium"
            style={{
              backgroundColor: g.bucketColor ? `${g.bucketColor}14` : undefined,
              borderColor: g.bucketColor ? `${g.bucketColor}33` : undefined,
              color: g.bucketColor ?? undefined,
            }}
            leadingIcon={
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: g.bucketColor ?? 'var(--primary)' }}
              />
            }
          >
            {g.bucketLabel}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full md:w-56 space-y-1.5">
        <div className="flex items-center justify-between text-caption font-numeric">
          <span className="font-medium text-text-primary">{formatInr(g.current_progress)}</span>
          <Badge
            variant={isCompleted ? 'success' : 'secondary'}
            size="sm"
            className="font-numeric font-semibold"
          >
            {Math.round(pct)}%
          </Badge>
        </div>
        <Progress value={pct} size="sm" variant={progressVariant} />
      </div>

      {/* Target & Deadline */}
      <div className="flex items-center gap-4 text-caption">
        <div>
          <div className="text-text-muted text-[11px]">Target</div>
          <div className="font-numeric font-semibold text-text-primary">
            {formatInr(g.target_amount)}
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="text-text-muted text-[11px] mb-0.5">Deadline</div>
          <DeadlineCountdownBadge targetDate={g.target_date} pace={g.pace} />
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex items-center gap-2 justify-end">
        <OnTrackIndicator pace={g.pace} monthlyPlan={g.monthly_contribution_plan} />

        <Button
          variant="subtle"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddMoney?.(g);
          }}
          className="h-8 gap-1 text-caption hover:border-primary/40 hover:bg-primary-subtle hover:text-primary transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Skeleton Loader                                                 */
/* ------------------------------------------------------------------ */

export function GoalCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}
