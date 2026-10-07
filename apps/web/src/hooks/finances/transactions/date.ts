import { fromISO, toMonthKey } from '@kalya/utils';
import type { UnifiedTransactionItem } from './types';

/** 'YYYY-MM-DD' -> 'YYYY-MM', or null when the date cannot be parsed. */
export function getMonthKey(isoDate: string): string | null {
  const date = fromISO(isoDate);
  return date ? toMonthKey(date) : null;
}

// Items are rebuilt only when API data changes, so a WeakMap keyed by item means
// each item is parsed by Temporal once, not once per summary / trend / chart pass.
const itemMonthCache = new WeakMap<UnifiedTransactionItem, string | null>();

/** The month an item counts toward: income uses its `month`, everything else its date. */
export function getItemMonth(item: UnifiedTransactionItem): string | null {
  let key = itemMonthCache.get(item);
  if (key === undefined) {
    key = item.kind === 'income' ? item.month : getMonthKey(item.date);
    itemMonthCache.set(item, key);
  }
  return key;
}
