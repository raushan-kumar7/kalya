import { CreateIncomeDto, Income, IncomeFilterQueryDto, UpdateIncomeDto } from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { IncomeService } from '@/libs/services/finances/income.service';

export function useIncomeQuery(
  query?: IncomeFilterQueryDto,
  options?: Omit<UseQueryOptions<Income[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.income(query),
    queryFn: () => IncomeService.list(query),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useCreateIncomeMutation(
  options?: UseMutationOptions<Income, Error, CreateIncomeDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: IncomeService.create,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.overview(data.month) });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useUpdateIncomeMutation(
  options?: UseMutationOptions<Income, Error, { id: string; dto: UpdateIncomeDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, dto }) => IncomeService.update(id, dto),
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.incomeDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.overview(data.month) });
      options?.onSuccess?.(data, variables, ...args);
    },
  });
}

export function useDeleteIncomeMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: IncomeService.delete,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      options?.onSuccess?.(data, id, ...args);
    },
  });
}
