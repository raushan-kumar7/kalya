import { CreateGoalDto, Goal, GoalFilterQueryDto, UpdateGoalDto } from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { GoalService } from '@/libs/services/finances/goals.service';

export function useGoalsQuery(
  query?: GoalFilterQueryDto,
  options?: Omit<UseQueryOptions<Goal[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.goals(query),
    queryFn: () => GoalService.list(query),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useCreateGoalMutation(options?: UseMutationOptions<Goal, Error, CreateGoalDto>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: GoalService.create,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.goals() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useUpdateGoalMutation(
  options?: UseMutationOptions<Goal, Error, { id: string; dto: UpdateGoalDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, dto }) => GoalService.update(id, dto),
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.goals() });
      queryClient.invalidateQueries({ queryKey: financeKeys.goalDetail(variables.id) });
      options?.onSuccess?.(data, variables, ...args);
    },
  });
}

export function useDeleteGoalMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: GoalService.delete,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.goals() });
      options?.onSuccess?.(data, id, ...args);
    },
  });
}
