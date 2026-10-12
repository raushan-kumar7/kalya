'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Coins,
  Flame,
  Receipt,
  Settings2,
  Sparkles,
  Trophy,
  Users2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EASINGS } from '@/libs/animations';
import { cn } from '@/libs/utils';
import { useAlertsQuery, useAlertActions, useUnreadAlertCountQuery } from '@/hooks/finances';
import { useWebPush } from '@/hooks/use-web-push';
import { formatTimeAgo } from '@kalya/utils';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: 'budget' | 'split' | 'wealth' | 'system' | 'bill';
  created_at: string;
  is_read: boolean;
  href?: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

const TYPE_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    text: string;
    border: string;
  }
> = {
  budget: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/15',
    text: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  budget_critical: {
    icon: Flame,
    bg: 'bg-rose-500/15',
    text: 'text-rose-500 dark:text-rose-400',
    border: 'border-rose-500/30',
  },
  split: {
    icon: Users2,
    bg: 'bg-sky-500/15',
    text: 'text-sky-500 dark:text-sky-400',
    border: 'border-sky-500/30',
  },
  wealth: {
    icon: Trophy,
    bg: 'bg-purple-500/15',
    text: 'text-purple-500 dark:text-purple-400',
    border: 'border-purple-500/30',
  },
  bill: {
    icon: Receipt,
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-500 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  system: {
    icon: Sparkles,
    bg: 'bg-primary/15',
    text: 'text-primary',
    border: 'border-primary/30',
  },
};

/**
 * Converts ISO/epoch timestamp into human-readable relative time (e.g. "5m ago", "2h ago", "Yesterday")
 * with localized full timestamp tooltip.
 */
function formatNotificationTimestamp(dateStr?: string | null): { label: string; tooltip: string } {
  if (!dateStr) return { label: 'Recently', tooltip: '' };
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { label: 'Recently', tooltip: '' };

    const compact = formatTimeAgo(dateStr, { compact: true });
    const label = compact === 'now' ? 'Just now' : `${compact} ago`;
    const tooltip = date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return { label, tooltip };
  } catch {
    return { label: 'Recently', tooltip: '' };
  }
}

