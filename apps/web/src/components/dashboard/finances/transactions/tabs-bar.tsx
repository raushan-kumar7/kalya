'use client';

import React from 'react';
import type { TransactionTab } from './types';
import { cn } from '@/libs/utils';

export interface TabsBarProps {
  activeTab: TransactionTab;
  onTabChange: (tab: TransactionTab) => void;
  counts: {
    all: number;
    expense: number;
    split: number;
    income: number;
  };
}

export function TabsBar({ activeTab, onTabChange, counts }: TabsBarProps) {
  const tabs: { id: TransactionTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'expense', label: 'Expenses', count: counts.expense },
    { id: 'split', label: 'Split Bills', count: counts.split },
    { id: 'income', label: 'Incomes', count: counts.income },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-raised p-1 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-body text-body-sm transition-all duration-150 cursor-pointer whitespace-nowrap select-none',
                isActive
                  ? 'bg-surface text-text-primary font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface/50 font-medium'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-numeric text-[11px] font-medium leading-none transition-colors',
                  isActive
                    ? 'bg-primary-subtle text-primary'
                    : 'bg-surface text-text-muted border border-border/50'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
