'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/libs/utils';
import type { GoalInsight } from './types';

export interface GoalsInsightsBannerProps {
  insights: GoalInsight[];
  onActionClick?: (goalId?: string) => void;
  onDismiss?: (id: string) => void;
}

export function GoalsInsightsBanner({
  insights,
  onActionClick,
  onDismiss,
}: GoalsInsightsBannerProps) {
  if (!insights.length) return null;

  return (
    <div
      className={cn(
        'grid gap-3',
        insights.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
      )}
    >
      {insights.map((item) => {
        const isPositive = item.tone === 'positive';
        const isWarning = item.tone === 'warning';
        const isNegative = item.tone === 'negative';

        return (
          <div
            key={item.id}
            className={cn(
              'group relative flex items-start justify-between gap-3 rounded-xl border p-3.5 shadow-2xs transition-all',
              isPositive && 'border-success/30 bg-success-subtle/40 text-text-primary',
              isWarning && 'border-warning/30 bg-warning-subtle/40 text-text-primary',
              isNegative && 'border-danger/30 bg-danger-subtle/40 text-text-primary',
              !isPositive && !isWarning && !isNegative && 'border-border bg-surface-raised'
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  isPositive && 'bg-success text-on-success shadow-xs',
                  isWarning && 'bg-warning text-on-warning shadow-xs',
                  isNegative && 'bg-danger text-on-danger shadow-xs',
                  !isPositive && !isWarning && !isNegative && 'bg-primary text-on-primary shadow-xs'
                )}
              >
                {isPositive ? (
                  <Sparkles className="h-4 w-4" />
                ) : isNegative ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </span>

              <div className="min-w-0 pr-1">
                <h4 className="font-display text-body-sm font-semibold text-text-primary truncate">
                  {item.title}
                </h4>
                <p className="mt-0.5 text-caption text-text-secondary leading-snug line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-center">
              {item.actionLabel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onActionClick?.(item.goalId)}
                  className="gap-1 text-caption font-medium h-7 px-2.5 bg-surface/90 hover:bg-surface border-border/80"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(item.id)}
                  className="h-7 w-7 p-0 text-text-muted hover:text-text-primary"
                  aria-label="Dismiss banner"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
