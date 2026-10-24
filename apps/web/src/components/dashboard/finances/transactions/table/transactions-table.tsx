'use client';

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react';
import type {
  SplitBillFeedItem,
  TransactionFilterState,
  TransactionSortOption,
  UnifiedTransactionItem,
} from '../types';
import type { Category } from '@kalya/types';
import type { ColumnVisibilityState } from './column-visibility-menu';
import { ExcelColumnFilter } from './excel-column-filter';
import { RowActionsMenu } from './actions';
import { TransactionStatusBadge } from './status-badge';
import { DateDisplay } from '@/components/ui/data-display';
import { formatCardDate, fromISO, isSameDay, Temporal } from '@kalya/utils';
import { PAYMENT_OPTIONS } from '@/components/forms/finances/transactions/helper';
import { cn } from '@/libs/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/overlays/alert-dialog';

export interface FilteredTotalsSummary {
  rowsCount: number;
  income: number;
  spent: number;
  friendsOwe: number;
}

export interface TransactionsTableProps {
  items: UnifiedTransactionItem[];
  totalCount: number;
  filteredTotals: FilteredTotalsSummary;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy: TransactionSortOption;
  onSortChange: (sortBy: TransactionSortOption) => void;
  columnVisibility: ColumnVisibilityState;
  onToggleColumnVisibility: (col: keyof ColumnVisibilityState) => void;
  onResetColumnVisibility: () => void;
  selectedIds: string[];
  onSelectRow: (id: string) => void;
  onSelectAllPage: (ids: string[]) => void;
  onClearSelection: () => void;
  onBulkDelete: (ids: string[]) => Promise<void> | void;
  onViewDetails: (item: UnifiedTransactionItem) => void;
  onEdit: (item: UnifiedTransactionItem) => void;
  onDelete: (item: UnifiedTransactionItem) => Promise<void> | void;
  onSettleSplit: (item: SplitBillFeedItem) => void;
  showDayGroupDividers?: boolean;
  // Excel-style column-level filters
  filters: TransactionFilterState;
  onFilterChange: (partial: Partial<TransactionFilterState>) => void;
  categories?: Category[];
  monthLabel?: string;
}

