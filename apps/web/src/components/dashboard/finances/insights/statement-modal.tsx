'use client';

import React, { useState } from 'react';
import { Download, FileText, Sparkles } from 'lucide-react';
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
import { DatePicker } from '@/components/ui/forms/date-picker';
import { formatInr, formatMonthLabel, getCurrentMonthString } from '@kalya/utils';
import type { StatementSummaryRecord } from './types';

// ============================================================
// 1. GENERATE STATEMENT MODAL (Uses DatePicker)
// ============================================================

interface GenerateStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMonth?: string;
  isGenerating?: boolean;
  onConfirmGenerate: (month: string) => Promise<void>;
}

export function GenerateStatementModal({
  open,
  onOpenChange,
  defaultMonth,
  isGenerating = false,
  onConfirmGenerate,
}: GenerateStatementModalProps) {
  const currentYm = defaultMonth || getCurrentMonthString();
  const [selectedDate, setSelectedDate] = useState<string>(`${currentYm}-01`);

  const handleGenerate = async () => {
    const ym = selectedDate.slice(0, 7);
    await onConfirmGenerate(ym);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle className="text-body-lg font-bold">Generate Monthly Statement</ModalTitle>
              <ModalDescription className="text-caption text-text-muted">
                Create an archived snapshot of your cashflow and outlays
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
              Statement Month
            </label>
            {/* Date selection using components/ui/forms/date-picker.tsx */}
            <DatePicker
              date={selectedDate}
              onDateChange={(_d, plainDate) => {
                if (plainDate) {
                  setSelectedDate(plainDate.toString());
                }
              }}
              placeholder="Pick month"
              formatStyle="card"
              clearable={false}
            />
            <span className="text-[11px] text-text-muted">
              Generates an immutable ledger snapshot for{' '}
              <strong className="text-text-primary">
                {formatMonthLabel(selectedDate.slice(0, 7))}
              </strong>
              .
            </span>
          </div>

          <div className="rounded-lg border border-border bg-surface-raised/70 p-3 text-caption text-text-secondary">
            💡 This snapshot archives your monthly bucket allocations, category spendings, and net
            savings for tax and historical reviews.
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isGenerating ? 'Generating…' : 'Generate Snapshot'}</span>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ============================================================
// 2. VIEW STATEMENT MODAL
// ============================================================

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
        </div>

        <ModalFooter>
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(statement)}
              className="gap-1.5 mr-auto"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download JSON</span>
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
