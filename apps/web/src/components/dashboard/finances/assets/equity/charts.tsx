'use client';

import React, { useMemo } from 'react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { CartesianChart, ChartCard, DonutChart } from '@/components/ui/charts';
import type { EquityRow } from '@/hooks/finances/use-equities';

export interface EquityChartsProps {
  rows: EquityRow[];
  isLoading?: boolean;
}

interface TimelinePoint {
  date: string;
  purchased: number;
  cumulative: number;
}

export function EquityCharts({ rows, isLoading = false }: EquityChartsProps) {
  // 1. Portfolio Allocation by Company (Donut chart data)
  const { allocationData, totalInvested } = useMemo(() => {
    const companyMap = new Map<string, number>();
    let total = 0;

    for (const r of rows) {
      total += r.total_amount;
      companyMap.set(r.company, (companyMap.get(r.company) || 0) + r.total_amount);
    }

    const data = Array.from(companyMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { allocationData: data, totalInvested: total };
  }, [rows]);

  // 2. Cumulative Deployed Capital Progression (Timeline Area chart data)
  const timelineData = useMemo<TimelinePoint[]>(() => {
    if (rows.length === 0) return [];

    const dateMap = new Map<string, number>();
    const sorted = [...rows].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const r of sorted) {
      dateMap.set(r.date, (dateMap.get(r.date) || 0) + r.total_amount);
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
  }, [rows]);

  const hasData = rows.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Company Allocation */}
      <ChartCard
        title="Portfolio Allocation"
        description="Invested capital distribution across stocks"
        info="Shows breakdown of total buy amounts deployed per company."
        isLoading={isLoading}
        isEmpty={!hasData}
        emptyMessage="Log your first stock purchase to see portfolio allocation."
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
        description="Cumulative equity investment growth over time"
        info="Chronological progression of cumulative capital invested in public equities."
        isLoading={isLoading}
        isEmpty={!hasData}
        emptyMessage="Log your first stock purchase to view investment progression."
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
              color: 'var(--chart-2)',
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
