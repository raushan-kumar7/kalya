import { useDeferredValue, useMemo, useState } from 'react';
import { shiftMonth } from '@kalya/utils';
import { useFinanceFeed } from '../feed/use-finance-feed';
import { useMonthNavigation } from '../use-month-navigation';
import { countByTab, createTransactionPredicate, isAnyFilterActive, matchesTab } from './filters';
import { groupByDay } from './group-by-day';
import { sortTransactions } from './sort';
import { computeFilteredTotals, computeSummaryMetrics } from './summary';
import type { TransactionFilterState, TransactionTab } from './types';

const DEFAULT_PAGE_SIZE = 25;

export interface UseTransactionsOptions {
  filters: TransactionFilterState;
  activeTab: TransactionTab;
}

/**
 * Thin wiring hook: feed -> filter -> sort -> summarise -> paginate.
 * Fetching + building lives in `useFinanceFeed` (shared with Overview);
 * business logic lives in the pure modules next to this file.
 * `month` carries the picker state + controls (label, prev / next / current).
 */
export function useTransactions({ filters: liveFilters, activeTab }: UseTransactionsOptions) {
  const month = useMonthNavigation();
  const { selectedMonth } = month;
  const previousMonth = useMemo(() => shiftMonth(selectedMonth, -1), [selectedMonth]);

  // Typing in the search box stays responsive; heavy re-filtering runs at low priority.
  const filters = useDeferredValue(liveFilters);

  const feed = useFinanceFeed();
  const { items: allItems } = feed;

  /* ── pipeline ── */
  const summaryMetrics = useMemo(
    () => computeSummaryMetrics(allItems, selectedMonth),
    [allItems, selectedMonth]
  );

  const predicate = useMemo(
    () => createTransactionPredicate(filters, { selectedMonth, previousMonth }),
    [filters, selectedMonth, previousMonth]
  );

  const tabCounts = useMemo(() => countByTab(allItems, predicate), [allItems, predicate]);

  const filteredItems = useMemo(() => {
    const visible = allItems.filter((item) => matchesTab(item, activeTab) && predicate(item));
    return sortTransactions(visible, filters.sortBy);
  }, [allItems, activeTab, predicate, filters.sortBy]);

  const filteredTotals = useMemo(() => computeFilteredTotals(filteredItems), [filteredItems]);

  /* ── pagination: numbered pages (table) and load-more (feed) ── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE);

  // Reset to the top when the result set changes shape. Done during render
  // (React's "adjust state on prop change" pattern): no extra effect pass,
  // so there is never a frame showing a stale page.
  const resetKey = JSON.stringify([filters, activeTab, selectedMonth, pageSize]);
  const [seenKey, setSeenKey] = useState(resetKey);
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setPage(1);
    setVisibleCount(pageSize);
  }

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedPageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const paginatedItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const hasMore = visibleCount < filteredItems.length;
  const loadMore = () => setVisibleCount((prev) => prev + pageSize);

  const groupedDays = useMemo(() => groupByDay(paginatedItems), [paginatedItems]);
  const isFilterActive = useMemo(() => isAnyFilterActive(liveFilters), [liveFilters]);

  return {
    // counts & metrics
    allCount: allItems.length,
    filteredCount: filteredItems.length,
    tabCounts,
    summaryMetrics,
    filteredTotals,

    // feed (load-more)
    groupedDays,
    paginatedItems,
    hasMore,
    loadMore,

    // table (numbered pages)
    paginatedPageItems,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,

    // status
    isLoading: feed.isLoading,
    isError: feed.isError,
    error: feed.error,
    refetch: feed.refetch,

    // month picker + reference data for filter UIs
    month,
    selectedMonth,
    categories: feed.categories,
    buckets: feed.buckets,
    contacts: feed.contacts,
    isFilterActive,
  };
}
