import {
  CreateSplitContactMemberDto,
  Expense,
  SettleSplitExpenseDto,
  SplitContactMember,
  SplitExpense,
} from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { SplitService } from '@/libs/services/finances/splits.service';

export function useSplitContactsQuery(
  options?: Omit<UseQueryOptions<SplitContactMember[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.splitsContacts(),
    queryFn: SplitService.listContacts,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function usePendingSplitSharesQuery(
  options?: Omit<
    UseQueryOptions<(SplitExpense & { expense: Expense; member: SplitContactMember })[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: financeKeys.splitsPending(),
    queryFn: SplitService.listPending,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
}

export function useCreateSplitContactMutation(
  options?: UseMutationOptions<SplitContactMember, Error, CreateSplitContactMemberDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: SplitService.createContact,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.splitsContacts() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useSettleSplitExpenseMutation(
  options?: UseMutationOptions<SplitExpense, Error, { id: string; dto: SettleSplitExpenseDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, dto }) => SplitService.settleShare(id, dto),
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.splitsPending() });
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      options?.onSuccess?.(data, ...args);
    },
  });
}
