'use client';

import React, { useState } from 'react';
import {
  Check,
  Clock,
  Coins,
  History,
  IndianRupee,
  Pencil,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/overlays/drawer';
import { Button } from '@/components/ui/forms/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Input } from '@/components/ui/forms/input';
import { RadialChart } from '@/components/ui/charts/radial-chart';
import { CartesianChart, SEMANTIC } from '@/components/ui/charts';
import { formatInr, roundMoney } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { DeadlineCountdownBadge, GoalStatusBadge, OnTrackIndicator } from './status';
import type { GoalRow } from './types';
import { calculateWhatIf, generateProjectionTimeline } from './helper';

export interface GoalDetailsSheetProps {
  goal: GoalRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMoney?: (goal: GoalRow) => void;
  onEdit?: (goal: GoalRow) => void;
  onDelete?: (goal: GoalRow) => void;
  onDeleteContribution?: (goalId: string, contributionId: string) => void;
}

export function GoalDetailsSheet({
  goal: g,
  open,
  onOpenChange,
  onAddMoney,
  onEdit,
  onDelete,
  onDeleteContribution,
}: GoalDetailsSheetProps) {
  // "What-if" calculator state
  const [whatIfMonthly, setWhatIfMonthly] = useState<string>('');
  const [whatIfMode, _setWhatIfMode] = useState<'amount' | 'date'>('amount');

  if (!g) return null;

  const pct = Math.min(100, Math.max(0, g.pace.progressPercentage));
  const isCompleted = g.status === 'completed' || pct >= 100;
  const milestones = [
    { pct: 25, label: '25% Kickoff', amount: roundMoney(g.target_amount * 0.25) },
    { pct: 50, label: '50% Halfway', amount: roundMoney(g.target_amount * 0.5) },
    { pct: 75, label: '75% Home Stretch', amount: roundMoney(g.target_amount * 0.75) },
    { pct: 100, label: '100% Target Met', amount: g.target_amount },
  ];

  // Dynamic what-if evaluation
  const customMonthlyNum = Number(whatIfMonthly) || g.monthly_contribution_plan || 5000;
  const whatIfResult = calculateWhatIf(
    g.target_amount,
    g.current_progress,
    g.target_date,
    whatIfMode === 'amount' ? customMonthlyNum : undefined
  );

  const projectionTimeline = generateProjectionTimeline(g);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="lg" className="flex flex-col overflow-hidden bg-surface">
        {/* Drawer Header */}
        <DrawerHeader className="border-b border-border bg-surface-raised/40 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-xs"
                style={{
                  backgroundColor: g.bucketColor ? `${g.bucketColor}15` : 'var(--primary-subtle)',
                  borderColor: g.bucketColor ? `${g.bucketColor}35` : 'var(--primary-subtle)',
                  color: g.bucketColor ?? 'var(--primary)',
                }}
              >
                <Target className="h-6 w-6" />
              </span>
              <div>
                <DrawerTitle className="font-display text-body-lg font-bold text-text-primary">
                  {g.name}
                </DrawerTitle>
                <DrawerDescription className="flex items-center gap-2 text-caption text-text-muted mt-0.5">
                  <span
                    className="h-2 w-2 rounded-full inline-block"
                    style={{ backgroundColor: g.bucketColor ?? 'var(--primary)' }}
                  />
                  <span>{g.bucketLabel}</span>
                  <span>•</span>
                  <span>Target Date: {g.target_date}</span>
                </DrawerDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <GoalStatusBadge status={g.status} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(g)}
                className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
                title="Edit Goal"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Progress Ring & Milestone Section */}
          <div className="rounded-xl border border-border bg-surface-raised/30 p-5 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Radial Chart */}
              <div className="flex flex-col items-center justify-center">
                <RadialChart
                  value={pct}
                  max={100}
                  color={
                    isCompleted
                      ? 'var(--success)'
                      : g.pace.isOverdue
                        ? 'var(--danger)'
                        : g.bucketColor || 'var(--primary)'
                  }
                  centerText={`${Math.round(pct)}%`}
                  label="Saved"
                  height={150}
                />
                <div className="mt-2 text-center">
                  <div className="font-numeric text-body-md font-bold text-text-primary">
                    {formatInr(g.current_progress)}
                  </div>
                  <div className="text-caption text-text-muted">
                    of {formatInr(g.target_amount)} target
                  </div>
                </div>
              </div>

              {/* Milestones Tracker */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
                  Milestone Checkpoints
                </h4>
                <div className="space-y-2">
                  {milestones.map((m) => {
                    const reached = g.current_progress >= m.amount;
                    return (
                      <div
                        key={m.pct}
                        className={cn(
                          'flex items-center justify-between rounded-lg border px-3 py-2 text-caption transition-colors',
                          reached
                            ? 'border-success/30 bg-success-subtle/40 text-text-primary'
                            : 'border-border/60 bg-surface text-text-muted'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                              reached
                                ? 'bg-success text-on-success'
                                : 'bg-surface-raised border border-border text-text-muted'
                            )}
                          >
                            {reached ? <Check className="h-3 w-3" /> : `${m.pct}%`}
                          </span>
                          <span className={reached ? 'font-medium text-text-primary' : ''}>
                            {m.label}
                          </span>
                        </div>
                        <span className="font-numeric font-medium">{formatInr(m.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pace & Timeline Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
              <span className="text-caption text-text-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Deadline Pace</span>
              </span>
              <div className="font-numeric text-body-sm font-semibold text-text-primary">
                <DeadlineCountdownBadge targetDate={g.target_date} pace={g.pace} />
              </div>
              <div className="text-[11px] text-text-muted">
                {g.pace.isOverdue
                  ? 'Deadline has passed'
                  : `${g.pace.monthsRemaining} months remaining`}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
              <span className="text-caption text-text-muted flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span>Monthly Plan</span>
              </span>
              <div className="font-numeric text-body-sm font-semibold text-text-primary">
                {formatInr(g.monthly_contribution_plan)}/mo
              </div>
              <div className="text-[11px] text-text-muted">
                Recommended: {formatInr(g.pace.recommendedMonthly)}/mo
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
              <span className="text-caption text-text-muted flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Projected Completion</span>
              </span>
              <div className="font-numeric text-body-sm font-semibold text-text-primary">
                {g.pace.projectedCompletionDate ?? 'On track'}
              </div>
              <div className="text-[11px]">
                <OnTrackIndicator pace={g.pace} monthlyPlan={g.monthly_contribution_plan} />
              </div>
            </div>
          </div>

          {/* Interactive "What-If" Calculator Helper */}
          <div className="rounded-xl border border-border bg-surface-raised/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <h4 className="font-display text-body-md font-semibold text-text-primary">
                  &ldquo;What-If&rdquo; Pace Helper
                </h4>
              </div>
              <span className="text-caption text-text-muted">
                Explore scenarios &amp; optimize savings
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-caption">
                  <label className="text-text-muted font-medium block">
                    Simulate Monthly Contribution (₹):
                  </label>
                  {g.pace.recommendedMonthly > 0 && (
                    <button
                      type="button"
                      onClick={() => setWhatIfMonthly(String(g.pace.recommendedMonthly))}
                      className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Set Recommended ({formatInr(g.pace.recommendedMonthly)}/mo)</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={whatIfMonthly}
                      placeholder={String(
                        g.monthly_contribution_plan || g.pace.recommendedMonthly || 5000
                      )}
                      trailingIcon={<IndianRupee className="h-4 w-4 text-text-muted" />}
                      onChange={(e) => setWhatIfMonthly(e.target.value)}
                      className="font-numeric text-body-sm w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  {whatIfMonthly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWhatIfMonthly('')}
                      className="text-caption text-text-muted hover:text-text-primary shrink-0 h-9"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {/* Quick Scenario Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-text-muted mr-0.5">Quick Scenarios:</span>
                  {[
                    {
                      label: `Plan (${formatInr(g.monthly_contribution_plan)}/mo)`,
                      val: g.monthly_contribution_plan,
                    },
                    {
                      label: `Recommended (${formatInr(g.pace.recommendedMonthly)}/mo)`,
                      val: g.pace.recommendedMonthly,
                    },
                    { label: '+₹5k', val: customMonthlyNum + 5000 },
                    { label: '+₹10k', val: customMonthlyNum + 10000 },
                  ]
                    .filter((p) => p.val > 0)
                    .map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWhatIfMonthly(String(p.val))}
                        className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-primary/50 hover:bg-primary-subtle hover:text-primary cursor-pointer shadow-2xs"
                      >
                        {p.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Live Calculation Output Card */}
              <div className="rounded-xl border border-primary/25 bg-primary-subtle/30 p-4 space-y-1.5">
                <div className="text-caption font-semibold text-primary flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Scenario Projection Result</span>
                </div>
                <div className="text-body-sm text-text-primary font-medium leading-relaxed">
                  {whatIfResult.type === 'by_amount' && (
                    <>
                      Saving{' '}
                      <strong className="font-numeric text-text-primary font-bold">
                        {formatInr(customMonthlyNum)}/mo
                      </strong>{' '}
                      will finish this goal in{' '}
                      <strong className="text-primary font-bold">
                        {whatIfResult.monthsNeeded} months
                      </strong>{' '}
                      ({whatIfResult.projectedDate}).
                      <div className="mt-1 text-caption text-text-secondary font-numeric">
                        Pace: approx.{' '}
                        <strong className="text-text-primary">
                          {formatInr(whatIfResult.weeklyPace)}
                        </strong>{' '}
                        per week.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mini Goal Projection Timeline Chart */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-body-sm font-semibold text-text-primary">
                Savings Trajectory
              </h4>
              <span className="text-caption text-text-muted font-numeric">
                Target: {formatInr(g.target_amount)}
              </span>
            </div>
            <CartesianChart
              data={projectionTimeline}
              xKey="label"
              height={190}
              series={[
                { key: 'projected', label: 'Accumulated', type: 'area', color: SEMANTIC.savings },
                { key: 'target', label: 'Target', type: 'line', color: 'var(--accent)' },
              ]}
            />
          </div>

          {/* Contribution History Log */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-primary" />
                <h4 className="font-display text-body-md font-semibold text-text-primary">
                  Contribution History
                </h4>
                <span className="rounded-full bg-surface-raised px-2 py-0.5 text-caption font-medium border border-border text-text-secondary">
                  {g.contributions.length}
                </span>
              </div>

              <Button
                variant="subtle"
                size="sm"
                onClick={() => onAddMoney?.(g)}
                className="gap-1 text-caption"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Money</span>
              </Button>
            </div>

            {g.contributions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-caption text-text-muted">
                No contribution deposits recorded yet.
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={() => onAddMoney?.(g)}>
                    Add your first contribution
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {g.contributions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-raised/40 p-3 text-caption transition-colors hover:bg-surface-raised"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-numeric text-body-sm font-semibold text-text-primary">
                          +{formatInr(c.amount)}
                        </span>
                        {c.id.startsWith('c-init-') && (
                          <Badge
                            variant="subtle"
                            size="sm"
                            className="text-[10px] py-0 px-1.5 h-4.5 font-medium"
                          >
                            Initial Deposit
                          </Badge>
                        )}
                      </div>
                      <div className="text-text-muted flex items-center gap-2 text-[11px] truncate">
                        <span>{c.date}</span>
                        {c.note && (
                          <>
                            <span>•</span>
                            <span className="text-text-secondary italic truncate">{c.note}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {onDeleteContribution && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteContribution(g.id, c.id)}
                        className="h-7 w-7 p-0 text-text-muted hover:text-danger"
                        title="Delete contribution"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <DrawerFooter className="border-t border-border bg-surface-raised/40 p-4">
          <div className="flex w-full items-center justify-between gap-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete?.(g)}
              className="gap-1.5 text-caption whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Goal</span>
            </Button>

            <div className="flex items-center gap-2 shrink-0">
              <DrawerClose asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  Close
                </Button>
              </DrawerClose>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onAddMoney?.(g)}
                className="gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Money</span>
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
