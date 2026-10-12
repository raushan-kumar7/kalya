'use client';

import React from 'react';
import { BarChart2, Calendar, Search, Table2, X } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import type { Granularity, ReportTab, ViewMode } from './types';

interface TabToolbarProps {
  activeTab: ReportTab;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  granularity: Granularity;
  onGranularityChange: (g: Granularity) => void;
}

export function TabToolbar({
  activeTab,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  granularity,
  onGranularityChange,
}: TabToolbarProps) {
  const supportsGranularity =
    viewMode === 'chart' && (activeTab === 'income' || activeTab === 'expenses');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-border/60">
      {/* Left: View Mode Toggle (Chart vs Table) */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center rounded-lg bg-surface-raised p-1 border border-border/80 shadow-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('chart')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-caption font-medium transition-colors cursor-pointer select-none',
              viewMode === 'chart'
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Chart</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-caption font-medium transition-colors cursor-pointer select-none',
              viewMode === 'table'
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Table2 className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>

        {/* Granularity switch (Daily / Weekly / Monthly) for time charts */}
        {supportsGranularity && (
          <div className="hidden md:inline-flex items-center rounded-lg bg-surface-raised p-1 border border-border/80 shadow-xs animate-in fade-in-50">
            {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGranularityChange(g)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer select-none',
                  granularity === g
                    ? 'bg-surface text-text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Search Input */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Input
            size="sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${activeTab}…`}
            leadingIcon={<Search className="h-3.5 w-3.5 text-text-muted" />}
            clearable
            className="h-8 text-body-sm bg-surface shadow-xs"
          />
        </div>
      </div>
    </div>
  );
}
