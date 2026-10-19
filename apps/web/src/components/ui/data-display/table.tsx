'use client';

import * as React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Button } from '@/components/ui/forms/button';
import { Skeleton } from '@/components/ui/states/skeleton';

// ------------------------------------------------------------
// 1. Semantic Table Atoms
// ------------------------------------------------------------

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto rounded-md border border-border bg-surface shadow-card">
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-body-sm text-text-primary border-collapse',
          className
        )}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('border-b border-border bg-surface-raised/70 [&_tr]:border-b-0', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-border/60 [&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-border bg-surface-raised/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      data-state={selected ? 'selected' : undefined}
      className={cn(
        'transition-colors hover:bg-surface-raised/60',
        'data-[state=selected]:bg-primary-subtle/30',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | false;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortDirection, onSort, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-11 px-4 text-left align-middle font-body text-caption font-semibold uppercase tracking-wider text-text-secondary select-none',
        sortable && 'cursor-pointer hover:text-text-primary transition-colors',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      {sortable ? (
        <div className="flex items-center gap-1.5">
          <span>{children}</span>
          <span className="text-text-muted">
            {sortDirection === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : sortDirection === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </span>
        </div>
      ) : (
        children
      )}
    </th>
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle font-body text-body-sm leading-normal', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-caption text-text-muted', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

// ------------------------------------------------------------
// 2. High-Level DataTable Organism
// ------------------------------------------------------------

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  loadingRows?: number;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectionChange?: (keys: (string | number)[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
  className?: string;
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  loadingRows = 5,
  isError = false,
  errorMessage = 'Failed to load table records.',
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search filters or adding a new record.',
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  searchable = true,
  searchPlaceholder = 'Filter records...',
  searchFilter,
  pageSize = 5,
  className,
  title,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState('');
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [page, setPage] = React.useState(1);

  // Filtered data
  const filteredData = React.useMemo(() => {
    if (!search) return data;
    if (searchFilter) {
      return data.filter((item) => searchFilter(item, search));
    }
    const q = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item as Record<string, unknown>).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    );
  }, [data, search, searchFilter]);

  // Sorted data
  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = col.sortValue ? col.sortValue(a) : (a as Record<string, unknown>)[sortKey];
      const valB = col.sortValue ? col.sortValue(b) : (b as Record<string, unknown>)[sortKey];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // Paginated data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Selection logic
  const allCurrentKeys = paginatedData.map(keyExtractor);
  const isAllSelected =
    allCurrentKeys.length > 0 && allCurrentKeys.every((k) => selectedKeys.includes(k));
  const isSomeSelected = allCurrentKeys.some((k) => selectedKeys.includes(k)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange?.(selectedKeys.filter((k) => !allCurrentKeys.includes(k)));
    } else {
      const combined = Array.from(new Set([...selectedKeys, ...allCurrentKeys]));
      onSelectionChange?.(combined);
    }
  };

  const handleSelectRow = (key: string | number) => {
    if (selectedKeys.includes(key)) {
      onSelectionChange?.(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange?.([...selectedKeys, key]);
    }
  };

  return (
    <div className={cn('flex flex-col space-y-3.5 w-full font-body', className)}>
      {/* Table Toolbar */}
      {(title || searchable || actions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {title && (
              <div className="font-display text-body-md font-semibold text-text-primary">
                {title}
              </div>
            )}
            {selectedKeys.length > 0 && (
              <span className="text-caption font-medium text-primary bg-primary-subtle px-2 py-0.5 rounded-sm">
                {selectedKeys.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {searchable && (
              <div className="relative min-w-56 flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8.5 w-full rounded-md border border-border bg-surface pl-8.5 pr-3 text-caption text-text-primary placeholder:text-text-muted outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Main Table Structure */}
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10 px-4">
                <Checkbox
                  checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all current rows"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                sortable={col.sortable}
                sortDirection={sortKey === col.key ? sortOrder : false}
                onSort={() => handleSort(col.key)}
                className={col.className}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: loadingRows }).map((_, rIdx) => (
              <TableRow key={`skeleton-row-${rIdx}`}>
                {selectable && (
                  <TableCell className="w-10 px-4">
                    <Skeleton className="h-4 w-4 rounded-xs" />
                  </TableCell>
                )}
                {columns.map((col, cIdx) => (
                  <TableCell key={`skeleton-col-${cIdx}`} className={col.className}>
                    <Skeleton className="h-4 w-3/4 rounded-xs" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="py-12 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <AlertCircle className="h-7 w-7 text-danger" />
                  <p className="font-medium text-text-primary text-body-sm">{errorMessage}</p>
                  {onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      leftIcon={<RotateCw className="h-3.5 w-3.5" />}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="py-12 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <Database className="h-8 w-8 text-text-muted opacity-60" />
                  <p className="font-display font-medium text-text-primary text-body-sm">
                    {emptyTitle}
                  </p>
                  <p className="text-caption text-text-muted max-w-sm">{emptyDescription}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item) => {
              const rowKey = keyExtractor(item);
              const isSelected = selectedKeys.includes(rowKey);

              return (
                <TableRow key={String(rowKey)} selected={isSelected}>
                  {selectable && (
                    <TableCell className="w-10 px-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRow(rowKey)}
                        aria-label={`Select row ${String(rowKey)}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      {!isLoading && !isError && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-caption text-text-secondary select-none">
          <div className="font-numeric">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setPage(1)}
              disabled={currentPage <= 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <span className="font-numeric px-2 text-text-primary font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setPage(totalPages)}
              disabled={currentPage >= totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