export const NotificationPanel = React.forwardRef<HTMLDivElement, NotificationPanelProps>(
  (
    {
      isOpen,
      onClose,
      notifications: propNotifications,
      onMarkAllAsRead,
      onMarkAsRead,
      onDismiss,
      className,
    },
    ref
  ) => {
    const router = useRouter();
    const { data: serverAlerts } = useAlertsQuery({ limit: 25 }, { enabled: isOpen });
    const { data: serverUnreadCount } = useUnreadAlertCountQuery();
    const {
      markAsRead: markReadAction,
      markAllAsRead: markAllAction,
      deleteAlert: deleteAlertAction,
    } = useAlertActions();

    const {
      isSupported: isPushSupported,
      isSubscribed: isPushSubscribed,
      permission: pushPermission,
      subscribeToPush,
      isLoading: isPushLoading,
    } = useWebPush();

    const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

    const mappedServerItems = React.useMemo<NotificationItem[] | null>(() => {
      if (!serverAlerts || serverAlerts.length === 0) return null;
      return serverAlerts.map((a) => {
        let normalizedType: NotificationItem['type'] = 'system';
        if (a.type === 'budget_alert') normalizedType = 'budget';
        else if (a.type === 'split_update') normalizedType = 'split';
        else if (a.type === 'goal_milestone') normalizedType = 'wealth';

        let targetHref = '/dashboard/finances';
        if (a.reference_type === 'budget' || a.type === 'budget_alert') {
          targetHref = '/dashboard/budgets';
        } else if (a.reference_type === 'split_expense' || a.type === 'split_update') {
          targetHref = '/dashboard/splits';
        } else if (a.reference_type === 'goal' || a.type === 'goal_milestone') {
          targetHref = '/dashboard/goals';
        } else if (a.type === 'system') {
          targetHref = '/dashboard/insights';
        }

        return {
          id: a.id,
          title: a.title,
          message: a.message,
          type: normalizedType,
          severity: a.severity,
          created_at: (a as any).created_at ?? (a as any).createdAt ?? new Date().toISOString(),
          is_read: Boolean((a as any).is_read ?? (a as any).isRead),
          href: targetHref,
        };
      });
    }, [serverAlerts]);

    const items = propNotifications ?? mappedServerItems ?? [];

    const unreadCount = serverUnreadCount?.count ?? items.filter((item) => !item.is_read).length;

    const filteredItems = React.useMemo(() => {
      if (filter === 'unread') {
        return items.filter((item) => !item.is_read);
      }
      return items;
    }, [items, filter]);

    const handleMarkAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onMarkAllAsRead) {
        onMarkAllAsRead();
      } else {
        markAllAction();
      }
    };

    const handleToggleRead = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onMarkAsRead) {
        onMarkAsRead(id);
      } else {
        markReadAction(id);
      }
    };

    const handleDismissItem = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onDismiss) {
        onDismiss(id);
      } else {
        deleteAlertAction(id);
      }
    };

    const handleItemClick = (item: NotificationItem, e: React.MouseEvent) => {
      if (!item.is_read) {
        if (onMarkAsRead) {
          onMarkAsRead(item.id);
        } else {
          markReadAction(item.id);
        }
      }

      onClose();

      if (item.href) {
        router.push(item.href);
      }
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={ref}
            role="dialog"
            aria-label="Notifications panel"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: EASINGS.editorial }}
            className={cn(
              'fixed right-3 top-16 z-50 flex w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-2xl select-none',
              'sm:absolute sm:right-0 sm:top-full sm:mt-2.5 sm:w-105',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-surface px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25">
                  <Bell size={15} />
                </div>
                <span className="text-body-md text-text-primary font-semibold tracking-tight">
                  Notifications
                </span>
                {unreadCount > 0 ? (
                  <span className="bg-primary/15 text-primary border border-primary/30 text-caption rounded-full px-2 py-0.5 font-bold leading-none">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="text-caption text-text-muted font-medium">All caught up</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    className="text-caption text-text-secondary hover:text-primary rounded-md px-2 py-1 flex items-center gap-1.5 font-medium transition-colors hover:bg-surface-raised border border-transparent hover:border-border cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck size={14} className="shrink-0 text-primary" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close notifications"
                  className="text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-md p-1.5 transition-colors sm:hidden cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b border-border/70 bg-surface/50 px-4 py-2">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={cn(
                    'text-caption rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer',
                    filter === 'all'
                      ? 'bg-primary text-on-primary shadow-xs font-semibold'
                      : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                  )}
                >
                  All ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={cn(
                    'text-caption rounded-lg px-2.5 py-1 font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                    filter === 'unread'
                      ? 'bg-primary text-on-primary shadow-xs font-semibold'
                      : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                  )}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.2 text-[10px] font-bold leading-none',
                        filter === 'unread'
                          ? 'bg-on-primary/20 text-on-primary'
                          : 'bg-primary/15 text-primary'
                      )}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <span className="text-[11px] text-text-muted font-numeric">
                {items.length > 0 ? `${items.length} total` : ''}
              </span>
            </div>

            {/* Optional Push Opt-In Banner */}
            {isPushSupported && !isPushSubscribed && pushPermission === 'default' && (
              <div className="mx-3 mt-2.5 flex items-center justify-between gap-2.5 rounded-xl border border-primary/25 bg-primary-subtle/50 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <BellRing size={14} className="text-primary shrink-0 animate-pulse" />
                  <span className="text-[11px] text-text-secondary leading-tight truncate">
                    Enable browser push for instant alerts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={subscribeToPush}
                  disabled={isPushLoading}
                  className="text-[11px] font-semibold text-primary hover:text-primary-hover bg-primary/15 hover:bg-primary/25 px-2.5 py-0.5 rounded-md shrink-0 transition-colors cursor-pointer border border-primary/25"
                >
                  {isPushLoading ? '…' : 'Enable'}
                </button>
              </div>
            )}

            {/* Notification Items List */}
            <div className="max-h-95 overflow-y-auto px-2 py-2 space-y-1.5 scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  {filter === 'unread' ? (
                    <>
                      <div className="bg-primary/10 border border-primary/20 text-primary flex h-11 w-11 items-center justify-center rounded-2xl mb-2.5 shadow-xs">
                        <CheckCheck size={20} />
                      </div>
                      <p className="text-body-sm text-text-primary font-semibold">All caught up!</p>
                      <p className="text-caption text-text-muted mt-0.5 max-w-55">
                        You have no unread notifications right now.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="bg-surface border border-border flex h-11 w-11 items-center justify-center rounded-2xl mb-2.5 text-text-muted shadow-xs">
                        <Bell size={20} />
                      </div>
                      <p className="text-body-sm text-text-primary font-semibold">
                        No notifications yet
                      </p>
                      <p className="text-caption text-text-muted mt-0.5 max-w-60">
                        We'll alert you when there are updates on splits, budgets, or milestones.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredItems.map((item) => {
                    const isCriticalBudget = item.type === 'budget' && item.severity === 'critical';
                    const configKey = isCriticalBudget
                      ? 'budget_critical'
                      : (item.type ?? 'system');
                    const config = TYPE_CONFIG[configKey] ?? TYPE_CONFIG.system;
                    const IconComponent = config.icon;
                    const { label: timeLabel, tooltip: timeTooltip } = formatNotificationTimestamp(
                      item.created_at
                    );

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => handleItemClick(item, e)}
                        className={cn(
                          'group relative flex items-start gap-3 rounded-xl p-3 text-left transition-all cursor-pointer border',
                          item.is_read
                            ? 'border-transparent bg-transparent hover:bg-surface/80 opacity-80 hover:opacity-100'
                            : 'border-primary/25 bg-primary-subtle/40 hover:bg-primary-subtle/70 shadow-xs'
                        )}
                      >
                        {/* Type Icon Badge */}
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-xs mt-0.5 transition-transform group-hover:scale-105',
                            config.bg,
                            config.text,
                            config.border
                          )}
                        >
                          <IconComponent className="h-4.5 w-4.5" />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {!item.is_read && (
                                <span className="h-2 w-2 rounded-full bg-accent ring-2 ring-accent/30 shrink-0" />
                              )}
                              <h4
                                className={cn(
                                  'text-body-sm leading-tight text-text-primary truncate',
                                  item.is_read ? 'font-medium' : 'font-semibold'
                                )}
                                title={item.title}
                              >
                                {item.title}
                              </h4>
                            </div>

                            {/* Relative Timestamp */}
                            <span
                              className="text-[11px] font-numeric text-text-muted shrink-0 tabular-nums ml-2"
                              title={timeTooltip}
                            >
                              {timeLabel}
                            </span>
                          </div>

                          <p className="text-caption text-text-secondary line-clamp-2 mt-1 leading-snug">
                            {item.message}
                          </p>
                        </div>

                        {/* Quick Hover Action Buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 self-start mt-0.5">
                          {!item.is_read && (
                            <button
                              type="button"
                              onClick={(e) => handleToggleRead(item.id, e)}
                              title="Mark as read"
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-surface border border-border text-text-muted hover:text-primary hover:border-primary/40 hover:bg-primary-subtle transition-all cursor-pointer shadow-xs"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDismissItem(item.id, e)}
                            title="Dismiss"
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-surface border border-border text-text-muted hover:text-danger hover:border-danger/40 hover:bg-danger-subtle transition-all cursor-pointer shadow-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/80 bg-surface/50 flex items-center justify-between px-4 py-2.5">
              <Link
                href="/dashboard/settings/account?tab=notification"
                onClick={onClose}
                className="text-caption text-text-secondary hover:text-primary flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <Settings2 size={13} className="shrink-0" />
                <span>Notification Settings</span>
                <ArrowRight size={12} className="shrink-0" />
              </Link>

              <div className="flex items-center gap-1.5 text-text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-numeric text-[11px] font-medium">Real-time sync</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

NotificationPanel.displayName = 'NotificationPanel';

export const Notifications = NotificationPanel;
export default NotificationPanel;
