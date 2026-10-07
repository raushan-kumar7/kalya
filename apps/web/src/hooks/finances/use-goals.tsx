import { useCallback } from 'react';
import { RunActionOptions, runAction } from '@/libs';
import { GoalService } from '@/libs/services/finances';
import { GoalFilterQueryDto, Goal, CreateGoalDto, UpdateGoalDto } from '@kalya/types';
import { queryOptions, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { financeKeys, STALE, QueryOverrides, SuccessResponse } from './shared';

/* ── Queries ─────────────────────────────────────────────── */

export const goalQueries = {
  list: (query?: GoalFilterQueryDto) =>
    queryOptions({
      queryKey: financeKeys.goals.list(query),
      queryFn: () => GoalService.list(query),
      staleTime: STALE.medium,
    }),
};

export function useGoalsQuery(query?: GoalFilterQueryDto, options?: QueryOverrides<Goal[]>) {
  return useQuery({ ...goalQueries.list(query), ...options });
}

/* ── Mutations ───────────────────────────────────────────── */

const invalidateGoals = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: financeKeys.goals.all() });

export function useCreateGoalMutation() {
  const qc = useQueryClient();
  return useMutation<Goal, Error, CreateGoalDto>({
    mutationFn: (dto) => GoalService.create(dto),
    onSuccess: () => invalidateGoals(qc),
  });
}

export function useUpdateGoalMutation() {
  const qc = useQueryClient();
  return useMutation<Goal, Error, { id: string; dto: UpdateGoalDto }>({
    mutationFn: ({ id, dto }) => GoalService.update(id, dto),
    onSuccess: () => invalidateGoals(qc),
  });
}

export function useDeleteGoalMutation() {
  const qc = useQueryClient();
  return useMutation<SuccessResponse, Error, string>({
    mutationFn: (id) => GoalService.delete(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: financeKeys.goals.detail(id) });
      return invalidateGoals(qc);
    },
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useGoalActions() {
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateGoalMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateGoalMutation();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteGoalMutation();

  const createGoal = useCallback(
    (dto: CreateGoalDto, options?: RunActionOptions<Goal>) =>
      runAction(() => createAsync(dto), {
        loading: 'Creating savings goal…',
        success: 'Savings goal created!',
        ...options,
      }),
    [createAsync]
  );

  const updateGoal = useCallback(
    (id: string, dto: UpdateGoalDto, options?: RunActionOptions<Goal>) =>
      runAction(() => updateAsync({ id, dto }), {
        loading: 'Updating goal…',
        success: 'Goal updated successfully!',
        ...options,
      }),
    [updateAsync]
  );

  const deleteGoal = useCallback(
    (id: string, options?: RunActionOptions<SuccessResponse>) =>
      runAction(() => deleteAsync(id), {
        loading: 'Deleting goal…',
        success: 'Goal deleted successfully!',
        ...options,
      }),
    [deleteAsync]
  );

  return {
    createGoal,
    updateGoal,
    deleteGoal,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting: isCreating || isUpdating || isDeleting,
  };
}
