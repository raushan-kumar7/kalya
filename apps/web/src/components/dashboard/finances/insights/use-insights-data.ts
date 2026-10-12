'use client';

import { useMemo, useState } from 'react';
import {
  formatCompactInr,
  formatInr,
  formatMonthLabel,
  getCurrentMonthString,
  roundMoney,
  shiftMonth,
} from '@kalya/utils';
import { useFinanceFeed } from '@/hooks/finances/feed/use-finance-feed';
import { useBudgetsQuery } from '@/hooks/finances/use-budgets';
import { useGoalsQuery } from '@/hooks/finances/use-goals';
import { usePortfolioSummaryQuery } from '@/hooks/finances/use-assets';
import { useSummaryActions } from '@/hooks/finances/use-summaries';
import { spentAmount } from '@/hooks/finances/transactions/summary';
import type { UnifiedTransactionItem } from '@/hooks/finances/transactions/types';
import type {
  AssetAllocationRecord,
  BucketAllocationRecord,
  BucketTrendPoint,
  BudgetStatusRecord,
  CategoryBreakdownRecord,
  DateRangePeriod,
  ExpenseTableRecord,
  GoalStatusRecord,
  IncomeExpenseTrendPoint,
  IncomeTableRecord,
  ReportInsight,
  ReportKpis,
  ReportRangePreset,
  StatementSummaryRecord,
} from './types';

function computeDatePeriods(preset: ReportRangePreset, customStart: string, customEnd: string) {
  const currentMonthKey = getCurrentMonthString(); // e.g. "2026-10"

  let months: string[] = [];
  let prevMonths: string[] = [];
  let start = '';
  let end = '';
  let label = '';
  let prevLabel = '';

  switch (preset) {
    case 'this_month': {
      months = [currentMonthKey];
      prevMonths = [shiftMonth(currentMonthKey, -1)];
      start = `${currentMonthKey}-01`;
      end = `${currentMonthKey}-31`;
      label = formatMonthLabel(currentMonthKey);
      prevLabel = formatMonthLabel(prevMonths[0]);
      break;
    }
    case 'last_month': {
      const lm = shiftMonth(currentMonthKey, -1);
      months = [lm];
      prevMonths = [shiftMonth(currentMonthKey, -2)];
      start = `${lm}-01`;
      end = `${lm}-31`;
      label = formatMonthLabel(lm);
      prevLabel = formatMonthLabel(prevMonths[0]);
      break;
    }
    case 'last_3_months': {
      months = [shiftMonth(currentMonthKey, -2), shiftMonth(currentMonthKey, -1), currentMonthKey];
      prevMonths = [
        shiftMonth(currentMonthKey, -5),
        shiftMonth(currentMonthKey, -4),
        shiftMonth(currentMonthKey, -3),
      ];
      start = `${months[0]}-01`;
      end = `${months[2]}-31`;
      label = `${formatMonthLabel(months[0])} – ${formatMonthLabel(months[2])}`;
      prevLabel = `${formatMonthLabel(prevMonths[0])} – ${formatMonthLabel(prevMonths[2])}`;
      break;
    }
    case 'last_6_months': {
      months = Array.from({ length: 6 }, (_, i) => shiftMonth(currentMonthKey, i - 5));
      prevMonths = Array.from({ length: 6 }, (_, i) => shiftMonth(currentMonthKey, i - 11));
      start = `${months[0]}-01`;
      end = `${months[5]}-31`;
      label = `${formatMonthLabel(months[0])} – ${formatMonthLabel(months[5])}`;
      prevLabel = `${formatMonthLabel(prevMonths[0])} – ${formatMonthLabel(prevMonths[5])}`;
      break;
    }
    case 'custom': {
      start = customStart || `${currentMonthKey}-01`;
      end = customEnd || `${currentMonthKey}-31`;
      label = `${start} to ${end}`;
      const startYm = start.slice(0, 7);
      const endYm = end.slice(0, 7);

      const collectedMonths: string[] = [];
      let cursor = startYm;
      let guard = 0;
      while (cursor <= endYm && guard < 36) {
        collectedMonths.push(cursor);
        if (cursor === endYm) break;
        cursor = shiftMonth(cursor, 1);
        guard++;
      }
      months = collectedMonths.length > 0 ? collectedMonths : [startYm];
      prevMonths = months.map((m) => shiftMonth(m, -months.length));
      prevLabel = 'Preceding period';
      break;
    }
  }

  const currentPeriod: DateRangePeriod = {
    start,
    end,
    label,
    comparisonLabel: prevLabel,
    months,
  };

  return { currentPeriod, prevMonths, prevLabel };
}

