'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Coins, HelpCircle, Layers, TrendingUp, Wallet } from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { DonutChart } from '@/components/ui/charts/donut-chart';
import { ChartCard } from '@/components/ui/charts/chart-card';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/libs/utils';

export interface WealthNetWorthCardProps {
  commoditiesValue: number;
  equitiesValue: number;
  mutualFundsValue: number;
  totalInvested: number;
  className?: string;
}

export function WealthNetWorthCard({
  commoditiesValue,
  equitiesValue,
  mutualFundsValue,
  totalInvested,
  className,
}: WealthNetWorthCardProps) {
  const totalNetWorth = commoditiesValue + equitiesValue + mutualFundsValue;
  const totalGain = totalNetWorth - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const isProfit = totalGain >= 0;

  const allocationData = [
    {
      name: 'Equities & Stocks',
      value: equitiesValue,
      color: 'var(--chart-1)',
    },
    {
      name: 'Mutual Funds',
      value: mutualFundsValue,
      color: 'var(--chart-2)',
    },
    {
      name: 'Precious Metals (Bullion)',
      value: commoditiesValue,
      color: '#f59e0b',
    },
  ].filter((d) => d.value > 0);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-surface via-surface to-surface-raised p-5 shadow-card',
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Net Worth KPI and Growth */}
        <div className="space-y-4 lg:max-w-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <Wallet className="h-4 w-4" />
              </span>
              <h3 className="font-display text-body-md font-semibold text-text-primary">
                Total Assets & Wealth
              </h3>
            </div>

            <div className="mt-3">
              <span className="font-numeric text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                {formatInr(totalNetWorth)}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-numeric text-caption font-semibold',
                    isProfit ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                  )}
                >
                  {isProfit ? '+' : ''}
                  {formatInr(totalGain)} ({totalGainPct.toFixed(1)}%)
                </span>
                <span className="text-caption text-text-muted">overall return</span>
              </div>
            </div>
          </div>

          {/* Quick Sub-Assets Overview */}
          <div className="grid grid-cols-2 gap-2 text-caption">
            <Link
              href="/dashboard/assets/gold-silver"
              className="group flex flex-col rounded-xl border border-border/80 bg-surface/70 p-2.5 transition-all hover:border-amber-500/50 hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-1 font-medium text-amber-500">
                  <Coins className="h-3.5 w-3.5" /> Bullion
                </span>
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <span className="mt-1 font-numeric font-bold text-text-primary">
                {formatInr(commoditiesValue)}
              </span>
            </Link>

            <Link
              href="/dashboard/assets/equity"
              className="group flex flex-col rounded-xl border border-border/80 bg-surface/70 p-2.5 transition-all hover:border-primary/50 hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-1 font-medium text-primary">
                  <TrendingUp className="h-3.5 w-3.5" /> Equities & MFs
                </span>
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <span className="mt-1 font-numeric font-bold text-text-primary">
                {formatInr(equitiesValue + mutualFundsValue)}
              </span>
            </Link>
          </div>
        </div>

        {/* Right: Allocation Donut */}
        <div className="flex-1 lg:max-w-md">
          <DonutChart
            data={allocationData}
            height={200}
            centerLabel="Net Worth"
            centerValue={formatCompactInr(totalNetWorth)}
            showLegend={true}
            legendPosition="right"
          />
        </div>
      </div>
    </div>
  );
}
