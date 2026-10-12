'use client';

import React, { Suspense, useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Landmark,
  Layers,
  PieChart,
  Receipt,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { ReportsToolbar } from './toolbar';
import { ReportInsightsStrip, ReportKpiDeck } from './cards';
import { TabToolbar } from './tab-toolbar';
import {
  AssetsChartView,
  BucketsChartView,
  BudgetsChartView,
  CategoriesChartView,
  ExpensesChartView,
  GoalsChartView,
  IncomeChartView,
} from './charts';
import {
  AssetsTableView,
  BucketsTableView,
  BudgetsTableView,
  CategoriesTableView,
  ExpensesTableView,
  GoalsTableView,
  IncomeTableView,
} from './tables';
import { GenerateStatementModal, ViewStatementModal } from './statement-modal';
import { downloadCsv, triggerPrintReport } from './export-utils';
import { useInsightsData } from './use-insights-data';
import type {
  CategoryBreakdownRecord,
  ExpenseTableRecord,
  Granularity,
  ReportInsight,
  ReportTab,
  StatementSummaryRecord,
  ViewMode,
} from './types';

const TAB_CONFIG: { id: ReportTab; label: string; icon: React.ElementType }[] = [
  { id: 'income', label: 'Income', icon: Wallet },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'buckets', label: 'Buckets', icon: Layers },
  { id: 'categories', label: 'Categories', icon: PieChart },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'goals', label: 'Goals', icon: TrendingUp },
  { id: 'assets', label: 'Assets', icon: Landmark },
];

function FinancialInsightsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active Tab state synced with URL ?tab=...
  const tabParam = searchParams.get('tab') as ReportTab | null;
  const initialTab: ReportTab =
    tabParam && TAB_CONFIG.some((t) => t.id === tabParam) ? tabParam : 'income';

  const [activeTab, setActiveTab] = useState<ReportTab>(initialTab);
  const [viewModes, setViewModes] = useState<Record<ReportTab, ViewMode>>({
    income: 'chart',
    expenses: 'chart',
    buckets: 'chart',
    categories: 'chart',
    budgets: 'chart',
    goals: 'chart',
    assets: 'chart',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [granularity, setGranularity] = useState<Granularity>('monthly');

  // Statement Modals State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [viewingStatement, setViewingStatement] = useState<StatementSummaryRecord | null>(null);

  // Sync tab with URL
  const handleTabChange = useCallback(
    (newTab: ReportTab) => {
      setActiveTab(newTab);
      setSearchQuery('');
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', newTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const currentViewMode = viewModes[activeTab] || 'chart';
  const handleViewModeChange = (mode: ViewMode) => {
    setViewModes((prev) => ({ ...prev, [activeTab]: mode }));
  };

  // Data hook
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
    kpis,
    incomeRecords,
    expenseRecords,
    categoryRecords,
    bucketRecords,
    budgetRecords,
    goalRecords,
    assetRecords,
    incomeExpenseTrend,
    bucketTrend,
    insights,
    generateSummary,
    isGenerating,
    isLoading,
    refetch,
  } = useInsightsData();

  // Export handlers
  const handleExportCsv = () => {
    if (activeTab === 'income') {
      const headers = ['Date', 'Source', 'Account', 'Amount'];
      const rows = incomeRecords.map((r) => [r.date, r.source, r.account, r.amount]);
      downloadCsv(`kalya-income-${currentPeriod.months[0]}`, headers, rows);
    } else if (activeTab === 'expenses') {
      const headers = ['Date', 'Merchant', 'Category', 'Bucket', 'Amount'];
      const rows = expenseRecords.map((r) => [r.date, r.merchant, r.category, r.bucket, r.amount]);
      downloadCsv(`kalya-expenses-${currentPeriod.months[0]}`, headers, rows);
    } else if (activeTab === 'categories') {
      const headers = ['Category', 'Amount', '% of Total', 'Change %', 'Count'];
      const rows = categoryRecords.map((r) => [
        r.name,
        r.amount,
        r.percent.toFixed(1),
        r.changePct,
        r.count,
      ]);
      downloadCsv(`kalya-categories-${currentPeriod.months[0]}`, headers, rows);
    } else if (activeTab === 'budgets') {
      const headers = ['Budget', 'Limit', 'Spent', 'Remaining', 'Status'];
      const rows = budgetRecords.map((r) => [r.name, r.limit, r.spent, r.remaining, r.status]);
      downloadCsv(`kalya-budgets-${currentPeriod.months[0]}`, headers, rows);
    } else {
      const headers = ['Metric', 'Amount'];
      const rows = [
        ['Total Income', kpis.income.formatted],
        ['Total Spent', kpis.spent.formatted],
        ['Net Savings', kpis.netSavings.formatted],
        ['Savings Rate', kpis.savingsRate.formatted],
      ];
      downloadCsv(`kalya-summary-${currentPeriod.months[0]}`, headers, rows);
    }
  };

  const handleExportPdf = () => {
    triggerPrintReport();
  };

  // Direct Page Navigation for details (instead of drilldown drawer)
  const handleSelectCategory = (_cat: CategoryBreakdownRecord) => {
    router.push('/dashboard/transactions');
  };

  const handleSelectExpenseRow = (_item: ExpenseTableRecord) => {
    router.push('/dashboard/transactions');
  };

  const handleInsightAction = (ins: ReportInsight) => {
    if (ins.targetTab === 'budgets') {
      router.push('/dashboard/budgets');
    } else if (ins.targetTab === 'goals') {
      router.push('/dashboard/goals');
    } else if (ins.targetTab === 'assets') {
      router.push('/dashboard/assets');
    } else if (ins.targetTab === 'expenses' || ins.filterKey === 'category') {
      router.push('/dashboard/transactions');
    } else if (ins.targetTab) {
      handleTabChange(ins.targetTab);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* 1. STICKY HEADER */}
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
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
        onGenerateStatementClick={() => setIsGenerateModalOpen(true)}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* 2. SECTION 1: KPI CARDS */}
      <ReportKpiDeck
        kpis={kpis}
        isLoading={isLoading}
        onSelectTab={handleTabChange}
        onDrilldownExpense={() => router.push('/dashboard/transactions')}
      />

      {/* 3. INSIGHTS STRIP (Max 3, Collapsible) */}
      <ReportInsightsStrip insights={insights} onActionClick={handleInsightAction} />

      {/* 4. SECTION 2: EXPLORE TABS */}
      <div className="flex flex-col gap-4">
        {/* Underline Tab Bar (Horizontally scrollable on mobile) */}
        <div className="border-b border-border/80 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-6 min-w-max" aria-label="Tabs">
            {TAB_CONFIG.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTabChange(t.id)}
                  className={cn(
                    'group inline-flex items-center gap-2 py-3 px-1 border-b-2 text-body-sm font-medium transition-all cursor-pointer select-none',
                    isActive
                      ? 'border-primary text-text-primary font-semibold'
                      : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
                    )}
                  />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sub-toolbar above content */}
        <TabToolbar
          activeTab={activeTab}
          viewMode={currentViewMode}
          onViewModeChange={handleViewModeChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />

        {/* Content Area: Chart view or Table view */}
        <div className="mt-2 min-h-95">
          {activeTab === 'income' &&
            (currentViewMode === 'chart' ? (
              <IncomeChartView
                trendData={incomeExpenseTrend}
                compareWithPrevious={compareWithPrevious}
                isLoading={isLoading}
              />
            ) : (
              <IncomeTableView records={incomeRecords} searchQuery={searchQuery} />
            ))}

          {activeTab === 'expenses' &&
            (currentViewMode === 'chart' ? (
              <ExpensesChartView
                trendData={incomeExpenseTrend}
                compareWithPrevious={compareWithPrevious}
                isLoading={isLoading}
              />
            ) : (
              <ExpensesTableView
                records={expenseRecords}
                searchQuery={searchQuery}
                onSelectRow={handleSelectExpenseRow}
              />
            ))}

          {activeTab === 'buckets' &&
            (currentViewMode === 'chart' ? (
              <BucketsChartView
                buckets={bucketRecords}
                trendData={bucketTrend}
                isLoading={isLoading}
              />
            ) : (
              <BucketsTableView records={bucketRecords} searchQuery={searchQuery} />
            ))}

          {activeTab === 'categories' &&
            (currentViewMode === 'chart' ? (
              <CategoriesChartView
                categories={categoryRecords}
                onSelectCategory={handleSelectCategory}
                isLoading={isLoading}
              />
            ) : (
              <CategoriesTableView
                records={categoryRecords}
                searchQuery={searchQuery}
                onSelectCategory={handleSelectCategory}
              />
            ))}

          {activeTab === 'budgets' &&
            (currentViewMode === 'chart' ? (
              <BudgetsChartView budgets={budgetRecords} isLoading={isLoading} />
            ) : (
              <BudgetsTableView records={budgetRecords} searchQuery={searchQuery} />
            ))}

          {activeTab === 'goals' &&
            (currentViewMode === 'chart' ? (
              <GoalsChartView goals={goalRecords} isLoading={isLoading} />
            ) : (
              <GoalsTableView records={goalRecords} searchQuery={searchQuery} />
            ))}

          {activeTab === 'assets' &&
            (currentViewMode === 'chart' ? (
              <AssetsChartView assets={assetRecords} isLoading={isLoading} />
            ) : (
              <AssetsTableView records={assetRecords} searchQuery={searchQuery} />
            ))}
        </div>
      </div>

      {/* Generate Statement Modal (with DatePicker) */}
      <GenerateStatementModal
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        defaultMonth={currentPeriod.months[0]}
        isGenerating={isGenerating}
        onConfirmGenerate={async (targetMonth) => {
          await generateSummary({
            month: targetMonth,
            period_start: `${targetMonth}-01`,
            period_end: `${targetMonth}-31`,
          });
        }}
      />

      {/* View Statement Modal */}
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
    </div>
  );
}

export function FinancialInsights() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-text-muted">Loading financial insights…</div>}
    >
      <FinancialInsightsContent />
    </Suspense>
  );
}

export * from './toolbar';
export * from './cards';
export * from './charts';
export * from './tables';
export * from './tab-toolbar';
export * from './statement-modal';
export * from './export-utils';
export * from './types';
export * from './use-insights-data';
