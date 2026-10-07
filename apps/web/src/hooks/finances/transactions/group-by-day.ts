import { formatCardDate, fromISO, isSameDay, roundMoney, Temporal } from '@kalya/utils';
import type { DayTransactionGroup, UnifiedTransactionItem } from './types';

function dayLabel(date: string): string {
  const plain = fromISO(date);
  if (!plain) return date;

  const today = Temporal.Now.plainDateISO();
  const yesterday = today.subtract({ days: 1 });

  if (isSameDay(plain, today)) return `Today - ${formatCardDate(plain)}`;
  if (isSameDay(plain, yesterday)) return `Yesterday - ${formatCardDate(plain)}`;
  return formatCardDate(plain);
}

/** Groups items by calendar day, keeping the incoming order. Pure, no React. */
export function groupByDay(items: UnifiedTransactionItem[]): DayTransactionGroup[] {
  const byDate = new Map<string, UnifiedTransactionItem[]>();

  for (const item of items) {
    const list = byDate.get(item.date);
    if (list) list.push(item);
    else byDate.set(item.date, [item]);
  }

  const groups: DayTransactionGroup[] = [];

  for (const [date, dayItems] of byDate) {
    let totalOutflow = 0;
    let totalInflow = 0;

    for (const item of dayItems) {
      if (item.kind === 'personal_expense') totalOutflow += item.amount;
      else if (item.kind === 'split_bill') totalOutflow += item.yourShare;
      else totalInflow += item.totalIncome;
    }

    groups.push({
      date,
      label: dayLabel(date),
      totalOutflow: roundMoney(totalOutflow),
      totalInflow: roundMoney(totalInflow),
      items: dayItems,
    });
  }

  return groups;
}
