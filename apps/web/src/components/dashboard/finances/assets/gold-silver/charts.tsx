'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Coins,
  CreditCard,
  LineChart as LineChartIcon,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { CartesianChart, ChartCard, DonutChart } from '@/components/ui/charts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';

export interface GoldSilverChartsProps {
  timeline: Array<{
    date: string;
    label: string;
    invested: number;
    currentValue: number;
    gainLoss: number;
  }>;
  allocation: Array<{
    name: string;
    value: number;
    weight: number;
    unit: string;
    color: string;
  }>;
  purchasesByMonth: Array<{
    month: string;
    goldAmount: number;
    silverAmount: number;
    total: number;
  }>;
  rateComparison: Array<{
    name: string;
    buyRate: number;
    marketRate: number;
    platform: string;
    diffPct: number;
  }>;
  byPlatform: Array<{
    name: string;
    value: number;
  }>;
  isLoading?: boolean;
}

export function GoldSilverCharts({
  timeline,
  allocation,
  purchasesByMonth,
  rateComparison,
  byPlatform,
  isLoading,
}: GoldSilverChartsProps) {
  const [activeTab, setActiveTab] = useState<
    'timeline' | 'allocation' | 'monthly' | 'rates' | 'platform'
  >('timeline');

  const hasData = timeline.length > 0;

  return (
    <section className="space-y-4">
      {/* Chart Navigation Tabs */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-body-md font-semibold text-text-primary">
          Bullion Portfolio Analytics
        </h3>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList variant="pill">
            <TabsTrigger value="timeline" icon={<LineChartIcon className="h-3.5 w-3.5" />}>
              Growth
            </TabsTrigger>
            <TabsTrigger value="allocation" icon={<PieChart className="h-3.5 w-3.5" />}>
              Gold vs Silver
            </TabsTrigger>
            <TabsTrigger value="monthly" icon={<BarChart3 className="h-3.5 w-3.5" />}>
              Monthly Inflow
            </TabsTrigger>
            <TabsTrigger value="rates" icon={<TrendingUp className="h-3.5 w-3.5" />}>
              Buy vs Live Rate
            </TabsTrigger>
            <TabsTrigger value="platform" icon={<CreditCard className="h-3.5 w-3.5" />}>
              Vaults
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Charts View */}
      {activeTab === 'timeline' && (
        <ChartCard
          title="Invested vs Market Value Growth"
          description="Track capital deployed into precious metals versus current market valuation."
          info="Shows cumulative amount spent (including GST) plotted against current valuation at benchmark market rates."
          isLoading={isLoading}
          isEmpty={!hasData}
          height={260}
        >
          <CartesianChart
            data={timeline}
            xKey="label"
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
                label: 'Market Valuation (₹)',
                color: '#f59e0b',
                type: 'area',
              },
            ]}
          />
        </ChartCard>
      )}

      {activeTab === 'allocation' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Gold vs Silver Allocation"
            description="Valuation share between 24K Gold and 999 Fine Silver."
            info="Computed from current market rates of ₹7,650/g (Gold) and ₹94.5/g (Silver)."
            isLoading={isLoading}
            isEmpty={allocation.length === 0}
            height={240}
          >
            <DonutChart
              data={allocation}
              height={220}
              centerLabel="Total Metals"
              centerValue={formatCompactInr(allocation.reduce((a, b) => a + b.value, 0))}
              legendPosition="right"
            />
          </ChartCard>

          <ChartCard
            title="Vault & Platform Breakdown"
            description="Holdings distribution across digital gold providers and jewellers."
            info="Shows where your precious metals are safely vaulted or held."
            isLoading={isLoading}
            isEmpty={byPlatform.length === 0}
            height={240}
          >
            <DonutChart
              data={byPlatform}
              height={220}
              centerLabel="By Vault"
              legendPosition="right"
            />
          </ChartCard>
        </div>
      )}

      {activeTab === 'monthly' && (
        <ChartCard
          title="Monthly Bullion Purchases"
          description="Consistency of precious metals accumulation over time."
          info="Tracks your rupee-cost-averaging discipline across months."
          isLoading={isLoading}
          isEmpty={purchasesByMonth.length === 0}
          height={260}
        >
          <CartesianChart
            data={purchasesByMonth}
            xKey="month"
            height={260}
            series={[
              {
                key: 'goldAmount',
                label: 'Gold (₹)',
                color: '#f59e0b',
                type: 'bar',
                stackId: 'metals',
              },
              {
                key: 'silverAmount',
                label: 'Silver (₹)',
                color: '#94a3b8',
                type: 'bar',
                stackId: 'metals',
              },
            ]}
          />
        </ChartCard>
      )}

      {activeTab === 'rates' && (
        <ChartCard
          title="Average Buy Rate vs Today's Live Rate"
          description="Compare the price you paid per gram with today's prevailing bullion rates."
          info="Buy rates below today's rate indicate profitable purchases (bought low)."
          isLoading={isLoading}
          isEmpty={rateComparison.length === 0}
          height={260}
        >
          <CartesianChart
            data={rateComparison}
            xKey="name"
            height={260}
            series={[
              {
                key: 'buyRate',
                label: 'Purchase Rate (₹/g)',
                color: 'var(--chart-4)',
                type: 'bar',
              },
              {
                key: 'marketRate',
                label: 'Live Market Rate (₹/g)',
                color: '#f59e0b',
                type: 'line',
              },
            ]}
          />
        </ChartCard>
      )}

      {activeTab === 'platform' && (
        <ChartCard
          title="Capital Allocation by Platform"
          description="Total capital deployed across each vault and provider."
          info="Total invested amount grouped by provider (Jar, MMTC-PAMP, Augmont, etc.)."
          isLoading={isLoading}
          isEmpty={byPlatform.length === 0}
          height={260}
        >
          <CartesianChart
            data={byPlatform}
            xKey="name"
            height={260}
            series={[
              {
                key: 'value',
                label: 'Capital Held (₹)',
                color: 'var(--chart-2)',
                type: 'bar',
              },
            ]}
          />
        </ChartCard>
      )}
    </section>
  );
}
