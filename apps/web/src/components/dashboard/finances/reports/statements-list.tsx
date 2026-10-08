'use client';

import React from 'react';
import {
  Calendar,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Plus,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { formatCardDate, formatInr, formatMonthLabel } from '@kalya/utils';
import { Button } from '@/components/ui/forms/button';
import { Badge } from '@/components/ui/data-display/badge';
import type { StatementSummaryRecord } from './types';

interface StatementsListProps {
  statements: StatementSummaryRecord[];
  isLoading?: boolean;
  onViewStatement?: (statement: StatementSummaryRecord) => void;
  onDownloadStatement?: (statement: StatementSummaryRecord) => void;
  onGenerateClick?: () => void;
}

export function StatementsList({
  statements,
  isLoading,
  onViewStatement,
  onDownloadStatement,
  onGenerateClick,
}: StatementsListProps) {
  if (statements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-xl bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="font-display font-semibold text-body-lg text-text-primary">
          No Monthly Statements Generated
        </h3>
        <p className="text-caption text-text-secondary max-w-sm mt-1 mb-5">
          Generate an immutable monthly snapshot to archive your bucket budgets, category spending,
          and total outlays.
        </p>
        <Button onClick={onGenerateClick} className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Generate Statement</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card p-4">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-display text-body-md font-semibold text-text-primary">
            Saved Ledger Statements
          </h3>
          <p className="text-caption text-text-muted">
            Official monthly snapshots with archived category and bucket breakdowns
          </p>
        </div>

        <Button
          onClick={onGenerateClick}
          variant="outline"
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Statement</span>
        </Button>
      </header>

      <div className="overflow-x-auto min-h-0">
        <table className="w-full text-left border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              <th className="py-2.5 px-3">Statement Month</th>
              <th className="py-2.5 px-3">Period Window</th>
              <th className="py-2.5 px-3 text-right">Total Outlay</th>
              <th className="py-2.5 px-3 text-center">Buckets</th>
              <th className="py-2.5 px-3 text-center">Categories</th>
              <th className="py-2.5 px-3">Generated At</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {statements.map((s) => {
              const bucketCount = Object.keys(s.bucketTotals || {}).length;
              const catCount = Object.keys(s.categoryTotals || {}).length;

              return (
                <tr key={s.id} className="hover:bg-surface-raised/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-text-primary">
                    {formatMonthLabel(s.month)}
                  </td>
                  <td className="py-3 px-3 text-caption text-text-secondary font-mono">
                    {s.periodStart} → {s.periodEnd}
                  </td>
                  <td className="py-3 px-3 text-right font-numeric font-bold text-text-primary">
                    {formatInr(s.totalSpent)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant="subtle" size="sm">
                      {bucketCount} buckets
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant="secondary" size="sm">
                      {catCount} categories
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-caption text-text-muted">
                    {formatCardDate(s.generatedAt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewStatement?.(s)}
                        className="h-8 px-2 gap-1 text-text-secondary hover:text-text-primary"
                        aria-label="View Statement"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadStatement?.(s)}
                        className="h-8 px-2 gap-1 text-text-secondary hover:text-text-primary"
                        aria-label="Download Statement"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>JSON</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
