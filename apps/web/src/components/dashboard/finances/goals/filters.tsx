'use client';

import React from 'react';
import type { Bucket } from '@kalya/types';
import {
  ArrowDownUp,
  ArrowUpDown,
  Filter,
  Grid3X3,
  LayoutGrid,
  LayoutList,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/forms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { cn } from '@/libs/utils';
import type { GoalFiltersState, GoalSortField, GoalStatusFilter, GoalViewMode } from './types';

export interface GoalsFiltersProps {
  filters: GoalFiltersState;
  onFiltersChange: (next: GoalFiltersState) => void;
  buckets: Bucket[];
  totalGoalsCount: number;
  filteredCount: number;
}

export function GoalsFilters({
  filters,
  onFiltersChange,
  buckets,
  totalGoalsCount,
  filteredCount,
}: GoalsFiltersProps) {
  const statusOptions: { value: GoalStatusFilter; label: string; shortLabel: string }[] = [
    { value: 'all', label: 'All Goals', shortLabel: 'All' },
    { value: 'active', label: 'Active', shortLabel: 'Active' },
    { value: 'completed', label: 'Completed', shortLabel: 'Completed' },
    { value: 'paused', label: 'Paused', shortLabel: 'Paused' },
  ];

  const sortOptions: { value: GoalSortField; label: string }[] = [
    { value: 'target_date', label: 'Target Date' },
    { value: 'progress_pct', label: 'Progress %' },
    { value: 'remaining_amount', label: 'Amount Remaining' },
    { value: 'target_amount', label: 'Target Amount' },
    { value: 'name', label: 'Goal Name' },
  ];

  return (
    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 rounded-xl border border-border bg-surface p-2.5 shadow-2xs">
      {/* ── Left Controls: Search, Status Tabs, Bucket Select ── */}
      <div className="flex flex-1 items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="w-full sm:w-52 md:w-60 lg:w-64 shrink-0">
          <Input
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search goals or buckets…"
            leadingIcon={<Search className="h-3.5 w-3.5 text-text-muted" />}
            clearable
            onClear={() => onFiltersChange({ ...filters, searchQuery: '' })}
            size="sm"
            className="text-caption h-8.5"
          />
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center rounded-lg border border-border bg-surface-raised p-0.5 shrink-0">
          {statusOptions.map((opt) => {
            const active = filters.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFiltersChange({ ...filters, status: opt.value })}
                className={cn(
                  'rounded-md px-2.5 py-1 text-caption font-medium transition-all',
                  active
                    ? 'bg-primary text-on-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <span className="hidden xl:inline">{opt.label}</span>
                <span className="xl:hidden">{opt.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Bucket Dropdown */}
        <div className="w-36 lg:w-40 shrink-0">
          <Select
            value={filters.bucketId}
            onValueChange={(val) => onFiltersChange({ ...filters, bucketId: val })}
          >
            <SelectTrigger size="sm" className="h-8.5 text-caption">
              <SelectValue placeholder="All Buckets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buckets</SelectItem>
              {buckets.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: b.color || 'var(--primary)' }}
                    />
                    <span className="truncate">{b.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Right Controls: Sort, Sort Direction, View Toggle ── */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {/* Sort By Field */}
        <div className="w-36 lg:w-40 shrink-0">
          <Select
            value={filters.sortBy}
            onValueChange={(val) => onFiltersChange({ ...filters, sortBy: val as GoalSortField })}
          >
            <SelectTrigger size="sm" className="h-8.5 text-caption">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Direction Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onFiltersChange({
              ...filters,
              sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
            })
          }
          className="h-8.5 w-8.5 p-0 flex items-center justify-center text-text-muted hover:text-text-primary shrink-0"
          title={filters.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>

        {/* Grid / List View Toggle */}
        <div className="flex items-center rounded-lg border border-border bg-surface-raised p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onFiltersChange({ ...filters, viewMode: 'cards' })}
            aria-label="Cards grid view"
            className={cn(
              'rounded-md p-1.5 text-text-muted transition-colors',
              filters.viewMode === 'cards'
                ? 'bg-surface text-primary shadow-xs font-semibold'
                : 'hover:text-text-primary'
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onFiltersChange({ ...filters, viewMode: 'table' })}
            aria-label="Compact list view"
            className={cn(
              'rounded-md p-1.5 text-text-muted transition-colors',
              filters.viewMode === 'table'
                ? 'bg-surface text-primary shadow-xs font-semibold'
                : 'hover:text-text-primary'
            )}
          >
            <LayoutList className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
