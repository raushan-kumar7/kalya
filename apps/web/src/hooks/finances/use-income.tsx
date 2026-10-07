import { useCallback } from 'react';
import { RunActionOptions, runAction } from '@/libs';
import { IncomeService } from '@/libs/services/finances';
import { CreateIncomeDto, Income, IncomeFilterQueryDto, UpdateIncomeDto } from '@kalya/types';
import { queryOptions, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  financeKeys,
  STALE,
  QueryOverrides,
  invalidateAfterIncomeChange,
  SuccessResponse,
} from './shared';

/* ── Queries ─────────────────────────────────────────────── */

export const incomeQueries = {
  list: (query?: IncomeFilterQueryDto) =>
    queryOptions({
      queryKey: financeKeys.income.list(query),
      queryFn: () => IncomeService.list(query),
      staleTime: STALE.medium,
    }),
};

export function useIncomeQuery(query?: IncomeFilterQueryDto, options?: QueryOverrides<Income[]>) {
  return useQuery({ ...incomeQueries.list(query), ...options });
}

/* ── Mutations ───────────────────────────────────────────── */

export function useCreateIncomeMutation() {
  const qc = useQueryClient();
  return useMutation<Income, Error, CreateIncomeDto>({
    mutationFn: (dto) => IncomeService.create(dto),
    onSuccess: () => invalidateAfterIncomeChange(qc),
  });
}

export function useUpdateIncomeMutation() {
  const qc = useQueryClient();
  return useMutation<Income, Error, { id: string; dto: UpdateIncomeDto }>({
    mutationFn: ({ id, dto }) => IncomeService.update(id, dto),
    // Invalidates ALL summaries, so both the old and new month are refreshed
    // if the month was changed by the update.
    onSuccess: () => invalidateAfterIncomeChange(qc),
  });
}

export function useDeleteIncomeMutation() {
  const qc = useQueryClient();
  return useMutation<SuccessResponse, Error, string>({
    mutationFn: (id) => IncomeService.delete(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: financeKeys.income.detail(id) });
      return invalidateAfterIncomeChange(qc);
    },
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useIncomeActions() {
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateIncomeMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateIncomeMutation();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteIncomeMutation();

  const logIncome = useCallback(
    (dto: CreateIncomeDto, options?: RunActionOptions<Income>) =>
      runAction(() => createAsync(dto), {
        loading: 'Registering income…',
        success: 'Monthly income logged!',
        ...options,
      }),
    [createAsync]
  );

  const updateIncome = useCallback(
    (id: string, dto: UpdateIncomeDto, options?: RunActionOptions<Income>) =>
      runAction(() => updateAsync({ id, dto }), {
        loading: 'Updating income…',
        success: 'Income updated successfully!',
        ...options,
      }),
    [updateAsync]
  );

  const deleteIncome = useCallback(
    (id: string, options?: RunActionOptions<SuccessResponse>) =>
      runAction(() => deleteAsync(id), {
        loading: 'Deleting income…',
        success: 'Income deleted successfully!',
        ...options,
      }),
    [deleteAsync]
  );

  return {
    logIncome,
    updateIncome,
    deleteIncome,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting: isCreating || isUpdating || isDeleting,
  };
}
