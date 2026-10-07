'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  LineChart as LineChartIcon,
  PieChart,
  Repeat,
  TrendingUp,
} from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { CartesianChart, ChartCard, DonutChart } from '@/components/ui/charts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';

export interface EquitiesChartsProps {
  allocation: Array<{
    name: string;
    value: number;
    type: string;
  }>;
  exchangeSplit: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  gainLossHoldings: Array<{
    name: string;
    gainLoss: number;
    gainLossPct: number;
    isProfit: boolean;
  }>;
  growthTrend: Array<{
    date: string;
    invested: number;
    currentValue: number;
  }>;
  monthlySip: Array<{
    month: string;
    stocks: number;
    sips: number;
    total: number;
  }>;
  isLoading?: boolean;
}

export function EquitiesCharts({
  allocation,
  exchangeSplit,
  gainLossHoldings,
  growthTrend,
  monthlySip,
  isLoading,
}: EquitiesChartsProps) {
  const [activeTab, setActiveTab] = useState<
    'growth' | 'allocation' | 'gainLoss' | 'exchanges' | 'sip'
  >('growth');

  const hasData = allocation.length > 0;

  return (
    <section className="space-y-4">
      {/* Chart Navigation Tabs */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-body-md font-semibold text-text-primary">
          Equities & Mutual Funds Analytics
        </h3>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList variant="pill">
            <TabsTrigger value="growth" icon={<LineChartIcon className="h-3.5 w-3.5" />}>
              Capital Growth
            </TabsTrigger>
            <TabsTrigger value="allocation" icon={<PieChart className="h-3.5 w-3.5" />}>
              Allocation
            </TabsTrigger>
            <TabsTrigger value="gainLoss" icon={<TrendingUp className="h-3.5 w-3.5" />}>
              P&L Performance
            </TabsTrigger>
            <TabsTrigger value="exchanges" icon={<Building2 className="h-3.5 w-3.5" />}>
              Exchanges
            </TabsTrigger>
            <TabsTrigger value="sip" icon={<Repeat className="h-3.5 w-3.5" />}>
              SIP & Inflow
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Charts View */}
      {activeTab === 'growth' && (
        <ChartCard
          title="Portfolio Growth Trend"
          description="Cumulative capital invested versus current market valuation across stocks and funds."
          info="Area chart displaying cumulative cost basis against total current market value."
          isLoading={isLoading}
          isEmpty={!hasData}
          height={260}
        >
          <CartesianChart
            data={growthTrend}
            xKey="date"
            height={260}
            series={[
              {
                key: 'invested',
                label: 'Invested (₹)',
                color: 'var(--chart-3)',
                type: 'line',
              },
              {
                key: 'currentValue',
                label: 'Market Value (₹)',
                color: 'var(--chart-1)',
                type: 'area',
              },
            ]}
          />
        </ChartCard>
      )}

      {activeTab === 'allocation' && (
        <ChartCard
          title="Portfolio Allocation by Holding"
          description="Distribution of capital across individual companies and mutual fund schemes."
          info="Helps you spot concentration risk and maintain asset diversity."
          isLoading={isLoading}
          isEmpty={allocation.length === 0}
          height={260}
        >
          <DonutChart
            data={allocation.slice(0, 8)}
            height={240}
            centerLabel="Holdings"
            centerValue={formatCompactInr(allocation.reduce((a, b) => a + b.value, 0))}
            legendPosition="right"
          />
        </ChartCard>
      )}

      {activeTab === 'gainLoss' && (
        <ChartCard
          title="Return Percentage per Holding"
          description="Ranking each company and scheme by percentage gain or loss."
          info="Highlights outperformers and underperformers in your portfolio."
          isLoading={isLoading}
          isEmpty={gainLossHoldings.length === 0}
          height={280}
        >
          <CartesianChart
            data={gainLossHoldings.slice(0, 8)}
            xKey="name"
            layout="vertical"
            categoryAxisWidth={120}
            height={280}
            axisFormatter={(v) => `${v}%`}
            valueFormatter={(v) => `${v}%`}
            series={[
              {
                key: 'gainLossPct',
                label: 'Return %',
                color: 'var(--chart-2)',
                type: 'bar',
              },
            ]}
          />
        </ChartCard>
      )}

      {activeTab === 'exchanges' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Exchange Distribution (NSE vs BSE)"
            description="Proportion of stocks listed on NSE versus BSE."
            info="Shows stock volume and liquidity split between exchanges."
            isLoading={isLoading}
            isEmpty={exchangeSplit.length === 0}
            height={240}
          >
            <DonutChart
              data={exchangeSplit}
              height={220}
              centerLabel="Equities"
              legendPosition="right"
            />
          </ChartCard>

          <ChartCard
            title="Asset Class Distribution"
            description="Equities versus Mutual Funds breakdown."
            info="Split between direct stock equity risk and managed mutual funds."
            isLoading={isLoading}
            isEmpty={allocation.length === 0}
            height={240}
          >
            <DonutChart
              data={[
                {
                  name: 'Direct Stocks',
                  value: allocation
                    .filter((a) => a.type === 'Stock')
                    .reduce((s, a) => s + a.value, 0),
                  color: 'var(--chart-1)',
                },
                {
                  name: 'Mutual Funds',
                  value: allocation
                    .filter((a) => a.type === 'Mutual Fund')
                    .reduce((s, a) => s + a.value, 0),
                  color: 'var(--chart-2)',
                },
              ]}
              height={220}
              centerLabel="Split"
              legendPosition="right"
            />
          </ChartCard>
        </div>
      )}

      {activeTab === 'sip' && (
        <ChartCard
          title="Monthly Investment & SIP Flow"
          description="Consistent monthly deployment into stocks and mutual fund SIPs."
          info="Shows how disciplined your regular monthly investments have been."
          isLoading={isLoading}
          isEmpty={monthlySip.length === 0}
          height={260}
        >
          <CartesianChart
            data={monthlySip}
            xKey="month"
            height={260}
            series={[
              {
                key: 'stocks',
                label: 'Direct Stocks (₹)',
                color: 'var(--chart-1)',
                type: 'bar',
                stackId: 'inflow',
              },
              {
                key: 'sips',
                label: 'Mutual Fund SIPs (₹)',
                color: 'var(--chart-2)',
                type: 'bar',
                stackId: 'inflow',
              },
            ]}
          />
        </ChartCard>
      )}
    </section>
  );
}
