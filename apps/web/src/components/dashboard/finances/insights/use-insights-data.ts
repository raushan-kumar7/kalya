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
  BucketAllocationPoint,
  BudgetHeatCell,
  BudgetHeatRow,
  CashflowTrendPoint,
  CategoryBreakdownItem,
  CategoryTrendPoint,
  DailyHeatmapCell,
  DateRangePeriod,
  FrequentMerchantItem,
  PaymentMethodItem,
  ReportInsight,
  ReportKpis,
  ReportRangePreset,
  SplitFriendBalance,
  SplitReportTotals,
  StatementSummaryRecord,
  TopExpenseItem,
  WeekdaySpendPoint,
} from './types';

// Helper to compute range dates for presets
function computeDatePeriods(preset: ReportRangePreset, customStart: string, customEnd: string) {
  const currentMonthKey = getCurrentMonthString(); // e.g. "2026-10"
  const now = new Date();

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
    case 'last_12_months': {
      months = Array.from({ length: 12 }, (_, i) => shiftMonth(currentMonthKey, i - 11));
      prevMonths = Array.from({ length: 12 }, (_, i) => shiftMonth(currentMonthKey, i - 23));
      start = `${months[0]}-01`;
      end = `${months[11]}-31`;
      label = `${formatMonthLabel(months[0])} – ${formatMonthLabel(months[11])}`;
      prevLabel = `${formatMonthLabel(prevMonths[0])} – ${formatMonthLabel(prevMonths[11])}`;
      break;
    }
    case 'financial_year': {
      // Indian Financial Year: April 1 to March 31
      const year = now.getFullYear();
      const monthIdx = now.getMonth(); // 0 = Jan, 3 = Apr
      const fyStartYear = monthIdx >= 3 ? year : year - 1;
      const fyEndYear = fyStartYear + 1;

      // 12 months from April of fyStartYear to March of fyEndYear
      months = [
        `${fyStartYear}-04`,
        `${fyStartYear}-05`,
        `${fyStartYear}-06`,
        `${fyStartYear}-07`,
        `${fyStartYear}-08`,
        `${fyStartYear}-09`,
        `${fyStartYear}-10`,
        `${fyStartYear}-11`,
        `${fyStartYear}-12`,
        `${fyEndYear}-01`,
        `${fyEndYear}-02`,
        `${fyEndYear}-03`,
      ];
      prevMonths = months.map((m) => {
        const [y, mm] = m.split('-');
        return `${Number(y) - 1}-${mm}`;
      });
      start = `${fyStartYear}-04-01`;
      end = `${fyEndYear}-03-31`;
      label = `FY ${fyStartYear}–${String(fyEndYear).slice(-2)}`;
      prevLabel = `FY ${fyStartYear - 1}–${String(fyStartYear).slice(-2)}`;
      break;
    }
    case 'custom': {
      start = customStart || `${currentMonthKey}-01`;
      end = customEnd || `${currentMonthKey}-31`;
      label = `${start} to ${end}`;
      const startYm = start.slice(0, 7);
      const endYm = end.slice(0, 7);
      months = [startYm];
      if (startYm !== endYm) months.push(endYm);
      prevMonths = months.map((m) => shiftMonth(m, -months.length));
      prevLabel = 'Preceding period';
      break;
    }
  }

  const currentPeriod: DateRangePeriod = { start, end, label, months };
  const previousPeriod: DateRangePeriod = {
    start: `${prevMonths[0]}-01`,
    end: `${prevMonths[prevMonths.length - 1]}-31`,
    label: prevLabel,
    months: prevMonths,
  };

  return { currentPeriod, previousPeriod };
}

