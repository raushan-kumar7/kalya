import { Bucket, Budget, Category, Expense, Income } from '@kalya/types';
import {
  BudgetAlertItem,
  BudgetCategoryBreakdown,
  BudgetProjection,
  BudgetRow,
  BudgetsView,
  BudgetTotals,
  HistoryPoint,
  PacePoint,
} from './types';
import {
  formatInr,
  fromISO,
  getCurrentMonthString,
  roundMoney,
  shiftMonth,
  Temporal,
  toMonthKey,
} from '@kalya/utils';
import { usagePct, usageStatus } from './status';

export const EMPTY_TOTALS: BudgetTotals = {
  budgeted: 0,
  spent: 0,
  remaining: 0,
  usedPct: 0,
  alertCount: 0,
};

export const buildView = (args: {
  month: string;
  budgets: Budget[];
  incomes: Income[];
  expenses: Expense[];
  categories: Category[];
  buckets: Bucket[];
}): BudgetsView => {
  const { month, budgets, incomes, expenses, categories, buckets } = args;

  // 1. Single pass over incomes: build lookup map AND accumulate totalIncome
  const incomeMonth = new Map<string, string>();
  let totalIncome = 0;
  for (const i of incomes) {
    incomeMonth.set(i.id, i.month);
    if (i.month === month) {
      totalIncome += Number(i.total_income) || 0;
    }
  }

  const bucketById = new Map(buckets.map((b) => [b.id, b]));
  const bucketOfCategory = new Map(categories.map((c) => [c.id, c.bucket_id]));
  const categoriesByBucketId = new Map<string, Category[]>();
  for (const c of categories) {
    const list = categoriesByBucketId.get(c.bucket_id) ?? [];
    list.push(c);
    categoriesByBucketId.set(c.bucket_id, list);
  }

  // 2. Single pass over budgets: group by month and collect current month's budgeted buckets
  const budgetsByMonth = new Map<string, Budget[]>();
  const budgetedBuckets = new Set<string>();

  for (const b of budgets) {
    const m = incomeMonth.get(b.income_id);
    if (!m) continue;
    let list = budgetsByMonth.get(m);
    if (!list) {
      list = [];
      budgetsByMonth.set(m, list);
    }
    list.push(b);
    if (m === month) {
      budgetedBuckets.add(b.bucket_id);
    }
  }

  // 3. Single pass over expenses: accumulate monthly bucket spend, daily spend, and category spend
  const days = Temporal.PlainYearMonth.from(month).daysInMonth;
  const current = getCurrentMonthString();
  const today = month === current ? Temporal.Now.plainDateISO().day : month < current ? days : 0;
  const daysRemaining = Math.max(0, days - today);

  const dailySpent = new Float64Array(days + 1);
  const spentByMonthBucket = new Map<string, number>();
  const spentByMonthCategory = new Map<string, number>();

  for (const e of expenses) {
    if (!e.category_id) continue;
    const bucketId = bucketOfCategory.get(e.category_id);
    if (!bucketId) continue;

    const d = fromISO(e.date);
    if (!d) continue;

    const amt = Number(e.is_split ? e.your_share : e.amount) || 0;
    const m = toMonthKey(d);
    const key = `${m}|${bucketId}`;
    spentByMonthBucket.set(key, (spentByMonthBucket.get(key) ?? 0) + amt);

    if (m === month) {
      spentByMonthCategory.set(e.category_id, (spentByMonthCategory.get(e.category_id) ?? 0) + amt);
      if (budgetedBuckets.has(bucketId)) {
        dailySpent[d.day] += amt;
      }
    }
  }

  // 4. Single pass over current month's budgets: build rows, category breakdowns, projections & alerts
  const inMonth = budgetsByMonth.get(month) ?? [];
  const rows: BudgetRow[] = [];
  const alerts: BudgetAlertItem[] = [];
  const insights: string[] = [];
  let budgeted = 0;
  let spent = 0;
  let alertCount = 0;

  for (const b of inMonth) {
    const bucket = bucketById.get(b.bucket_id);
    const amount = Number(b.amount) || 0;
    const rowSpent = roundMoney(spentByMonthBucket.get(`${month}|${b.bucket_id}`) ?? 0);
    const amberThreshold = Number(b.alert_threshold_amber ?? 80);
    const redThreshold = Number(b.alert_threshold_red ?? 100);
    const pct = usagePct(rowSpent, amount);
    const status = usageStatus(pct, amberThreshold, redThreshold);

    // Build categories breakdown inside this bucket
    const bucketCats = categoriesByBucketId.get(b.bucket_id) ?? [];
    const categoryBreakdown: BudgetCategoryBreakdown[] = bucketCats
      .map((cat) => {
        const catSpent = roundMoney(spentByMonthCategory.get(cat.id) ?? 0);
        const percent = rowSpent > 0 ? Math.round((catSpent / rowSpent) * 100) : 0;
        return {
          id: cat.id,
          label: cat.label,
          color: cat.color ?? undefined,
          spent: catSpent,
          percent,
        };
      })
      .sort((a, b) => b.spent - a.spent);

    // Build projections
    const dailyAvgSpent = today > 0 ? roundMoney(rowSpent / today) : 0;
    const remaining = amount - rowSpent;
    const safeDailySpend =
      daysRemaining > 0 ? roundMoney(Math.max(0, remaining) / daysRemaining) : 0;
    const projectedMonthEndSpent = roundMoney(
      today > 0 ? rowSpent + dailyAvgSpent * daysRemaining : rowSpent
    );
    const projectedOverspend = roundMoney(Math.max(0, projectedMonthEndSpent - amount));
    const willExceedInMonth = dailyAvgSpent > 0 && remaining > 0 && projectedMonthEndSpent > amount;
    const runoutDay = willExceedInMonth
      ? Math.min(days, Math.max(today + 1, Math.round(amount / dailyAvgSpent)))
      : undefined;

    const projection: BudgetProjection = {
      daysInMonth: days,
      daysElapsed: today,
      daysRemaining,
      dailyAvgSpent,
      safeDailySpend,
      projectedMonthEndSpent,
      projectedOverspend,
      runoutDay,
    };

    const row: BudgetRow = {
      id: b.id,
      bucketId: b.bucket_id,
      incomeId: b.income_id,
      bucketKey: bucket?.key ?? '',
      bucketLabel: bucket?.label ?? '',
      bucketColor: bucket?.color ?? undefined,
      targetPercent: Number(bucket?.target_percent ?? 0),
      period: b.period as BudgetRow['period'],
      amount,
      spent: rowSpent,
      rollover: Boolean(b.rollover),
      amberThreshold,
      redThreshold,
      categories: categoryBreakdown,
      projection,
    };

    rows.push(row);
    budgeted += amount;
    spent += rowSpent;

    if (status.tone !== 'success') {
      alertCount++;
      const isOver = status.tone === 'danger';
      alerts.push({
        id: b.id,
        bucketLabel: row.bucketLabel,
        bucketColor: row.bucketColor,
        spent: rowSpent,
        amount,
        pct: Math.round(pct),
        tone: status.tone,
        remaining,
        message: isOver
          ? `${row.bucketLabel} is over budget by ${formatInr(Math.abs(remaining))}.`
          : `${row.bucketLabel} reached ${Math.round(pct)}% of budget (${formatInr(remaining)} remaining).`,
      });

      if (isOver) {
        insights.push(
          `${row.bucketLabel} has surpassed its monthly cap by ${formatInr(Math.abs(remaining))}. Halt discretionary spend in this bucket.`
        );
      } else if (dailyAvgSpent > 0 && runoutDay && runoutDay <= days) {
        insights.push(
          `${row.bucketLabel} will exhaust its allocation around day ${runoutDay} at the current daily pace (${formatInr(dailyAvgSpent)}/day).`
        );
      }
    } else if (safeDailySpend > 0 && daysRemaining > 0) {
      insights.push(
        `${row.bucketLabel} is on track: safe pace is ${formatInr(safeDailySpend)}/day for the remaining ${daysRemaining} days.`
      );
    }
  }

  const totals: BudgetTotals = rows.length
    ? {
        budgeted: roundMoney(budgeted),
        spent: roundMoney(spent),
        remaining: roundMoney(budgeted - spent),
        usedPct: usagePct(spent, budgeted),
        alertCount,
      }
    : EMPTY_TOTALS;

  // 5. Build pace points in a single pass without intermediate cumulative arrays
  let pace: PacePoint[] = [];
  if (rows.length > 0) {
    let spentThroughToday = 0;
    for (let d = 1; d <= today; d++) {
      spentThroughToday += dailySpent[d];
    }
    const rate = today > 0 ? spentThroughToday / today : 0;
    const isCurrentMonth = month === current && today > 0;

    let cum = 0;
    pace = Array.from({ length: days }, (_, i) => {
      const d = i + 1;
      cum += dailySpent[d];
      return {
        day: String(d),
        cumulative: d <= today ? roundMoney(cum) : undefined,
        ideal: roundMoney((budgeted * d) / days),
        projected:
          isCurrentMonth && d >= today
            ? roundMoney(spentThroughToday + rate * (d - today))
            : undefined,
      };
    });
  }

  // 6. History: O(1) lookup per month using budgetsByMonth instead of re-filtering all budgets 6 times
  let hasHistoryBudget = false;
  const history: HistoryPoint[] = [-5, -4, -3, -2, -1, 0].map((delta) => {
    const m = shiftMonth(month, delta);
    const monthBudgets = budgetsByMonth.get(m) ?? [];
    let mBudget = 0;
    let mSpent = 0;

    for (const b of monthBudgets) {
      mBudget += Number(b.amount) || 0;
      mSpent += spentByMonthBucket.get(`${m}|${b.bucket_id}`) ?? 0;
    }

    const roundedBudget = roundMoney(mBudget);
    if (roundedBudget > 0) hasHistoryBudget = true;

    return {
      month: m,
      budget: roundedBudget,
      spent: roundMoney(mSpent),
    };
  });

  return {
    rows,
    totals,
    totalIncome,
    pace,
    history: hasHistoryBudget ? history : [],
    alerts,
    insights,
  };
};
