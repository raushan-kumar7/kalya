import type { TransactionFilterState, UnifiedTransactionItem } from './types';

type Comparator = (a: UnifiedTransactionItem, b: UnifiedTransactionItem) => number;

const categoryLabel = (item: UnifiedTransactionItem): string =>
  item.kind === 'income' ? 'Income' : item.category?.label || '';

const byDate =
  (direction: 1 | -1): Comparator =>
  (a, b) => {
    if (a.date !== b.date) return direction * a.date.localeCompare(b.date);
    return direction * (a.createdAt || '').localeCompare(b.createdAt || '');
  };

const COMPARATORS: Record<string, Comparator> = {
  'date-desc': byDate(-1),
  'date-asc': byDate(1),
  'amount-desc': (a, b) => b.amount - a.amount,
  'amount-asc': (a, b) => a.amount - b.amount,
  'description-asc': (a, b) => a.description.localeCompare(b.description),
  'description-desc': (a, b) => b.description.localeCompare(a.description),
  'category-asc': (a, b) => categoryLabel(a).localeCompare(categoryLabel(b)),
  'category-desc': (a, b) => categoryLabel(b).localeCompare(categoryLabel(a)),
};

/** Returns a new sorted array; never mutates the input. */
export function sortTransactions(
  items: UnifiedTransactionItem[],
  sortBy: TransactionFilterState['sortBy']
): UnifiedTransactionItem[] {
  const comparator = COMPARATORS[sortBy as string];
  return comparator ? [...items].sort(comparator) : [...items];
}
