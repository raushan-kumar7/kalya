'use client';

import React from 'react';
import { Button } from '@/components/ui/forms/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays/popover';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  RotateCcw,
  Split,
  Wallet,
} from 'lucide-react';

export interface TransactionsHeaderProps {
  monthLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  isCurrentMonth?: boolean;
  onGoToCurrentMonth?: () => void;
  onOpenCreateExpense: () => void;
  onOpenCreateSplit: () => void;
  onOpenCreateIncome: () => void;
}

export function TransactionsHeader({
  monthLabel,
  onPreviousMonth,
  onNextMonth,
  isCurrentMonth = true,
  onGoToCurrentMonth,
  onOpenCreateExpense,
  onOpenCreateSplit,
  onOpenCreateIncome,
}: TransactionsHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-5">
      {/* Left: Month Navigator & Quick "Current Month" Reset */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-1 py-1 shadow-xs">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onPreviousMonth}
            aria-label="Previous month"
            className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-surface-raised cursor-pointer rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5 px-2.5 min-w-32 justify-center">
            <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <span className="text-center font-body text-body-sm font-semibold text-text-primary select-none whitespace-nowrap">
              {monthLabel}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onNextMonth}
            aria-label="Next month"
            className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-surface-raised cursor-pointer rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick jump to current month button if navigating past/future months */}
        {!isCurrentMonth && onGoToCurrentMonth && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onGoToCurrentMonth}
            className="h-8 gap-1 rounded-lg text-caption text-primary hover:bg-primary-subtle cursor-pointer transition-colors"
            title="Reset to current calendar month"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Today</span>
          </Button>
        )}
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2 justify-end">
        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateExpense}
            className="gap-1.5 shadow-xs cursor-pointer font-medium"
          >
            <Receipt className="h-4 w-4" />
            <span>Log Expense</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateSplit}
            className="gap-1.5 border-primary/40 text-primary hover:bg-primary-subtle/50 cursor-pointer shadow-xs font-medium"
          >
            <Split className="h-4 w-4" />
            <span>Split Bill</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateIncome}
            className="gap-1.5 border-border hover:bg-surface-raised cursor-pointer shadow-xs font-medium"
          >
            <Wallet className="h-4 w-4 text-success" />
            <span>Log Income</span>
          </Button>
        </div>

        {/* Mobile Action Dropdown */}
        <div className="flex sm:hidden">
          <Popover open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="primary" size="sm" className="gap-1.5 cursor-pointer shadow-xs">
                <Plus className="h-4 w-4" />
                <span>Log Transaction</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-1.5 shadow-raised">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCreateExpense();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-body-sm font-medium text-text-primary transition-colors hover:bg-surface-raised cursor-pointer"
                >
                  <Receipt className="h-4 w-4 text-primary" />
                  <span>Log Expense</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCreateSplit();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-body-sm font-medium text-text-primary transition-colors hover:bg-surface-raised cursor-pointer"
                >
                  <Split className="h-4 w-4 text-accent" />
                  <span>Split Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCreateIncome();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-body-sm font-medium text-text-primary transition-colors hover:bg-surface-raised cursor-pointer"
                >
                  <Wallet className="h-4 w-4 text-success" />
                  <span>Log Income</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