export function useInsightsData() {
  const [preset, setPreset] = useState<ReportRangePreset>('last_6_months');
  const [customStart, setCustomStart] = useState<string>(() => {
    const cur = getCurrentMonthString();
    return `${cur}-01`;
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    const cur = getCurrentMonthString();
    return `${cur}-31`;
  });
  const [compareWithPrevious, setCompareWithPrevious] = useState<boolean>(true);
  const [statementsList, setStatementsList] = useState<StatementSummaryRecord[]>([]);

  // Feed and service queries
  const feed = useFinanceFeed();
  const budgetsQuery = useBudgetsQuery();
  const goalsQuery = useGoalsQuery();
  const portfolioQuery = usePortfolioSummaryQuery();
  const { generateSummary: triggerGenerateSummary, isGenerating } = useSummaryActions();

  // Compute Active Periods
  const { currentPeriod, previousPeriod } = useMemo(
    () => computeDatePeriods(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  );

  const { items, categories, buckets, contacts } = feed;

  // Filter items strictly belonging to current period and previous period
  const { currentItems, previousItems } = useMemo(() => {
    const curSet = new Set(currentPeriod.months);
    const prevSet = new Set(previousPeriod.months);

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
  }, [items, currentPeriod.months, previousPeriod.months]);

  // Compute KPIs strictly from real data
  const kpis: ReportKpis = useMemo(() => {
    let currIncome = 0;
    let currSpent = 0;
    let prevIncome = 0;
    let prevSpent = 0;
    let largestAmount = 0;
    let largestDesc = '';
    let largestDate = '';

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

    const calcDelta = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    const daysCount = Math.max(1, currentPeriod.months.length * 30);
    const avgDaily = roundMoney(currSpent / daysCount);

    return {
      income: {
        value: currIncome,
        formatted: formatInr(currIncome),
        previousValue: prevIncome,
        previousFormatted: formatInr(prevIncome),
        deltaPct: calcDelta(currIncome, prevIncome),
        isPositiveGood: true,
      },
      spent: {
        value: currSpent,
        formatted: formatInr(currSpent),
        previousValue: prevSpent,
        previousFormatted: formatInr(prevSpent),
        deltaPct: calcDelta(currSpent, prevSpent),
        isPositiveGood: false,
      },
      netSavings: {
        value: currNetSavings,
        formatted: formatInr(currNetSavings),
        previousValue: prevNetSavings,
        previousFormatted: formatInr(prevNetSavings),
        deltaPct: calcDelta(currNetSavings, prevNetSavings),
        isPositiveGood: true,
      },
      savingsRate: {
        value: currSavingsRate,
        formatted: `${Math.round(currSavingsRate)}%`,
        previousValue: prevSavingsRate,
        previousFormatted: `${Math.round(prevSavingsRate)}%`,
        deltaPct: calcDelta(currSavingsRate, prevSavingsRate),
        isPositiveGood: true,
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
      },
      transactionCount: {
        value: currentItems.length,
        previousValue: previousItems.length,
        deltaPct: calcDelta(currentItems.length, previousItems.length),
      },
    };
  }, [currentItems, previousItems, currentPeriod]);

  // Compute Cashflow Trend from real data
  const cashflowTrend: CashflowTrendPoint[] = useMemo(() => {
    let runningCumulative = 0;

    return currentPeriod.months.map((m) => {
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

      const savings = income - expense;
      const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
      runningCumulative += savings;

      return {
        month: m,
        label: formatMonthLabel(m).split(' ')[0],
        income: roundMoney(income),
        expense: roundMoney(expense),
        savings: roundMoney(savings),
        savingsRate,
        cumulativeSavings: roundMoney(runningCumulative),
      };
    });
  }, [currentPeriod.months, currentItems]);

  // Compute Category Breakdown from real data
  const categoryBreakdown: CategoryBreakdownItem[] = useMemo(() => {
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
          c.prevAmount > 0
            ? Math.round(((c.amount - c.prevAmount) / c.prevAmount) * 100)
            : c.amount > 0
              ? 100
              : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentItems, previousItems]);

  // Compute Category Trend Stacked Points
  const { categoryTrendPoints, topCategoryKeys } = useMemo(() => {
    const topCats = categoryBreakdown.slice(0, 5);
    const keys = topCats.map((c) => ({
      key: c.name,
      label: c.name,
      color: c.color,
    }));

    if (topCats.length === 0) {
      return { categoryTrendPoints: [], topCategoryKeys: [] };
    }

    const points: CategoryTrendPoint[] = currentPeriod.months.map((m) => {
      const pt: CategoryTrendPoint = {
        month: m,
        label: formatMonthLabel(m).split(' ')[0],
      };

      topCats.forEach((c) => {
        let sum = 0;
        for (const item of currentItems) {
          if (
            item.date.startsWith(m) &&
            item.kind !== 'income' &&
            (item.category?.label === c.name || (!item.category && c.name === 'Uncategorized'))
          ) {
            sum += spentAmount(item);
          }
        }
        pt[c.name] = roundMoney(sum);
      });

      return pt;
    });

    return { categoryTrendPoints: points, topCategoryKeys: keys };
  }, [categoryBreakdown, currentPeriod.months, currentItems]);

  // 50/30/20 Actual vs Target Allocation
  const bucketAllocation: BucketAllocationPoint[] = useMemo(() => {
    return currentPeriod.months.map((m) => {
      let mIncome = 0;
      let needsSpent = 0;
      let wantsSpent = 0;
      let savingsSpent = 0;

      for (const item of currentItems) {
        if (item.date.startsWith(m)) {
          if (item.kind === 'income') {
            mIncome += item.totalIncome;
          } else {
            const bucketType = item.bucket?.key || 'needs';
            const s = spentAmount(item);
            if (bucketType === 'needs') needsSpent += s;
            else if (bucketType === 'wants') wantsSpent += s;
            else savingsSpent += s;
          }
        }
      }

      const inc = mIncome > 0 ? mIncome : 0;
      return {
        month: m,
        label: formatMonthLabel(m).split(' ')[0],
        needsActual: inc > 0 ? Math.round((needsSpent / inc) * 100) : 0,
        needsTarget: 50,
        wantsActual: inc > 0 ? Math.round((wantsSpent / inc) * 100) : 0,
        wantsTarget: 30,
        savingsActual:
          inc > 0 ? Math.max(0, 100 - Math.round(((needsSpent + wantsSpent) / inc) * 100)) : 0,
        savingsTarget: 20,
        totalIncome: mIncome,
      };
    });
  }, [currentPeriod.months, currentItems]);

  // Weekday Spend Patterns
  const weekdaySpend: WeekdaySpendPoint[] = useMemo(() => {
    const days = [
      { day: 'Sunday', shortDay: 'Sun', dayIndex: 0, total: 0, count: 0 },
      { day: 'Monday', shortDay: 'Mon', dayIndex: 1, total: 0, count: 0 },
      { day: 'Tuesday', shortDay: 'Tue', dayIndex: 2, total: 0, count: 0 },
      { day: 'Wednesday', shortDay: 'Wed', dayIndex: 3, total: 0, count: 0 },
      { day: 'Thursday', shortDay: 'Thu', dayIndex: 4, total: 0, count: 0 },
      { day: 'Friday', shortDay: 'Fri', dayIndex: 5, total: 0, count: 0 },
      { day: 'Saturday', shortDay: 'Sat', dayIndex: 6, total: 0, count: 0 },
    ];

    for (const item of currentItems) {
      if (item.kind !== 'income' && item.date) {
        const dt = new Date(item.date);
        const dayIdx = dt.getDay();
        if (days[dayIdx]) {
          days[dayIdx].total += spentAmount(item);
          days[dayIdx].count += 1;
        }
      }
    }

    return days.map((d) => ({
      ...d,
      total: roundMoney(d.total),
      average: d.count > 0 ? roundMoney(d.total / d.count) : 0,
    }));
  }, [currentItems]);

  // Daily Heatmap
  const dailyHeatmap: DailyHeatmapCell[] = useMemo(() => {
    const curMonth = currentPeriod.months[currentPeriod.months.length - 1];
    const cells: DailyHeatmapCell[] = [];

    const spendByDate = new Map<string, number>();
    for (const item of currentItems) {
      if (item.kind !== 'income') {
        spendByDate.set(item.date, (spendByDate.get(item.date) || 0) + spentAmount(item));
      }
    }

    for (let day = 1; day <= 30; day++) {
      const dayStr = String(day).padStart(2, '0');
      const d = `${curMonth}-${dayStr}`;
      const dt = new Date(d);
      const dow = dt.getDay();

      const amt = spendByDate.get(d) || 0;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (amt > 4000) level = 4;
      else if (amt > 2000) level = 3;
      else if (amt > 800) level = 2;
      else if (amt > 0) level = 1;

      cells.push({
        date: d,
        dayOfMonth: day,
        dayOfWeek: dow,
        monthKey: curMonth,
        amount: amt,
        level,
      });
    }

    return cells;
  }, [currentPeriod.months, currentItems]);

  // Payment Method Breakdown
  const paymentMethods: PaymentMethodItem[] = useMemo(() => {
    const counts = new Map<string, { amount: number; count: number }>();
    let total = 0;

    for (const item of currentItems) {
      if (item.kind !== 'income') {
        const method = item.paymentMethod || 'upi';
        const s = spentAmount(item);
        total += s;

        const cur = counts.get(method) || { amount: 0, count: 0 };
        cur.amount += s;
        cur.count += 1;
        counts.set(method, cur);
      }
    }

    const formatMethodLabel = (m: string) => {
      switch (m.toLowerCase()) {
        case 'upi':
          return 'UPI';
        case 'credit_card':
          return 'Credit Card';
        case 'debit_card':
          return 'Debit Card';
        case 'cash':
          return 'Cash';
        case 'netbanking':
        case 'net_banking':
          return 'Net Banking';
        default:
          return m.toUpperCase();
      }
    };

    return Array.from(counts.entries()).map(([method, data]) => ({
      method,
      label: formatMethodLabel(method),
      amount: roundMoney(data.amount),
      count: data.count,
      percent: total > 0 ? Math.round((data.amount / total) * 100) : 0,
    }));
  }, [currentItems]);

  // Top 10 Expenses
  const topExpenses: TopExpenseItem[] = useMemo(() => {
    return currentItems
      .filter((i) => i.kind !== 'income')
      .map((item) => ({
        id: item.id,
        description: item.description,
        amount: spentAmount(item),
        date: item.date,
        categoryName: item.category?.label || 'General',
        categoryColor: item.category?.color || 'var(--primary)',
        paymentMethod: item.paymentMethod,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [currentItems]);

  // Most Frequent Spends
  const frequentMerchants: FrequentMerchantItem[] = useMemo(() => {
    const counts = new Map<string, { count: number; total: number; cat: string }>();

    for (const item of currentItems) {
      if (item.kind !== 'income') {
        const desc = item.description.trim() || 'General Expense';
        const cur = counts.get(desc) || {
          count: 0,
          total: 0,
          cat: item.category?.label || 'General',
        };
        cur.count += 1;
        cur.total += spentAmount(item);
        counts.set(desc, cur);
      }
    }

    return Array.from(counts.entries())
      .map(([description, data]) => ({
        description,
        count: data.count,
        totalAmount: roundMoney(data.total),
        avgAmount: roundMoney(data.total / data.count),
        categoryName: data.cat,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [currentItems]);

  // Budget Heat Matrix
  const budgetHeatRows: BudgetHeatRow[] = useMemo(() => {
    const rawBudgets = budgetsQuery.data ?? [];
    if (!buckets.length) return [];

    return buckets.map((bucket, bIdx) => {
      let overCount = 0;
      let totalAdh = 0;

      const cells: BudgetHeatCell[] = currentPeriod.months.map((m) => {
        const bMatch = rawBudgets.find((b) => b.bucket_id === bucket.id);
        const budgeted = bMatch ? Number(bMatch.amount) : 0;

        let spent = 0;
        for (const item of currentItems) {
          if (item.date.startsWith(m) && item.kind !== 'income' && item.bucket?.id === bucket.id) {
            spent += spentAmount(item);
          }
        }

        const pct = budgeted > 0 ? (spent / budgeted) * 100 : 0;
        let status: 'within' | 'warning' | 'over' | 'unbudgeted' = 'within';

        if (budgeted <= 0) status = 'unbudgeted';
        else if (pct > 100) {
          status = 'over';
          overCount++;
        } else if (pct >= 80) status = 'warning';

        totalAdh += Math.min(100, Math.round(pct));

        return {
          month: m,
          monthLabel: formatMonthLabel(m).split(' ')[0],
          budgeted,
          spent: roundMoney(spent),
          pct,
          status,
        };
      });

      return {
        bucketId: bucket.id,
        bucketName: bucket.label,
        bucketType: (bucket.key as any) || 'needs',
        color: bIdx === 0 ? 'var(--chart-3)' : bIdx === 1 ? 'var(--chart-5)' : 'var(--chart-1)',
        cells,
        monthsOverBudget: overCount,
        averageAdherencePct: cells.length > 0 ? totalAdh / cells.length : 100,
      };
    });
  }, [budgetsQuery.data, buckets, currentPeriod.months, currentItems]);

  // Splits Friends Balances
  const splitReportData = useMemo(() => {
    let paidForFriends = 0;
    let owedToYou = 0;
    let youOwe = 0;
    let settled = 0;

    const friendsMap = new Map<
      string,
      {
        name: string;
        paid: number;
        owesYou: number;
        youOwe: number;
        settled: number;
        pendingCount: number;
        settledCount: number;
      }
    >();

    for (const item of currentItems) {
      if (item.kind === 'split_bill') {
        paidForFriends += item.friendsOweUserAmount;
        owedToYou += item.friendsOweUserAmount;
        youOwe += item.userOwesAmount;
        if (item.isSettled) {
          settled += item.totalBill;
        }

        for (const m of item.members || []) {
          const cur = friendsMap.get(m.memberId) || {
            name: m.memberName,
            paid: 0,
            owesYou: 0,
            youOwe: 0,
            settled: 0,
            pendingCount: 0,
            settledCount: 0,
          };

          if (item.isUserPayer) {
            cur.paid += m.amount;
            if (m.settled) {
              cur.settled += m.amount;
              cur.settledCount += 1;
            } else {
              cur.owesYou += m.amount;
              cur.pendingCount += 1;
            }
          }

          friendsMap.set(m.memberId, cur);
        }
      }
    }

    const friendBalances: SplitFriendBalance[] = Array.from(friendsMap.entries()).map(
      ([contactId, f]) => ({
        contactId,
        name: f.name,
        totalPaidForThem: roundMoney(f.paid),
        owedToYou: roundMoney(f.owesYou),
        youOwe: roundMoney(f.youOwe),
        netBalance: roundMoney(f.owesYou - f.youOwe),
        settledAmount: roundMoney(f.settled),
        settledTransactionsCount: f.settledCount,
        pendingTransactionsCount: f.pendingCount,
      })
    );

    return {
      totals: {
        paidForFriends: roundMoney(paidForFriends),
        owedToYou: roundMoney(owedToYou),
        youOwe: roundMoney(youOwe),
        settled: roundMoney(settled),
      },
      friendBalances,
    };
  }, [currentItems]);

  // Auto-generated Insights from strictly real metrics
  const insights: ReportInsight[] = useMemo(() => {
    const list: ReportInsight[] = [];

    if (categoryBreakdown.length > 0) {
      const topRiser = categoryBreakdown.find((c) => c.changePct > 20 && c.amount > 0);
      if (topRiser) {
        list.push({
          id: 'ins-riser',
          title: `${topRiser.name} rose ${Math.round(topRiser.changePct)}%`,
          description: `Outlays in ${topRiser.name} reached ${formatInr(topRiser.amount)} vs ${formatInr(topRiser.previousAmount)} in the prior period.`,
          tone: 'warning',
          metric: `+${Math.round(topRiser.changePct)}%`,
          actionLabel: 'View details',
          filterKey: 'category',
          filterValue: topRiser.name,
        });
      }
    }

    if (kpis.savingsRate.value >= 20 && kpis.income.value > 0) {
      list.push({
        id: 'ins-savings',
        title: 'Strong savings discipline',
        description: `Your savings rate of ${Math.round(kpis.savingsRate.value)}% meets or exceeds the 20% benchmark.`,
        tone: 'positive',
        metric: `${Math.round(kpis.savingsRate.value)}% saved`,
      });
    }

    if (splitReportData.totals.owedToYou > 0) {
      list.push({
        id: 'ins-splits',
        title: 'Outstanding split receivables',
        description: `You have ${formatInr(splitReportData.totals.owedToYou)} awaiting settlement across friends.`,
        tone: 'neutral',
        metric: formatInr(splitReportData.totals.owedToYou),
        actionLabel: 'Inspect splits',
      });
    }

    return list;
  }, [categoryBreakdown, kpis, splitReportData]);

  // Wrapper for generate summary that persists into statementsList state
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
    // Wealth & Goals
    goals: goalsQuery.data ?? [],
    isGoalsLoading: goalsQuery.isLoading,
    portfolio: portfolioQuery.data,
    isPortfolioLoading: portfolioQuery.isLoading,
    // Actions & Status
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
