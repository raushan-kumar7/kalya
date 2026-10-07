'use client';

import React from 'react';
import {
  Calendar,
  Layers,
  Percent,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { AssetsSummaryStrip, WealthKpiItem } from '../shared/summary-strip';
import { EquitiesTotals } from '@/hooks/finances/use-equities';

export interface EquitiesSummaryProps {
  totals: EquitiesTotals;
  isLoading?: boolean;
}

export function EquitiesSummary({ totals, isLoading }: EquitiesSummaryProps) {
  const isProfit = totals.totalGainLoss >= 0;
  const isDayProfit = totals.dayChange >= 0;

  const kpis: WealthKpiItem[] = [
    {
      id: 'total-invested',
      title: 'Total Invested',
      value: formatInr(totals.totalInvested),
      hint: `${totals.stocksCount} stocks • ${totals.mfsCount} mutual funds`,
      icon: PiggyBank,
      tone: 'default',
      tooltip: 'Combined capital deployed across equity stocks and mutual fund holdings.',
    },
    {
      id: 'current-value',
      title: 'Current Value',
      value: formatInr(totals.currentValue),
      hint: `Stocks: ${formatCompactInr(totals.stocksCurrentValue)} • MFs: ${formatCompactInr(totals.mfsCurrentValue)}`,
      icon: Wallet,
      tone: 'default',
      tooltip:
        'Consolidated market valuation of all stock shares and mutual fund units based on latest prices.',
    },
    {
      id: 'day-change',
      title: 'Day Change',
      value: `${isDayProfit ? '+' : ''}${formatInr(totals.dayChange)}`,
      hint: `${isDayProfit ? '+' : ''}${totals.dayChangePct.toFixed(2)}% today`,
      icon: Zap,
      tone: isDayProfit ? 'positive' : 'negative',
      tooltip: 'Estimated portfolio gain or loss for the current trading day.',
    },
    {
      id: 'total-gain-loss',
      title: 'Total Returns',
      value: `${isProfit ? '+' : ''}${formatInr(totals.totalGainLoss)}`,
      hint: `${isProfit ? '+' : ''}${totals.totalGainLossPct.toFixed(1)}% absolute return`,
      icon: isProfit ? TrendingUp : TrendingDown,
      tone: isProfit ? 'positive' : 'negative',
      tooltip:
        'Total unrealized profit or loss calculated as Current Valuation minus Total Invested.',
    },
    {
      id: 'xirr-return',
      title: 'Annualized Return (XIRR)',
      value: `${totals.xirr.toFixed(1)}%`,
      hint: 'Weighted compound growth',
      icon: Percent,
      tone: totals.xirr >= 12 ? 'positive' : 'default',
      tooltip:
        'Extended Internal Rate of Return (XIRR) accounting for irregular cash inflows over time.',
    },
    {
      id: 'holdings-count',
      title: 'Active Holdings',
      value: String(totals.holdingsCount),
      hint: `${totals.stocksCount} listed stocks • ${totals.mfsCount} schemes`,
      icon: Layers,
      tone: 'default',
      tooltip: 'Total distinct companies and mutual fund schemes currently held in your portfolio.',
    },
  ];

  return <AssetsSummaryStrip items={kpis} isLoading={isLoading} />;
}
