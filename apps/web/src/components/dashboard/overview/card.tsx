'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/libs/utils';

export interface KpiCardProps {
  title: string;
  value: string;
  hint?: string;
  badge?: string;
  icon?: LucideIcon;
  /** colours the value: green for positive, red for negative, amber for warning */
  tone?: 'default' | 'positive' | 'negative' | 'warning';
  isLoading?: boolean;
  className?: string;
}

const TONE_VALUE_CLASS = {
  default: 'text-text-primary',
  positive: 'text-success',
  negative: 'text-danger',
  warning: 'text-warning',
} as const;

const TONE_ICON_CLASS = {
  default: 'bg-primary-subtle text-primary border-primary/20',
  positive: 'bg-success-subtle text-success border-success/20',
  negative: 'bg-danger-subtle text-danger border-danger/20',
  warning: 'bg-warning-subtle text-warning border-warning/20',
} as const;

export function KpiCard({
  title,
  value,
  hint,
  badge,
  icon: Icon,
  tone = 'default',
  isLoading,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-medium text-text-secondary truncate">{title}</span>
        {Icon && (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105',
              TONE_ICON_CLASS[tone]
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="h-8 w-32 animate-pulse rounded-md bg-surface-raised" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'font-display text-display-xs sm:text-display-sm font-bold tracking-tight',
                TONE_VALUE_CLASS[tone]
              )}
            >
              {value}
            </span>
            {badge && (
              <span className="rounded-full bg-surface-raised px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                {badge}
              </span>
            )}
          </div>
        )}

        {hint && <p className="mt-1 text-caption text-text-muted truncate">{hint}</p>}
      </div>
    </div>
  );
}
