import { useCallback } from 'react';
import { RunActionOptions, runAction } from '@/libs';
import { ExpenseService } from '@/libs/services/finances';
import { ExpenseFilterQueryDto, Expense, CreateExpenseDto, UpdateExpenseDto } from '@kalya/types';
import { queryOptions, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  financeKeys,
  STALE,
  QueryOverrides,
  ExpenseDetail,
  invalidateAfterExpenseChange,
  SuccessResponse,
} from './shared';

/* ── Queries ─────────────────────────────────────────────── */

export const expenseQueries = {
  list: (query?: ExpenseFilterQueryDto) =>
    queryOptions({
      queryKey: financeKeys.expenses.list(query),
      queryFn: () => ExpenseService.list(query),
      staleTime: STALE.short,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: financeKeys.expenses.detail(id),
      queryFn: () => ExpenseService.getById(id),
      enabled: Boolean(id),
    }),
};

export function useExpensesQuery(
  query?: ExpenseFilterQueryDto,
  options?: QueryOverrides<Expense[]>
) {
  return useQuery({ ...expenseQueries.list(query), ...options });
}

export function useExpenseDetailQuery(id: string, options?: QueryOverrides<ExpenseDetail>) {
  return useQuery({
    ...expenseQueries.detail(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

/* ── Mutations ───────────────────────────────────────────── */

export function useCreateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation<Expense, Error, CreateExpenseDto>({
    mutationFn: (dto) => ExpenseService.create(dto),
    onSuccess: () => invalidateAfterExpenseChange(qc),
  });
}

export function useUpdateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation<Expense, Error, { id: string; dto: UpdateExpenseDto }>({
    mutationFn: ({ id, dto }) => ExpenseService.update(id, dto),
    onSuccess: () => invalidateAfterExpenseChange(qc),
  });
}

export function useDeleteExpenseMutation() {
  const qc = useQueryClient();
  return useMutation<SuccessResponse, Error, string>({
    mutationFn: (id) => ExpenseService.delete(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: financeKeys.expenses.detail(id) });
      return invalidateAfterExpenseChange(qc);
    },
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useExpenseActions() {
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateExpenseMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateExpenseMutation();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteExpenseMutation();

  const createExpense = useCallback(
    (dto: CreateExpenseDto, options?: RunActionOptions<Expense>) =>
      runAction(() => createAsync(dto), {
        loading: 'Recording expense…',
        success: 'Expense logged successfully!',
        ...options,
      }),
    [createAsync]
  );

  const updateExpense = useCallback(
    (id: string, dto: UpdateExpenseDto, options?: RunActionOptions<Expense>) =>
      runAction(() => updateAsync({ id, dto }), {
        loading: 'Updating expense…',
        success: 'Expense updated successfully!',
        ...options,
      }),
    [updateAsync]
  );

  const deleteExpense = useCallback(
    (id: string, options?: RunActionOptions<SuccessResponse>) =>
      runAction(() => deleteAsync(id), {
        loading: 'Deleting expense…',
        success: 'Expense deleted successfully!',
        ...options,
      }),
    [deleteAsync]
  );

  return {
    createExpense,
    updateExpense,
    deleteExpense,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting: isCreating || isUpdating || isDeleting,
  };
}
