import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { buildTransactionItems } from '../transactions/build-items';
import { bucketQueries } from '../use-buckets';
import { categoryQueries } from '../use-categories';
import { expenseQueries } from '../use-expenses';
import { incomeQueries } from '../use-income';
import { splitQueries } from '../use-splits';

// Stable fallback so `data ?? []` never creates a new array per render.
const NONE: never[] = [];

/**
 * Single source of truth for "all my money movements".
 * Overview and Transactions both call this, so they hit the SAME React Query
 * cache entries (one network round trip) and are built by the SAME mapper
 * (the two pages can never disagree on a number).
 */
export function useFinanceFeed() {
  const { data, status } = useQueries({
    // Reuses the existing queryOptions: no keys / staleTimes redefined here.
    queries: [
      expenseQueries.list(),
      incomeQueries.list(),
      categoryQueries.list(),
      bucketQueries.list(),
      splitQueries.contacts(),
      splitQueries.pending(),
    ],
    combine: (results) => ({
      data: {
        expenses: results[0].data ?? NONE,
        incomes: results[1].data ?? NONE,
        categories: results[2].data ?? NONE,
        buckets: results[3].data ?? NONE,
        contacts: results[4].data ?? NONE,
        pendingShares: results[5].data ?? NONE,
      },
      status: {
        isLoading: results.some((r) => r.isLoading),
        isError: results.some((r) => r.isError),
        error: results.find((r) => r.error)?.error ?? null,
        refetch: () => Promise.all(results.map((r) => r.refetch())),
      },
    }),
  });

  const { expenses, incomes, categories, buckets, contacts, pendingShares } = data;

  // Depend on the arrays (structurally shared by React Query), not on `data`.
  const items = useMemo(
    () =>
      buildTransactionItems({ expenses, incomes, categories, buckets, contacts, pendingShares }),
    [expenses, incomes, categories, buckets, contacts, pendingShares]
  );

  return { items, categories, buckets, contacts, ...status };
}
