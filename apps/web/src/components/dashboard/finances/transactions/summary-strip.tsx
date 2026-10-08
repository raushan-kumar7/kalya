'use client';

import * as React from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/shared';
import type { TransactionSummaryMetrics } from './types';

export interface SummaryStripProps {
  metrics: TransactionSummaryMetrics;
  isLoading?: boolean;
}

export function SummaryStrip({ metrics, isLoading = false }: SummaryStripProps) {
  const isNetPositive = metrics.netCashflow >= 0;

  return (
    <div className="w-full">
      <KpiGrid cols={5}>
        {/* Card 1: Income */}
        <KpiCard
          title="Income"
          value={`+₹${metrics.totalIncome.toLocaleString('en-IN')}`}
          hint="Total received this month"
          icon={ArrowDownLeft}
          tone="positive"
          size="sm"
          isLoading={isLoading}
        />

        {/* Card 2: Spent (Personal) */}
        <KpiCard
          title="Spent (Personal)"
          value={`-₹${metrics.totalSpentPersonal.toLocaleString('en-IN')}`}
          hint="Direct spend + your share"
          icon={ArrowUpRight}
          tone="negative"
          size="sm"
          isLoading={isLoading}
        />

        {/* Card 3: Friends Owe You */}
        <KpiCard
          title="Friends Owe You"
          value={`₹${metrics.friendsOweYou.toLocaleString('en-IN')}`}
          hint="Pending from split bills"
          icon={Users}
          tone="accent"
          size="sm"
          isLoading={isLoading}
        />

        {/* Card 4: You Owe */}
        <KpiCard
          title="You Owe"
          value={`₹${metrics.youOwe.toLocaleString('en-IN')}`}
          hint="Bills friends paid for you"
          icon={Clock}
          tone="warning"
          size="sm"
          isLoading={isLoading}
        />

        {/* Card 5: Net Cashflow */}
        <KpiCard
          title="Net Cashflow"
          value={`${isNetPositive ? '+' : '-'}₹${Math.abs(metrics.netCashflow).toLocaleString('en-IN')}`}
          hint={isNetPositive ? 'Net savings surplus' : 'Net monthly deficit'}
          icon={isNetPositive ? TrendingUp : TrendingDown}
          tone={isNetPositive ? 'positive' : 'negative'}
          highlight
          size="sm"
          isLoading={isLoading}
        />
      </KpiGrid>
    </div>
  );
}
