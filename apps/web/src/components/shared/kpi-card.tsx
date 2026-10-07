'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/libs/utils';

export interface KpiCardProps {
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  /** colours the value */
  tone?: 'default' | 'positive' | 'warning' | 'negative';
  isLoading?: boolean;
  /** extra content under the hint, e.g. a progress bar */
  footer?: ReactNode;
  className?: string;
}

const TONE = {
  default: 'text-text-primary',
  positive: 'text-success',
  warning: 'text-warning',
  negative: 'text-danger',
} as const;

const ICON_TONE = {
  default: 'bg-primary-subtle text-primary',
  positive: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  negative: 'bg-danger-subtle text-danger',
} as const;

export function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  isLoading,
  footer,
  className,
}: KpiCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface p-4 shadow-card', className)}>
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium text-text-secondary">{title}</span>
        {Icon && (
          <span
            className={cn('flex h-7 w-7 items-center justify-center rounded-full', ICON_TONE[tone])}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="mt-2 h-7 w-24 animate-pulse rounded bg-surface-raised" />
      ) : (
        <div className={cn('mt-1.5 font-numeric text-body-lg font-bold', TONE[tone])}>{value}</div>
      )}
      {hint && <div className="mt-1 text-caption text-text-muted">{hint}</div>}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
