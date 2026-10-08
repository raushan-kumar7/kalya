import {
  Alert,
  AlertFilterQueryDto,
  MarkAlertsAsReadDto,
  NotificationPreference,
  NotificationPreferenceFilterQueryDto,
  UnreadAlertCountResponse,
  UpdateNotificationPreferenceDto,
  UpsertNotificationPreferenceDto,
} from '@kalya/types';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { runAction, RunActionOptions } from '@/libs';
import { AlertService, PreferenceService } from '@/libs/services/notifications';
import { QueryOverrides, STALE } from './shared';

/* ── Query Keys ─────────────────────────────────────────── */

export const alertKeys = {
  all: (): QueryKey => ['notifications', 'alerts'],
  list: (filters?: AlertFilterQueryDto): QueryKey => [
    'notifications',
    'alerts',
    'list',
    filters ?? {},
  ],
  unreadCount: (): QueryKey => ['notifications', 'alerts', 'unread-count'],
  preferences: (filters?: NotificationPreferenceFilterQueryDto): QueryKey => [
    'notifications',
    'preferences',
    filters ?? {},
  ],
};

/* ── Query Options ──────────────────────────────────────── */

export const alertQueries = {
  list: (filters?: AlertFilterQueryDto) =>
    queryOptions({
      queryKey: alertKeys.list(filters),
      queryFn: () => AlertService.list(filters),
      staleTime: STALE.short,
    }),

  unreadCount: () =>
    queryOptions({
      queryKey: alertKeys.unreadCount(),
      queryFn: () => AlertService.getUnreadCount(),
      staleTime: STALE.short,
      refetchInterval: 30_000, // Background poll every 30s
    }),

  preferences: (filters?: NotificationPreferenceFilterQueryDto) =>
    queryOptions({
      queryKey: alertKeys.preferences(filters),
      queryFn: () => PreferenceService.list(filters),
      staleTime: STALE.long,
    }),
};

/* ── Query Hooks ────────────────────────────────────────── */

export function useAlertsQuery(filters?: AlertFilterQueryDto, options?: QueryOverrides<Alert[]>) {
  return useQuery({
    ...alertQueries.list(filters),
    ...options,
  });
}

export function useUnreadAlertCountQuery(options?: QueryOverrides<UnreadAlertCountResponse>) {
  return useQuery({
    ...alertQueries.unreadCount(),
    ...options,
  });
}

export function useNotificationPreferencesQuery(
  filters?: NotificationPreferenceFilterQueryDto,
  options?: QueryOverrides<NotificationPreference[]>
) {
  return useQuery({
    ...alertQueries.preferences(filters),
    ...options,
  });
}

/* ── Mutation Hooks ─────────────────────────────────────── */

export function useMarkAlertReadMutation() {
  const qc = useQueryClient();
  return useMutation<Alert, Error, string>({
    mutationFn: (id: string) => AlertService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.all() });
      qc.invalidateQueries({ queryKey: alertKeys.unreadCount() });
    },
  });
}

export function useBatchMarkAlertsReadMutation() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, Error, MarkAlertsAsReadDto>({
    mutationFn: (dto: MarkAlertsAsReadDto) => AlertService.batchMarkAsRead(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.all() });
      qc.invalidateQueries({ queryKey: alertKeys.unreadCount() });
    },
  });
}

export function useDeleteAlertMutation() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => AlertService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.all() });
      qc.invalidateQueries({ queryKey: alertKeys.unreadCount() });
    },
  });
}

export function useUpsertNotificationPreferenceMutation() {
  const qc = useQueryClient();
  return useMutation<NotificationPreference, Error, UpsertNotificationPreferenceDto>({
    mutationFn: (dto: UpsertNotificationPreferenceDto) => PreferenceService.upsert(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.preferences() });
    },
  });
}

export function useUpdateNotificationPreferenceMutation() {
  const qc = useQueryClient();
  return useMutation<
    NotificationPreference,
    Error,
    { id: string; dto: UpdateNotificationPreferenceDto }
  >({
    mutationFn: ({ id, dto }) => PreferenceService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.preferences() });
    },
  });
}

/* ── Action Helpers with Toasts ─────────────────────────── */

export function useAlertActions() {
  const { mutateAsync: markReadAsync } = useMarkAlertReadMutation();
  const { mutateAsync: batchMarkReadAsync } = useBatchMarkAlertsReadMutation();
  const { mutateAsync: deleteAlertAsync } = useDeleteAlertMutation();
  const { mutateAsync: upsertPrefAsync } = useUpsertNotificationPreferenceMutation();
  const { mutateAsync: updatePrefAsync } = useUpdateNotificationPreferenceMutation();

  const markAsRead = useCallback(
    (id: string, options?: RunActionOptions<Alert>) =>
      runAction(() => markReadAsync(id), {
        silent: true,
        ...options,
      }),
    [markReadAsync]
  );

  const markAllAsRead = useCallback(
    (options?: RunActionOptions<{ success: boolean }>) =>
      runAction(() => batchMarkReadAsync({ all: true }), {
        loading: 'Marking all alerts as read…',
        success: 'All alerts marked as read',
        ...options,
      }),
    [batchMarkReadAsync]
  );

  const markSelectedAsRead = useCallback(
    (alertIds: string[], options?: RunActionOptions<{ success: boolean }>) =>
      runAction(() => batchMarkReadAsync({ alert_ids: alertIds }), {
        loading: 'Marking selected as read…',
        success: `${alertIds.length} alert${alertIds.length === 1 ? '' : 's'} marked as read`,
        ...options,
      }),
    [batchMarkReadAsync]
  );

  const deleteAlert = useCallback(
    (id: string, options?: RunActionOptions<{ success: boolean }>) =>
      runAction(() => deleteAlertAsync(id), {
        loading: 'Dismissing alert…',
        success: 'Alert dismissed',
        ...options,
      }),
    [deleteAlertAsync]
  );

  const upsertPreference = useCallback(
    (dto: UpsertNotificationPreferenceDto, options?: RunActionOptions<NotificationPreference>) =>
      runAction(() => upsertPrefAsync(dto), {
        loading: 'Saving preference…',
        success: 'Notification preference saved',
        ...options,
      }),
    [upsertPrefAsync]
  );

  const updatePreference = useCallback(
    (
      id: string,
      dto: UpdateNotificationPreferenceDto,
      options?: RunActionOptions<NotificationPreference>
    ) =>
      runAction(() => updatePrefAsync({ id, dto }), {
        loading: 'Updating preference…',
        success: 'Notification preference updated',
        ...options,
      }),
    [updatePrefAsync]
  );

  return {
    markAsRead,
    markAllAsRead,
    markSelectedAsRead,
    deleteAlert,
    upsertPreference,
    updatePreference,
  };
}
