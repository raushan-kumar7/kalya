'use client';

import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/libs/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';

export interface ChartCardProps {
  title: string;
  description?: string;
  /** optional "how is this calculated" hint, shown in a tooltip next to the title */
  info?: string;
  /** right side of header: filters, tabs, "View all" link */
  action?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  error?: string | null;
  /** used for skeleton / empty placeholder height */
  height?: number;
  className?: string;
  children: ReactNode;
}

/** Shell for every chart / widget: header + loading + empty + error states. */
export function ChartCard({
  title,
  description,
  info,
  action,
  isLoading,
  isEmpty,
  emptyMessage = 'No data for this period yet.',
  error,
  height = 260,
  className,
  children,
}: ChartCardProps) {
  let body: ReactNode = children;

  if (isLoading) {
    body = <div className="animate-pulse rounded-lg bg-surface-raised" style={{ height }} />;
  } else if (error) {
    body = (
      <div className="flex items-center justify-center text-body-sm text-danger" style={{ height }}>
        {error}
      </div>
    );
  } else if (isEmpty) {
    body = (
      <div
        className="flex items-center justify-center text-body-sm text-text-muted"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <section
      className={cn(
        'flex flex-col rounded-xl border border-border bg-surface p-4 shadow-card',
        className
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-body-md font-semibold text-text-primary">{title}</h3>
            {info && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`About ${title}`}
                      className="cursor-pointer text-text-muted hover:text-text-primary"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{info}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {description && <p className="text-caption text-text-muted">{description}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1 min-h-0 flex flex-col">{body}</div>
    </section>
  );
}
