'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays/popover';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Checkbox } from '@/components/ui/forms/checkbox';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  IndianRupee,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import type { Category, PaymentMethod } from '@kalya/types';
import type {
  DateRangePreset,
  SplitStatusFilter,
  TransactionFilterState,
  TransactionSortOption,
  UnifiedTransactionItem,
  UnifiedTransactionKind,
} from '../types';
import { PAYMENT_OPTIONS } from '@/components/forms/finances/transactions/helper';
import { cn } from '@/libs/utils';

export type ExcelFilterColumn =
  'date' | 'description' | 'category' | 'type' | 'method' | 'total' | 'yourShare' | 'status';

export interface ExcelColumnFilterProps {
  column: ExcelFilterColumn;
  label: string;
  className?: string;
  align?: 'left' | 'right';
  filters: TransactionFilterState;
  onFilterChange: (partial: Partial<TransactionFilterState>) => void;
  categories?: Category[];
  items?: UnifiedTransactionItem[];
  monthLabel?: string;
}

export function ExcelColumnFilter({
  column,
  label,
  className,
  align = 'left',
  filters,
  onFilterChange,
  categories = [],
  items = [],
  monthLabel = 'This Month',
}: ExcelColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Determine if this specific column has an active filter
  const isFiltered = React.useMemo(() => {
    switch (column) {
      case 'date':
        return filters.dateRange !== 'this-month';
      case 'description':
        return Boolean(filters.searchQuery.trim());
      case 'category':
        return Boolean(
          filters.categoryId || (filters.categoryIds && filters.categoryIds.length > 0)
        );
      case 'type':
        return Boolean(filters.kinds && filters.kinds.length > 0);
      case 'method':
        return Boolean(
          (filters.paymentMethod && filters.paymentMethod !== 'all') ||
          (filters.paymentMethods && filters.paymentMethods.length > 0)
        );
      case 'total':
      case 'yourShare':
        return filters.minAmount !== undefined || filters.maxAmount !== undefined;
      case 'status':
        return filters.splitStatus !== 'all';
      default:
        return false;
    }
  }, [column, filters]);

  // Determine active sort state for this column
  const sortDirection = React.useMemo<'asc' | 'desc' | null>(() => {
    if (column === 'date') {
      if (filters.sortBy === 'date-asc') return 'asc';
      if (filters.sortBy === 'date-desc') return 'desc';
    }
    if (column === 'total' || column === 'yourShare') {
      if (filters.sortBy === 'amount-asc') return 'asc';
      if (filters.sortBy === 'amount-desc') return 'desc';
    }
    if (column === 'description') {
      if (filters.sortBy === 'description-asc') return 'asc';
      if (filters.sortBy === 'description-desc') return 'desc';
    }
    if (column === 'category') {
      if (filters.sortBy === 'category-asc') return 'asc';
      if (filters.sortBy === 'category-desc') return 'desc';
    }
    return null;
  }, [column, filters.sortBy]);

  // Clear this specific column's filter
  const handleClearColumnFilter = () => {
    switch (column) {
      case 'date':
        onFilterChange({
          dateRange: 'this-month',
          customStartDate: undefined,
          customEndDate: undefined,
        });
        break;
      case 'description':
        onFilterChange({ searchQuery: '' });
        break;
      case 'category':
        onFilterChange({ categoryId: null, categoryIds: [] });
        break;
      case 'type':
        onFilterChange({ kinds: [] });
        break;
      case 'method':
        onFilterChange({ paymentMethod: 'all', paymentMethods: [] });
        break;
      case 'total':
      case 'yourShare':
        onFilterChange({ minAmount: undefined, maxAmount: undefined });
        break;
      case 'status':
        onFilterChange({ splitStatus: 'all' });
        break;
    }
  };

  // Sort handlers
  const handleSetSort = (option: TransactionSortOption) => {
    onFilterChange({ sortBy: option });
  };

  // Category multi-select helper
  const selectedCategoryIds =
    filters.categoryIds ?? (filters.categoryId ? [filters.categoryId] : []);
  const allCategoryIds = React.useMemo(() => categories.map((c) => c.id), [categories]);
  const isAllCategoriesSelected =
    selectedCategoryIds.length === 0 || selectedCategoryIds.length === categories.length;

  const handleToggleCategory = (catId: string) => {
    let next: string[];
    if (selectedCategoryIds.includes(catId)) {
      next = selectedCategoryIds.filter((id) => id !== catId);
    } else {
      next = [...selectedCategoryIds, catId];
    }
    onFilterChange({
      categoryIds: next,
      categoryId: next.length === 1 ? next[0] : null,
    });
  };

  const handleSelectAllCategories = (select: boolean) => {
    if (select) {
      onFilterChange({ categoryIds: [], categoryId: null });
    } else {
      onFilterChange({ categoryIds: [], categoryId: null });
    }
  };

  // Category item counts computed from current dataset
  const categoryCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (item.kind !== 'income' && item.category?.id) {
        map.set(item.category.id, (map.get(item.category.id) || 0) + 1);
      }
    }
    return map;
  }, [items]);

  // Payment method multi-select helper
  const selectedMethods =
    filters.paymentMethods ?? (filters.paymentMethod !== 'all' ? [filters.paymentMethod] : []);
  const handleToggleMethod = (methodId: PaymentMethod) => {
    let next: PaymentMethod[];
    if (selectedMethods.includes(methodId)) {
      next = selectedMethods.filter((m) => m !== methodId);
    } else {
      next = [...selectedMethods, methodId];
    }
    onFilterChange({
      paymentMethods: next,
      paymentMethod: next.length === 1 ? next[0] : 'all',
    });
  };

  // Kind / Type helper
  const selectedKinds = filters.kinds ?? [];
  const handleToggleKind = (kind: UnifiedTransactionKind) => {
    let next: UnifiedTransactionKind[];
    if (selectedKinds.includes(kind)) {
      next = selectedKinds.filter((k) => k !== kind);
    } else {
      next = [...selectedKinds, kind];
    }
    onFilterChange({ kinds: next });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 group select-none',
          align === 'right' ? 'justify-end w-full' : 'justify-start',
          className
        )}
      >
        <span className="font-semibold">{label}</span>

        {/* Sort indicator if active */}
        {sortDirection && (
          <span className="text-primary font-bold">
            {sortDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3 inline" />
            ) : (
              <ArrowDown className="h-3 w-3 inline" />
            )}
          </span>
        )}

        {/* Excel-style Filter/Sort Trigger Button */}
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Filter ${label}`}
            className={cn(
              'inline-flex items-center justify-center rounded-md p-1 transition-all duration-150 cursor-pointer',
              isFiltered
                ? 'bg-primary text-text-inverse shadow-xs'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-raised opacity-70 group-hover:opacity-100'
            )}
          >
            {isFiltered ? (
              <Filter className="h-3 w-3 fill-current" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </PopoverTrigger>
      </div>

      <PopoverContent
        align={align === 'right' ? 'end' : 'start'}
        className="w-72 p-0 shadow-raised border-border/90 z-50 bg-surface rounded-xl overflow-hidden"
      >
        {/* Popover Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-raised/80 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Filter
              className={cn('h-3.5 w-3.5', isFiltered ? 'text-primary' : 'text-text-muted')}
            />
            <span className="font-display text-caption font-semibold text-text-primary">
              Filter by {label}
            </span>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={handleClearColumnFilter}
              className="text-[11px] font-medium text-danger hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Popover Body */}
        <div className="p-3 space-y-3">
          {/* 1. Sorting Section (Excel style) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Sort
            </span>

            {column === 'date' && (
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleSetSort('date-desc')}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-caption font-medium transition-colors cursor-pointer text-left',
                    filters.sortBy === 'date-desc'
                      ? 'bg-primary-subtle text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-raised'
                  )}
                >
                  <span>Newest First</span>
                  {filters.sortBy === 'date-desc' && <Check className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSort('date-asc')}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-caption font-medium transition-colors cursor-pointer text-left',
                    filters.sortBy === 'date-asc'
                      ? 'bg-primary-subtle text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-raised'
                  )}
                >
                  <span>Oldest First</span>
                  {filters.sortBy === 'date-asc' && <Check className="h-3 w-3" />}
                </button>
              </div>
            )}

            {(column === 'description' || column === 'category') && (
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSetSort(column === 'description' ? 'description-asc' : 'category-asc')
                  }
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-caption font-medium transition-colors cursor-pointer text-left',
                    filters.sortBy ===
                      (column === 'description' ? 'description-asc' : 'category-asc')
                      ? 'bg-primary-subtle text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-raised'
                  )}
                >
                  <span>A → Z</span>
                  {filters.sortBy ===
                    (column === 'description' ? 'description-asc' : 'category-asc') && (
                    <Check className="h-3 w-3" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSetSort(column === 'description' ? 'description-desc' : 'category-desc')
                  }
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-caption font-medium transition-colors cursor-pointer text-left',
                    filters.sortBy ===
                      (column === 'description' ? 'description-desc' : 'category-desc')
                      ? 'bg-primary-subtle text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-raised'
                  )}
                >
                  <span>Z → A</span>
                  {filters.sortBy ===
                    (column === 'description' ? 'description-desc' : 'category-desc') && (
                    <Check className="h-3 w-3" />
                  )}
                </button>
              </div>
            )}

            {(column === 'total' || column === 'yourShare') && (
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleSetSort('amount-asc')}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-caption font-medium transition-colors cursor-pointer text-left',
                    filters.sortBy === 'amount-asc'
                      ? 'bg-primary-subtle text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-raised'
                  )}
                >
                  <span>Smallest First</span>
                  {filters.sortBy === 'amount-asc' && <Check className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSort('amount-desc')}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-caption font-medium transition-colors cursor-pointer text-left',
                    filters.sortBy === 'amount-desc'
                      ? 'bg-primary-subtle text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-raised'
                  )}
                >
                  <span>Largest First</span>
                  {filters.sortBy === 'amount-desc' && <Check className="h-3 w-3" />}
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-border/80" />

          {/* 2. Specific Column Filter Controls */}
          {column === 'date' && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Date Range
              </span>
              <div className="space-y-1">
                {[
                  { id: 'this-month', label: `Selected Month (${monthLabel})` },
                  { id: 'last-month', label: 'Previous Month' },
                  { id: 'all', label: 'All Dates (Full History)' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onFilterChange({ dateRange: preset.id as DateRangePreset });
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-caption transition-colors cursor-pointer',
                      filters.dateRange === preset.id
                        ? 'bg-primary-subtle text-primary font-semibold'
                        : 'text-text-secondary hover:bg-surface-raised font-normal'
                    )}
                  >
                    <span>{preset.label}</span>
                    {filters.dateRange === preset.id && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {column === 'description' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Search Description
              </span>
              <Input
                size="xs"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                onClear={() => onFilterChange({ searchQuery: '' })}
                placeholder="Contains text…"
                clearable
                autoFocus
              />
            </div>
          )}

          {column === 'category' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Categories
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectAllCategories(true)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  Select All
                </button>
              </div>

              {/* Quick Search inside category list */}
              <Input
                size="xs"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories…"
                leadingIcon={<Search className="h-3 w-3 text-text-muted" />}
                className="h-7 text-xs"
              />

              <div className="max-h-44 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {categories
                  .filter((cat) =>
                    cat.label.toLowerCase().includes(categorySearch.toLowerCase().trim())
                  )
                  .map((cat) => {
                    const isChecked =
                      selectedCategoryIds.length === 0 || selectedCategoryIds.includes(cat.id);
                    const count = categoryCounts.get(cat.id) || 0;

                    return (
                      <label
                        key={cat.id}
                        className="flex items-center justify-between rounded-md px-2 py-1 text-xs text-text-secondary hover:bg-surface-raised cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggleCategory(cat.id)}
                          />
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color || '#2563EB' }}
                          />
                          <span className="truncate">{cat.label}</span>
                        </div>
                        {count > 0 && (
                          <span className="font-numeric text-[10px] text-text-muted bg-surface-raised px-1.5 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </label>
                    );
                  })}
              </div>
            </div>
          )}

          {column === 'type' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Transaction Type
              </span>
              <div className="space-y-1">
                {[
                  { id: 'personal_expense', label: 'Expenses (Personal)' },
                  { id: 'split_bill', label: 'Split Bills' },
                  { id: 'income', label: 'Incomes' },
                ].map((type) => {
                  const isChecked =
                    selectedKinds.length === 0 ||
                    selectedKinds.includes(type.id as UnifiedTransactionKind);
                  return (
                    <label
                      key={type.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-text-secondary hover:bg-surface-raised cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleToggleKind(type.id as UnifiedTransactionKind)}
                      />
                      <span>{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {column === 'method' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Payment Method
                </span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ paymentMethods: [], paymentMethod: 'all' })}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  All
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {PAYMENT_OPTIONS.map((opt) => {
                  const isChecked =
                    selectedMethods.length === 0 ||
                    selectedMethods.includes(opt.id as PaymentMethod);
                  return (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-text-secondary hover:bg-surface-raised cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleToggleMethod(opt.id as PaymentMethod)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {(column === 'total' || column === 'yourShare') && (
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Amount Range (₹)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-muted mb-0.5 block">Min</label>
                  <Input
                    type="number"
                    size="xs"
                    min={0}
                    placeholder="0"
                    value={filters.minAmount ?? ''}
                    onChange={(e) =>
                      onFilterChange({
                        minAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-0.5 block">Max</label>
                  <Input
                    type="number"
                    size="xs"
                    min={0}
                    placeholder="Any"
                    value={filters.maxAmount ?? ''}
                    onChange={(e) =>
                      onFilterChange({
                        maxAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { label: '> ₹500', min: 500 },
                  { label: '> ₹1,000', min: 1000 },
                  { label: '> ₹5,000', min: 5000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onFilterChange({ minAmount: preset.min, maxAmount: undefined })}
                    className="rounded-md border border-border/80 bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-text-secondary hover:text-text-primary hover:border-primary cursor-pointer transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {column === 'status' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Settlement Status
              </span>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Statuses' },
                  { id: 'pending', label: 'Pending Dues (Friends owe or you owe)' },
                  { id: 'settled', label: 'Fully Settled' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onFilterChange({ splitStatus: s.id as SplitStatusFilter })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer',
                      filters.splitStatus === s.id
                        ? 'bg-primary-subtle text-primary font-semibold'
                        : 'text-text-secondary hover:bg-surface-raised font-normal'
                    )}
                  >
                    <span>{s.label}</span>
                    {filters.splitStatus === s.id && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Popover Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-raised/50 px-3 py-2">
          <Button
            variant="primary"
            size="xs"
            onClick={() => setIsOpen(false)}
            className="text-[11px] h-7 px-3 cursor-pointer"
          >
            Apply & Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
