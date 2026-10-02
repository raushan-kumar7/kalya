import {
  CreateExpenseDto,
  Expense,
  ExpenseFilterQueryDto,
  SplitExpense,
  UpdateExpenseDto,
} from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { ExpenseService } from '@/libs/services/finances/expenses.service';

export function useExpensesQuery(
  query?: ExpenseFilterQueryDto,
  options?: Omit<UseQueryOptions<Expense[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.expenses(query),
    queryFn: () => ExpenseService.list(query),
    staleTime: 1000 * 60 * 2,
    ...options,
  });
}

export function useExpenseDetailQuery(
  id: string,
  options?: Omit<
    UseQueryOptions<Expense & { splits: SplitExpense[] }, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: financeKeys.expenseDetail(id),
    queryFn: () => ExpenseService.getById(id),
    enabled: Boolean(id && options?.enabled !== false),
    ...options,
  });
}

export function useCreateExpenseMutation(
  options?: UseMutationOptions<Expense, Error, CreateExpenseDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ExpenseService.create,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets() });
      queryClient.invalidateQueries({ queryKey: financeKeys.splitsPending() });
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useUpdateExpenseMutation(
  options?: UseMutationOptions<Expense, Error, { id: string; dto: UpdateExpenseDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, dto }) => ExpenseService.update(id, dto),
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets() });
      options?.onSuccess?.(data, variables, ...args);
    },
  });
}

export function useDeleteExpenseMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ExpenseService.delete,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() });
      queryClient.removeQueries({ queryKey: financeKeys.expenseDetail(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets() });
      queryClient.invalidateQueries({ queryKey: financeKeys.splitsPending() });
      options?.onSuccess?.(data, id, ...args);
    },
  });
}
