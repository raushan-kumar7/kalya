'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { FOCUS_RING, TRANSITIONS_CSS } from '@/components/ui/constants';
import { Button, type ButtonProps } from '@/components/ui/forms/button';

/* ------------------------------------------------------------------ */
/* 1. Root & Container Components                                      */
/* ------------------------------------------------------------------ */

export interface PaginationProps extends React.ComponentProps<'nav'> {
  variant?: 'default' | 'compact' | 'segmented' | 'minimal';
}

const Pagination = ({ className, variant = 'default', ...props }: PaginationProps) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn(
      'flex items-center',
      variant === 'segmented'
        ? 'inline-flex rounded-md border border-border bg-surface p-1 shadow-xs'
        : 'w-auto justify-center',
      className
    )}
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
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('shrink-0 list-none', className)} {...props} />
  )
);
PaginationItem.displayName = 'PaginationItem';

/* ------------------------------------------------------------------ */
/* 2. Interactive Page Link / Button                                   */
/* ------------------------------------------------------------------ */

export interface PaginationLinkProps extends Omit<React.ComponentProps<typeof Button>, 'size'> {
  isActive?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const PaginationLink = ({
  className,
  isActive = false,
  size = 'sm',
  variant,
  children,
  ...props
}: PaginationLinkProps) => {
  // Sizing matrix with guaranteed min-width to prevent digit squishing
  const sizeClasses = {
    xs: 'h-7 min-w-7 px-2 text-[11px] rounded-xs',
    sm: 'h-8.5 min-w-8.5 px-2.5 text-caption rounded-sm',
    md: 'h-10 min-w-10 px-3.5 text-body-sm rounded-md',
    lg: 'h-12 min-w-12 px-4 text-body-md rounded-lg',
  }[size];

  return (
    <Button
      aria-current={isActive ? 'page' : undefined}
      variant={isActive ? 'default' : variant || 'ghost'}
      className={cn(
        'font-numeric tabular-nums transition-all duration-150 select-none cursor-pointer',
        sizeClasses,
        isActive
          ? 'bg-primary text-on-primary font-semibold shadow-xs border border-primary hover:bg-primary-hover active:scale-95'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-transparent hover:border-border/80 active:scale-95',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
PaginationLink.displayName = 'PaginationLink';

/* ------------------------------------------------------------------ */
/* 3. Navigation Controls (First, Prev, Next, Last)                   */
/* ------------------------------------------------------------------ */

export interface PaginationNavButtonProps extends Omit<
  React.ComponentProps<typeof PaginationLink>,
  'children'
> {
  label?: string;
  showLabel?: boolean;
  tooltip?: string;
}

const PaginationFirst = ({
  className,
  label = 'First',
  showLabel = false,
  size = 'sm',
  disabled,
  ...props
}: PaginationNavButtonProps) => (
  <PaginationLink
    aria-label="Go to first page"
    size={size}
    disabled={disabled}
    className={cn(
      'gap-1.5 border border-border/60 bg-surface hover:bg-surface-raised text-text-primary shadow-xs',
      disabled && 'opacity-40 pointer-events-none bg-surface/50 border-border/40 text-text-muted',
      !showLabel && 'px-0 justify-center',
      className
    )}
    {...props}
  >
    <ChevronsLeft className="h-4 w-4" />
    {showLabel && <span className="font-body text-caption font-medium">{label}</span>}
  </PaginationLink>
);
PaginationFirst.displayName = 'PaginationFirst';

const PaginationPrevious = ({
  className,
  label = 'Previous',
  showLabel = true,
  size = 'sm',
  disabled,
  ...props
}: PaginationNavButtonProps) => (
  <PaginationLink
    aria-label="Go to previous page"
    size={size}
    disabled={disabled}
    className={cn(
      'gap-1.5 border border-border/60 bg-surface hover:bg-surface-raised text-text-primary shadow-xs',
      disabled && 'opacity-40 pointer-events-none bg-surface/50 border-border/40 text-text-muted',
      showLabel ? 'px-3' : 'px-0 justify-center',
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    {showLabel && <span className="font-body text-caption font-medium">{label}</span>}
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  label = 'Next',
  showLabel = true,
  size = 'sm',
  disabled,
  ...props
}: PaginationNavButtonProps) => (
  <PaginationLink
    aria-label="Go to next page"
    size={size}
    disabled={disabled}
    className={cn(
      'gap-1.5 border border-border/60 bg-surface hover:bg-surface-raised text-text-primary shadow-xs',
      disabled && 'opacity-40 pointer-events-none bg-surface/50 border-border/40 text-text-muted',
      showLabel ? 'px-3' : 'px-0 justify-center',
      className
    )}
    {...props}
  >
    {showLabel && <span className="font-body text-caption font-medium">{label}</span>}
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationLast = ({
  className,
  label = 'Last',
  showLabel = false,
  size = 'sm',
  disabled,
  ...props
}: PaginationNavButtonProps) => (
  <PaginationLink
    aria-label="Go to last page"
    size={size}
    disabled={disabled}
    className={cn(
      'gap-1.5 border border-border/60 bg-surface hover:bg-surface-raised text-text-primary shadow-xs',
      disabled && 'opacity-40 pointer-events-none bg-surface/50 border-border/40 text-text-muted',
      !showLabel && 'px-0 justify-center',
      className
    )}
    {...props}
  >
    {showLabel && <span className="font-body text-caption font-medium">{label}</span>}
    <ChevronsRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationLast.displayName = 'PaginationLast';

/* ------------------------------------------------------------------ */
/* 4. Smart Interactive Ellipsis                                       */
/* ------------------------------------------------------------------ */

export interface PaginationEllipsisProps extends React.ComponentProps<'button'> {
  jumpDirection?: 'backward' | 'forward';
  jumpCount?: number;
  onJump?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const PaginationEllipsis = ({
  className,
  jumpDirection,
  jumpCount = 5,
  onJump,
  size = 'sm',
  ...props
}: PaginationEllipsisProps) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const sizeClasses = {
    xs: 'h-7 w-7 min-w-7 rounded-xs',
    sm: 'h-8.5 w-8.5 min-w-8.5 rounded-sm',
    md: 'h-10 w-10 min-w-10 rounded-md',
    lg: 'h-12 w-12 min-w-12 rounded-lg',
  }[size];

  if (onJump) {
    return (
      <button
        type="button"
        onClick={onJump}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Jump ${jumpCount} pages ${jumpDirection === 'backward' ? 'back' : 'forward'}`}
        title={`Jump ${jumpCount} pages ${jumpDirection === 'backward' ? 'back' : 'forward'}`}
        className={cn(
          'inline-flex items-center justify-center font-numeric text-caption text-text-muted hover:text-primary hover:bg-primary-subtle border border-transparent hover:border-primary/20 transition-all cursor-pointer active:scale-95',
          sizeClasses,
          FOCUS_RING.primary,
          className
        )}
        {...props}
      >
        {isHovered ? (
          jumpDirection === 'backward' ? (
            <ChevronsLeft className="h-4 w-4 text-primary animate-pulse" />
          ) : (
            <ChevronsRight className="h-4 w-4 text-primary animate-pulse" />
          )
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center text-text-muted select-none',
        sizeClasses,
        className
      )}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
};
PaginationEllipsis.displayName = 'PaginationEllipsis';

/* ------------------------------------------------------------------ */
/* 5. Summary & Page Size Controls                                    */
/* ------------------------------------------------------------------ */

export interface PaginationSummaryProps {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  totalItems?: number;
  className?: string;
}

function PaginationSummary({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  className,
}: PaginationSummaryProps) {
  if (totalItems !== undefined && pageSize !== undefined) {
    const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className={cn('text-caption text-text-secondary select-none font-body', className)}>
        <span>Showing </span>
        <strong className="font-numeric font-semibold text-text-primary">
          {start}–{end}
        </strong>
        <span> of </span>
        <strong className="font-numeric font-semibold text-text-primary">{totalItems}</strong>
        <span> results</span>
      </div>
    );
  }

  return (
    <div className={cn('text-caption text-text-secondary select-none font-body', className)}>
      <span>Page </span>
      <strong className="font-numeric font-semibold text-text-primary">{currentPage}</strong>
      <span> of </span>
      <strong className="font-numeric font-semibold text-text-primary">{totalPages}</strong>
    </div>
  );
}

export interface PaginationPageSizeProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

function PaginationPageSize({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationPageSizeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-caption text-text-secondary select-none font-body',
        className
      )}
    >
      <span className="hidden sm:inline">Rows per page:</span>
      <span className="sm:hidden">Per page:</span>
      <div className="relative">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="appearance-none h-8.5 rounded-md border border-border bg-surface pl-2.5 pr-7 text-caption text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary font-numeric cursor-pointer hover:border-text-secondary/50 shadow-xs transition-colors"
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
      </div>
    </div>
  );
}

export interface PaginationJumperProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function PaginationJumper({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationJumperProps) {
  const [val, setVal] = React.useState(String(currentPage));

  React.useEffect(() => {
    setVal(String(currentPage));
  }, [currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(val, 10);
    if (!isNaN(pageNum)) {
      const clamped = Math.max(1, Math.min(totalPages, pageNum));
      onPageChange(clamped);
      setVal(String(clamped));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-1.5 text-caption text-text-secondary select-none font-body',
        className
      )}
    >
      <span>Go to:</span>
      <input
        type="number"
        min={1}
        max={totalPages}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSubmit}
        className="h-8.5 w-14 rounded-md border border-border bg-surface px-2 text-center text-caption text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary font-numeric shadow-xs hover:border-text-secondary/40 transition-colors"
        aria-label="Jump to page number"
      />
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* 6. High-Level ResponsivePagination Component                        */
/* ------------------------------------------------------------------ */

export interface ResponsivePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  totalItems?: number;
  showSummary?: boolean;
  showPageSize?: boolean;
  showJumper?: boolean;
  showFastForward?: boolean;
  variant?: 'default' | 'compact' | 'segmented' | 'minimal';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  siblingCount?: number;
  className?: string;
}

function ResponsivePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems,
  showSummary = true,
  showPageSize = true,
  showJumper = true,
  showFastForward = true,
  variant = 'default',
  size = 'sm',
  siblingCount = 1,
  className,
}: ResponsivePaginationProps) {
  // Generate pages with smart ellipsis & jump targets
  const getPageItems = () => {
    const totalPageNumbers = siblingCount * 2 + 5; // sibling count + first + last + current + 2 ellipses

    // Case 1: If total pages is less than the page numbers we want to show
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots needed
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'ellipsis-right', lastPageIndex];
    }

    // Case 3: No right dots, but left dots needed
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + 1 + i
      );
      return [firstPageIndex, 'ellipsis-left', ...rightRange];
    }

    // Case 4: Both left and right dots needed
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, 'ellipsis-left', ...middleRange, 'ellipsis-right', lastPageIndex];
  };

  const pages = getPageItems();

  /* ------------------------------------------------------------------ */
  /* COMPACT VARIANT: [< Prev] Page X of Y [Next >]                      */
  /* ------------------------------------------------------------------ */
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 w-full text-caption select-none',
          className
        )}
      >
        <PaginationSummary
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
        />

        <div className="flex items-center gap-1.5">
          <PaginationPrevious
            size={size}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            showLabel={false}
          />
          <span className="font-numeric font-medium px-2 text-text-primary">
            {currentPage} / {totalPages}
          </span>
          <PaginationNext
            size={size}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            showLabel={false}
          />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* SEGMENTED VARIANT: Unified pill group                              */
  /* ------------------------------------------------------------------ */
  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'flex flex-col sm:flex-row items-center justify-between gap-3 w-full',
          className
        )}
      >
        {showSummary && (
          <PaginationSummary
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
          />
        )}

        <Pagination variant="segmented">
          <PaginationContent className="gap-0.5">
            <PaginationItem>
              <PaginationPrevious
                size={size}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                showLabel={false}
                className="border-0 bg-transparent shadow-none hover:bg-surface-raised"
              />
            </PaginationItem>

            {pages.map((p, idx) => {
              if (p === 'ellipsis-left' || p === 'ellipsis-right') {
                const isLeft = p === 'ellipsis-left';
                return (
                  <PaginationItem key={`seg-ellipsis-${idx}`}>
                    <PaginationEllipsis
                      size={size}
                      jumpDirection={isLeft ? 'backward' : 'forward'}
                      onJump={() =>
                        onPageChange(
                          isLeft
                            ? Math.max(1, currentPage - 5)
                            : Math.min(totalPages, currentPage + 5)
                        )
                      }
                      className="border-0 bg-transparent"
                    />
                  </PaginationItem>
                );
              }

              const pageNum = p as number;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    size={size}
                    isActive={currentPage === pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={
                      currentPage === pageNum
                        ? ''
                        : 'border-0 bg-transparent shadow-none hover:bg-surface-raised'
                    }
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                size={size}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                showLabel={false}
                className="border-0 bg-transparent shadow-none hover:bg-surface-raised"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {pageSize && onPageSizeChange && showPageSize && (
          <PaginationPageSize
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
          />
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* DEFAULT RICH VARIANT: Full Ledger Pagination with Controls         */
  /* ------------------------------------------------------------------ */
  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row items-center justify-between gap-4 w-full',
        className
      )}
    >
      {/* Left side: Records Summary & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-4 order-2 lg:order-1 w-full lg:w-auto justify-between lg:justify-start">
        {showSummary && (
          <PaginationSummary
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
          />
        )}

        {pageSize && onPageSizeChange && showPageSize && (
          <>
            <span className="hidden sm:inline text-border">|</span>
            <PaginationPageSize
              pageSize={pageSize}
              onPageSizeChange={onPageSizeChange}
              pageSizeOptions={pageSizeOptions}
            />
          </>
        )}
      </div>

      {/* Center: Numeric Page Controls */}
      <div className="order-1 lg:order-2 flex items-center justify-center">
        <Pagination>
          <PaginationContent className="flex-wrap justify-center gap-1 sm:gap-1.5">
            {showFastForward && totalPages > 5 && (
              <PaginationItem className="hidden sm:block">
                <PaginationFirst
                  size={size}
                  onClick={() => onPageChange(1)}
                  disabled={currentPage <= 1}
                />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationPrevious
                size={size}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                showLabel={true}
                className="hidden sm:inline-flex"
              />
              <PaginationPrevious
                size={size}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                showLabel={false}
                className="sm:hidden inline-flex"
              />
            </PaginationItem>

            {pages.map((p, idx) => {
              if (p === 'ellipsis-left' || p === 'ellipsis-right') {
                const isLeft = p === 'ellipsis-left';
                return (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis
                      size={size}
                      jumpDirection={isLeft ? 'backward' : 'forward'}
                      onJump={() =>
                        onPageChange(
                          isLeft
                            ? Math.max(1, currentPage - 5)
                            : Math.min(totalPages, currentPage + 5)
                        )
                      }
                    />
                  </PaginationItem>
                );
              }

              const pageNum = p as number;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    size={size}
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
                size={size}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                showLabel={true}
                className="hidden sm:inline-flex"
              />
              <PaginationNext
                size={size}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                showLabel={false}
                className="sm:hidden inline-flex"
              />
            </PaginationItem>

            {showFastForward && totalPages > 5 && (
              <PaginationItem className="hidden sm:block">
                <PaginationLast
                  size={size}
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>

      {/* Right side: Quick Page Jumper */}
      {showJumper && totalPages > 3 && (
        <div className="order-3 hidden xl:flex items-center">
          <PaginationJumper
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
  PaginationEllipsis,
  PaginationSummary,
  PaginationPageSize,
  PaginationJumper,
  ResponsivePagination,
};
