'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Landmark,
  Layers,
  PieChart,
  Receipt,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { downloadCsv, triggerPrintReport } from './export-utils';
import { ReportKpiStrip, ReportInsightsPanel } from './cards';
import {
  BucketAllocationOverTime,
  CashflowTrendChart,
  CategoryBreakdownSection,
  CategoryTrendChart,
  CumulativeSavingsChart,
  PaymentMethodChart,
  SavingsRateChart,
  SpendHeatmap,
  TopExpensesCard,
  WeekdaySpendChart,
} from './charts';
import { BudgetHeatTable } from './budget-heat-table';
import { SplitBalancesTable } from './splits-table';
import { WealthReportSection, GoalsReportSection } from './wealth-goals-section';
import { StatementsList } from './statements-list';
import { GenerateStatementModal, ViewStatementModal } from './statement-modal';
import { DrilldownDrawer } from './drilldown-drawer';
import { ReportsToolbar } from './toolbar';
import { useInsightsData } from './use-insights-data';
import type {
  CategoryBreakdownItem,
  DrilldownTarget,
  ReportInsight,
  ReportTab,
  StatementSummaryRecord,
  TopExpenseItem,
} from './types';

export function FinancialInsights() {
  const [activeTab, setActiveTab] = useState<ReportTab>('cashflow');
  const [drilldownTarget, setDrilldownTarget] = useState<DrilldownTarget | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [viewingStatement, setViewingStatement] = useState<StatementSummaryRecord | null>(null);
  const [dismissedInsightIds, setDismissedInsightIds] = useState<string[]>([]);

  const {
    preset,
    setPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    compareWithPrevious,
    setCompareWithPrevious,
    currentPeriod,
    previousPeriod,
    currentItems,
    kpis,
    cashflowTrend,
    categoryBreakdown,
    categoryTrendPoints,
    topCategoryKeys,
    bucketAllocation,
    weekdaySpend,
    dailyHeatmap,
    paymentMethods,
    topExpenses,
    frequentMerchants,
    budgetHeatRows,
    splitReportData,
    statementsList,
    insights,
    goals,
    isGoalsLoading,
    portfolio,
    isPortfolioLoading,
    generateSummary,
    isGenerating,
    isLoading,
    refetch,
  } = useInsightsData();

  const visibleInsights = insights.filter((i) => !dismissedInsightIds.includes(i.id));

  // Drilldown triggers
  const handleSelectCategory = (cat: CategoryBreakdownItem) => {
    setDrilldownTarget({
      type: 'category',
      id: cat.id,
      title: cat.name,
      subtitle: `${cat.count} expenses • ${cat.percent.toFixed(1)}% of total outlays`,
    });
    setIsDrilldownOpen(true);
  };

  const handleSelectBudgetCell = (bucketId: string, month: string) => {
    const row = budgetHeatRows.find((r) => r.bucketId === bucketId);
    setDrilldownTarget({
      type: 'bucket',
      id: bucketId,
      title: row ? `${row.bucketName} (${month})` : month,
      subtitle: `Budget performance for month ${month}`,
    });
    setIsDrilldownOpen(true);
  };

  const handleSelectExpense = (exp: TopExpenseItem) => {
    setDrilldownTarget({
      type: 'category',
      title: exp.categoryName,
      subtitle: `Filtered to ${exp.categoryName}`,
    });
    setIsDrilldownOpen(true);
  };

  const handleInsightAction = (ins: ReportInsight) => {
    if (ins.filterKey === 'category' && ins.filterValue) {
      setDrilldownTarget({
        type: 'category',
        title: ins.filterValue,
        subtitle: `Drilldown for insight: ${ins.title}`,
      });
      setIsDrilldownOpen(true);
    } else {
      setActiveTab('spending');
    }
  };

  // Export handlers
  const handleExportCsv = () => {
    if (activeTab === 'spending') {
      const headers = [
        'Category',
        'Amount (INR)',
        '% of Total',
        'Previous Amount',
        'Change %',
        'Transaction Count',
      ];
      const rows = categoryBreakdown.map((c) => [
        c.name,
        c.amount,
        c.percent.toFixed(1),
        c.previousAmount,
        c.changePct.toFixed(1),
        c.count,
      ]);
      downloadCsv(`kalya-category-report-${currentPeriod.months[0]}`, headers, rows);
    } else if (activeTab === 'cashflow') {
      const headers = [
        'Month',
        'Income (INR)',
        'Expenses (INR)',
        'Net Savings (INR)',
        'Savings Rate %',
        'Cumulative Savings',
      ];
      const rows = cashflowTrend.map((c) => [
        c.month,
        c.income,
        c.expense,
        c.savings,
        c.savingsRate,
        c.cumulativeSavings,
      ]);
      downloadCsv(`kalya-cashflow-report-${currentPeriod.months[0]}`, headers, rows);
    } else if (activeTab === 'splits') {
      const headers = [
        'Friend',
        'Total Paid for Them',
        'Owes You',
        'You Owe',
        'Net Balance',
        'Settled Amount',
      ];
      const rows = splitReportData.friendBalances.map((f) => [
        f.name,
        f.totalPaidForThem,
        f.owedToYou,
        f.youOwe,
        f.netBalance,
        f.settledAmount,
      ]);
      downloadCsv(`kalya-splits-ledger-${currentPeriod.months[0]}`, headers, rows);
    } else {
      const headers = ['Metric', 'Current Period', 'Previous Period', 'Change %'];
      const rows = [
        [
          'Total Income',
          kpis.income.formatted,
          kpis.income.previousFormatted,
          kpis.income.deltaPct.toFixed(1),
        ],
        [
          'Total Spent',
          kpis.spent.formatted,
          kpis.spent.previousFormatted,
          kpis.spent.deltaPct.toFixed(1),
        ],
        [
          'Net Savings',
          kpis.netSavings.formatted,
          kpis.netSavings.previousFormatted,
          kpis.netSavings.deltaPct.toFixed(1),
        ],
        [
          'Savings Rate',
          kpis.savingsRate.formatted,
          kpis.savingsRate.previousFormatted,
          kpis.savingsRate.deltaPct.toFixed(1),
        ],
      ];
      downloadCsv(`kalya-financial-overview-${currentPeriod.months[0]}`, headers, rows);
    }
  };

  const handleExportExcel = () => {
    handleExportCsv();
  };

  const handleExportPdf = () => {
    triggerPrintReport();
  };

  const handleConfirmGenerateStatement = async (targetMonth: string) => {
    await generateSummary({
      month: targetMonth,
      period_start: `${targetMonth}-01`,
      period_end: `${targetMonth}-31`,
    });
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-12">
      {/* 1. Header & Title */}
      <header className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="font-display text-title-lg font-bold text-text-primary tracking-tight">
            Financial Insights
          </h1>
          <p className="text-body-sm text-text-secondary mt-0.5">
            Holistic trends, spending habits, budget adherence, and archived monthly statements
          </p>
        </div>
      </header>

      {/* 2. Controls & Toolbar */}
      <ReportsToolbar
        preset={preset}
        onPresetChange={setPreset}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        compareWithPrevious={compareWithPrevious}
        onCompareToggle={setCompareWithPrevious}
        currentPeriod={currentPeriod}
        previousPeriod={previousPeriod}
        onExportCsv={handleExportCsv}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onGenerateStatementClick={() => setIsGenerateModalOpen(true)}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* 3. Summary Strip (KPIs) */}
      <ReportKpiStrip
        kpis={kpis}
        isLoading={isLoading}
        compareWithPrevious={compareWithPrevious}
        onDrilldownExpense={() => {
          if (kpis.largestExpense.description) {
            setDrilldownTarget({
              type: 'category',
              title: kpis.largestExpense.description,
              subtitle: `Largest outlay: ${kpis.largestExpense.formatted}`,
            });
            setIsDrilldownOpen(true);
          }
        }}
      />

      {/* 4. Insights Panel */}
      {visibleInsights.length > 0 && (
        <ReportInsightsPanel
          insights={visibleInsights}
          onActionClick={handleInsightAction}
          onDismiss={(id) => setDismissedInsightIds((prev) => [...prev, id])}
        />
      )}

      {/* 5. Report Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as ReportTab)}
        className="w-full flex-1 flex flex-col gap-4 min-h-0"
      >
        <div className="overflow-x-auto pb-1 -mb-1">
          <TabsList variant="pill" className="w-auto inline-flex">
            <TabsTrigger value="cashflow" icon={<Wallet className="h-4 w-4" />}>
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="spending" icon={<PieCardIcon className="h-4 w-4" />}>
              Spending
            </TabsTrigger>
            <TabsTrigger value="budgets" icon={<Target className="h-4 w-4" />}>
              Budgets
            </TabsTrigger>
            <TabsTrigger value="splits" icon={<Scale className="h-4 w-4" />}>
              Splits
            </TabsTrigger>
            <TabsTrigger value="wealth" icon={<Landmark className="h-4 w-4" />}>
              Wealth
            </TabsTrigger>
            <TabsTrigger value="goals" icon={<TrendingUp className="h-4 w-4" />}>
              Goals
            </TabsTrigger>
            <TabsTrigger value="statements" icon={<FileText className="h-4 w-4" />}>
              Statements
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Cash Flow */}
        <TabsContent value="cashflow" className="flex flex-col gap-4 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CashflowTrendChart data={cashflowTrend} isLoading={isLoading} />
            <SavingsRateChart data={cashflowTrend} isLoading={isLoading} />
          </div>
          <CumulativeSavingsChart data={cashflowTrend} isLoading={isLoading} />
        </TabsContent>

        {/* Tab 2: Spending */}
        <TabsContent value="spending" className="flex flex-col gap-4 mt-0">
          {/* Category Breakdown & Table */}
          <CategoryBreakdownSection
            categories={categoryBreakdown}
            totalSpent={kpis.spent.value}
            isLoading={isLoading}
            onSelectCategory={handleSelectCategory}
          />

          {/* Category Trend Stacked & 50/30/20 Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryTrendChart
              data={categoryTrendPoints}
              categoryKeys={topCategoryKeys}
              isLoading={isLoading}
            />
            <BucketAllocationOverTime data={bucketAllocation} isLoading={isLoading} />
          </div>

          {/* Weekday patterns & Calendar Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeekdaySpendChart data={weekdaySpend} isLoading={isLoading} />
            <SpendHeatmap cells={dailyHeatmap} isLoading={isLoading} />
          </div>

          {/* Payment Methods & Top Outlays */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PaymentMethodChart methods={paymentMethods} isLoading={isLoading} />
            <TopExpensesCard
              topExpenses={topExpenses}
              frequentMerchants={frequentMerchants}
              isLoading={isLoading}
              onSelectExpense={handleSelectExpense}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Budgets */}
        <TabsContent value="budgets" className="flex flex-col gap-4 mt-0">
          <BudgetHeatTable
            rows={budgetHeatRows}
            months={currentPeriod.months.map((m) => ({
              key: m,
              label: m,
            }))}
            isLoading={isLoading}
            onSelectCell={handleSelectBudgetCell}
          />
        </TabsContent>

        {/* Tab 4: Splits */}
        <TabsContent value="splits" className="flex flex-col gap-4 mt-0">
          <SplitBalancesTable
            totals={splitReportData.totals}
            friendBalances={splitReportData.friendBalances}
            isLoading={isLoading}
            onSelectFriend={(f) => {
              setDrilldownTarget({
                type: 'category',
                title: f.name,
                subtitle: `Split transactions involving ${f.name}`,
              });
              setIsDrilldownOpen(true);
            }}
          />
        </TabsContent>

        {/* Tab 5: Wealth */}
        <TabsContent value="wealth" className="flex flex-col gap-4 mt-0">
          <WealthReportSection
            netWorth={portfolio?.total_portfolio_net_worth || 0}
            equitiesValue={portfolio?.total_equities_value || 0}
            goldSilverValue={portfolio?.total_commodities_value || 0}
            liquidSavings={0}
            totalGains={0}
            gainsPercent={0}
            isLoading={isPortfolioLoading}
          />
        </TabsContent>

        {/* Tab 6: Goals */}
        <TabsContent value="goals" className="flex flex-col gap-4 mt-0">
          <GoalsReportSection goals={goals} isLoading={isGoalsLoading} />
        </TabsContent>

        {/* Tab 7: Statements */}
        <TabsContent value="statements" className="flex flex-col gap-4 mt-0">
          <StatementsList
            statements={statementsList}
            isLoading={isLoading}
            onViewStatement={(s) => setViewingStatement(s)}
            onDownloadStatement={(s) => {
              const dataStr =
                'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(s, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `statement-${s.month}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            onGenerateClick={() => setIsGenerateModalOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Drill-down Drawer */}
      <DrilldownDrawer
        open={isDrilldownOpen}
        onOpenChange={setIsDrilldownOpen}
        target={drilldownTarget}
        items={currentItems}
      />

      {/* View Statement Details Modal */}
      <ViewStatementModal
        open={Boolean(viewingStatement)}
        onOpenChange={(open) => {
          if (!open) setViewingStatement(null);
        }}
        statement={viewingStatement}
        onDownload={(s) => {
          const dataStr =
            'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(s, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', dataStr);
          downloadAnchor.setAttribute('download', `statement-${s.month}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        }}
      />

      {/* Generate Monthly Statement Modal */}
      <GenerateStatementModal
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        selectedMonth={currentPeriod.months[currentPeriod.months.length - 1]}
        isGenerating={isGenerating}
        onConfirmGenerate={handleConfirmGenerateStatement}
      />
    </section>
  );
}

function PieCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

export * from './cards';
export * from './charts';
export * from './toolbar';
export * from './types';
export * from './use-insights-data';
export * from './budget-heat-table';
export * from './splits-table';
export * from './wealth-goals-section';
export * from './statements-list';
export * from './statement-modal';
export * from './drilldown-drawer';
export * from './export-utils';
