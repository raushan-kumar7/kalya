'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Layers,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import type { Alert } from '@kalya/types';
import { cn } from '@/libs/utils';
import { formatInr } from '@kalya/utils';
import { Button } from '@/components/ui/forms/button';
import { AlertItem } from './item';
import type { ActivityFeedItem, AlertDayGroup } from './types';

interface AlertFeedProps {
  dayGroups: AlertDayGroup[];
  activityFeed: ActivityFeedItem[];
  viewMode: 'alerts' | 'feed';
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  onToggleReadStatus: (id: string, currentReadStatus: boolean) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string, hours: number) => void;
}

export function AlertFeed({
  dayGroups,
  activityFeed,
  viewMode,
  selectedIds,
  onToggleSelect,
  onMarkRead,
  onToggleReadStatus,
  onDelete,
  onSnooze,
}: AlertFeedProps) {
  const [displayCount, setDisplayCount] = useState<number>(20);

  if (viewMode === 'feed') {
    // Mixed Activity Feed View
    const visibleActivity = activityFeed.slice(0, displayCount);
    const hasMore = activityFeed.length > displayCount;

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">
            Timeline of Money & Events ({activityFeed.length})
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {visibleActivity.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              className="group flex items-center justify-between rounded-2xl border border-border/80 bg-surface-raised/70 p-3.5 hover:bg-surface-raised hover:border-border transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    item.type === 'alert'
                      ? 'bg-amber-500/15 text-amber-500'
                      : item.title.includes('Income')
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-rose-500/15 text-rose-500'
                  )}
                >
                  {item.type === 'alert' ? (
                    <Sparkles className="h-4 w-4" />
                  ) : item.title.includes('Income') ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                      {item.title}
                    </p>
                    {item.amount !== undefined && (
                      <span className="font-numeric text-xs font-bold text-text-primary">
                        {formatInr(item.amount)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary truncate">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-[11px] text-text-tertiary">
                  {new Date(item.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {item.href && (
                  <Link
                    href={item.href}
                    className="inline-flex items-center text-xs font-medium text-accent hover:text-accent-strong"
                  >
                    {item.actionLabel ?? 'View'} <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisplayCount((prev) => prev + 20)}
              className="gap-1.5 text-xs font-medium border-border"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Load more activity
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Standard Alerts Feed View - Grouped by Day
  return (
    <div className="flex flex-col gap-6">
      {dayGroups.map((group) => (
        <div key={group.dateKey} className="flex flex-col gap-2.5">
          {/* Day Group Header */}
          <div className="sticky top-14 z-10 flex items-center gap-2 bg-background/90 py-1.5 backdrop-blur-md">
            <Calendar className="h-3.5 w-3.5 text-text-tertiary" />
            <h2 className="text-xs font-semibold tracking-wider uppercase text-text-tertiary">
              {group.displayDate}
            </h2>
            <span className="text-[11px] font-medium text-text-muted">({group.items.length})</span>
            <div className="ml-2 h-px flex-1 bg-border/60" />
          </div>

          {/* Group Items */}
          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {group.items.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  isSelected={selectedIds.has(alert.id)}
                  onToggleSelect={onToggleSelect}
                  onMarkRead={onMarkRead}
                  onToggleReadStatus={onToggleReadStatus}
                  onDelete={onDelete}
                  onSnooze={onSnooze}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
