import { RunActionOptions, runAction } from '@/libs';
import { SplitService } from '@/libs/services/finances';
import {
  SplitContactMember,
  CreateSplitContactMemberDto,
  UpdateSplitContactMemberDto,
  SplitExpense,
  SettleSplitExpenseDto,
} from '@kalya/types';
import { queryOptions, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  financeKeys,
  STALE,
  QueryOverrides,
  PendingSplitShare,
  SuccessResponse,
  invalidateAfterSplitSettle,
} from './shared';

/* ── Queries ─────────────────────────────────────────────── */

export const splitQueries = {
  contacts: () =>
    queryOptions({
      queryKey: financeKeys.splits.contacts(),
      queryFn: () => SplitService.listContacts(),
      staleTime: STALE.medium,
    }),
  pending: () =>
    queryOptions({
      queryKey: financeKeys.splits.pending(),
      queryFn: () => SplitService.listPending(),
      staleTime: STALE.short,
    }),
};

export function useSplitContactsQuery(options?: QueryOverrides<SplitContactMember[]>) {
  return useQuery({ ...splitQueries.contacts(), ...options });
}

export function usePendingSplitSharesQuery(options?: QueryOverrides<PendingSplitShare[]>) {
  return useQuery({ ...splitQueries.pending(), ...options });
}

/* ── Mutations ───────────────────────────────────────────── */

export function useCreateSplitContactMutation() {
  const qc = useQueryClient();
  return useMutation<SplitContactMember, Error, CreateSplitContactMemberDto>({
    mutationFn: (dto) => SplitService.createContact(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.splits.contacts() }),
  });
}

export function useUpdateSplitContactMutation() {
  const qc = useQueryClient();
  return useMutation<SplitContactMember, Error, { id: string; dto: UpdateSplitContactMemberDto }>({
    mutationFn: ({ id, dto }) => SplitService.updateContact(id, dto),
    // Pending shares embed the member, so a rename must refresh them too.
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.splits.all() }),
  });
}

export function useDeleteSplitContactMutation() {
  const qc = useQueryClient();
  return useMutation<SuccessResponse, Error, string>({
    mutationFn: (id) => SplitService.deleteContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.splits.all() }),
  });
}

export function useSettleSplitExpenseMutation() {
  const qc = useQueryClient();
  return useMutation<SplitExpense, Error, { id: string; dto: SettleSplitExpenseDto }>({
    mutationFn: ({ id, dto }) => SplitService.settleShare(id, dto),
    onSuccess: () => invalidateAfterSplitSettle(qc),
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useSplitContactActions() {
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateSplitContactMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateSplitContactMutation();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteSplitContactMutation();

  const createContact = useCallback(
    (dto: CreateSplitContactMemberDto, options?: RunActionOptions<SplitContactMember>) =>
      runAction(() => createAsync(dto), {
        loading: 'Adding split contact…',
        success: 'Contact added successfully!',
        ...options,
      }),
    [createAsync]
  );

  const updateContact = useCallback(
    (
      id: string,
      dto: UpdateSplitContactMemberDto,
      options?: RunActionOptions<SplitContactMember>
    ) =>
      runAction(() => updateAsync({ id, dto }), {
        loading: 'Updating contact…',
        success: 'Contact updated successfully!',
        ...options,
      }),
    [updateAsync]
  );

  const deleteContact = useCallback(
    (id: string, options?: RunActionOptions<SuccessResponse>) =>
      runAction(() => deleteAsync(id), {
        loading: 'Deleting contact…',
        success: 'Contact removed successfully!',
        ...options,
      }),
    [deleteAsync]
  );

  return {
    createContact,
    updateContact,
    deleteContact,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting: isCreating || isUpdating || isDeleting,
  };
}

export function useSplitShareActions() {
  const { mutateAsync: settleAsync, isPending: isSettling } = useSettleSplitExpenseMutation();

  const settleShare = useCallback(
    (id: string, dto: SettleSplitExpenseDto, options?: RunActionOptions<SplitExpense>) =>
      runAction(() => settleAsync({ id, dto }), {
        loading: 'Recording settlement…',
        success: 'Split share settled successfully!',
        ...options,
      }),
    [settleAsync]
  );

  return { settleShare, isSettling, isSubmitting: isSettling };
}
