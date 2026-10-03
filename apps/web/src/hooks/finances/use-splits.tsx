import { useCallback } from 'react';
import {
  CreateSplitContactMemberDto,
  Expense,
  SettleSplitExpenseDto,
  SplitContactMember,
  SplitExpense,
  UpdateSplitContactMemberDto,
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
import { runAction, type RunActionOptions } from '@/libs';

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

export function useUpdateSplitContactMutation(
  options?: UseMutationOptions<
    SplitContactMember,
    Error,
    { id: string; dto: UpdateSplitContactMemberDto }
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, dto }) => SplitService.updateContact(id, dto),
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.splitsContacts() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useDeleteSplitContactMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id: string) => SplitService.deleteContact(id),
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.splitsContacts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.splitsPending() });
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

/**
 * High-level domain hook for managing split contacts with toast integration and reactive state.
 */
export function useSplitContacts() {
  const query = useSplitContactsQuery();
  const createMutation = useCreateSplitContactMutation();
  const updateMutation = useUpdateSplitContactMutation();
  const deleteMutation = useDeleteSplitContactMutation();

  const createSplitContact = useCallback(
    async (dto: CreateSplitContactMemberDto, options?: RunActionOptions<SplitContactMember>) => {
      return runAction(() => createMutation.mutateAsync(dto), {
        loading: 'Adding split contact…',
        success: 'Contact added successfully!',
        ...options,
      });
    },
    [createMutation]
  );

  const updateSplitContact = useCallback(
    async (
      id: string,
      dto: UpdateSplitContactMemberDto,
      options?: RunActionOptions<SplitContactMember>
    ) => {
      return runAction(() => updateMutation.mutateAsync({ id, dto }), {
        loading: 'Updating contact…',
        success: 'Contact updated successfully!',
        ...options,
      });
    },
    [updateMutation]
  );

  const deleteSplitContact = useCallback(
    async (id: string, options?: RunActionOptions<{ success: boolean }>) => {
      return runAction(() => deleteMutation.mutateAsync(id), {
        loading: 'Deleting contact…',
        success: 'Contact removed successfully!',
        ...options,
      });
    },
    [deleteMutation]
  );

  const error = query.error ? query.error.message || 'Failed to load contacts' : null;

  return {
    // Contact records
    contacts: query.data ?? [],
    splitContacts: query.data ?? [],

    // Query status flags
    isLoading: query.isLoading,
    isSplitContactsLoading: query.isLoading,
    isContactsLoading: query.isLoading,
    isRefetching: query.isRefetching,

    // Error states
    error,
    splitContactsError: error,
    contactsError: error,

    // Actions
    createSplitContact,
    createContact: createSplitContact,
    updateSplitContact,
    updateContact: updateSplitContact,
    deleteSplitContact,
    deleteContact: deleteSplitContact,

    // Mutation pending states
    isCreating: createMutation.isPending,
    isCreatingSplitContact: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingSplitContact: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingSplitContact: deleteMutation.isPending,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

    // Query refetch
    refetch: query.refetch,
    refetchSplitContacts: query.refetch,
    refetchContacts: query.refetch,
  };
}

/**
 * Domain hook for querying and settling pending/unsettled split expense shares.
 */
export function useUnsettledSplits() {
  const query = usePendingSplitSharesQuery();
  const settleMutation = useSettleSplitExpenseMutation();

  const settle = useCallback(
    async (id: string, dto: SettleSplitExpenseDto, options?: RunActionOptions<SplitExpense>) => {
      return runAction(() => settleMutation.mutateAsync({ id, dto }), {
        loading: 'Recording settlement…',
        success: 'Split share settled successfully!',
        ...options,
      });
    },
    [settleMutation]
  );

  const error = query.error ? query.error.message || "Couldn't load unsettled splits" : null;

  return {
    unsettledSplits: query.data ?? [],
    pendingSplits: query.data ?? [],
    isLoading: query.isLoading,
    unsettledLoading: query.isLoading,
    isPendingSplitsLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error,
    unsettledError: error,
    pendingSplitsError: error,
    settleSplit: settle,
    settleShare: settle,
    isSettling: settleMutation.isPending,
    isSettlingSplit: settleMutation.isPending,
    refetch: query.refetch,
    refetchUnsettledSplits: query.refetch,
    refetchPendingSplits: query.refetch,
  };
}

export const usePendingSplits = useUnsettledSplits;
