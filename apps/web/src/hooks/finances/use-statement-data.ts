'use client';

import { useMemo } from 'react';
import { formatMonthLabel, getCurrentMonthString, roundMoney, shiftMonth } from '@kalya/utils';
import { useFinanceFeed } from './feed/use-finance-feed';
import { useAuthStore } from '@/stores/auth';
import type {
  StatementBucketSummary,
  StatementCategorySummary,
  StatementData,
  StatementExpenseItem,
  StatementIncomeItem,
  StatementPeriodPreset,
  StatementScope,
} from '@/components/dashboard/finances/statement/types';

export interface UseStatementDataOptions {
  preset: StatementPeriodPreset;
  customStart?: string;
  customEnd?: string;
  scope?: StatementScope;
}

export function computeStatementDatePeriod(
  preset: StatementPeriodPreset,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string; label: string } {
  const currentYm = getCurrentMonthString(); // e.g. "2026-10"

  switch (preset) {
    case 'this_month': {
      const startDate = `${currentYm}-01`;
      const endDate = `${currentYm}-31`;
      return {
        startDate,
        endDate,
        label: formatMonthLabel(currentYm),
      };
    }
    case 'last_month': {
      const lastYm = shiftMonth(currentYm, -1);
      const startDate = `${lastYm}-01`;
      const endDate = `${lastYm}-31`;
      return {
        startDate,
        endDate,
        label: formatMonthLabel(lastYm),
      };
    }
    case 'last_3_months': {
      const startYm = shiftMonth(currentYm, -2);
      const startDate = `${startYm}-01`;
      const endDate = `${currentYm}-31`;
      return {
        startDate,
        endDate,
        label: `${formatMonthLabel(startYm)} – ${formatMonthLabel(currentYm)}`,
      };
    }
    case 'custom': {
      const start = customStart || `${currentYm}-01`;
      const end = customEnd || `${currentYm}-31`;
      return {
        startDate: start,
        endDate: end,
        label: `${start} to ${end}`,
      };
    }
  }
}

