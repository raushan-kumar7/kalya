import { Budget, BudgetFilterQueryDto, CreateBudgetDto, UpdateBudgetDto } from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { BudgetService } from '@/libs/services/finances/budgets.service';
import { BudgetHealthEvaluation } from '@/libs/services/finances';

export function useBudgetsQuery(
  query?: BudgetFilterQueryDto,
  options?: Omit<UseQueryOptions<Budget[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.budgets(query),
    queryFn: () => BudgetService.list(query),
    staleTime: 1000 * 60 * 2,
    ...options,
  });
}

export function useBudgetHealthQuery(
  id: string,
  options?: Omit<UseQueryOptions<BudgetHealthEvaluation, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.budgetHealth(id),
    queryFn: () => BudgetService.getHealth(id),
    enabled: Boolean(id && options?.enabled !== false),
    staleTime: 1000 * 30, // 30s freshness for real-time spend gauge
    ...options,
  });
}

export function useCreateBudgetMutation(
  options?: UseMutationOptions<Budget, Error, CreateBudgetDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: BudgetService.create,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useUpdateBudgetMutation(
  options?: UseMutationOptions<Budget, Error, { id: string; dto: UpdateBudgetDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, dto }) => BudgetService.update(id, dto),
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets() });
      queryClient.invalidateQueries({ queryKey: financeKeys.budgetHealth(variables.id) });
      options?.onSuccess?.(data, variables, ...args);
    },
  });
}

export function useDeleteBudgetMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: BudgetService.delete,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets() });
      queryClient.removeQueries({ queryKey: financeKeys.budgetDetail(id) });
      options?.onSuccess?.(data, id, ...args);
    },
  });
}
