'use client';

import React from 'react';
import {
  Coins,
  IndianRupee,
  Percent,
  PiggyBank,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { AssetsSummaryStrip, WealthKpiItem } from '../shared/summary-strip';
import { GoldSilverTotals } from '@/hooks/finances/use-gold-silver';

export interface GoldSilverSummaryProps {
  totals: GoldSilverTotals;
  isLoading?: boolean;
}

export function GoldSilverSummary({ totals, isLoading }: GoldSilverSummaryProps) {
  const isProfit = totals.totalGainLoss >= 0;

  const kpis: WealthKpiItem[] = [
    {
      id: 'gold-weight',
      title: 'Gold Held',
      value: `${totals.goldWeight} g`,
      hint: `Valued at ${formatCompactInr(totals.goldCurrentValue)}`,
      icon: Coins,
      tone: 'default',
      tooltip:
        'Total physical and digital gold weight currently held across all vaults and platforms.',
    },
    {
      id: 'silver-weight',
      title: 'Silver Held',
      value: `${totals.silverWeight} g`,
      hint: `Valued at ${formatCompactInr(totals.silverCurrentValue)}`,
      icon: Sparkles,
      tone: 'default',
      tooltip: 'Total fine 999 silver bullion weight held across all vaults and accounts.',
    },
    {
      id: 'total-invested',
      title: 'Total Invested',
      value: formatInr(totals.totalInvested),
      hint: `Across ${totals.purchaseCount} purchases`,
      icon: PiggyBank,
      tone: 'default',
      tooltip:
        'Gross amount paid to purchase bullion, including the mandatory 3% GST on precious metals.',
    },
    {
      id: 'current-value',
      title: 'Market Valuation',
      value: formatInr(totals.totalCurrentValue),
      hint: `Gold @ ₹${totals.goldMarketRate}/g`,
      icon: Wallet,
      tone: 'default',
      tooltip:
        'Current portfolio value based on live 24K Gold and 999 Silver bullion market rates.',
    },
    {
      id: 'gain-loss',
      title: 'Net Gain / Loss',
      value: `${isProfit ? '+' : ''}${formatInr(totals.totalGainLoss)}`,
      hint: `${isProfit ? '+' : ''}${totals.totalGainLossPct.toFixed(1)}% net return`,
      icon: isProfit ? TrendingUp : TrendingDown,
      tone: isProfit ? 'positive' : 'negative',
      tooltip:
        'Current Valuation minus Total Invested. Reflects unrealized profit or loss after taxes.',
    },
    {
      id: 'avg-buy-rate',
      title: 'Avg Buy Rates',
      value: totals.goldWeight > 0 ? `₹${Math.round(totals.goldAvgBuyRate)}/g` : '—',
      hint:
        totals.silverWeight > 0
          ? `Silver: ₹${totals.silverAvgBuyRate.toFixed(1)}/g`
          : 'Gold buy average',
      icon: Scale,
      tone: 'default',
      tooltip: 'Weighted average purchase price per gram across your accumulated lots.',
    },
  ];

  return <AssetsSummaryStrip items={kpis} isLoading={isLoading} />;
}