export function useStatementData({
  preset,
  customStart,
  customEnd,
  scope = 'expenses',
}: UseStatementDataOptions) {
  const feed = useFinanceFeed();
  const authUser = useAuthStore((s) => s.user);

  const period = useMemo(
    () => computeStatementDatePeriod(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  );

  const statementData: StatementData = useMemo(() => {
    const { startDate, endDate, label } = period;
    const { items, categories: allCategories, buckets: allBuckets } = feed;

    // Filter items within the date window (inclusive)
    const periodItems = items.filter((item) => item.date >= startDate && item.date <= endDate);

    // Filter expenses (personal + split bills) and incomes
    const expenseFeedItems = periodItems.filter(
      (item) => item.kind === 'personal_expense' || item.kind === 'split_bill'
    );
    const incomeFeedItems = periodItems.filter((item) => item.kind === 'income');

    // Financial KPIs
    const totalIncome = roundMoney(
      incomeFeedItems.reduce((acc, curr) => acc + (curr.amount || 0), 0)
    );
    const totalExpenses = roundMoney(
      expenseFeedItems.reduce((acc, curr) => acc + (curr.amount || 0), 0)
    );
    const netSavings = roundMoney(totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? roundMoney((netSavings / totalIncome) * 100) : 0;

    // Split bills pending dues calculation
    let unsettledSplits = 0;
    expenseFeedItems.forEach((item) => {
      if (item.kind === 'split_bill' && !item.isSettled) {
        unsettledSplits += (item.friendsOweUserAmount || 0) + (item.userOwesAmount || 0);
      }
    });
    unsettledSplits = roundMoney(unsettledSplits);

    // Mapped Statement Expense items (sorted reverse-chronological by date)
    const expenses: StatementExpenseItem[] = expenseFeedItems
      .map((item) => {
        const isSplit = item.kind === 'split_bill';
        const totalBill = isSplit ? item.totalBill : item.amount;
        const yourShare = item.amount;
        let splitStatus = 'Personal';
        let paidBy = 'You';

        if (isSplit) {
          paidBy = item.isUserPayer ? 'You' : item.payerName || 'Friend';
          if (item.isSettled) {
            splitStatus = 'Settled';
          } else if (item.isUserPayer && item.friendsOweUserAmount > 0) {
            splitStatus = `Pending (Friends owe ₹${item.friendsOweUserAmount})`;
          } else if (!item.isUserPayer && item.userOwesAmount > 0) {
            splitStatus = `Pending (You owe ₹${item.userOwesAmount})`;
          } else {
            splitStatus = 'Pending';
          }
        }

        return {
          id: item.id,
          date: item.date,
          description: item.description,
          categoryName: item.category?.label || 'General',
          categoryColor: item.category?.color || '#0d3e26',
          paymentMethod: (item.paymentMethod || 'UPI').toUpperCase(),
          isSplit,
          totalBill: roundMoney(totalBill),
          yourShare: roundMoney(yourShare),
          splitStatus,
          paidBy,
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

    // Mapped Statement Income items
    const incomes: StatementIncomeItem[] = incomeFeedItems.map((item) => ({
      id: item.id,
      date: item.date,
      source: item.description || 'Income Deposit',
      amount: roundMoney(item.amount),
      salary: roundMoney(item.salary || 0),
      other: roundMoney(item.other || 0),
    }));

    // Category breakdown
    const categoryTotalsMap = new Map<
      string,
      { label: string; amount: number; count: number; color?: string }
    >();

    expenseFeedItems.forEach((item) => {
      const catId = item.category?.id || 'uncategorized';
      const catLabel = item.category?.label || 'General';
      const catColor = item.category?.color || undefined;
      const current = categoryTotalsMap.get(catId) || {
        label: catLabel,
        amount: 0,
        count: 0,
        color: catColor,
      };
      current.amount += item.amount;
      current.count += 1;
      categoryTotalsMap.set(catId, current);
    });

    const categories: StatementCategorySummary[] = Array.from(categoryTotalsMap.entries())
      .map(([id, val]) => ({
        id,
        label: val.label,
        amount: roundMoney(val.amount),
        count: val.count,
        percent: totalExpenses > 0 ? roundMoney((val.amount / totalExpenses) * 100) : 0,
        color: val.color,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Bucket breakdown
    const bucketSpentMap = new Map<string, number>();
    expenseFeedItems.forEach((item) => {
      if (item.bucket?.id) {
        const cur = bucketSpentMap.get(item.bucket.id) || 0;
        bucketSpentMap.set(item.bucket.id, cur + item.amount);
      }
    });

    const buckets: StatementBucketSummary[] = allBuckets.map((b) => {
      const spent = roundMoney(bucketSpentMap.get(b.id) || 0);
      const budgeted =
        b.target_percent && totalIncome > 0
          ? roundMoney((totalIncome * b.target_percent) / 100)
          : 0;
      const percent = budgeted > 0 ? roundMoney((spent / budgeted) * 100) : spent > 0 ? 100 : 0;
      let status: StatementBucketSummary['status'] = 'on_track';
      if (budgeted > 0) {
        if (spent > budgeted) status = 'over';
        else if (percent >= 85) status = 'near';
        else status = 'under';
      }
      return {
        id: b.id,
        name: b.label || b.key,
        budgeted,
        spent,
        percent,
        status,
      };
    });

    // Unique statement reference ID: KLY-YYYYMM-XXXX
    const rawRef = `${startDate.replace(/-/g, '').slice(0, 6)}`;
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const statementId = `KLY-${rawRef}-${randomHex}`;

    return {
      meta: {
        statementId,
        generatedAt: new Date().toISOString(),
        scope,
      },
      period: {
        preset,
        startDate,
        endDate,
        label,
      },
      user: {
        name: authUser?.name || 'Kalya Account Holder',
        email: authUser?.email || '',
        username: authUser?.username || '',
        userId: authUser?.id || '',
      },
      kpis: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
        unsettledSplits,
        expensesCount: expenses.length,
        incomesCount: incomes.length,
      },
      buckets,
      categories,
      expenses,
      incomes,
    };
  }, [period, feed, authUser, preset, scope]);

  return {
    statementData,
    period,
    isLoading: feed.isLoading,
    isError: feed.isError,
    error: feed.error,
    refetch: feed.refetch,
  };
}
