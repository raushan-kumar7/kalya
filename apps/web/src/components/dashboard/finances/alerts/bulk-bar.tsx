'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Trash2, X, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';

interface AlertsBulkBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarkSelectedAsRead: () => void;
  onDeleteSelected: () => void;
}

export function AlertsBulkBar({
  selectedCount,
  totalFilteredCount,
  isAllSelected,
  onSelectAll,
  onDeselectAll,
  onMarkSelectedAsRead,
  onDeleteSelected,
}: AlertsBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-4 rounded-2xl border border-border/90 bg-surface-raised/95 px-4 py-2.5 shadow-2xl backdrop-blur-md ring-1 ring-black/5"
      >
        {/* Selection Count & Select All */}
        <div className="flex items-center gap-2 border-r border-border/80 pr-3 sm:pr-4">
          <button
            type="button"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-primary hover:text-accent transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4 text-accent" />
            ) : (
              <Square className="h-4 w-4 text-text-tertiary" />
            )}
            <span>
              {selectedCount} selected{' '}
              <span className="hidden sm:inline font-normal text-text-muted">
                of {totalFilteredCount}
              </span>
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkSelectedAsRead}
            className="h-8 gap-1.5 px-3 text-xs font-medium text-text-primary hover:bg-surface-subtle"
          >
            <CheckCheck className="h-3.5 w-3.5 text-accent" />
            <span>Mark read</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteSelected}
            className="h-8 gap-1.5 px-3 text-xs font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>

        {/* Close / Deselect */}
        <button
          type="button"
          onClick={onDeselectAll}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition-all"
          title="Deselect all"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
