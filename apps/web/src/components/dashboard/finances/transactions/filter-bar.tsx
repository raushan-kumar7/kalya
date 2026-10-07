'use client';

import React from 'react';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/forms/button';
import { Download, RotateCcw, Search, X } from 'lucide-react';
import type { Category } from '@kalya/types';
import type { TransactionFilterState, TransactionTab, UnifiedTransactionItem } from './types';
import { ColumnVisibilityMenu, type ColumnVisibilityState } from './table/column-visibility-menu';
import { exportTransactionsToCsv } from './table/export-csv';
import { PAYMENT_OPTIONS } from '@/components/forms/finances/transactions/helper';
import { cn } from '@/libs/utils';

export interface FilterBarProps {
  filters: TransactionFilterState;
  onFilterChange: (partial: Partial<TransactionFilterState>) => void;
  onResetFilters: () => void;
  isFilterActive: boolean;
  activeTab: TransactionTab;
  onTabChange: (tab: TransactionTab) => void;
  tabCounts: {
    all: number;
    expense: number;
    split: number;
    income: number;
  };
  categories: Category[];
  columnVisibility: ColumnVisibilityState;
  onToggleColumnVisibility: (col: keyof ColumnVisibilityState) => void;
  onResetColumnVisibility: () => void;
  items: UnifiedTransactionItem[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  isFilterActive,
  activeTab,
  onTabChange,
  tabCounts,
  categories,
  columnVisibility,
  onToggleColumnVisibility,
  onResetColumnVisibility,
  items,
  totalRecordsCount,
  filteredRecordsCount,
}: FilterBarProps) {
  const tabs: { id: TransactionTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: tabCounts.all },
    { id: 'expense', label: 'Expenses', count: tabCounts.expense },
    { id: 'split', label: 'Split Bills', count: tabCounts.split },
    { id: 'income', label: 'Incomes', count: tabCounts.income },
  ];

  // Helper labels for active filter chips
  const activeCategoryLabels = React.useMemo(() => {
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      return filters.categoryIds
        .map((id) => categories.find((c) => c.id === id)?.label)
        .filter(Boolean) as string[];
    }
    if (filters.categoryId) {
      const cat = categories.find((c) => c.id === filters.categoryId);
      return cat ? [cat.label] : [];
    }
    return [];
  }, [filters.categoryIds, filters.categoryId, categories]);

  const activeMethodLabels = React.useMemo(() => {
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      return filters.paymentMethods
        .map((m) => PAYMENT_OPTIONS.find((p) => p.id === m)?.label)
        .filter(Boolean) as string[];
    }
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      const opt = PAYMENT_OPTIONS.find((p) => p.id === filters.paymentMethod);
      return opt ? [opt.label] : [];
    }
    return [];
  }, [filters.paymentMethods, filters.paymentMethod]);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Row 1: Tabs + Search + Utilities */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Tab Segmented Control */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-raised p-1 shadow-xs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-body text-body-sm transition-all duration-150 cursor-pointer whitespace-nowrap select-none',
                    isActive
                      ? 'bg-surface text-text-primary font-semibold shadow-xs'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface/50 font-medium'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 font-numeric text-[11px] font-medium leading-none transition-colors',
                      isActive
                        ? 'bg-primary-subtle text-primary'
                        : 'bg-surface text-text-muted border border-border/50'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Search + Column Visibility + CSV Export */}
        <div className="flex items-center gap-2">
          {/* Universal Search Input */}
          <div className="w-full sm:w-60 lg:w-72">
            <Input
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              onClear={() => onFilterChange({ searchQuery: '' })}
              placeholder="Search description, friend…"
              clearable
              size="sm"
              leadingIcon={<Search className="h-4 w-4 text-text-muted" />}
              className="bg-surface h-9"
            />
          </div>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportTransactionsToCsv(items)}
            className="h-9 gap-1.5 text-caption bg-surface cursor-pointer shadow-xs shrink-0"
            title="Download current filtered transactions as CSV"
          >
            <Download className="h-4 w-4 text-text-muted" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Column Visibility Menu */}
          <ColumnVisibilityMenu
            visibility={columnVisibility}
            onToggle={onToggleColumnVisibility}
            onReset={onResetColumnVisibility}
          />
        </div>
      </div>

      {/* Row 2: Active Filter Chips (only shown when filters are active) */}
      {isFilterActive && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary-subtle/15 px-3 py-2 text-caption animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-text-secondary text-[11px] uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {/* Search chip */}
            {filters.searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary shadow-xs">
                <span>Text: &ldquo;{filters.searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ searchQuery: '' })}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Date range chip */}
            {filters.dateRange !== 'this-month' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary shadow-xs">
                <span>
                  Date: {filters.dateRange === 'last-month' ? 'Previous Month' : 'All Dates'}
                </span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ dateRange: 'this-month' })}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Category chip */}
            {activeCategoryLabels.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary shadow-xs">
                <span>Category: {activeCategoryLabels.join(', ')}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ categoryId: null, categoryIds: [] })}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Type chip */}
            {filters.kinds && filters.kinds.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary shadow-xs">
                <span>
                  Type:{' '}
                  {filters.kinds
                    .map((k) =>
                      k === 'personal_expense' ? 'Expense' : k === 'split_bill' ? 'Split' : 'Income'
                    )
                    .join(', ')}
                </span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ kinds: [] })}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Method chip */}
            {activeMethodLabels.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary shadow-xs">
                <span>Method: {activeMethodLabels.join(', ')}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ paymentMethod: 'all', paymentMethods: [] })}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Amount range chip */}
            {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary shadow-xs">
                <span>
                  Amount: ₹{filters.minAmount ?? 0}&ndash;₹{filters.maxAmount ?? '∞'}
                </span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ minAmount: undefined, maxAmount: undefined })}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Split status chip */}
            {filters.splitStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary shadow-xs">
                <span>Status: {filters.splitStatus === 'pending' ? 'Pending' : 'Settled'}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ splitStatus: 'all' })}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Sort chip (when non-default) */}
            {filters.sortBy !== 'date-desc' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary shadow-xs">
                <span>
                  Sorted:{' '}
                  {filters.sortBy
                    .replace('-asc', ' ↑')
                    .replace('-desc', ' ↓')
                    .replace('date', 'Date')
                    .replace('amount', 'Amount')
                    .replace('description', 'Description')
                    .replace('category', 'Category')}
                </span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ sortBy: 'date-desc' })}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Reset all */}
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-primary hover:underline cursor-pointer ml-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset all</span>
            </button>
          </div>

          {/* Record count */}
          <span className="text-[11px] font-medium text-text-muted whitespace-nowrap">
            {filteredRecordsCount} of {totalRecordsCount} records
          </span>
        </div>
      )}
    </div>
  );
}
