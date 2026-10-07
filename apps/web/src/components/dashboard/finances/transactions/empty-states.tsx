'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/states/empty-state';
import { Button } from '@/components/ui/forms/button';
import { Receipt, RotateCcw, SearchX, Split, Wallet } from 'lucide-react';
import type { TransactionTab } from './types';

export interface TransactionsEmptyStateProps {
  type: 'no-data' | 'no-filter-match' | 'split-empty';
  activeTab?: TransactionTab;
  onClearFilters?: () => void;
  onOpenCreateExpense: () => void;
  onOpenCreateSplit: () => void;
  onOpenCreateIncome: () => void;
}

export function TransactionsEmptyState({
  type,
  onClearFilters,
  onOpenCreateExpense,
  onOpenCreateSplit,
  onOpenCreateIncome,
}: TransactionsEmptyStateProps) {
  if (type === 'no-filter-match') {
    return (
      <EmptyState
        icon={<SearchX className="h-10 w-10 text-text-muted" />}
        title="No transactions match your filters."
        description="Try adjusting your search terms, date range, or category filter to discover recorded transactions."
        action={
          onClearFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </Button>
          )
        }
      />
    );
  }

  if (type === 'split-empty') {
    return (
      <EmptyState
        icon={<Split className="h-10 w-10 text-text-muted" />}
        title="No split bills yet."
        description="Split a bill with friends to track who owes what and maintain fair balances."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateSplit}
            className="gap-1.5 cursor-pointer shadow-xs"
          >
            <Split className="h-4 w-4" />
            <span>Split Bill</span>
          </Button>
        }
      />
    );
  }

  // Fallback: No data at all in selected month
  return (
    <EmptyState
      icon={<Receipt className="h-10 w-10 text-text-muted" />}
      title="No transactions yet."
      description="Start by logging your first expense or registering your monthly earnings."
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateExpense}
            className="gap-1.5 cursor-pointer shadow-xs"
          >
            <Receipt className="h-4 w-4" />
            <span>Log Expense</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateSplit}
            className="gap-1.5 border-primary/40 text-primary hover:bg-primary-subtle/50 cursor-pointer shadow-xs"
          >
            <Split className="h-4 w-4" />
            <span>Split Bill</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateIncome}
            className="gap-1.5 border-border hover:bg-surface-raised cursor-pointer shadow-xs"
          >
            <Wallet className="h-4 w-4 text-success" />
            <span>Log Income</span>
          </Button>
        </div>
      }
    />
  );
}
