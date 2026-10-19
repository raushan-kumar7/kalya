'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Printer, Sparkles, Calendar, X } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from '@/components/ui/overlays/modal';
import { Button } from '@/components/ui/forms/button';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays/popover';
import { toast } from '@/components/ui/feedback';
import { cn } from '@/libs/utils';
import { useStatementData } from '@/hooks/finances/use-statement-data';
import { StatementHeader } from './statement-header';
import { StatementKpis } from './statement-kpis';
import { StatementExpensesTable } from './statement-expenses-table';
import { StatementFullLedger } from './statement-full-ledger';
import { StatementFooter } from './statement-footer';
import { exportStatementToExcel } from '@/libs/export/statement-excel';
import { exportStatementToPdf, printStatementReport } from '@/libs/export/statement-pdf';
import type { StatementPeriodPreset, StatementScope } from './types';
import { getCurrentMonthString } from '@kalya/utils';

export interface StatementViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPreset?: StatementPeriodPreset;
}

export function StatementViewerModal({
  open,
  onOpenChange,
  initialPreset = 'this_month',
}: StatementViewerModalProps) {
  const currentYm = getCurrentMonthString();
  const [preset, setPreset] = useState<StatementPeriodPreset>(initialPreset);
  const [scope, setScope] = useState<StatementScope>('expenses');
  const [customStart, setCustomStart] = useState<string>(`${currentYm}-01`);
  const [customEnd, setCustomEnd] = useState<string>(`${currentYm}-31`);
  const [isCustomPopoverOpen, setIsCustomPopoverOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { statementData, isLoading } = useStatementData({
    preset,
    customStart,
    customEnd,
    scope,
  });

  const handleDownloadExcel = async () => {
    try {
      setIsExportingExcel(true);
      await exportStatementToExcel(statementData);
      toast.success('Excel workbook downloaded successfully');
    } catch {
      toast.error('Failed to generate Excel file');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportStatementToPdf(statementData);
      toast.success('PDF statement downloaded successfully');
    } catch {
      toast.error('Failed to generate PDF statement');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    try {
      printStatementReport('kalya-statement-document');
    } catch {
      toast.error('Failed to trigger print');
    }
  };

  const PRESETS: { id: StatementPeriodPreset; label: string }[] = [
    { id: 'this_month', label: 'Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'last_3_months', label: 'Last 3 Months' },
    { id: 'custom', label: 'Custom Date' },
  ];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl" hideClose className="max-w-5xl h-[92vh] flex flex-col p-0">
        {/* Modal Header */}
        <ModalHeader
          tone="default"
          icon={<Sparkles className="h-5 w-5 text-primary" />}
          className="px-6 py-4 border-b border-border bg-surface shrink-0"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div>
              <ModalTitle className="text-body-lg font-bold text-text-primary font-display">
                Financial Statement
              </ModalTitle>
              <ModalDescription className="text-caption text-text-muted font-body">
                Review your income, expenses, and budget progress with downloadable PDF and Excel
                reports
              </ModalDescription>
            </div>

            {/* Quick Export Actions & Aligned Close Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadExcel}
                disabled={isExportingExcel || isLoading}
                className="gap-1.5 h-8 text-caption cursor-pointer shadow-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{isExportingExcel ? 'Exporting…' : 'Export Excel'}</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf || isLoading}
                className="gap-1.5 h-8 text-caption cursor-pointer shadow-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isExportingPdf ? 'Generating…' : 'Download PDF'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={isLoading}
                className="gap-1.5 h-8 text-caption cursor-pointer shadow-xs"
                title="Print Document"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print</span>
              </Button>

              {/* Vertical divider */}
              <div className="h-4 w-px bg-border mx-0.5" />

              {/* Explicit Aligned Close Button */}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 text-text-muted hover:text-text-primary hover:bg-surface-raised cursor-pointer rounded-lg shrink-0"
                aria-label="Close statement modal"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ModalHeader>

        {/* Toolbar: Preset Selector & Scope Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 border-b border-border bg-surface-raised shrink-0">
          {/* Left: Period Preset Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider mr-1 hidden sm:inline">
              Period:
            </span>
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1 shadow-xs">
              {PRESETS.map((p) => {
                const isSelected = preset === p.id;
                if (p.id === 'custom') {
                  return (
                    <Popover
                      key={p.id}
                      open={isCustomPopoverOpen}
                      onOpenChange={setIsCustomPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setPreset('custom');
                            setIsCustomPopoverOpen(true);
                          }}
                          className={cn(
                            'flex items-center gap-1 rounded-md px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer select-none',
                            isSelected
                              ? 'bg-primary-subtle text-primary font-semibold shadow-xs'
                              : 'text-text-muted hover:text-text-primary hover:bg-surface-raised'
                          )}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>Custom Date</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-80 p-4 shadow-raised">
                        <div className="flex flex-col gap-3">
                          <div className="font-semibold text-body-sm text-text-primary border-b border-border pb-1.5">
                            Pick Custom Date Window
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-text-muted uppercase">
                              Start Date
                            </label>
                            <DatePicker
                              date={customStart}
                              onDateChange={(_d, plainDate) => {
                                if (plainDate) setCustomStart(plainDate.toString());
                              }}
                              formatStyle="card"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-text-muted uppercase">
                              End Date
                            </label>
                            <DatePicker
                              date={customEnd}
                              onDateChange={(_d, plainDate) => {
                                if (plainDate) setCustomEnd(plainDate.toString());
                              }}
                              formatStyle="card"
                            />
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsCustomPopoverOpen(false)}
                            className="mt-1"
                          >
                            Apply Filter
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                }

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer select-none',
                      isSelected
                        ? 'bg-primary-subtle text-primary font-semibold shadow-xs'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-raised'
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Scope Switch (Expenses vs Full Statement) */}
          <div className="flex items-center gap-1.5">
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider mr-1 hidden sm:inline">
              Scope:
            </span>
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setScope('expenses')}
                className={cn(
                  'rounded-md px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer select-none',
                  scope === 'expenses'
                    ? 'bg-primary-subtle text-primary font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-raised'
                )}
              >
                Expenses Statement
              </button>
              <button
                type="button"
                onClick={() => setScope('full')}
                className={cn(
                  'rounded-md px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer select-none',
                  scope === 'full'
                    ? 'bg-primary-subtle text-primary font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-raised'
                )}
              >
                Full Statement (All Streams)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Statement Document Preview */}
        <ModalBody className="flex-1 overflow-y-auto p-4 sm:p-6 bg-bg/50">
          <div className="max-w-4xl mx-auto">
            {/* The Document Wrapper matching exact PDF Layout */}
            <div
              id="kalya-statement-document"
              className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card text-text-primary transition-colors"
            >
              {/* Header: Company Details & User Details */}
              <StatementHeader statement={statementData} />

              {/* Body Section 1: KPI Deck, Buckets & Category Totals */}
              <StatementKpis statement={statementData} />

              {/* Body Section 2: Date-Wise Itemized Expenses */}
              <StatementExpensesTable statement={statementData} />

              {/* Body Section 3: Incomes & Full Ledger (when full statement active) */}
              <StatementFullLedger statement={statementData} />

              {/* Footer: Certification, Timestamp & Legal Notice */}
              <StatementFooter statement={statementData} />
            </div>
          </div>
        </ModalBody>

        {/* Modal Footer with Close Button */}
        <ModalFooter className="px-6 py-3 border-t border-border bg-surface shrink-0 flex items-center justify-between">
          <div className="text-caption text-text-muted">
            Displaying statement for{' '}
            <strong className="text-text-primary">{statementData.period.label}</strong>
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
