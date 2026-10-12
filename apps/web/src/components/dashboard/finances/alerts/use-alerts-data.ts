'use client';

import { useMemo, useState, useCallback } from 'react';
import type { Alert, AlertType } from '@kalya/types';
import {
  useAlertsQuery,
  useUnreadAlertCountQuery,
  useAlertActions,
  useFinanceFeed,
} from '@/hooks/finances';
import type {
  AlertDateFilter,
  AlertDayGroup,
  AlertSortOrder,
  AlertTabFilter,
  AlertViewMode,
  ActivityFeedItem,
} from './types';

function normalizeAlert(raw: any): Alert {
  if (!raw) {
    return {
      id: `alert-${Math.random().toString(36).substring(2, 9)}`,
      user_id: '',
      type: 'system',
      title: 'Alert',
      message: '',
      is_read: false,
      reference_type: null,
      reference_id: null,
      metadata: {},
      created_at: new Date().toISOString(),
    };
  }

  const rawCreatedAt = raw.created_at ?? raw.createdAt ?? raw.timestamp;
  let createdAtStr = new Date().toISOString();
  if (rawCreatedAt) {
    if (rawCreatedAt instanceof Date) {
      createdAtStr = rawCreatedAt.toISOString();
    } else if (typeof rawCreatedAt === 'number') {
      createdAtStr = new Date(rawCreatedAt).toISOString();
    } else {
      const s = String(rawCreatedAt);
      createdAtStr = s.length >= 10 ? s : new Date().toISOString();
    }
  }

  const rawReadAt = raw.read_at ?? raw.readAt;
  let readAtStr: string | null = null;
  if (rawReadAt) {
    if (rawReadAt instanceof Date) {
      readAtStr = rawReadAt.toISOString();
    } else if (typeof rawReadAt === 'number') {
      readAtStr = new Date(rawReadAt).toISOString();
    } else {
      readAtStr = String(rawReadAt);
    }
  }

  return {
    id: String(raw.id ?? `alert-${Math.random().toString(36).substring(2, 9)}`),
    user_id: String(raw.user_id ?? raw.userId ?? ''),
    type: (raw.type ?? 'system') as AlertType,
    title: String(raw.title ?? ''),
    message: String(raw.message ?? ''),
    is_read: Boolean(raw.is_read ?? raw.isRead),
    reference_type: raw.reference_type ?? raw.referenceType ?? null,
    reference_id: raw.reference_id ?? raw.referenceId ?? null,
    severity:
      raw.severity ??
      (raw.metadata as any)?.severity ??
      (raw.type === 'budget_alert' ? 'warning' : 'info'),
    metadata: raw.metadata ?? {},
    created_at: createdAtStr,
    read_at: readAtStr,
  };
}

