import { RunActionOptions, runAction } from '@/libs';
import { SplitService } from '@/libs/services/finances';
import {
  SplitContactMember,
  CreateSplitContactMemberDto,
  UpdateSplitContactMemberDto,
  SplitExpense,
  SettleSplitExpenseDto,
  LinkSplitContactDto,
  RespondSplitInvitationDto,
  SplitContactSuggestion,
  SplitInvitation,
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
  suggestions: () =>
    queryOptions({
      queryKey: financeKeys.splits.suggestions(),
      queryFn: () => SplitService.getSuggestions(),
      staleTime: STALE.medium,
    }),
  invitations: () =>
    queryOptions({
      queryKey: financeKeys.splits.invitations(),
      queryFn: () => SplitService.listInvitations(),
      staleTime: STALE.short,
    }),
};

export function useSplitContactsQuery(options?: QueryOverrides<SplitContactMember[]>) {
  return useQuery({ ...splitQueries.contacts(), ...options });
}

export function usePendingSplitSharesQuery(options?: QueryOverrides<PendingSplitShare[]>) {
  return useQuery({ ...splitQueries.pending(), ...options });
}

export function useSplitContactSuggestionsQuery(
  options?: QueryOverrides<SplitContactSuggestion[]>
) {
  return useQuery({ ...splitQueries.suggestions(), ...options });
}

export function useSplitInvitationsQuery(options?: QueryOverrides<SplitInvitation[]>) {
  return useQuery({ ...splitQueries.invitations(), ...options });
}

/* ── Mutations ───────────────────────────────────────────── */

export function useCreateSplitContactMutation() {
  const qc = useQueryClient();
  return useMutation<SplitContactMember, Error, CreateSplitContactMemberDto>({
    mutationFn: (dto) => SplitService.createContact(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.splits.contacts() });
      qc.invalidateQueries({ queryKey: financeKeys.splits.suggestions() });
    },
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

export function useLinkSplitContactMutation() {
  const qc = useQueryClient();
  return useMutation<SplitContactMember, Error, { id: string; dto: LinkSplitContactDto }>({
    mutationFn: ({ id, dto }) => SplitService.linkContact(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.splits.all() }),
  });
}

export function useUnlinkSplitContactMutation() {
  const qc = useQueryClient();
  return useMutation<SplitContactMember, Error, string>({
    mutationFn: (id) => SplitService.unlinkContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.splits.all() }),
  });
}

export function useRespondSplitInvitationMutation() {
  const qc = useQueryClient();
  return useMutation<SplitInvitation, Error, { id: string; dto: RespondSplitInvitationDto }>({
    mutationFn: ({ id, dto }) => SplitService.respondInvitation(id, dto),
    onSuccess: (_data, variables) => {
      // Optimistically remove the responded invitation from cache immediately
      qc.setQueriesData<SplitInvitation[]>(
        { queryKey: financeKeys.splits.invitations() },
        (old) => {
          if (!old) return [];
          return old.filter((inv) => inv.id !== variables.id);
        }
      );
      qc.invalidateQueries({ queryKey: financeKeys.splits.invitations() });
      qc.invalidateQueries({ queryKey: financeKeys.splits.all() });
      qc.invalidateQueries({ queryKey: financeKeys.expenses.all() });
    },
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
  const { mutateAsync: linkAsync, isPending: isLinking } = useLinkSplitContactMutation();
  const { mutateAsync: unlinkAsync, isPending: isUnlinking } = useUnlinkSplitContactMutation();

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

  const linkContact = useCallback(
    (id: string, dto: LinkSplitContactDto, options?: RunActionOptions<SplitContactMember>) =>
      runAction(() => linkAsync({ id, dto }), {
        loading: 'Linking to Kalya account…',
        success: 'Contact linked successfully!',
        ...options,
      }),
    [linkAsync]
  );

  const unlinkContact = useCallback(
    (id: string, options?: RunActionOptions<SplitContactMember>) =>
      runAction(() => unlinkAsync(id), {
        loading: 'Unlinking contact…',
        success: 'Contact unlinked successfully',
        ...options,
      }),
    [unlinkAsync]
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
    linkContact,
    unlinkContact,
    deleteContact,
    isCreating,
    isUpdating,
    isLinking,
    isUnlinking,
    isDeleting,
    isSubmitting: isCreating || isUpdating || isLinking || isUnlinking || isDeleting,
  };
}

export function useSplitShareActions() {
  const { mutateAsync: settleAsync, isPending: isSettling } = useSettleSplitExpenseMutation();
  const { mutateAsync: respondAsync, isPending: isResponding } =
    useRespondSplitInvitationMutation();

  const settleShare = useCallback(
    (id: string, dto: SettleSplitExpenseDto, options?: RunActionOptions<SplitExpense>) =>
      runAction(() => settleAsync({ id, dto }), {
        loading: 'Recording settlement…',
        success: 'Split share settled successfully!',
        ...options,
      }),
    [settleAsync]
  );

  const respondInvitation = useCallback(
    (id: string, dto: RespondSplitInvitationDto, options?: RunActionOptions<SplitInvitation>) =>
      runAction(() => respondAsync({ id, dto }), {
        loading: dto.action === 'accept' ? 'Accepting split bill…' : 'Declining split…',
        success: dto.action === 'accept' ? 'Split bill accepted and synced!' : 'Split declined',
        ...options,
      }),
    [respondAsync]
  );

  return {
    settleShare,
    respondInvitation,
    isSettling,
    isResponding,
    isSubmitting: isSettling || isResponding,
  };
}
