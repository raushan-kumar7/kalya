'use client';

import React, { useState } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  Calendar,
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/forms/button';
import { Switch } from '@/components/ui/forms/switch';
import { Badge } from '@/components/ui/data-display/badge';
import { DatePicker } from '@/components/ui/forms/date-picker';
import type { DateRangePeriod, ReportRangePreset } from './types';

interface ReportsToolbarProps {
  preset: ReportRangePreset;
  onPresetChange: (preset: ReportRangePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (val: string) => void;
  onCustomEndChange: (val: string) => void;
  compareWithPrevious: boolean;
  onCompareToggle: (val: boolean) => void;
  currentPeriod: DateRangePeriod;
  previousPeriod: DateRangePeriod;
  onExportCsv: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onGenerateStatementClick: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const PRESET_OPTIONS: { id: ReportRangePreset; label: string }[] = [
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'last_3_months', label: 'Last 3 Months' },
  { id: 'last_6_months', label: 'Last 6 Months' },
  { id: 'last_12_months', label: 'Last 12 Months' },
  { id: 'financial_year', label: 'Financial Year (Apr–Mar)' },
  { id: 'custom', label: 'Custom Range' },
];

export function ReportsToolbar({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  compareWithPrevious,
  onCompareToggle,
  currentPeriod,
  previousPeriod,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  onGenerateStatementClick,
  onRefresh,
  isLoading,
}: ReportsToolbarProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Range Presets & Custom Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap rounded-lg bg-surface-raised p-1 border border-border/80">
            {PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPresetChange(opt.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-caption font-medium transition-colors cursor-pointer select-none',
                  preset === opt.id
                    ? 'bg-surface text-text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers if preset is custom */}
          {preset === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in-50 duration-150">
              <DatePicker
                size="sm"
                date={customStart || undefined}
                onDateChange={(_d, plainDate) =>
                  onCustomStartChange(plainDate ? plainDate.toString() : '')
                }
                placeholder="Start date"
                formatStyle="short"
                aria-label="Start date"
                className="w-36"
              />
              <span className="text-caption text-text-muted">to</span>
              <DatePicker
                size="sm"
                date={customEnd || undefined}
                onDateChange={(_d, plainDate) =>
                  onCustomEndChange(plainDate ? plainDate.toString() : '')
                }
                placeholder="End date"
                formatStyle="short"
                aria-label="End date"
                className="w-36"
              />
            </div>
          )}
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Compare with Previous Period toggle */}
          <div className="flex items-center gap-2 border-r border-border/80 pr-3">
            <Switch
              size="sm"
              checked={compareWithPrevious}
              onCheckedChange={onCompareToggle}
              id="compare-period-toggle"
            />
            <label
              htmlFor="compare-period-toggle"
              className="text-caption font-medium text-text-secondary cursor-pointer select-none"
            >
              Compare with previous period
            </label>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 px-2.5"
              aria-label="Refresh Data"
            >
              <RotateCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            </Button>
          )}

          {/* Export Menu Dropdown */}
          <DropdownMenuPrimitive.Root open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DropdownMenuPrimitive.Trigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuPrimitive.Trigger>

            <DropdownMenuPrimitive.Portal>
              <DropdownMenuPrimitive.Content
                align="end"
                sideOffset={6}
                className="z-50 min-w-44 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-card animate-in fade-in-80 zoom-in-95"
              >
                <DropdownMenuPrimitive.Item
                  onClick={onExportCsv}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-body-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary cursor-pointer select-none outline-none"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Export CSV</span>
                </DropdownMenuPrimitive.Item>

                <DropdownMenuPrimitive.Item
                  onClick={onExportExcel}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-body-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary cursor-pointer select-none outline-none"
                >
                  <FileSpreadsheet className="h-4 w-4 text-success" />
                  <span>Export Excel (.csv)</span>
                </DropdownMenuPrimitive.Item>

                <DropdownMenuPrimitive.Item
                  onClick={onExportPdf}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-body-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary cursor-pointer select-none outline-none"
                >
                  <Printer className="h-4 w-4 text-accent" />
                  <span>Print / PDF Report</span>
                </DropdownMenuPrimitive.Item>
              </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
          </DropdownMenuPrimitive.Root>

          {/* Generate Statement Button */}
          <Button
            variant="default"
            size="sm"
            onClick={onGenerateStatementClick}
            className="h-8 gap-1.5 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Statement</span>
          </Button>
        </div>
      </div>

      {/* Period Description Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-border/60 text-caption text-text-muted">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-primary opacity-80" />
          <span className="font-medium text-text-secondary">{currentPeriod.label}</span>
          {compareWithPrevious && (
            <>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted">
                Comparing to:{' '}
                <strong className="text-text-secondary font-medium">{previousPeriod.label}</strong>
              </span>
            </>
          )}
        </div>

        <div className="font-numeric text-[11px] text-text-muted">
          {currentPeriod.months.length} {currentPeriod.months.length === 1 ? 'month' : 'months'} in
          view
        </div>
      </div>
    </div>
  );
}
