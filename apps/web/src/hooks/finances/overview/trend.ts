import { formatMonthLabel, roundMoney, shiftMonth } from '@kalya/utils';
import type { UnifiedTransactionItem } from '../transactions/types';
import { getItemMonth } from '../transactions/date';
import { spentAmount } from '../transactions/summary';
import type { MonthlyTrendPoint } from './types';

/** Last `months` months ending at `selectedMonth`. One pass over the items. */
export function computeMonthlyTrend(
  items: UnifiedTransactionItem[],
  selectedMonth: string,
  months = 6
): MonthlyTrendPoint[] {
  // Pre-seeding keeps empty months in the chart and preserves oldest -> newest order.
  const totals = new Map<string, { income: number; expense: number }>();
  for (let i = months - 1; i >= 0; i--) {
    totals.set(shiftMonth(selectedMonth, -i), { income: 0, expense: 0 });
  }

  for (const item of items) {
    const row = totals.get(getItemMonth(item) ?? '');
    if (!row) continue;
    if (item.kind === 'income') row.income += item.totalIncome;
    else row.expense += spentAmount(item);
  }

  return [...totals].map(([month, { income, expense }]) => ({
    month,
    label: formatMonthLabel(month),
    income: roundMoney(income),
    expense: roundMoney(expense),
    savings: roundMoney(income - expense),
  }));
}
