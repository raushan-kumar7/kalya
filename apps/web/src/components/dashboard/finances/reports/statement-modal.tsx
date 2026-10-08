'use client';

import React from 'react';
import { Calendar, CheckCircle2, Download, FileText, Printer, Sparkles, X } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/overlays/modal';
import { Button } from '@/components/ui/forms/button';
import { Badge } from '@/components/ui/data-display/badge';
import { formatCardDate, formatInr, formatMonthLabel } from '@kalya/utils';
import type { StatementSummaryRecord } from './types';

interface ViewStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statement: StatementSummaryRecord | null;
  onDownload?: (statement: StatementSummaryRecord) => void;
}

export function ViewStatementModal({
  open,
  onOpenChange,
  statement,
  onDownload,
}: ViewStatementModalProps) {
  if (!statement) return null;

  const bucketKeys = Object.keys(statement.bucketTotals || {});
  const categoryKeys = Object.keys(statement.categoryTotals || {});

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-xl">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle className="text-body-lg font-bold">
                Statement: {formatMonthLabel(statement.month)}
              </ModalTitle>
              <ModalDescription className="text-caption text-text-muted">
                Period: {statement.periodStart} to {statement.periodEnd}
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Summary Box */}
          <div className="rounded-xl border border-border bg-surface-raised p-4 flex items-center justify-between">
            <div>
              <span className="text-caption font-medium text-text-muted">
                Total Documented Outflow
              </span>
              <div className="font-numeric text-title-md font-bold text-text-primary mt-0.5">
                {formatInr(statement.totalSpent)}
              </div>
            </div>
            <Badge variant="success" size="sm">
              Archived Snapshot
            </Badge>
          </div>

          {/* Bucket Totals Snapshot */}
          <div>
            <h4 className="font-semibold text-body-sm text-text-primary mb-2">
              Bucket Totals Snapshot
            </h4>
            {bucketKeys.length === 0 ? (
              <p className="text-caption text-text-muted italic">
                No buckets logged in this snapshot.
              </p>
            ) : (
              <div className="rounded-lg border border-border divide-y divide-border/60 text-body-sm">
                {bucketKeys.map((k) => {
                  const b = statement.bucketTotals[k];
                  return (
                    <div key={k} className="p-2.5 flex items-center justify-between">
                      <span className="font-medium text-text-secondary truncate pr-2">
                        Bucket ID: {k.slice(0, 8)}…
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-numeric font-semibold text-text-primary">
                          {formatInr(b.spent)}
                        </span>
                        <Badge variant="subtle" size="sm">
                          {b.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timestamp Info */}
          <div className="text-[11px] text-text-muted border-t border-border/60 pt-2 flex items-center justify-between">
            <span>Generated At: {formatCardDate(statement.generatedAt)}</span>
            <span>Record ID: {statement.id.slice(0, 8)}</span>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>

          {onDownload && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onDownload(statement)}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download JSON</span>
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface GenerateStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMonth: string;
  isGenerating?: boolean;
  onConfirmGenerate: (month: string) => Promise<void>;
}

export function GenerateStatementModal({
  open,
  onOpenChange,
  selectedMonth,
  isGenerating,
  onConfirmGenerate,
}: GenerateStatementModalProps) {
  const [monthInput, setMonthInput] = React.useState(selectedMonth);

  React.useEffect(() => {
    setMonthInput(selectedMonth);
  }, [selectedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmGenerate(monthInput);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <ModalTitle className="text-body-lg font-bold">
                  Generate Monthly Statement
                </ModalTitle>
                <ModalDescription className="text-caption text-text-muted">
                  Create an immutable snapshot of your monthly finances
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <div className="py-4 flex flex-col gap-3">
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Generating a statement will compute and store the final expenditure totals, bucket
              budget adherence, and category breakdowns for{' '}
              <strong className="text-text-primary">{formatMonthLabel(monthInput)}</strong>.
            </p>

            <div>
              <label
                htmlFor="statement-month"
                className="text-caption font-medium text-text-secondary mb-1.5 block"
              >
                Target Month (YYYY-MM)
              </label>
              <input
                id="statement-month"
                type="month"
                value={monthInput}
                onChange={(e) => setMonthInput(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body-sm font-numeric text-text-primary focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isGenerating} className="gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isGenerating ? 'Generating…' : 'Generate Snapshot'}</span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
