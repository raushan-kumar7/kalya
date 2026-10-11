'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Coins,
  CreditCard,
  Layers,
  PieChart,
  Plus,
  Scale,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { Button } from '@/components/ui/forms/button';
import { WealthNetWorthCard } from '@/components/dashboard/finances/assets/shared';
import { useGoldSilverData } from '@/hooks/finances/use-gold-silver';
import { useEquitiesData } from '@/hooks/finances/use-equities';

export default function AssetsPage() {
  const goldSilver = useGoldSilverData();
  const equities = useEquitiesData();

  const totalCommodities = goldSilver.totals.totalInvested;
  const totalEquities = equities.totals.stocksCurrentValue;
  const totalMutualFunds = equities.totals.mfsCurrentValue;
  const totalInvested = goldSilver.totals.totalInvested + equities.totals.totalInvested;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 pb-12">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary shadow-inner">
              <Wallet className="h-5 w-5" />
            </span>
            <h1 className="font-display text-heading-md font-bold text-text-primary">
              Assets & Wealth Portfolio
            </h1>
          </div>
          <p className="mt-1 text-body-sm text-text-secondary">
            Unified view of your bullion commodities, listed equities, and mutual fund investments.
          </p>
        </div>
      </header>

      {/* Aggregate Net Worth Card */}
      <WealthNetWorthCard
        commoditiesValue={totalCommodities}
        equitiesValue={totalEquities}
        mutualFundsValue={totalMutualFunds}
        totalInvested={totalInvested}
      />

      {/* Sub-Asset Class Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Gold & Silver Card */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:border-amber-500/50 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 shadow-inner">
                <Coins className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-caption font-semibold text-amber-500">
                Bullion Holdings
              </span>
            </div>

            <h3 className="mt-4 font-display text-body-lg font-bold text-text-primary">
              Gold & Silver Bullion
            </h3>
            <p className="mt-1 text-body-sm text-text-secondary">
              24K Gold and 999 Fine Silver digital and vaulted assets with 3% GST deduction math.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
              <div>
                <span className="text-caption text-text-muted">Total Weight</span>
                <div className="font-numeric text-body-md font-bold text-text-primary">
                  {goldSilver.totals.goldWeight}g Au • {goldSilver.totals.silverWeight}g Ag
                </div>
              </div>
              <div>
                <span className="text-caption text-text-muted">Total Invested</span>
                <div className="font-numeric text-body-md font-bold text-amber-500">
                  {formatInr(totalCommodities)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between group-hover:border-amber-500/50"
            >
              <Link href="/dashboard/assets/gold-silver">
                <span>Open Gold & Silver Ledger</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Equities & Mutual Funds Card */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:border-primary/50 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary shadow-inner">
                <TrendingUp className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-caption font-semibold text-primary">
                Capital Markets
              </span>
            </div>

            <h3 className="mt-4 font-display text-body-lg font-bold text-text-primary">
              Equities & Mutual Funds
            </h3>
            <p className="mt-1 text-body-sm text-text-secondary">
              Public stocks on BSE/NSE with lots consolidation, mutual fund direct folios, and SIP
              tracking.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
              <div>
                <span className="text-caption text-text-muted">Holdings Count</span>
                <div className="font-numeric text-body-md font-bold text-text-primary">
                  {equities.totals.stocksCount} stocks • {equities.totals.mfsCount} funds
                </div>
              </div>
              <div>
                <span className="text-caption text-text-muted">Current Value</span>
                <div className="font-numeric text-body-md font-bold text-primary">
                  {formatInr(totalEquities + totalMutualFunds)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between group-hover:border-primary/50"
            >
              <Link href="/dashboard/assets/equity">
                <span>Open Equities & MFs Portfolio</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
