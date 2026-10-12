'use client';

import * as React from 'react';
import { Calendar, Clock } from 'lucide-react';
import {
  formatCardDate,
  formatCalendarDate,
  formatDateTime,
  formatTime,
  formatTimeAgo,
  formatRelativeTime,
  fromISO,
  isSameDay,
  Temporal,
  type TimestampInput,
} from '@kalya/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import { Badge } from './badge';
import { cn } from '@/libs/utils';

export interface DateDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The ISO date string ('YYYY-MM-DD' or full timestamp), Date object, or Temporal.PlainDate */
  date: string | Temporal.PlainDate | Date;
  /** Optional creation timestamp (ISO string, epoch ms, Date, or Temporal instant) for time display & tooltip */
  timestamp?: TimestampInput | null;
  /** Presentation style */
  variant?: 'standard' | 'compact' | 'badge' | 'relative' | 'split';
  /** Show subtle time alongside the date */
  showTime?: boolean;
  /** Show calendar icon */
  showIcon?: boolean;
  /** Highlight relative day status (Today / Yesterday) */
  showRelativeTag?: boolean;
  /** Enable hover Radix tooltip with full date and time */
  withTooltip?: boolean;
  /** Timezone for formatting (defaults to 'Asia/Kolkata') */
  timezone?: string;
}

/**
 * Normalizes input date to Temporal.PlainDate
 */
function toPlainDate(input: string | Temporal.PlainDate | Date): Temporal.PlainDate | null {
  if (input instanceof Temporal.PlainDate) return input;
  if (input instanceof Date) {
    return Temporal.PlainDate.from({
      year: input.getFullYear(),
      month: input.getMonth() + 1,
      day: input.getDate(),
    });
  }
  if (typeof input === 'string') {
    // If it's a full ISO timestamp like '2026-10-12T14:30:00Z', extract date part
    const dateStr = input.includes('T') ? input.split('T')[0] : input;
    return fromISO(dateStr);
  }
  return null;
}

export const DateDisplay = React.forwardRef<HTMLDivElement, DateDisplayProps>(
  (
    {
      date,
      timestamp,
      variant = 'standard',
      showTime = false,
      showIcon = false,
      showRelativeTag = false,
      withTooltip = true,
      timezone = 'Asia/Kolkata',
      className,
      ...props
    },
    ref
  ) => {
    const plainDate = React.useMemo(() => toPlainDate(date), [date]);

    // Format relative metadata (Today / Yesterday)
    const relativeMeta = React.useMemo(() => {
      if (!plainDate) return null;
      try {
        const today = Temporal.Now.plainDateISO();
        const yesterday = today.subtract({ days: 1 });
        if (isSameDay(plainDate, today)) return 'Today';
        if (isSameDay(plainDate, yesterday)) return 'Yesterday';
        return null;
      } catch {
        return null;
      }
    }, [plainDate]);

    // Standard card date string (e.g., "12 Oct 2026")
    const formattedCard = React.useMemo(() => {
      return plainDate ? formatCardDate(plainDate) : typeof date === 'string' ? date : '—';
    }, [plainDate, date]);

    // Full tooltip timestamp description
    const fullTooltipText = React.useMemo(() => {
      if (!plainDate) return typeof date === 'string' ? date : '';
      const fullCalendar = formatCalendarDate(plainDate);
      if (timestamp) {
        const timeStr = formatDateTime(timestamp, timezone);
        return `${fullCalendar} • ${timeStr}`;
      }
      return fullCalendar;
    }, [plainDate, timestamp, timezone, date]);

    // Format short time if timestamp available (e.g., "3:42 PM IST")
    const timeFormatted = React.useMemo(() => {
      if (!timestamp) return null;
      try {
        return formatTime(timestamp, timezone);
      } catch {
        return null;
      }
    }, [timestamp, timezone]);

    // Visual rendering based on variant
    const content = (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-1.5 font-numeric select-none', className)}
        {...props}
      >
        {showIcon && <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />}

        {showRelativeTag && relativeMeta && (
          <Badge
            variant={relativeMeta === 'Today' ? 'subtle' : 'secondary'}
            size="sm"
            className="text-[10px] h-4.5 px-1 font-semibold uppercase tracking-wider shrink-0"
          >
            {relativeMeta}
          </Badge>
        )}

        {variant === 'badge' ? (
          <Badge variant="outline" size="sm" className="font-numeric text-caption">
            {formattedCard}
          </Badge>
        ) : variant === 'compact' ? (
          <span className="text-caption text-text-secondary whitespace-nowrap">
            {plainDate
              ? plainDate.toLocaleString('en-IN', { day: 'numeric', month: 'short' })
              : formattedCard}
          </span>
        ) : (
          <span className="text-caption text-text-secondary whitespace-nowrap">
            {formattedCard}
          </span>
        )}

        {showTime && timeFormatted && (
          <span className="text-[11px] text-text-muted font-normal whitespace-nowrap flex items-center gap-0.5">
            <Clock className="h-3 w-3 inline text-text-muted/60" />
            {timeFormatted}
          </span>
        )}
      </div>
    );

    if (!withTooltip || !fullTooltipText) {
      return content;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-on-primary">{fullTooltipText}</span>
              {timestamp && (
                <span className="text-[10px] text-on-primary/75">{formatTimeAgo(timestamp)}</span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

DateDisplay.displayName = 'DateDisplay';
