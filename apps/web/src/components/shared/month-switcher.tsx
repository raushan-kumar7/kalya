'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '../ui';

export interface MonthSwitcherProps {
  monthLabel: string;
  isCurrentMonth: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToCurrentMonth?: () => void;
  /** Show the calendar icon next to the label */
  showIcon?: boolean;
  /** Label for the reset button */
  resetLabel?: string;
  className?: string;
}

const navButtonClass =
  'h-8 w-8 cursor-pointer rounded-lg text-text-secondary hover:bg-surface-raised hover:text-text-primary';

export function MonthSwitcher({
  monthLabel,
  isCurrentMonth,
  onPreviousMonth,
  onNextMonth,
  onGoToCurrentMonth,
  showIcon = true,
  resetLabel = 'Today',
  className,
}: MonthSwitcherProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-1 py-1 shadow-xs">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onPreviousMonth}
          aria-label="Previous month"
          className={navButtonClass}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex min-w-32 items-center justify-center gap-1.5 px-2.5">
          {showIcon && <Calendar className="h-3.5 w-3.5 shrink-0 text-text-muted" />}
          <span className="select-none whitespace-nowrap text-center font-body text-body-sm font-semibold text-text-primary">
            {monthLabel}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onNextMonth}
          aria-label="Next month"
          className={navButtonClass}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!isCurrentMonth && onGoToCurrentMonth && (
        <Button
          variant="ghost"
          size="xs"
          onClick={onGoToCurrentMonth}
          title="Reset to current calendar month"
          className="h-8 cursor-pointer gap-1 rounded-lg text-caption text-primary transition-colors hover:bg-primary-subtle"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{resetLabel}</span>
        </Button>
      )}
    </div>
  );
}
