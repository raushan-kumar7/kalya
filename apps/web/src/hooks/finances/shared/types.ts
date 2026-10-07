import type { Expense, SplitContactMember, SplitExpense } from '@kalya/types';
import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * Per-call overrides a component may pass to a query hook.
 * `enabled` is narrowed to boolean so it can be safely combined with the
 * hook's own precondition (e.g. a non-empty id).
 */
export type QueryOverrides<TData> = Omit<
  UseQueryOptions<TData, Error>,
  'queryKey' | 'queryFn' | 'enabled'
> & { enabled?: boolean };

export type SuccessResponse = { success: boolean };

export type ExpenseDetail = Expense & { splits: SplitExpense[] };

export type PendingSplitShare = SplitExpense & {
  expense: Expense;
  member: SplitContactMember;
};