export function useAlertsData() {
  // Query server alerts
  const { data: serverAlerts, isLoading, isError, refetch } = useAlertsQuery();
  const { data: unreadCountData } = useUnreadAlertCountQuery();
  const { items: activityItems } = useFinanceFeed();
  const actions = useAlertActions();

  // Mode & Filter state
  const [tabFilter, setTabFilter] = useState<AlertTabFilter>('all');
  const [dateFilter, setDateFilter] = useState<AlertDateFilter>('all');
  const [sortOrder, setSortOrder] = useState<AlertSortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<AlertViewMode>('alerts');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [snoozedIds, setSnoozedIds] = useState<Record<string, number>>({}); // id -> timestamp until

  // Real server alerts normalized
  const activeAlertsSource = useMemo(() => {
    return (serverAlerts ?? []).map(normalizeAlert);
  }, [serverAlerts]);

  // Filter out actively snoozed alerts
  const now = Date.now();
  const unSnoozedAlerts = useMemo(() => {
    return activeAlertsSource.filter((item) => {
      const snoozedUntil = snoozedIds[item.id];
      return !snoozedUntil || snoozedUntil <= now;
    });
  }, [activeAlertsSource, snoozedIds, now]);

  // Apply Tab, Date, Search, and Sort Filters
  const filteredAlerts = useMemo(() => {
    let result = [...unSnoozedAlerts];

    // 1. Tab filter
    if (tabFilter === 'unread') {
      result = result.filter((a) => !a.is_read);
    } else if (tabFilter !== 'all') {
      result = result.filter((a) => a.type === tabFilter);
    }

    // 2. Date filter
    const nowTime = new Date();
    if (dateFilter === 'today') {
      const todayStr = nowTime.toISOString().slice(0, 10);
      result = result.filter((a) => (a.created_at || '').slice(0, 10) === todayStr);
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(nowTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter((a) => new Date(a.created_at || 0) >= oneWeekAgo);
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date(nowTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter((a) => new Date(a.created_at || 0) >= oneMonthAgo);
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          (a.reference_type && a.reference_type.toLowerCase().includes(q))
      );
    }

    // 4. Sort order
    result.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [unSnoozedAlerts, tabFilter, dateFilter, searchQuery, sortOrder]);

  // Group filtered alerts by Day (Today, Yesterday, Earlier date string)
  const dayGroups = useMemo<AlertDayGroup[]>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

    const map = new Map<string, { display: string; items: Alert[] }>();

    for (const item of filteredAlerts) {
      const safeCreatedAt = item.created_at || new Date().toISOString();
      const dateKey = safeCreatedAt.slice(0, 10) || todayStr;
      let displayDate = dateKey;

      if (dateKey === todayStr) {
        displayDate = 'Today';
      } else if (dateKey === yesterdayStr) {
        displayDate = 'Yesterday';
      } else {
        const d = new Date(safeCreatedAt);
        displayDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        });
      }

      if (!map.has(dateKey)) {
        map.set(dateKey, { display: displayDate, items: [] });
      }
      map.get(dateKey)!.items.push(item);
    }

    return Array.from(map.entries()).map(([dateKey, val]) => ({
      dateKey,
      displayDate: val.display,
      items: val.items,
    }));
  }, [filteredAlerts]);

  // Combined Activity Feed items (alerts + money movements from useFinanceFeed)
  const combinedFeed = useMemo<ActivityFeedItem[]>(() => {
    const alertFeedItems: ActivityFeedItem[] = filteredAlerts.map((a) => ({
      id: `alert-${a.id}`,
      type: 'alert',
      title: a.title,
      description: a.message,
      timestamp: a.created_at,
      isRead: a.is_read,
      severity: a.severity ?? (a.type === 'budget_alert' ? 'warning' : 'info'),
      href:
        a.reference_type === 'budget'
          ? '/dashboard/budgets'
          : a.reference_type === 'split_expense'
            ? '/dashboard/splits'
            : a.reference_type === 'goal'
              ? '/dashboard/goals'
              : a.type === 'system'
                ? '/dashboard/insights'
                : '/dashboard/transactions',
      actionLabel:
        a.reference_type === 'budget'
          ? 'View Budget'
          : a.reference_type === 'split_expense'
            ? 'View Split'
            : a.reference_type === 'goal'
              ? 'View Goal'
              : 'View Details',
      referenceType: a.reference_type,
    }));

    const transactionFeedItems: ActivityFeedItem[] = (activityItems || []).slice(0, 20).map((t) => {
      const isIncome = t.kind === 'income';
      const categoryName = 'category' in t && t.category ? t.category.label : undefined;
      const paymentMethod = 'paymentMethod' in t ? t.paymentMethod : undefined;

      const title = isIncome
        ? `Income Received: ${t.description || 'Income inflow'}`
        : t.kind === 'split_bill'
          ? `Split Bill: ${t.description || categoryName || 'Shared bill'}`
          : `Expense Logged: ${t.description || categoryName || 'Expense'}`;

      const description = isIncome
        ? `Month: ${t.month} • Income inflow`
        : `${categoryName || 'General'}${paymentMethod ? ` • Paid via ${paymentMethod}` : ''}`;

      return {
        id: `trx-${t.id}`,
        type: 'transaction' as const,
        title,
        description,
        timestamp: t.date,
        isRead: true,
        amount: t.amount,
        href: '/dashboard/transactions',
        actionLabel: 'View Transaction',
      };
    });

    return [...alertFeedItems, ...transactionFeedItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filteredAlerts, activityItems]);

  // Metrics
  const metrics = useMemo(() => {
    const all = activeAlertsSource;
    const unread = all.filter((a) => !a.is_read).length;
    const budgetsAtRisk = all.filter(
      (a) => a.type === 'budget_alert' && (a.severity === 'critical' || a.severity === 'warning')
    ).length;
    const pendingSplits = all.filter((a) => a.type === 'split_update' && !a.is_read).length;
    const goalMilestones = all.filter((a) => a.type === 'goal_milestone').length;

    return {
      unread: unreadCountData?.count ?? unread,
      budgetsAtRisk,
      pendingSplits,
      goalMilestones,
      totalCount: all.length,
    };
  }, [activeAlertsSource, unreadCountData]);

  // Multi-select handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredAlerts.map((a) => a.id)));
  }, [filteredAlerts]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = filteredAlerts.length > 0 && selectedIds.size === filteredAlerts.length;

  // Real Server Actions
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      await actions.markAsRead(id);
    },
    [actions]
  );

  const handleToggleReadStatus = useCallback(
    async (id: string, currentReadStatus: boolean) => {
      if (!currentReadStatus) {
        await actions.markAsRead(id);
      }
    },
    [actions]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await actions.markAllAsRead();
  }, [actions]);

  const handleMarkSelectedAsRead = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await actions.markSelectedAsRead(ids);
    deselectAll();
  }, [selectedIds, actions, deselectAll]);

  const handleDeleteAlert = useCallback(
    async (id: string) => {
      await actions.deleteAlert(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [actions]
  );

  const handleDeleteSelected = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    for (const id of ids) {
      await actions.deleteAlert(id, { silent: true });
    }
    await refetch();
    deselectAll();
  }, [selectedIds, actions, refetch, deselectAll]);

  const handleSnoozeAlert = useCallback((id: string, durationHours: number = 24) => {
    const snoozeUntil = Date.now() + durationHours * 60 * 60 * 1000;
    setSnoozedIds((prev) => ({ ...prev, [id]: snoozeUntil }));
  }, []);

  return {
    // Data
    alerts: filteredAlerts,
    dayGroups,
    combinedFeed,
    metrics,
    isLoading,
    isError,
    refetch,

    // Filters & View State
    tabFilter,
    setTabFilter,
    dateFilter,
    setDateFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,

    // Selection
    selectedIds,
    toggleSelect,
    selectAll,
    deselectAll,
    isAllSelected,

    // Actions
    markAsRead: handleMarkAsRead,
    toggleReadStatus: handleToggleReadStatus,
    markAllAsRead: handleMarkAllAsRead,
    markSelectedAsRead: handleMarkSelectedAsRead,
    deleteAlert: handleDeleteAlert,
    deleteSelected: handleDeleteSelected,
    snoozeAlert: handleSnoozeAlert,
  };
}