export function TransactionsTable({
  items,
  totalCount,
  filteredTotals,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortBy: _sortBy,
  onSortChange,
  columnVisibility,
  onToggleColumnVisibility: _onToggleColumnVisibility,
  onResetColumnVisibility: _onResetColumnVisibility,
  selectedIds,
  onSelectRow,
  onSelectAllPage,
  onClearSelection,
  onBulkDelete,
  onViewDetails,
  onEdit,
  onDelete,
  onSettleSplit,
  showDayGroupDividers = true,
  filters,
  onFilterChange,
  categories = [],
  monthLabel = 'This Month',
}: TransactionsTableProps) {
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);

  // Compute total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Page item IDs
  const pageItemIds = useMemo(() => items.map((i) => i.id), [items]);
  const isAllPageSelected = items.length > 0 && pageItemIds.every((id) => selectedIds.includes(id));
  const isSomePageSelected =
    pageItemIds.some((id) => selectedIds.includes(id)) && !isAllPageSelected;

  // Count visible columns for day divider and footer colSpan
  const visibleColumnCount = useMemo(() => {
    let count = 5; // Checkbox, Date, Description, Your Share, Actions (always visible)
    if (columnVisibility.category) count++;
    if (columnVisibility.type) count++;
    if (columnVisibility.method) count++;
    if (columnVisibility.total) count++;
    if (columnVisibility.status) count++;
    return count;
  }, [columnVisibility]);

  // Proxy onFilterChange to also reset sort via onSortChange when sortBy changes
  const handleFilterChange = (partial: Partial<typeof filters>) => {
    onFilterChange(partial);
    if (partial.sortBy) {
      onSortChange(partial.sortBy as TransactionSortOption);
    }
  };

  const handleExecuteBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await onBulkDelete(selectedIds);
      setBulkDeleteConfirmOpen(false);
      onClearSelection();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const today = Temporal.Now.plainDateISO();
  const yesterday = today.subtract({ days: 1 });

  return (
    <div className="flex flex-col gap-2 w-full min-w-0 max-w-full">
      {/* Bulk Selection Banner (only shown when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-subtle border border-primary/30 px-4 py-2 text-caption">
          <div className="flex items-center gap-2 font-medium text-primary">
            <span>{selectedIds.length} rows selected</span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-[11px] font-normal underline hover:text-primary-hover cursor-pointer"
            >
              Clear
            </button>
          </div>
          <Button
            variant="destructive"
            size="xs"
            onClick={() => setBulkDeleteConfirmOpen(true)}
            className="gap-1 h-6 text-[11px] cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span>Delete Selected</span>
          </Button>
        </div>
      )}

      {/* Main Responsive Table */}
      <Table className="w-full text-left" wrapperClassName="min-w-0 max-w-full">
        {/* Sticky Table Header with Excel-style per-column filter dropdowns */}
        <TableHeader className="sticky top-0 z-20 bg-surface-raised/95 backdrop-blur-xs">
          <TableRow className="border-b border-border hover:bg-transparent">
            {/* Checkbox */}
            <TableHead className="w-10 px-3 text-center">
              <Checkbox
                checked={isAllPageSelected ? true : isSomePageSelected ? 'indeterminate' : false}
                onCheckedChange={() => onSelectAllPage(pageItemIds)}
                aria-label="Select all on this page"
              />
            </TableHead>

            {/* 1. Date — Excel Filter */}
            <TableHead className="min-w-28 whitespace-nowrap px-3">
              <ExcelColumnFilter
                column="date"
                label="Date"
                filters={filters}
                onFilterChange={handleFilterChange}
                monthLabel={monthLabel}
              />
            </TableHead>

            {/* 2. Description — Excel Filter */}
            <TableHead className="min-w-40 sm:min-w-48 px-3">
              <ExcelColumnFilter
                column="description"
                label="Description"
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </TableHead>

            {/* 3. Category — Excel Filter */}
            {columnVisibility.category && (
              <TableHead className="min-w-28 px-3">
                <ExcelColumnFilter
                  column="category"
                  label="Category"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  items={items}
                />
              </TableHead>
            )}

            {/* 4. Type — Excel Filter (Hidden on Mobile) */}
            {columnVisibility.type && (
              <TableHead className="hidden md:table-cell min-w-20 px-3">
                <ExcelColumnFilter
                  column="type"
                  label="Type"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </TableHead>
            )}

            {/* 5. Method — Excel Filter (Hidden on Mobile & Tablet) */}
            {columnVisibility.method && (
              <TableHead className="hidden lg:table-cell min-w-24 px-3">
                <ExcelColumnFilter
                  column="method"
                  label="Method"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </TableHead>
            )}

            {/* 6. Total — Excel Filter (Hidden on Mobile) */}
            {columnVisibility.total && (
              <TableHead className="hidden sm:table-cell min-w-24 px-3 text-right">
                <ExcelColumnFilter
                  column="total"
                  label="Total"
                  align="right"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </TableHead>
            )}

            {/* 7. Your Share — Excel Filter (Always Visible) */}
            <TableHead className="min-w-24 px-3 text-right">
              <ExcelColumnFilter
                column="yourShare"
                label="Your Share"
                align="right"
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </TableHead>

            {/* 8. Status — Excel Filter */}
            {columnVisibility.status && (
              <TableHead className="min-w-36 px-3">
                <ExcelColumnFilter
                  column="status"
                  label="Status"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </TableHead>
            )}

            {/* 9. Actions */}
            <TableHead className="w-14 text-right pr-3 sm:pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {items.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);
            const prevItem = index > 0 ? items[index - 1] : null;
            const isNewDay = !prevItem || prevItem.date !== item.date;

            // Format date label for day divider
            const plainDate = fromISO(item.date);
            let dayLabel = item.date;
            if (plainDate) {
              if (isSameDay(plainDate, today)) {
                dayLabel = `Today — ${formatCardDate(plainDate)}`;
              } else if (isSameDay(plainDate, yesterday)) {
                dayLabel = `Yesterday — ${formatCardDate(plainDate)}`;
              } else {
                dayLabel = formatCardDate(plainDate);
              }
            }

            // Category color & icon info
            const categoryColor =
              item.kind === 'income'
                ? '#16A34A'
                : item.category?.color || (item.kind === 'split_bill' ? '#D97706' : '#2563EB');
            const categoryLabel =
              item.kind !== 'income' ? item.category?.label || 'General' : 'Income';

            // Payment method label
            const paymentOpt =
              item.kind !== 'income'
                ? PAYMENT_OPTIONS.find((p) => p.id === item.paymentMethod)
                : null;
            const paymentLabel = paymentOpt
              ? paymentOpt.label
              : item.kind === 'income'
                ? 'Bank'
                : 'UPI';

            return (
              <React.Fragment key={item.id}>
                {/* Optional Day Divider Row */}
                {showDayGroupDividers && isNewDay && (
                  <tr className="bg-surface-raised/40 border-y border-border/50 select-none">
                    <td colSpan={visibleColumnCount} className="py-2 px-3 sm:px-4 font-body">
                      <div className="inline-flex items-center gap-2">
                        {plainDate && isSameDay(plainDate, today) ? (
                          <>
                            <Badge
                              variant="subtle"
                              size="sm"
                              className="font-bold text-[10px] tracking-wider uppercase h-4.5 px-1.5"
                            >
                              Today
                            </Badge>
                            <span className="text-[11px] font-medium text-text-secondary">
                              {formatCardDate(plainDate)}
                            </span>
                          </>
                        ) : plainDate && isSameDay(plainDate, yesterday) ? (
                          <>
                            <Badge
                              variant="secondary"
                              size="sm"
                              className="font-bold text-[10px] tracking-wider uppercase h-4.5 px-1.5 text-text-muted"
                            >
                              Yesterday
                            </Badge>
                            <span className="text-[11px] font-medium text-text-secondary">
                              {formatCardDate(plainDate)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase">
                            {dayLabel}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {/* Transaction Row */}
                <TableRow
                  selected={isSelected}
                  onClick={() => onViewDetails(item)}
                  className="cursor-pointer transition-colors hover:bg-surface-raised/60 group"
                >
                  {/* Checkbox */}
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 px-3 text-center py-3"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectRow(item.id)}
                      aria-label={`Select row ${item.description}`}
                    />
                  </TableCell>

                  {/* 1. Date */}
                  <TableCell className="whitespace-nowrap px-3 py-3">
                    <DateDisplay
                      date={item.date}
                      timestamp={item.createdAt}
                      withTooltip
                      className="font-body text-body-sm text-text-secondary"
                    />
                  </TableCell>

                  {/* 2. Description (with Paid by friend or Split info for split bills) */}
                  <TableCell className="max-w-60 px-3 py-3">
                    <div className="font-display font-medium text-body-sm text-text-primary truncate">
                      {item.description}
                    </div>
                    {item.kind === 'split_bill' && (
                      <div className="text-[11px] text-text-muted mt-0.5 font-normal truncate">
                        {!item.isUserPayer
                          ? `Paid by ${item.payerName}`
                          : item.members.length > 0
                            ? `Split with ${item.members.map((m) => m.memberName).join(', ')}`
                            : 'Split bill'}
                      </div>
                    )}
                  </TableCell>

                  {/* 3. Category (Color dot + Label) */}
                  {columnVisibility.category && (
                    <TableCell className="whitespace-nowrap px-3 py-3">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <span className="font-body text-body-sm text-text-secondary">
                          {categoryLabel}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* 4. Type Badge (Hidden on Mobile) */}
                  {columnVisibility.type && (
                    <TableCell className="hidden md:table-cell whitespace-nowrap px-3 py-3">
                      {item.kind === 'personal_expense' && (
                        <Badge
                          variant="secondary"
                          size="sm"
                          className="font-medium text-[11px] bg-surface-raised border-border/70 text-text-secondary shadow-2xs"
                        >
                          Expense
                        </Badge>
                      )}
                      {item.kind === 'split_bill' && (
                        <Badge
                          variant="subtle"
                          size="sm"
                          className="font-medium text-[11px] border-primary/20 bg-primary-subtle/50 text-primary shadow-2xs"
                        >
                          Split
                        </Badge>
                      )}
                      {item.kind === 'income' && (
                        <Badge
                          variant="success"
                          size="sm"
                          className="font-medium text-[11px] shadow-2xs"
                        >
                          Income
                        </Badge>
                      )}
                    </TableCell>
                  )}

                  {/* 5. Payment Method (Hidden on Mobile & Tablet) */}
                  {columnVisibility.method && (
                    <TableCell className="hidden lg:table-cell whitespace-nowrap px-3 py-3 font-body text-caption text-text-muted">
                      {paymentLabel}
                    </TableCell>
                  )}

                  {/* 6. Total Amount (Hidden on Mobile) */}
                  {columnVisibility.total && (
                    <TableCell className="hidden sm:table-cell text-right whitespace-nowrap px-3 py-3 font-body tabular-nums">
                      {item.kind === 'personal_expense' && (
                        <span className="text-text-secondary font-medium">
                          -₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                      {item.kind === 'split_bill' && (
                        <span className="text-text-muted font-medium">
                          -₹{item.totalBill.toLocaleString('en-IN')}
                        </span>
                      )}
                      {item.kind === 'income' && (
                        <span className="text-success font-medium">
                          +₹{item.totalIncome.toLocaleString('en-IN')}
                        </span>
                      )}
                    </TableCell>
                  )}

                  {/* 7. Your Share (Always Visible) */}
                  <TableCell className="text-right whitespace-nowrap px-3 py-3 font-body tabular-nums">
                    {item.kind === 'personal_expense' && (
                      <span className="text-text-primary font-semibold">
                        -₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                    {item.kind === 'split_bill' && (
                      <span className="text-text-primary font-bold">
                        -₹{item.yourShare.toLocaleString('en-IN')}
                      </span>
                    )}
                    {item.kind === 'income' && (
                      <span className="text-success font-bold">
                        +₹{item.totalIncome.toLocaleString('en-IN')}
                      </span>
                    )}
                  </TableCell>

                  {/* 8. Status */}
                  {columnVisibility.status && (
                    <TableCell className="whitespace-nowrap px-3 py-3">
                      <TransactionStatusBadge
                        item={item}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(item);
                        }}
                      />
                    </TableCell>
                  )}

                  {/* 9. Actions Menu */}
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="text-right pr-3 sm:pr-4 py-3"
                  >
                    <RowActionsMenu
                      item={item}
                      onViewDetails={() => onViewDetails(item)}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                      onSettleSplit={
                        item.kind === 'split_bill'
                          ? () => onSettleSplit(item as SplitBillFeedItem)
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>

        {/* 4. Table Footer: Dynamic Totals based on current filter */}
        <TableFooter>
          <TableRow className="border-t border-border bg-surface-raised/70">
            <TableCell
              colSpan={visibleColumnCount}
              className="py-3 px-3 sm:px-4 font-body text-caption font-medium text-text-secondary"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    Rows: <strong className="text-text-primary">{filteredTotals.rowsCount}</strong>
                  </span>
                  <span className="text-border">|</span>
                  <span>
                    Income:{' '}
                    <strong className="text-success font-body tabular-nums font-semibold">
                      +₹{filteredTotals.income.toLocaleString('en-IN')}
                    </strong>
                  </span>
                  <span className="text-border">|</span>
                  <span>
                    Spent (your share):{' '}
                    <strong className="text-text-primary font-body tabular-nums font-semibold">
                      -₹{filteredTotals.spent.toLocaleString('en-IN')}
                    </strong>
                  </span>
                  {filteredTotals.friendsOwe > 0 && (
                    <>
                      <span className="text-border">|</span>
                      <span>
                        Friends owe you:{' '}
                        <strong className="text-amber-600 dark:text-amber-400 font-body tabular-nums font-semibold">
                          ₹{filteredTotals.friendsOwe.toLocaleString('en-IN')}
                        </strong>
                      </span>
                    </>
                  )}
                </div>

                <span className="text-[11px] text-text-muted italic">
                  *Totals reflect active filters using your share only.
                </span>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1">
        {/* Page size selector */}
        <div className="flex items-center gap-2 text-caption text-text-muted">
          <span>Rows per page:</span>
          <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
            {[25, 50, 100].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  onPageSizeChange(size);
                  onPageChange(1);
                }}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer',
                  pageSize === size
                    ? 'bg-primary-subtle text-primary font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Page navigator */}
        <div className="flex items-center gap-3">
          <span className="text-caption font-medium text-text-secondary">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="h-8 w-8 cursor-pointer rounded-lg bg-surface"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 cursor-pointer rounded-lg bg-surface"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 w-8 cursor-pointer rounded-lg bg-surface"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="h-8 w-8 cursor-pointer rounded-lg bg-surface"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete these {selectedIds.length} transactions? This will
              adjust your monthly summaries and budget health. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteBulkDelete}
              disabled={isBulkDeleting}
              className="bg-danger text-white hover:bg-danger-hover"
            >
              {isBulkDeleting ? 'Deleting…' : 'Delete Selected'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
