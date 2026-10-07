'use client';

import React from 'react';
import { RotateCw, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/libs/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';

export interface MarketPriceBadgeProps {
  goldRate?: number;
  silverRate?: number;
  lastRefreshedAt?: Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
  showMetals?: boolean;
}

export function MarketPriceBadge({
  goldRate = 7650,
  silverRate = 94.5,
  lastRefreshedAt,
  isRefreshing = false,
  onRefresh,
  className,
  showMetals = true,
}: MarketPriceBadgeProps) {
  const timeAgo = React.useMemo(() => {
    if (!lastRefreshedAt) return 'Live';
    const sec = Math.floor((new Date().getTime() - lastRefreshedAt.getTime()) / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    return `${min}m ago`;
  }, [lastRefreshedAt, isRefreshing]);

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-surface-raised/70 px-3 py-1.5 text-body-xs shadow-xs backdrop-blur-xs',
        className
      )}
    >
      {/* Live Indicator */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="font-semibold text-text-secondary uppercase tracking-wider text-[10px]">
          Market Data
        </span>
      </div>

      {showMetals && (
        <>
          <span className="h-3 w-px bg-border/80" />

          {/* Gold Ticker */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-amber-500">24K Gold:</span>
            <span className="font-numeric font-semibold text-text-primary">
              ₹{goldRate.toLocaleString('en-IN')}/g
            </span>
          </div>

          <span className="h-3 w-px bg-border/80" />

          {/* Silver Ticker */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-400">999 Silver:</span>
            <span className="font-numeric font-semibold text-text-primary">
              ₹{silverRate.toFixed(1)}/g
            </span>
          </div>
        </>
      )}

      {onRefresh && (
        <>
          <span className="h-3 w-px bg-border/80" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <RotateCw
                    className={cn('h-3 w-3', isRefreshing && 'animate-spin text-primary')}
                  />
                  <span>{timeAgo}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Click to refresh market quotes ({timeAgo})</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
