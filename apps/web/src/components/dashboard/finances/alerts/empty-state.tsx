'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';

interface AlertsEmptyStateProps {
  hasFiltersActive: boolean;
  onResetFilters: () => void;
  onOpenPreferences: () => void;
}

export function AlertsEmptyState({
  hasFiltersActive,
  onResetFilters,
  onOpenPreferences,
}: AlertsEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-surface/40 p-8 sm:p-12 text-center"
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised shadow-xs ring-1 ring-border/80">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold text-text-primary sm:text-lg">
        {hasFiltersActive ? 'No matching alerts found' : "You're all caught up!"}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs text-text-secondary sm:text-sm leading-relaxed">
        {hasFiltersActive
          ? 'No alerts match your current filter and search criteria. Try broadening your filter or clearing search.'
          : 'There are no active alerts or overdue financial events requiring your attention right now.'}
      </p>

      <div className="mt-6 flex items-center gap-3">
        {hasFiltersActive ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="gap-1.5 text-xs font-medium border-border"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        ) : null}

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenPreferences}
          className="gap-1.5 text-xs font-medium"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Notification settings
        </Button>
      </div>
    </motion.div>
  );
}
