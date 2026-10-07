import { roundMoney, Temporal, toISO } from '@kalya/utils';
import type { UnifiedTransactionItem } from '../transactions/types';
import { spentAmount } from '../transactions/summary';
import type { DailySpendPoint } from './types';

/** Every day of `month` with spend + running total. Expects items of that month. */
export function computeDailySpending(
  monthItems: UnifiedTransactionItem[],
  month: string
): DailySpendPoint[] {
  const spentByDate = new Map<string, number>();
  for (const item of monthItems) {
    const amount = spentAmount(item);
    if (amount > 0) spentByDate.set(item.date, (spentByDate.get(item.date) ?? 0) + amount);
  }

  const yearMonth = Temporal.PlainYearMonth.from(month);
  const points: DailySpendPoint[] = [];
  let cumulative = 0;

  const today = Temporal.Now.plainDateISO();
  const isCurrentMonth = month === today.toPlainYearMonth().toString();
  const currentDay = isCurrentMonth ? today.day : yearMonth.daysInMonth;

  for (let day = 1; day <= yearMonth.daysInMonth; day++) {
    const date = toISO(yearMonth.toPlainDate({ day }));
    const isFuture = isCurrentMonth && day > currentDay;
    const spent = isFuture ? 0 : roundMoney(spentByDate.get(date) ?? 0);
    if (!isFuture) {
      cumulative = roundMoney(cumulative + spent);
    }
    points.push({
      date,
      day,
      spent,
      cumulative: isFuture ? null : cumulative,
      isFuture,
    });
  }

  return points;
}
