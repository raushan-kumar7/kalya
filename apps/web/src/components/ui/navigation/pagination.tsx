'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/libs/utils';
import { FOCUS_RING, TRANSITIONS_CSS } from '@/components/ui/constants';
import { Button } from '@/components/ui/forms/button';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(
        'flex flex-row items-center gap-1 font-body text-caption select-none',
        className
      )}
      {...props}
    />
  )
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />
);
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof Button>;

const PaginationLink = ({
  className,
  isActive,
  size = 'icon-sm',
  variant,
  ...props
}: PaginationLinkProps) => (
  <Button
    aria-current={isActive ? 'page' : undefined}
    variant={isActive ? 'default' : variant || 'ghost'}
    size={size}
    className={cn('font-numeric text-caption', isActive && 'shadow-xs font-semibold', className)}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  label = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="sm"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>{label}</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  label = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) => (
  <PaginationLink
    aria-label="Go to next page"
    size="sm"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>{label}</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden="true"
    className={cn('flex h-8.5 w-8.5 items-center justify-center text-text-muted', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export interface ResponsivePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function ResponsivePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: ResponsivePaginationProps) {
  // Generate pages with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        'ellipsis-start',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      'ellipsis-start',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis-end',
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 w-full',
        className
      )}
    >
      {pageSize && onPageSizeChange && (
        <div className="flex items-center gap-2 text-caption text-text-secondary select-none">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-border bg-surface px-2 text-caption text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary font-numeric cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            />
          </PaginationItem>

          {pages.map((p, idx) => {
            if (p === 'ellipsis-start' || p === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const pageNum = p as number;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={currentPage === pageNum}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
