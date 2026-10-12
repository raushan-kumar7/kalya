'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Target, PieChart, Layers } from 'lucide-react';
import { formatInrPrecise } from '@kalya/utils';
import type { StatementData } from './types';
import { Badge } from '@/components/ui/data-display/badge';

interface StatementKpisProps {
  statement: StatementData;
}

export function StatementKpis({ statement }: StatementKpisProps) {
  const { kpis, buckets, categories } = statement;

  return (
    <div className="flex flex-col gap-5 my-6 page-break-inside-avoid">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="font-display text-body-md font-bold text-text-primary flex items-center gap-2">
          <span>Financial Summary</span>
        </h3>
        <span className="text-caption text-text-muted font-body">
          Section 1 · Overview of Inflows, Outflows &amp; Savings
        </span>
      </div>

      {/* 1. Primary 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Income */}
        <div className="rounded-xl border border-border bg-surface-raised p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-caption text-text-muted">
            <span className="font-medium uppercase tracking-wider text-[11px] font-body">
              Total Income
            </span>
            <div className="h-6 w-6 rounded-md bg-success-subtle text-success flex items-center justify-center">
              <ArrowDownRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-numeric text-title-sm font-bold text-success">
              {formatInrPrecise(kpis.totalIncome)}
            </div>
            <span className="text-[11px] text-text-muted font-body">
              {kpis.incomesCount} {kpis.incomesCount === 1 ? 'income deposit' : 'income deposits'}
            </span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="rounded-xl border border-border bg-surface-raised p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-caption text-text-muted">
            <span className="font-medium uppercase tracking-wider text-[11px] font-body">
              Total Spent
            </span>
            <div className="h-6 w-6 rounded-md bg-danger-subtle text-danger flex items-center justify-center">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-numeric text-title-sm font-bold text-text-primary">
              {formatInrPrecise(kpis.totalExpenses)}
            </div>
            <span className="text-[11px] text-text-muted font-body">
              {kpis.expensesCount}{' '}
              {kpis.expensesCount === 1 ? 'expense recorded' : 'expenses recorded'}
            </span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="rounded-xl border border-border bg-surface-raised p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-caption text-text-muted">
            <span className="font-medium uppercase tracking-wider text-[11px] font-body">
              Net Savings
            </span>
            <div className="h-6 w-6 rounded-md bg-primary-subtle text-primary flex items-center justify-center">
              <PiggyBank className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div
              className={`font-numeric text-title-sm font-bold ${
                kpis.netSavings >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {formatInrPrecise(kpis.netSavings)}
            </div>
            <span className="text-[11px] text-text-muted font-body">
              {kpis.savingsRate}% of income saved
            </span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="rounded-xl border border-border bg-surface-raised p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-caption text-text-muted">
            <span className="font-medium uppercase tracking-wider text-[11px] font-body">
              Savings Rate
            </span>
            <div className="h-6 w-6 rounded-md bg-accent-subtle text-accent-strong flex items-center justify-center">
              <Target className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-numeric text-title-sm font-bold text-accent-strong">
              {kpis.savingsRate}%
            </div>
            <span className="text-[11px] text-text-muted font-body">
              {kpis.unsettledSplits > 0
                ? `${formatInrPrecise(kpis.unsettledSplits)} in split bills`
                : 'All split bills settled ✓'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Bucket Totals & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bucket Allocations */}
        <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="font-body text-body-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              <span>Budget Rule Breakdown (50 / 30 / 20)</span>
            </span>
          </div>

          {buckets.length === 0 ? (
            <p className="text-caption text-text-muted italic py-2">
              No bucket allocations recorded for this period.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {buckets.map((bucket) => (
                <div key={bucket.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-caption font-body">
                    <span className="font-medium text-text-secondary">{bucket.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-numeric font-semibold text-text-primary">
                        {formatInrPrecise(bucket.spent)}
                      </span>
                      {bucket.budgeted > 0 && (
                        <span className="text-text-muted text-[11px] font-numeric">
                          / {formatInrPrecise(bucket.budgeted)}
                        </span>
                      )}
                      <Badge
                        variant={
                          bucket.status === 'over'
                            ? 'danger'
                            : bucket.status === 'near'
                              ? 'warning'
                              : 'success'
                        }
                        size="sm"
                      >
                        {bucket.percent}%
                      </Badge>
                    </div>
                  </div>
                  {bucket.budgeted > 0 && (
                    <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          bucket.percent > 100
                            ? 'bg-danger'
                            : bucket.percent >= 85
                              ? 'bg-warning'
                              : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, bucket.percent)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Spending Categories */}
        <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="font-body text-body-sm font-semibold text-text-primary flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-accent-strong" />
              <span>Top Expense Categories</span>
            </span>
          </div>

          {categories.length === 0 ? (
            <p className="text-caption text-text-muted italic py-2 font-body">
              No categorized expenses logged.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {categories.slice(0, 5).map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between text-caption py-1 font-body"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || '#0d3e26' }}
                    />
                    <span className="font-medium text-text-secondary truncate max-w-44">
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-text-muted">({cat.count})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-numeric font-semibold text-text-primary">
                      {formatInrPrecise(cat.amount)}
                    </span>
                    <span className="text-[11px] font-numeric text-text-muted w-10 text-right">
                      {cat.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
