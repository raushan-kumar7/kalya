'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Info, Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/libs/utils';
import { cardVariants } from '@/components/ui/data-display';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';

/* ============================================================
   Types
   ============================================================ */

export type KpiTone = 'default' | 'positive' | 'warning' | 'negative' | 'info' | 'accent';

export interface KpiTrend {
  /** Percentage change, e.g. 12.5 or -3.2 */
  value: number;
  /** Short context, e.g. "vs last month" */
  label?: string;
  /** Set true when "up" is bad (expenses, dues). Flips green/red. */
  invert?: boolean;
}

export interface KpiAction {
  label: string;
  /** If provided (and the card itself isn't clickable) renders as a link */
  href?: string;
  onClick?: () => void;
}

export interface KpiCardProps {
  /** Title of the card */
  title?: string;
  /** Alias for title (backward-compatibility) */
  label?: string;
  /** Pre-formatted value: "₹11,480", "0.75 g", "12.6%" */
  value: string | number;
  /** One-line context under the value */
  hint?: string;
  /** Alias for hint (backward-compatibility) */
  note?: string;
  /** Alias for hint (backward-compatibility) */
  subtitle?: string;
  /** Tooltip text for the small info indicator */
  info?: string;
  /** Alias for info (backward-compatibility) */
  tooltip?: string;
  /** Optional badge element or text */
  badge?: string | ReactNode;
  /** Lucide icon component or custom ReactNode */
  icon?: LucideIcon | ReactNode;
  /** Colours the value, accent border, and icon chip */
  tone?: KpiTone;
  /** Percentage change badge shown next to or under the value */
  trend?: KpiTrend;
  /** Tinted border + luxury background glow to make one card the hero */
  highlight?: boolean;
  /** sm = compact rows (5-6 across), md = default (4 across), lg = hero numbers */
  size?: 'sm' | 'md' | 'lg';
  /** Where the number and content sits. Defaults to 'start'. */
  align?: 'center' | 'start';
  /** Whether data is loading */
  isLoading?: boolean;
  /** Extra content pinned to the bottom, e.g. a progress bar */
  footer?: ReactNode;
  /** Small "Budgets →" style link/action pinned to the bottom */
  action?: KpiAction;
  /** Makes the whole card a link */
  href?: string;
  /** Makes the whole card a button */
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

/* ============================================================
   Style Maps
   ============================================================ */

const VALUE_TONE: Record<KpiTone, string> = {
  default: 'text-text-primary',
  positive: 'text-success',
  warning: 'text-warning',
  negative: 'text-danger',
  info: 'text-info',
  accent: 'text-accent-strong',
};

const ICON_TONE: Record<KpiTone, string> = {
  default: 'bg-primary-subtle text-primary border-primary/20',
  positive: 'bg-success-subtle text-success border-success/20',
  warning: 'bg-warning-subtle text-warning border-warning/20',
  negative: 'bg-danger-subtle text-danger border-danger/20',
  info: 'bg-info-subtle text-info border-info/20',
  accent: 'bg-accent-subtle text-accent-strong border-accent/20',
};

const HIGHLIGHT_TONE: Record<KpiTone, string> = {
  default:
    'border-primary/40 bg-linear-to-b from-primary-subtle/40 via-surface to-surface shadow-md',
  positive:
    'border-success/40 bg-linear-to-b from-success-subtle/40 via-surface to-surface shadow-md',
  warning:
    'border-warning/40 bg-linear-to-b from-warning-subtle/40 via-surface to-surface shadow-md',
  negative:
    'border-danger/40 bg-linear-to-b from-danger-subtle/40 via-surface to-surface shadow-md',
  info: 'border-info/40 bg-linear-to-b from-info-subtle/40 via-surface to-surface shadow-md',
  accent: 'border-accent/40 bg-linear-to-b from-accent-subtle/50 via-surface to-surface shadow-md',
};

const SIZE_CONFIG = {
  sm: {
    pad: 'p-3.5',
    value: 'text-body-lg sm:text-body-xl',
    chip: 'h-7 w-7 rounded-lg',
    iconSize: 'h-3.5 w-3.5',
    title: 'text-caption',
  },
  md: {
    pad: 'p-4',
    value: 'text-2xl sm:text-heading-xs',
    chip: 'h-8 w-8 rounded-xl',
    iconSize: 'h-4 w-4',
    title: 'text-caption',
  },
  lg: {
    pad: 'p-5 sm:p-6',
    value: 'text-display-xs sm:text-display-sm',
    chip: 'h-10 w-10 rounded-2xl',
    iconSize: 'h-5 w-5',
    title: 'text-body-sm',
  },
} as const;

/* ============================================================
   Sub-components
   ============================================================ */

function formatPercent(n: number): string {
  const abs = Number(Math.abs(n).toFixed(1));
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${abs}%`;
}

function TrendBadge({ trend }: { trend: KpiTrend }) {
  const { value, label, invert } = trend;
  const dir = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const isGood = dir === 'flat' ? null : (dir === 'up') !== Boolean(invert);
  const Icon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none tracking-tight transition-colors',
        isGood === null && 'border-border/60 bg-surface-raised text-text-muted',
        isGood === true && 'border-success/25 bg-success-subtle text-success',
        isGood === false && 'border-danger/25 bg-danger-subtle text-danger'
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="font-numeric font-semibold">{formatPercent(value)}</span>
      {label && <span className="font-normal opacity-80 text-text-secondary">{label}</span>}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-raised', className)} />;
}

/* ============================================================
   KpiCard Component
   ============================================================ */

export function KpiCard({
  title,
  label,
  value,
  hint,
  note,
  subtitle,
  info,
  tooltip,
  badge,
  icon: IconOrNode,
  tone = 'default',
  trend,
  highlight = false,
  size = 'md',
  align = 'start',
  isLoading = false,
  footer,
  action,
  href,
  onClick,
  className,
  children,
}: KpiCardProps) {
  const router = useRouter();
  const displayTitle = title ?? label ?? '';
  const displayHint = hint ?? note ?? subtitle;
  const displayInfo = info ?? tooltip;
  const s = SIZE_CONFIG[size];
  const isInteractive = Boolean(href || onClick);
  const isCentered = align === 'center';

  const rootClass = cn(
    cardVariants({ variant: isInteractive ? 'interactive' : 'default' }),
    'group relative flex h-full min-w-0 flex-col justify-between overflow-hidden transition-all duration-200',
    s.pad,
    highlight && HIGHLIGHT_TONE[tone],
    isInteractive &&
      'cursor-pointer hover:-translate-y-0.5 hover:shadow-raised hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    className
  );

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive) return;

    // Do not trigger card action if the click originated from an inner interactive element
    const target = e.target as HTMLElement | null;
    const interactive = target?.closest('button, a, input, select, textarea');
    if (interactive && interactive !== e.currentTarget) {
      return;
    }

    if (onClick) {
      onClick();
    } else if (href) {
      if (e.metaKey || e.ctrlKey) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(href);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;

    const target = e.target as HTMLElement | null;
    const interactive = target?.closest('button, a, input, select, textarea');
    if (interactive && interactive !== e.currentTarget) {
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) {
        onClick();
      } else if (href) {
        router.push(href);
      }
    }
  };

  const handleAuxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !href) return;
    if (e.button === 1) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const renderIcon = () => {
    if (!IconOrNode) return null;

    if (React.isValidElement(IconOrNode)) {
      return (
        <span
          aria-hidden="true"
          className={cn(
            'flex shrink-0 items-center justify-center border shadow-2xs transition-transform duration-200 group-hover:scale-105',
            s.chip,
            ICON_TONE[tone]
          )}
        >
          {IconOrNode}
        </span>
      );
    }

    const Component = IconOrNode as React.ComponentType<{ className?: string }>;
    return (
      <span
        aria-hidden="true"
        className={cn(
          'flex shrink-0 items-center justify-center border shadow-2xs transition-transform duration-200 group-hover:scale-105',
          s.chip,
          ICON_TONE[tone]
        )}
      >
        <Component className={s.iconSize} />
      </span>
    );
  };

  const content = (
    <>
      {/* Header Slot: Label + Tooltip on left, Icon chip on right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn('truncate font-medium text-text-secondary tracking-tight', s.title)}
            title={displayTitle}
          >
            {displayTitle}
          </span>

          {displayInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={displayInfo}
                    className="shrink-0 text-text-muted hover:text-text-primary transition-colors cursor-help p-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-caption">
                  {displayInfo}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {renderIcon()}
      </div>

      {/* Body Slot: Value hero + optional badge / trend / hint */}
      <div
        className={cn(
          'my-2.5 flex min-w-0 flex-1 flex-col justify-center gap-1',
          isCentered ? 'items-center text-center' : 'items-start text-left'
        )}
      >
        {isLoading ? (
          <div className="space-y-2 w-full">
            <Skeleton className={cn('h-8 w-28', s.value)} />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-2 max-w-full">
              <span
                title={String(value)}
                className={cn(
                  'font-numeric font-bold tracking-tight max-w-full truncate leading-none',
                  s.value,
                  VALUE_TONE[tone]
                )}
              >
                {value}
              </span>

              {badge && (
                <div className="shrink-0">
                  {typeof badge === 'string' ? (
                    <span className="rounded-full border border-border/80 bg-surface-raised px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                      {badge}
                    </span>
                  ) : (
                    badge
                  )}
                </div>
              )}
            </div>

            {trend && (
              <div className="mt-1">
                <TrendBadge trend={trend} />
              </div>
            )}

            {displayHint && (
              <p
                title={displayHint}
                className="max-w-full truncate text-caption font-normal text-text-muted"
              >
                {displayHint}
              </p>
            )}

            {children}
          </>
        )}
      </div>

      {/* Footer Slot: Progress bars, comparison badges, or action links */}
      {(footer || action) && (
        <div className="mt-auto space-y-2 border-t border-border/60 pt-2.5">
          {footer}

          {action && (
            <div className="flex items-center justify-end">
              {action.href ? (
                <Link
                  href={action.href}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.();
                  }}
                  className="inline-flex items-center gap-1 text-caption font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.();
                  }}
                  className="inline-flex items-center gap-1 text-caption font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleCardClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      onAuxClick={isInteractive && href ? handleAuxClick : undefined}
      className={rootClass}
      aria-busy={isLoading}
    >
      {content}
    </div>
  );
}

/* ============================================================
   KpiGrid Component — responsive grid container for KPI cards
   ============================================================ */

const GRID_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
} as const;

export interface KpiGridProps {
  cols?: keyof typeof GRID_COLS;
  className?: string;
  children: ReactNode;
}

export function KpiGrid({ cols = 4, className, children }: KpiGridProps) {
  return <div className={cn('grid gap-3 sm:gap-4', GRID_COLS[cols], className)}>{children}</div>;
}
