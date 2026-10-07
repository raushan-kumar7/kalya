'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { ArrowDownLeft, ArrowUpRight, Clock, TrendingDown, TrendingUp, Users } from 'lucide-react';
import type { TransactionSummaryMetrics } from './types';
import { cn } from '@/libs/utils';

export interface SummaryStripProps {
  metrics: TransactionSummaryMetrics;
}

export function SummaryStrip({ metrics }: SummaryStripProps) {
  const isNetPositive = metrics.netCashflow >= 0;

  return (
    <div className="w-full">
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
        {/* Card 1: Income */}
        <Card variant="raised" className="min-w-50 shrink-0 snap-start sm:min-w-0 border-border/80">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-caption font-medium text-text-muted">Income</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-subtle text-success">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="font-numeric text-heading-xs font-bold text-success">
                +₹{metrics.totalIncome.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">
                Total received this month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Spent (Personal) */}
        {/* <Card variant="raised" className="min-w-50 shrink-0 snap-start sm:min-w-0 border-border/80">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-caption font-medium text-text-muted">
                Spent (Personal)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-raised text-text-primary">
                <ArrowUpRight className="h-4 w-4 text-text-secondary" />
              </div>
            </div>
            <div className="mt-2">
              <div className="font-numeric text-heading-xs font-bold text-text-primary">
                -₹{metrics.totalSpentPersonal.toLocaleString('en-IN')}
              </div>
              <p
                className="text-[11px] text-text-muted mt-0.5 truncate"
                title="Direct spend + your share only"
              >
                Direct spend + your share
              </p>
            </div>
          </CardContent>
        </Card> */}
        {/* Card 2: Spent (Personal) */}
        <Card variant="raised" className="min-w-50 shrink-0 snap-start sm:min-w-0 border-border/80">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-caption font-medium text-text-muted">
                Spent (Personal)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger-subtle text-danger">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="font-numeric text-heading-xs font-bold text-danger">
                -₹{metrics.totalSpentPersonal.toLocaleString('en-IN')}
              </div>
              <p
                className="text-[11px] text-text-muted mt-0.5 truncate"
                title="Direct spend + your share only"
              >
                Direct spend + your share
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Friends Owe You */}
        <Card variant="raised" className="min-w-50 shrink-0 snap-start sm:min-w-0 border-border/80">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-caption font-medium text-text-muted">
                Friends Owe You
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="font-numeric text-heading-xs font-bold text-accent">
                ₹{metrics.friendsOweYou.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">
                Pending from split bills
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: You Owe */}
        <Card variant="raised" className="min-w-50 shrink-0 snap-start sm:min-w-0 border-border/80">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-caption font-medium text-text-muted">You Owe</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-subtle text-warning">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="font-numeric text-heading-xs font-bold text-warning">
                ₹{metrics.youOwe.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">
                Bills friends paid for you
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Net (Optional / 5th Card) */}
        <Card
          variant="raised"
          className={cn(
            'min-w-50 shrink-0 snap-start sm:min-w-0 border-border/80',
            isNetPositive
              ? 'border-success/30 bg-success-subtle/10'
              : 'border-danger/30 bg-danger-subtle/10'
          )}
        >
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-caption font-medium text-text-muted">
                Net Cashflow
              </span>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg',
                  isNetPositive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                )}
              >
                {isNetPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
            </div>
            <div className="mt-2">
              <div
                className={cn(
                  'font-numeric text-heading-xs font-bold',
                  isNetPositive ? 'text-success' : 'text-danger'
                )}
              >
                {isNetPositive ? '+' : '-'}₹{Math.abs(metrics.netCashflow).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">
                {isNetPositive ? 'Net savings surplus' : 'Net monthly deficit'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
