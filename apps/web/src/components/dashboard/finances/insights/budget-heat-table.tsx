'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { formatCompactInr, formatInr, formatPercent } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { Badge } from '@/components/ui/data-display/badge';
import { KpiCard, KpiGrid } from '@/components/shared';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import type { BudgetHeatCell, BudgetHeatRow } from './types';

interface BudgetHeatTableProps {
  rows: BudgetHeatRow[];
  months: { key: string; label: string }[];
  isLoading?: boolean;
  onSelectCell?: (bucketId: string, month: string) => void;
}

export function BudgetHeatTable({ rows, months, isLoading, onSelectCell }: BudgetHeatTableProps) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-muted">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="font-medium text-body-sm">No budget history available for this period.</p>
        <p className="text-caption mt-1">Set up monthly budgets to track adherence over time.</p>
      </div>
    );
  }

  // Calculate overall adherence stats
  const totalCells = rows.reduce((acc, r) => acc + r.cells.length, 0);
  const overCount = rows.reduce((acc, r) => acc + r.monthsOverBudget, 0);
  const withinPct =
    totalCells > 0 ? Math.round(((totalCells - overCount) / totalCells) * 100) : 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner stats */}
      <KpiGrid cols={3}>
        <KpiCard
          title="Overall Adherence"
          value={`${withinPct}%`}
          badge="On Track"
          icon={ShieldCheck}
          tone="positive"
          size="sm"
        />

        <KpiCard
          title="Total Over-Budget Instances"
          value={`${overCount} ${overCount === 1 ? 'month' : 'months'}`}
          icon={AlertCircle}
          tone={overCount > 0 ? 'negative' : 'positive'}
          size="sm"
        />

        <KpiCard
          title="Buckets Monitored"
          value={`${rows.length} Buckets`}
          icon={Target}
          tone="default"
          size="sm"
        />
      </KpiGrid>

      {/* Heatmap Grid Matrix */}
      <div className="rounded-xl border border-border bg-surface shadow-card p-4 overflow-hidden">
        <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-display text-body-md font-semibold text-text-primary">
              Budget Adherence Heat Table
            </h3>
            <p className="text-caption text-text-muted">
              Monthly spending vs allocated budget across financial buckets
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-caption text-text-muted">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-success/30 border border-success/60" />
              <span>≤80% (Within)</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-warning/30 border border-warning/60" />
              <span>81-100% (Caution)</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-danger/30 border border-danger/60" />
              <span>&gt;100% (Over)</span>
            </span>
          </div>
        </header>

        <div className="overflow-x-auto min-h-0">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-3 min-w-40">Bucket</th>
                {months.map((m) => (
                  <th key={m.key} className="py-3 px-2 text-center min-w-28">
                    {m.label}
                  </th>
                ))}
                <th className="py-3 px-3 text-center min-w-28">Over-Budget</th>
                <th className="py-3 px-3 text-right min-w-24">Adherence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row) => (
                <tr key={row.bucketId} className="hover:bg-surface-raised/40 transition-colors">
                  {/* Bucket Header */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: row.color || 'var(--primary)' }}
                      />
                      <div>
                        <div className="font-semibold text-text-primary">{row.bucketName}</div>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                          {row.bucketType}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Monthly Heat Cells */}
                  {row.cells.map((cell) => {
                    const isWithin = cell.status === 'within';
                    const isWarning = cell.status === 'warning';
                    const isOver = cell.status === 'over';

                    return (
                      <td key={cell.month} className="py-2.5 px-1.5 text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                onClick={() => onSelectCell?.(row.bucketId, cell.month)}
                                className={cn(
                                  'rounded-lg p-2 transition-all cursor-pointer border text-center select-none shadow-2xs hover:scale-105',
                                  isWithin &&
                                    'bg-success-subtle/50 border-success/30 hover:border-success/60 text-success',
                                  isWarning &&
                                    'bg-warning-subtle/50 border-warning/30 hover:border-warning/60 text-warning',
                                  isOver &&
                                    'bg-danger-subtle/50 border-danger/30 hover:border-danger/60 text-danger',
                                  cell.status === 'unbudgeted' &&
                                    'bg-surface-raised border-border/60 text-text-muted'
                                )}
                              >
                                <div className="font-numeric font-bold text-caption leading-tight">
                                  {cell.budgeted > 0 ? `${Math.round(cell.pct)}%` : '—'}
                                </div>
                                <div className="font-numeric text-[10px] opacity-80 mt-0.5">
                                  {formatCompactInr(cell.spent)}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="text-caption">
                                <div className="font-semibold">
                                  {row.bucketName} • {cell.monthLabel}
                                </div>
                                <div>Spent: {formatInr(cell.spent)}</div>
                                <div>Budget: {formatInr(cell.budgeted)}</div>
                                <div className="mt-1 font-semibold">
                                  {isOver
                                    ? '⚠️ Over budget'
                                    : isWarning
                                      ? '⚡ Near limit'
                                      : '✅ Within target'}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    );
                  })}

                  {/* Months Over Budget Count */}
                  <td className="py-3 px-3 text-center">
                    {row.monthsOverBudget > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-caption font-semibold bg-danger-subtle text-danger border border-danger/30">
                        {row.monthsOverBudget} {row.monthsOverBudget === 1 ? 'month' : 'months'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-caption font-semibold bg-success-subtle text-success border border-success/30">
                        0 months
                      </span>
                    )}
                  </td>

                  {/* Average Adherence */}
                  <td className="py-3 px-3 text-right font-numeric font-semibold text-text-primary">
                    {Math.round(row.averageAdherencePct)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
