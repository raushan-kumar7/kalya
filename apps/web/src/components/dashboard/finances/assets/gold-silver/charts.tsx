'use client';

import React, { useMemo } from 'react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { CartesianChart, ChartCard, DonutChart } from '@/components/ui/charts';
import type { DigitalAssetItem } from '@/hooks/finances/use-gold-silver';

export interface GoldSilverChartsProps {
  purchases: DigitalAssetItem[];
  isLoading?: boolean;
}

interface TimelinePoint {
  date: string;
  purchased: number;
  cumulative: number;
}

export function GoldSilverCharts({ purchases, isLoading = false }: GoldSilverChartsProps) {
  // 1. Metal Allocation (Gold vs Silver Donut chart data)
  const { allocationData, totalInvested } = useMemo(() => {
    let goldTotal = 0;
    let silverTotal = 0;

    for (const p of purchases) {
      const amount = Number(p.amount_paid) || 0;
      if (p.type === 'gold') {
        goldTotal += amount;
      } else {
        silverTotal += amount;
      }
    }

    const data = [
      { name: 'Gold 24K', value: goldTotal, color: '#f59e0b' },
      { name: 'Silver 999', value: silverTotal, color: '#94a3b8' },
    ].filter((d) => d.value > 0);

    return { allocationData: data, totalInvested: goldTotal + silverTotal };
  }, [purchases]);

  // 2. Cumulative Capital Deployed Timeline (Area chart data)
  const timelineData = useMemo<TimelinePoint[]>(() => {
    if (purchases.length === 0) return [];

    const dateMap = new Map<string, number>();
    const sorted = [...purchases].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const p of sorted) {
      const d = p.date.slice(0, 10);
      dateMap.set(d, (dateMap.get(d) || 0) + Number(p.amount_paid));
    }

    let runningTotal = 0;
    return Array.from(dateMap.entries()).map(([rawDate, amount]) => {
      runningTotal += amount;
      return {
        date: new Date(rawDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        }),
        purchased: amount,
        cumulative: runningTotal,
      };
    });
  }, [purchases]);

  const hasData = purchases.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Metal Allocation */}
      <ChartCard
        title="Bullion Allocation"
        description="Capital deployed across Gold and Silver"
        info="Shows allocation of total bullion purchase amounts between 24K Gold and 999 Silver."
        isLoading={isLoading}
        isEmpty={!hasData}
        emptyMessage="Log your first bullion purchase to see metal allocation."
        height={240}
      >
        <DonutChart
          data={allocationData}
          height={230}
          centerLabel="Invested"
          centerValue={formatCompactInr(totalInvested)}
          valueFormatter={formatInr}
          legendPosition="right"
        />
      </ChartCard>

      {/* Capital Deployed Progression */}
      <ChartCard
        title="Capital Deployed Timeline"
        description="Cumulative bullion investment progression"
        info="Chronological progression of cumulative capital invested in precious metals."
        isLoading={isLoading}
        isEmpty={!hasData}
        emptyMessage="Log your first bullion purchase to view investment progression."
        height={240}
      >
        <CartesianChart
          data={timelineData}
          xKey="date"
          series={[
            {
              key: 'cumulative',
              label: 'Total Invested',
              type: 'area',
              color: '#f59e0b',
            },
          ]}
          height={230}
          showLegend={false}
          valueFormatter={formatInr}
          axisFormatter={formatCompactInr}
        />
      </ChartCard>
    </div>
  );
}
