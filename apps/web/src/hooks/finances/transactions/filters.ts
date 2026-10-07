import type { TransactionFilterState, TransactionTab, UnifiedTransactionItem } from './types';
import { getMonthKey } from './date';

export interface FilterContext {
  selectedMonth: string;
  previousMonth: string;
}

/* ── individual rules (each returns true when the item passes) ── */

function matchesDateRange(
  item: UnifiedTransactionItem,
  filters: TransactionFilterState,
  { selectedMonth, previousMonth }: FilterContext
): boolean {
  switch (filters.dateRange) {
    case 'this-month': {
      const key = getMonthKey(item.date);
      return !key || key === selectedMonth; // unparsable dates are kept
    }
    case 'last-month': {
      const key = getMonthKey(item.date);
      return !key || key === previousMonth;
    }
    case 'custom':
      if (filters.customStartDate && item.date < filters.customStartDate) return false;
      if (filters.customEndDate && item.date > filters.customEndDate) return false;
      return true;
    default:
      return true;
  }
}

function matchesSearch(item: UnifiedTransactionItem, query: string): boolean {
  if (!query) return true;

  if (item.description.toLowerCase().includes(query)) return true;

  if (item.kind !== 'income' && item.category?.label.toLowerCase().includes(query)) {
    return true;
  }

  if (item.kind === 'split_bill') {
    return (
      item.payerName.toLowerCase().includes(query) ||
      item.members.some((m) => m.memberName.toLowerCase().includes(query))
    );
  }

  return false;
}

function matchesCategoryAndBucket(
  item: UnifiedTransactionItem,
  filters: TransactionFilterState
): boolean {
  const hasCategoryIds = Boolean(filters.categoryIds && filters.categoryIds.length > 0);
  const needsTaxonomy = hasCategoryIds || Boolean(filters.categoryId) || Boolean(filters.bucketId);

  if (!needsTaxonomy) return true;
  if (item.kind === 'income') return false; // income has no category / bucket

  if (hasCategoryIds) {
    if (!item.category?.id || !filters.categoryIds!.includes(item.category.id)) return false;
  } else if (filters.categoryId && item.category?.id !== filters.categoryId) {
    return false;
  }

  if (filters.bucketId && item.bucket?.id !== filters.bucketId) return false;

  return true;
}

function matchesPaymentMethod(
  item: UnifiedTransactionItem,
  filters: TransactionFilterState
): boolean {
  const multi = filters.paymentMethods;

  if (multi && multi.length > 0 && !multi.includes('all')) {
    if (item.kind === 'income') return false;
    return Boolean(item.paymentMethod && multi.includes(item.paymentMethod));
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    if (item.kind === 'income') return false;
    return item.paymentMethod === filters.paymentMethod;
  }

  return true;
}

function matchesKind(item: UnifiedTransactionItem, filters: TransactionFilterState): boolean {
  return !filters.kinds || filters.kinds.length === 0 || filters.kinds.includes(item.kind);
}

function matchesAmount(item: UnifiedTransactionItem, filters: TransactionFilterState): boolean {
  if (filters.minAmount !== undefined && item.amount < filters.minAmount) return false;
  if (filters.maxAmount !== undefined && item.amount > filters.maxAmount) return false;
  return true;
}

function matchesSplitStatus(
  item: UnifiedTransactionItem,
  filters: TransactionFilterState
): boolean {
  if (item.kind !== 'split_bill' || filters.splitStatus === 'all') return true;
  if (filters.splitStatus === 'pending') return !item.isSettled;
  if (filters.splitStatus === 'settled') return item.isSettled;
  return true;
}

/* ── public ──────────────────────────────────────────────── */

/** Builds one predicate from the active non-tab filters. Pure, no React. */
export function createTransactionPredicate(
  filters: TransactionFilterState,
  context: FilterContext
): (item: UnifiedTransactionItem) => boolean {
  const query = filters.searchQuery.trim().toLowerCase();

  return (item) =>
    matchesDateRange(item, filters, context) &&
    matchesSearch(item, query) &&
    matchesCategoryAndBucket(item, filters) &&
    matchesPaymentMethod(item, filters) &&
    matchesKind(item, filters) &&
    matchesAmount(item, filters) &&
    matchesSplitStatus(item, filters);
}

export function matchesTab(item: UnifiedTransactionItem, tab: TransactionTab): boolean {
  switch (tab) {
    case 'expense':
      return item.kind === 'personal_expense';
    case 'split':
      return item.kind === 'split_bill';
    case 'income':
      return item.kind === 'income';
    default:
      return true; // 'all'
  }
}

export interface TabCounts {
  all: number;
  expense: number;
  split: number;
  income: number;
}

/** Live tab badge counts under the current (non-tab) filters. */
export function countByTab(
  items: UnifiedTransactionItem[],
  predicate: (item: UnifiedTransactionItem) => boolean
): TabCounts {
  const counts: TabCounts = { all: 0, expense: 0, split: 0, income: 0 };

  for (const item of items) {
    if (!predicate(item)) continue;
    counts.all++;
    if (item.kind === 'personal_expense') counts.expense++;
    else if (item.kind === 'split_bill') counts.split++;
    else counts.income++;
  }

  return counts;
}

/** True when any filter differs from the defaults. */
export function isAnyFilterActive(filters: TransactionFilterState): boolean {
  return (
    Boolean(filters.searchQuery.trim()) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.categoryIds && filters.categoryIds.length > 0) ||
    Boolean(filters.bucketId) ||
    (Boolean(filters.paymentMethod) && filters.paymentMethod !== 'all') ||
    Boolean(filters.paymentMethods && filters.paymentMethods.length > 0) ||
    Boolean(filters.kinds && filters.kinds.length > 0) ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined ||
    filters.dateRange !== 'this-month' ||
    filters.splitStatus !== 'all' ||
    filters.sortBy !== 'date-desc'
  );
}
