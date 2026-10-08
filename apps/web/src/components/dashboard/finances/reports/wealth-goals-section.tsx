'use client';

import React from 'react';
import {
  Coins,
  Gem,
  Landmark,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { formatCompactInr, formatInr, formatPercent } from '@kalya/utils';
import { ChartCard, DonutChart } from '@/components/ui/charts';
import { Badge } from '@/components/ui/data-display/badge';
import { Progress } from '@/components/ui/feedback/progress';
import type { Goal } from '@kalya/types';

interface WealthReportSectionProps {
  netWorth: number;
  equitiesValue: number;
  goldSilverValue: number;
  liquidSavings: number;
  totalGains: number;
  gainsPercent: number;
  isLoading?: boolean;
}

export function WealthReportSection({
  netWorth,
  equitiesValue,
  goldSilverValue,
  liquidSavings,
  totalGains,
  gainsPercent,
  isLoading,
}: WealthReportSectionProps) {
  const assetData = [
    { name: 'Equities & Stocks', value: equitiesValue, color: 'var(--chart-1)' },
    { name: 'Precious Metals (Gold/Silver)', value: goldSilverValue, color: 'var(--chart-3)' },
    { name: 'Liquid Savings & Cash', value: liquidSavings, color: 'var(--chart-2)' },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Net Worth Summary Strip */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <span className="text-caption font-medium text-text-muted">
            Total Estimated Net Worth
          </span>
          <div className="mt-1 font-numeric text-title-md font-bold text-text-primary tracking-tight">
            {formatInr(netWorth)}
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-caption">
            <span className="text-text-muted">Unrealized Portfolio Gains:</span>
            <span className="font-numeric font-semibold text-success">
              +{formatInr(totalGains)} ({gainsPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Mini breakdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center gap-1.5 text-caption text-text-muted">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>Equities</span>
            </div>
            <div className="font-numeric font-bold text-body-sm text-text-primary mt-1">
              {formatCompactInr(equitiesValue)}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center gap-1.5 text-caption text-text-muted">
              <Coins className="h-3.5 w-3.5 text-accent" />
              <span>Metals</span>
            </div>
            <div className="font-numeric font-bold text-body-sm text-text-primary mt-1">
              {formatCompactInr(goldSilverValue)}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center gap-1.5 text-caption text-text-muted">
              <Landmark className="h-3.5 w-3.5 text-success" />
              <span>Savings</span>
            </div>
            <div className="font-numeric font-bold text-body-sm text-text-primary mt-1">
              {formatCompactInr(liquidSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Donut */}
      <div className="lg:col-span-7">
        <ChartCard
          title="Asset Allocation"
          description="Distribution across investment asset classes"
          isLoading={isLoading}
          isEmpty={!assetData.length}
        >
          <DonutChart
            data={assetData}
            centerLabel="Total Assets"
            centerValue={formatCompactInr(netWorth)}
            height={220}
            legendPosition="right"
          />
        </ChartCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Goals Section                                                       */
/* ------------------------------------------------------------------ */

interface GoalsReportSectionProps {
  goals: Goal[];
  isLoading?: boolean;
}

export function GoalsReportSection({ goals, isLoading }: GoalsReportSectionProps) {
  if (!goals.length) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-muted">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="font-medium text-body-sm">No savings goals created yet.</p>
        <p className="text-caption mt-1">Define long-term targets in the Goals section.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card p-4">
      <header className="mb-4">
        <h3 className="font-display text-body-md font-semibold text-text-primary">
          Savings Goals Trajectory
        </h3>
        <p className="text-caption text-text-muted">
          Active goal targets, progress saved, and monthly contribution status
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {goals.map((g) => {
          const target = Number(g.target_amount) || 1;
          const current = Number(g.current_progress) || 0;
          const pct = Math.min(100, Math.round((current / target) * 100));

          return (
            <div
              key={g.id}
              className="rounded-xl border border-border/80 bg-surface-raised/40 p-3.5 flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-body-sm text-text-primary truncate">
                    {g.name}
                  </h4>
                  <Badge variant={pct >= 100 ? 'success' : 'subtle'} size="sm">
                    {pct}%
                  </Badge>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-numeric font-bold text-body-md text-text-primary">
                    {formatInr(current)}
                  </span>
                  <span className="text-caption text-text-muted font-numeric">
                    of {formatInr(target)}
                  </span>
                </div>

                <div className="mt-2">
                  <Progress value={pct} className="h-1.5" />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
                <span>Plan: {formatInr(Number(g.monthly_contribution_plan) || 0)}/mo</span>
                <span>Due: {g.target_date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
