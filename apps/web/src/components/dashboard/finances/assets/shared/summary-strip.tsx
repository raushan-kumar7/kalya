'use client';

import React, { ReactNode } from 'react';
import {
  HelpCircle,
  IndianRupee,
  Layers,
  LucideIcon,
  Percent,
  PiggyBank,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';

export interface WealthKpiItem {
  id: string;
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'positive' | 'warning' | 'negative';
  tooltip?: string;
  footer?: ReactNode;
}

export interface AssetsSummaryStripProps {
  items: WealthKpiItem[];
  isLoading?: boolean;
  className?: string;
}

const TONE_CLASSES = {
  default: 'text-text-primary',
  positive: 'text-success',
  warning: 'text-warning',
  negative: 'text-danger',
} as const;

const ICON_TONE_CLASSES = {
  default: 'bg-primary-subtle text-primary',
  positive: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  negative: 'bg-danger-subtle text-danger',
} as const;

export function AssetsSummaryStrip({
  items,
  isLoading = false,
  className,
}: AssetsSummaryStripProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6', className)}>
      {items.map((kpi) => {
        const Icon = kpi.icon || Wallet;
        const tone = kpi.tone || 'default';

        return (
          <div
            key={kpi.id}
            className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 shadow-card transition-all hover:border-border-strong hover:shadow-md"
          >
            {/* Header: Title + Info Tooltip + Icon */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 min-w-0">
                <span className="truncate text-caption font-medium text-text-secondary">
                  {kpi.title}
                </span>

                {kpi.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="shrink-0 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        {kpi.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  ICON_TONE_CLASSES[tone]
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Value */}
            <div className="mt-2.5">
              {isLoading ? (
                <div className="h-7 w-20 animate-pulse rounded bg-surface-raised" />
              ) : (
                <div
                  className={cn(
                    'font-numeric text-body-lg font-bold tracking-tight',
                    TONE_CLASSES[tone]
                  )}
                >
                  {kpi.value}
                </div>
              )}

              {/* Subtitle / Hint */}
              {kpi.hint && (
                <div className="mt-1 truncate text-caption text-text-muted">{kpi.hint}</div>
              )}
            </div>

            {kpi.footer && <div className="mt-2 pt-2 border-t border-border/60">{kpi.footer}</div>}
          </div>
        );
      })}
    </div>
  );
}