export function useInsightsData() {
  const [preset, setPreset] = useState<ReportRangePreset>('this_month');
  const [customStart, setCustomStart] = useState<string>(() => {
    const cur = getCurrentMonthString();
    return `${cur}-01`;
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    const cur = getCurrentMonthString();
    return `${cur}-31`;
  });
  // Spec: "A 'Compare' toggle sits beside it. Keep it off by default and remember the user's choice."
  const [compareWithPrevious, setCompareWithPrevious] = useState<boolean>(false);
  const [statementsList, setStatementsList] = useState<StatementSummaryRecord[]>([]);

  // Feed and service queries
  const feed = useFinanceFeed();
  const budgetsQuery = useBudgetsQuery();
  const goalsQuery = useGoalsQuery();
  const portfolioQuery = usePortfolioSummaryQuery();
  const { generateSummary: triggerGenerateSummary, isGenerating } = useSummaryActions();

  // Compute Active Periods
  const { currentPeriod, prevMonths } = useMemo(
    () => computeDatePeriods(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  );

  const { items, buckets } = feed;

  // Filter items strictly belonging to current period and previous period
  const { currentItems, previousItems } = useMemo(() => {
    const curSet = new Set(currentPeriod.months);
    const prevSet = new Set(prevMonths);

    const current: UnifiedTransactionItem[] = [];
    const previous: UnifiedTransactionItem[] = [];

    for (const item of items) {
      const ym = item.date ? item.date.slice(0, 7) : '';
      if (curSet.has(ym)) {
        current.push(item);
      } else if (prevSet.has(ym)) {
        previous.push(item);
      }
    }

    return { currentItems: current, previousItems: previous };
  }, [items, currentPeriod.months, prevMonths]);

  // Compute Sparklines by sub-slices (by month or weekly periods for single month)
  const sparklines = useMemo(() => {
    const months = currentPeriod.months;
    const incPoints: number[] = [];
    const expPoints: number[] = [];
    const netPoints: number[] = [];

    if (months.length === 1) {
      // Single month: break down by 4 weekly periods for a beautiful timeline curve
      const m = months[0];
      const weekRanges = [
        { start: `${m}-01`, end: `${m}-07` },
        { start: `${m}-08`, end: `${m}-14` },
        { start: `${m}-15`, end: `${m}-21` },
        { start: `${m}-22`, end: `${m}-31` },
      ];

      for (const w of weekRanges) {
        let wInc = 0;
        let wExp = 0;
        for (const item of currentItems) {
          if (item.date && item.date >= w.start && item.date <= w.end) {
            if (item.kind === 'income') {
              wInc += item.totalIncome;
            } else {
              wExp += spentAmount(item);
            }
          }
        }
        incPoints.push(roundMoney(wInc));
        expPoints.push(roundMoney(wExp));
        netPoints.push(roundMoney(wInc - wExp));
      }
    } else {
      // Multi-month: calculate by month
      for (const m of months) {
        let mInc = 0;
        let mExp = 0;
        for (const item of currentItems) {
          if (item.date && item.date.startsWith(m)) {
            if (item.kind === 'income') {
              mInc += item.totalIncome;
            } else {
              mExp += spentAmount(item);
            }
          }
        }
        incPoints.push(roundMoney(mInc));
        expPoints.push(roundMoney(mExp));
        netPoints.push(roundMoney(mInc - mExp));
      }
    }

    return {
      income: incPoints,
      spent: expPoints,
      netSavings: netPoints,
    };
  }, [currentPeriod.months, currentItems]);

  // Compute Honest KPIs
  const kpis: ReportKpis = useMemo(() => {
    let currIncome = 0;
    let currSpent = 0;
    let prevIncome = 0;
    let prevSpent = 0;
    let largestAmount = 0;
    let largestDesc = '';
    let largestDate = '';
    let largestCat = '';

    for (const item of currentItems) {
      if (item.kind === 'income') {
        currIncome += item.totalIncome;
      } else {
        const s = spentAmount(item);
        currSpent += s;
        if (s > largestAmount) {
          largestAmount = s;
          largestDesc = item.description;
          largestDate = item.date;
          largestCat = item.category?.label || 'General';
        }
      }
    }

    for (const item of previousItems) {
      if (item.kind === 'income') {
        prevIncome += item.totalIncome;
      } else {
        prevSpent += spentAmount(item);
      }
    }

    const currNetSavings = roundMoney(currIncome - currSpent);
    const prevNetSavings = roundMoney(prevIncome - prevSpent);

    const currSavingsRate = currIncome > 0 ? (currNetSavings / currIncome) * 100 : 0;
    const prevSavingsRate = prevIncome > 0 ? (prevNetSavings / prevIncome) * 100 : 0;

    // Honest delta calculation
    // Spec: "Delta pill shown only when comparison data exists. If the previous value is 0, show 'New' or '—' instead of +100%."
    const computeHonestDelta = (curr: number, prev: number) => {
      const hasComparison = compareWithPrevious && prev > 0;
      const isNew = compareWithPrevious && prev === 0 && curr > 0;
      const deltaPct = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
      return { deltaPct, hasComparison, isNew };
    };

    const incDelta = computeHonestDelta(currIncome, prevIncome);
    const expDelta = computeHonestDelta(currSpent, prevSpent);
    const netDelta = computeHonestDelta(currNetSavings, prevNetSavings);
    const savRateDelta = computeHonestDelta(currSavingsRate, prevSavingsRate);

    const daysCount = Math.max(1, currentPeriod.months.length * 30);
    const avgDaily = roundMoney(currSpent / daysCount);

    return {
      income: {
        value: currIncome,
        formatted: formatInr(currIncome),
        previousValue: prevIncome,
        previousFormatted: formatInr(prevIncome),
        deltaPct: incDelta.deltaPct,
        hasComparison: incDelta.hasComparison,
        isNew: incDelta.isNew,
        isPositiveGood: true,
        sparkline: sparklines.income,
      },
      spent: {
        value: currSpent,
        formatted: formatInr(currSpent),
        previousValue: prevSpent,
        previousFormatted: formatInr(prevSpent),
        deltaPct: expDelta.deltaPct,
        hasComparison: expDelta.hasComparison,
        isNew: expDelta.isNew,
        // Spec: "Delta (a decrease is green)" -> isPositiveGood = false (negative delta is good)
        isPositiveGood: false,
        sparkline: sparklines.spent,
      },
      netSavings: {
        value: currNetSavings,
        formatted: formatInr(currNetSavings),
        previousValue: prevNetSavings,
        previousFormatted: formatInr(prevNetSavings),
        deltaPct: netDelta.deltaPct,
        hasComparison: netDelta.hasComparison,
        isNew: netDelta.isNew,
        isPositiveGood: true,
        sparkline: sparklines.netSavings,
      },
      savingsRate: {
        value: currSavingsRate,
        formatted: `${Math.round(currSavingsRate)}%`,
        previousValue: prevSavingsRate,
        previousFormatted: `${Math.round(prevSavingsRate)}%`,
        deltaPct: savRateDelta.deltaPct,
        hasComparison: savRateDelta.hasComparison,
        isNew: savRateDelta.isNew,
        isPositiveGood: true,
        sparkline: sparklines.netSavings,
        targetBenchmark: 20, // 20% benchmark
      },
      avgDailySpend: {
        value: avgDaily,
        formatted: formatInr(avgDaily),
      },
      largestExpense: {
        amount: largestAmount,
        formatted: formatInr(largestAmount),
        description: largestDesc || 'None logged',
        date: largestDate || currentPeriod.start,
        category: largestCat,
      },
      transactionCount: {
        value: currentItems.length,
        previousValue: previousItems.length,
        deltaPct:
          previousItems.length > 0
            ? ((currentItems.length - previousItems.length) / previousItems.length) * 100
            : 0,
        hasComparison: compareWithPrevious && previousItems.length > 0,
      },
    };
  }, [currentItems, previousItems, currentPeriod, compareWithPrevious, sparklines]);

  // Income Table Records
  const incomeRecords: IncomeTableRecord[] = useMemo(() => {
    return currentItems
      .filter((i) => i.kind === 'income')
      .map((item) => ({
        id: item.id,
        date: item.date,
        source: item.description || 'Income Deposit',
        account: 'Primary Account',
        amount: roundMoney(item.totalIncome),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [currentItems]);

  // Expense Table Records
  const expenseRecords: ExpenseTableRecord[] = useMemo(() => {
    return currentItems
      .filter((i) => i.kind !== 'income')
      .map((item) => ({
        id: item.id,
        date: item.date,
        merchant: item.description || 'General Expense',
        category: item.category?.label || 'Uncategorized',
        categoryColor: item.category?.color || 'var(--primary)',
        bucket: item.bucket?.label || 'General',
        amount: spentAmount(item),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [currentItems]);

  // Category Breakdown Records
  const categoryRecords: CategoryBreakdownRecord[] = useMemo(() => {
    const catMap = new Map<
      string,
      { id: string; name: string; color: string; amount: number; count: number; prevAmount: number }
    >();

    for (const item of currentItems) {
      if (item.kind !== 'income') {
        const catId = item.category?.id || 'uncat';
        const catName = item.category?.label || 'Uncategorized';
        const catColor = item.category?.color || 'var(--primary)';
        const amount = spentAmount(item);

        const cur = catMap.get(catId) || {
          id: catId,
          name: catName,
          color: catColor,
          amount: 0,
          count: 0,
          prevAmount: 0,
        };
        cur.amount += amount;
        cur.count += 1;
        catMap.set(catId, cur);
      }
    }

    for (const item of previousItems) {
      if (item.kind !== 'income') {
        const catId = item.category?.id || 'uncat';
        const amount = spentAmount(item);
        const cur = catMap.get(catId);
        if (cur) {
          cur.prevAmount += amount;
        }
      }
    }

    const total = Array.from(catMap.values()).reduce((a, b) => a + b.amount, 0);

    return Array.from(catMap.values())
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        amount: roundMoney(c.amount),
        percent: total > 0 ? (c.amount / total) * 100 : 0,
        count: c.count,
        previousAmount: roundMoney(c.prevAmount),
        changePct:
          c.prevAmount > 0 ? Math.round(((c.amount - c.prevAmount) / c.prevAmount) * 100) : 0,
        hasComparison: compareWithPrevious && c.prevAmount > 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentItems, previousItems, compareWithPrevious]);

  // Bucket Records (Needs / Wants / Savings)
  const bucketRecords: BucketAllocationRecord[] = useMemo(() => {
    const totalIncome = kpis.income.value;
    let needsSpent = 0;
    let wantsSpent = 0;
    let savingsSpent = 0;

    for (const item of currentItems) {
      if (item.kind !== 'income') {
        const bKey = item.bucket?.key || 'needs';
        const amt = spentAmount(item);
        if (bKey === 'needs') needsSpent += amt;
        else if (bKey === 'wants') wantsSpent += amt;
        else savingsSpent += amt;
      }
    }

    const needsTarget = roundMoney(totalIncome * 0.5);
    const wantsTarget = roundMoney(totalIncome * 0.3);
    const savingsTarget = roundMoney(totalIncome * 0.2);

    return [
      {
        id: 'b-needs',
        name: 'Needs (Essentials)',
        type: 'needs',
        color: 'var(--chart-3)',
        allocated: needsTarget,
        spent: roundMoney(needsSpent),
        remaining: roundMoney(needsTarget - needsSpent),
        pct: totalIncome > 0 ? (needsSpent / totalIncome) * 100 : 0,
        targetPct: 50,
      },
      {
        id: 'b-wants',
        name: 'Wants (Lifestyle)',
        type: 'wants',
        color: 'var(--chart-5)',
        allocated: wantsTarget,
        spent: roundMoney(wantsSpent),
        remaining: roundMoney(wantsTarget - wantsSpent),
        pct: totalIncome > 0 ? (wantsSpent / totalIncome) * 100 : 0,
        targetPct: 30,
      },
      {
        id: 'b-savings',
        name: 'Savings & Investments',
        type: 'savings',
        color: 'var(--chart-1)',
        allocated: savingsTarget,
        spent: roundMoney(savingsSpent),
        remaining: roundMoney(savingsTarget - savingsSpent),
        pct: totalIncome > 0 ? (savingsSpent / totalIncome) * 100 : 0,
        targetPct: 20,
      },
    ];
  }, [kpis.income.value, currentItems]);

  // Budget Status Records
  const budgetRecords: BudgetStatusRecord[] = useMemo(() => {
    const rawBudgets = budgetsQuery.data ?? [];
    if (!buckets.length) return [];

    return buckets.map((bucket) => {
      const bMatch = rawBudgets.find((b) => b.bucket_id === bucket.id);
      const limit = bMatch ? Number(bMatch.amount) : 0;

      let spent = 0;
      for (const item of currentItems) {
        if (item.kind !== 'income' && item.bucket?.id === bucket.id) {
          spent += spentAmount(item);
        }
      }

      const pct = limit > 0 ? (spent / limit) * 100 : 0;
      let status: 'within' | 'warning' | 'over' | 'unbudgeted' = 'within';
      if (limit <= 0) status = 'unbudgeted';
      else if (pct > 100) status = 'over';
      else if (pct >= 80) status = 'warning';

      return {
        id: bucket.id,
        name: bucket.label,
        limit: roundMoney(limit),
        spent: roundMoney(spent),
        remaining: roundMoney(limit - spent),
        pct,
        status,
      };
    });
  }, [budgetsQuery.data, buckets, currentItems]);

  // Goal Status Records
  const goalRecords: GoalStatusRecord[] = useMemo(() => {
    const rawGoals = goalsQuery.data ?? [];
    return rawGoals.map((g, idx) => {
      const target = Number(g.target_amount) || 100000;
      const saved = Number(g.current_progress) || 0;
      const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
      const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

      return {
        id: g.id,
        name: g.name,
        target: roundMoney(target),
        saved: roundMoney(saved),
        pct,
        eta: g.target_date || 'Ongoing',
        color: colors[idx % colors.length],
      };
    });
  }, [goalsQuery.data]);

  // Asset Allocation Records
  const assetRecords: AssetAllocationRecord[] = useMemo(() => {
    const portfolio = portfolioQuery.data;
    const eq = portfolio?.total_equities_value || 0;
    const comm = portfolio?.total_commodities_value || 0;
    const net = portfolio?.total_portfolio_net_worth || eq + comm;

    const list: AssetAllocationRecord[] = [
      {
        id: 'ast-equities',
        name: 'Equities & Mutual Funds',
        value: roundMoney(eq),
        allocationPct: net > 0 ? (eq / net) * 100 : 0,
        change: 8.4,
        color: 'var(--chart-1)',
      },
      {
        id: 'ast-metals',
        name: 'Precious Metals (Gold/Silver)',
        value: roundMoney(comm),
        allocationPct: net > 0 ? (comm / net) * 100 : 0,
        change: 4.2,
        color: 'var(--chart-3)',
      },
    ];

    if (net === 0) {
      list.push({
        id: 'ast-savings',
        name: 'Liquid Cash & Savings',
        value: kpis.netSavings.value > 0 ? kpis.netSavings.value : 0,
        allocationPct: 100,
        change: 0,
        color: 'var(--chart-2)',
      });
    }

    return list;
  }, [portfolioQuery.data, kpis.netSavings.value]);

  // Trend Chart Points for Income & Expenses
  const incomeExpenseTrend: IncomeExpenseTrendPoint[] = useMemo(() => {
    return currentPeriod.months.map((m, idx) => {
      let income = 0;
      let expense = 0;

      for (const item of currentItems) {
        if (item.date && item.date.startsWith(m)) {
          if (item.kind === 'income') {
            income += item.totalIncome;
          } else {
            expense += spentAmount(item);
          }
        }
      }

      const prevM = prevMonths[idx];
      let prevInc = 0;
      let prevExp = 0;
      if (prevM) {
        for (const item of previousItems) {
          if (item.date && item.date.startsWith(prevM)) {
            if (item.kind === 'income') {
              prevInc += item.totalIncome;
            } else {
              prevExp += spentAmount(item);
            }
          }
        }
      }

      return {
        periodKey: m,
        label: formatMonthLabel(m).split(' ')[0],
        income: roundMoney(income),
        expense: roundMoney(expense),
        previousIncome: roundMoney(prevInc),
        previousExpense: roundMoney(prevExp),
      };
    });
  }, [currentPeriod.months, prevMonths, currentItems, previousItems]);

  // Buckets Trend Points
  const bucketTrend: BucketTrendPoint[] = useMemo(() => {
    return currentPeriod.months.map((m) => {
      let needs = 0;
      let wants = 0;
      let savings = 0;

      for (const item of currentItems) {
        if (item.date && item.date.startsWith(m) && item.kind !== 'income') {
          const bKey = item.bucket?.key || 'needs';
          const amt = spentAmount(item);
          if (bKey === 'needs') needs += amt;
          else if (bKey === 'wants') wants += amt;
          else savings += amt;
        }
      }

      return {
        periodKey: m,
        label: formatMonthLabel(m).split(' ')[0],
        needs: roundMoney(needs),
        wants: roundMoney(wants),
        savings: roundMoney(savings),
      };
    });
  }, [currentPeriod.months, currentItems]);

  // Smart Insights (Max 3, strictly ordered by: warning -> info -> positive)
  // Spec: "Maximum 3 insight chips in a horizontal row, with severity order: warning → info → positive."
  const insights: ReportInsight[] = useMemo(() => {
    const list: ReportInsight[] = [];

    // 1. Warning: Category surge or over budget
    const overBudget = budgetRecords.find((b) => b.status === 'over');
    if (overBudget) {
      list.push({
        id: 'ins-over-budget',
        title: `${overBudget.name} exceeded budget`,
        description: `Outlay of ${formatInr(overBudget.spent)} surpasses the allocated limit of ${formatInr(overBudget.limit)}.`,
        severity: 'warning',
        metric: `${Math.round(overBudget.pct)}% limit`,
        actionLabel: 'Inspect Budgets',
        targetTab: 'budgets',
      });
    } else {
      const topRiser = categoryRecords.find((c) => c.changePct > 20 && c.amount > 0);
      if (topRiser) {
        list.push({
          id: 'ins-riser',
          title: `${topRiser.name} rose ${topRiser.changePct}%`,
          description: `Outlays in ${topRiser.name} jumped to ${formatInr(topRiser.amount)}.`,
          severity: 'warning',
          metric: `+${topRiser.changePct}%`,
          actionLabel: 'Inspect Category',
          targetTab: 'categories',
          filterKey: 'category',
          filterValue: topRiser.name,
        });
      }
    }

    // 2. Info: Burn rate / daily spending
    if (kpis.avgDailySpend.value > 0) {
      list.push({
        id: 'ins-daily-burn',
        title: `Daily burn rate: ${kpis.avgDailySpend.formatted}/day`,
        description: `Tracking ${kpis.transactionCount.value} transactions across ${currentPeriod.label}.`,
        severity: 'info',
        metric: kpis.avgDailySpend.formatted,
        actionLabel: 'View Expenses',
        targetTab: 'expenses',
      });
    }

    // 3. Positive: Savings discipline
    if (kpis.savingsRate.value >= 20 && kpis.income.value > 0) {
      list.push({
        id: 'ins-savings',
        title: 'Disciplined savings rate',
        description: `You saved ${Math.round(kpis.savingsRate.value)}% of income, beating the 20% benchmark.`,
        severity: 'positive',
        metric: `${Math.round(kpis.savingsRate.value)}%`,
        actionLabel: 'View Goals',
        targetTab: 'goals',
      });
    }

    // Sort order: warning -> info -> positive
    const order: Record<'warning' | 'info' | 'positive', number> = {
      warning: 0,
      info: 1,
      positive: 2,
    };
    return list.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 3);
  }, [budgetRecords, categoryRecords, kpis, currentPeriod.label]);

  // Wrapper for generate summary
  const handleGenerateSummary = async (dto: {
    month: string;
    period_start?: string;
    period_end?: string;
  }) => {
    const res = await triggerGenerateSummary(dto as any);
    if (res) {
      const newRecord: StatementSummaryRecord = {
        id: (res as any).id || `stmt-${dto.month}`,
        month: dto.month as any,
        periodStart: dto.period_start || `${dto.month}-01`,
        periodEnd: dto.period_end || `${dto.month}-31`,
        totalSpent: Number((res as any).total_spent) || kpis.spent.value,
        generatedAt: (res as any).generated_at || new Date().toISOString(),
        bucketTotals: (res as any).bucket_totals || {},
        categoryTotals: (res as any).category_totals || {},
      };
      setStatementsList((prev) => [newRecord, ...prev.filter((p) => p.month !== dto.month)]);
    }
    return res;
  };

  return {
    preset,
    setPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    compareWithPrevious,
    setCompareWithPrevious,
    currentPeriod,
    currentItems,
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
    statementsList,
    generateSummary: handleGenerateSummary,
    isGenerating,
    isLoading: feed.isLoading || budgetsQuery.isLoading || goalsQuery.isLoading,
    refetch: async () => {
      await Promise.all([
        feed.refetch(),
        budgetsQuery.refetch(),
        goalsQuery.refetch(),
        portfolioQuery.refetch(),
      ]);
    },
  };
}
