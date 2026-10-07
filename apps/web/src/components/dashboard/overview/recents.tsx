'use client';

import Link from 'next/link';
import { formatCardDate, formatInr } from '@kalya/utils';
import { ChartCard } from '@/components/ui/charts';
import { cn } from '@/libs/utils';
import { ArrowDownLeft, ArrowUpRight, Receipt, Users, ChevronRight } from 'lucide-react';
import type { RecentRow } from './helper';

export interface RecentTransactionsProps {
  items: RecentRow[];
  isLoading?: boolean;
  viewAllHref: string;
}

export function RecentTransactions({ items, isLoading, viewAllHref }: RecentTransactionsProps) {
  return (
    <ChartCard
      title="Recent transactions"
      description="Latest activities from this month"
      isLoading={isLoading}
      isEmpty={!items.length}
      emptyMessage="No transactions recorded for this period yet."
      action={
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-caption font-medium text-primary transition-colors hover:text-primary-hover hover:underline"
        >
          <span>View all</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
    >
      <ul className="divide-y divide-border/50">
        {items.map((item) => {
          const isIncome = item.isIncome;
          const isSplit = item.kind === 'split_bill';

          return (
            <li
              key={item.id}
              className="group flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-surface-raised/40 -mx-2 px-2 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                    isIncome
                      ? 'bg-success-subtle text-success'
                      : isSplit
                        ? 'bg-accent-subtle text-accent'
                        : 'bg-surface-raised text-text-secondary'
                  )}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : isSplit ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-body-sm font-medium text-text-primary">
                    {item.description}
                  </div>
                  <div className="flex items-center gap-1.5 truncate text-caption text-text-muted">
                    <span>{item.subtitle}</span>
                    <span>·</span>
                    <span>{formatCardDate(item.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end">
                <span
                  className={cn(
                    'font-numeric text-body-sm font-bold tracking-tight',
                    isIncome ? 'text-success' : 'text-text-primary'
                  )}
                >
                  {isIncome ? '+' : '-'}
                  {formatInr(item.amount)}
                </span>
                {isSplit && (
                  <span className="text-[10px] font-medium text-accent">Split share</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
