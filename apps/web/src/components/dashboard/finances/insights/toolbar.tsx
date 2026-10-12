'use client';

import React, { useState } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  Calendar as CalendarIcon,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import { getCurrentMonthString, formatMonthLabel } from '@kalya/utils';
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
  onExportCsv: () => void;
  onExportPdf: () => void;
  onGenerateStatementClick: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

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
  onExportCsv,
  onExportPdf,
  onGenerateStatementClick,
  onRefresh,
  isLoading,
}: ReportsToolbarProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  // Dynamic current month name for "This Month"
  const currentMonthKey = getCurrentMonthString();
  const currentMonthName = formatMonthLabel(currentMonthKey).split(' ')[0]; // e.g. "October"

  const PRESET_OPTIONS: { id: ReportRangePreset; label: string }[] = [
    { id: 'this_month', label: currentMonthName },
    { id: 'last_month', label: 'Last Month' },
    { id: 'last_3_months', label: '3 Months' },
    { id: 'last_6_months', label: '6 Months' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <header className="z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Range Presets & Compare Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Control */}
          <div className="inline-flex items-center rounded-lg bg-surface-raised p-1 border border-border/80 shadow-xs">
            {PRESET_OPTIONS.map((opt) => {
              const isSelected = preset === opt.id;
              if (opt.id === 'custom') {
                return (
                  <Popover key={opt.id} open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          onPresetChange('custom');
                          setIsCustomOpen(true);
                        }}
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer select-none',
                          isSelected
                            ? 'bg-surface text-text-primary shadow-xs font-semibold'
                            : 'text-text-muted hover:text-text-primary'
                        )}
                      >
                        <CalendarIcon className="h-3 w-3 opacity-70" />
                        <span>Custom</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={8}
                      className="w-80 p-4 bg-surface border border-border rounded-xl shadow-2xl"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <span className="text-body-sm font-semibold text-text-primary">
                            Custom Date Range
                          </span>
                          <span className="text-[11px] text-text-muted">Pick dates</span>
                        </div>

                        {/* Dual DatePicker from components/ui/forms/date-picker */}
                        <div className="flex flex-col gap-2.5">
                          <div>
                            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                              Start Date
                            </label>
                            <DatePicker
                              size="sm"
                              date={customStart || undefined}
                              onDateChange={(_d, plainDate) =>
                                onCustomStartChange(plainDate ? plainDate.toString() : '')
                              }
                              placeholder="Select start date"
                              formatStyle="card"
                              clearable={false}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                              End Date
                            </label>
                            <DatePicker
                              size="sm"
                              date={customEnd || undefined}
                              onDateChange={(_d, plainDate) =>
                                onCustomEndChange(plainDate ? plainDate.toString() : '')
                              }
                              placeholder="Select end date"
                              formatStyle="card"
                              clearable={false}
                            />
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setIsCustomOpen(false)}
                          className="w-full mt-1"
                        >
                          Apply Range
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onPresetChange(opt.id)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer select-none',
                    isSelected
                      ? 'bg-surface text-text-primary shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Compare Toggle */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/80 bg-surface/70">
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
              Compare
            </label>
          </div>
        </div>

        {/* Right: Refresh & Actions Button */}
        <div className="flex items-center gap-2.5">
          {/* Refresh Tooltip Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                  aria-label="Refresh Data"
                >
                  <RotateCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <span className="text-caption">Last updated just now · Click to refresh</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Actions Dropdown: Export (CSV/PDF) and Generate Statement */}
          <DropdownMenuPrimitive.Root open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <DropdownMenuPrimitive.Trigger asChild>
              <Button variant="primary" size="sm" className="h-8 gap-1.5 shadow-xs">
                <span>Actions</span>
                <ChevronDown className="h-3 w-3 opacity-80" />
              </Button>
            </DropdownMenuPrimitive.Trigger>

            <DropdownMenuPrimitive.Portal>
              <DropdownMenuPrimitive.Content
                align="end"
                sideOffset={6}
                className="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-card animate-in fade-in-80 zoom-in-95"
              >
                <DropdownMenuPrimitive.Item
                  onClick={onGenerateStatementClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-raised cursor-pointer select-none outline-none"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Generate Statement</span>
                </DropdownMenuPrimitive.Item>

                <div className="h-px bg-border/60 my-1" />

                <DropdownMenuPrimitive.Item
                  onClick={onExportCsv}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary cursor-pointer select-none outline-none"
                >
                  <FileText className="h-4 w-4 text-emerald-500" />
                  <span>Export CSV</span>
                </DropdownMenuPrimitive.Item>

                <DropdownMenuPrimitive.Item
                  onClick={onExportPdf}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary cursor-pointer select-none outline-none"
                >
                  <Printer className="h-4 w-4 text-accent" />
                  <span>Print / PDF Report</span>
                </DropdownMenuPrimitive.Item>
              </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
          </DropdownMenuPrimitive.Root>
        </div>
      </div>
    </header>
  );
}
