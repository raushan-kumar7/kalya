import type { QueryClient } from '@tanstack/react-query';
import { financeKeys } from './keys';

/**
 * Cross-entity cache rules live here, once.
 * Each helper returns a promise so a mutation's onSuccess can return it,
 * which keeps the mutation "pending" until the refetch finishes.
 */

/** Any expense create / update / delete. */
export const invalidateAfterExpenseChange = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: financeKeys.expenses.all() }),
    qc.invalidateQueries({ queryKey: financeKeys.budgets.all() }), // lists + health
    qc.invalidateQueries({ queryKey: financeKeys.splits.all() }), // pending shares
    qc.invalidateQueries({ queryKey: financeKeys.summaries.all() }), // monthly overview
  ]);

/** Any income create / update / delete. Covers both old and new month overviews. */
export const invalidateAfterIncomeChange = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: financeKeys.income.all() }),
    qc.invalidateQueries({ queryKey: financeKeys.summaries.all() }),
  ]);

/** Settling a split share changes pending list, expense feed and overview. */
export const invalidateAfterSplitSettle = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: financeKeys.splits.all() }),
    qc.invalidateQueries({ queryKey: financeKeys.expenses.all() }),
    qc.invalidateQueries({ queryKey: financeKeys.summaries.all() }),
  ]);

/** Buckets own categories, so bucket changes can affect both. */
export const invalidateAfterBucketChange = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: financeKeys.buckets.all() }),
    qc.invalidateQueries({ queryKey: financeKeys.categories.all() }),
  ]);

/** Deleting a bucket/category can orphan expenses and budgets that reference it. */
export const invalidateAfterTaxonomyRemoval = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: financeKeys.expenses.all() }),
    qc.invalidateQueries({ queryKey: financeKeys.budgets.all() }),
  ]);
