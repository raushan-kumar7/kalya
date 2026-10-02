'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  Coins,
  Receipt,
  Sparkles,
  Users2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { EASINGS, TRANSITIONS } from '@/libs/animations';
import { cn } from '@/libs/utils';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: 'budget' | 'split' | 'wealth' | 'system' | 'bill';
  created_at: string;
  is_read: boolean;
  href?: string;
}

export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Budget Threshold Reached',
    message: 'You have reached 85% of your Dining Out monthly budget allocation.',
    type: 'budget',
    created_at: '10m ago',
    is_read: false,
    href: '/dashboard/budgets',
  },
  {
    id: 'n-2',
    title: 'Split Bill Settled',
    message: 'Aarav settled ₹1,450 for "Weekend Brunch" via UPI.',
    type: 'split',
    created_at: '2h ago',
    is_read: false,
    href: '/dashboard/splits',
  },
  {
    id: 'n-3',
    title: 'Gold Price Milestone',
    message: '24K Digital Gold is up +1.8% today at live market rates.',
    type: 'wealth',
    created_at: '5h ago',
    is_read: true,
    href: '/dashboard/assets/gold-silver',
  },
  {
    id: 'n-4',
    title: 'Upcoming Utility Bill',
    message: 'Electricity board bill due in 3 days. Total: ₹2,180.',
    type: 'bill',
    created_at: 'Yesterday',
    is_read: true,
    href: '/dashboard/transactions',
  },
];

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  budget: AlertTriangle,
  split: Users2,
  wealth: Coins,
  bill: Receipt,
  system: Sparkles,
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  budget: { bg: 'bg-warning/15', text: 'text-warning' },
  split: { bg: 'bg-primary/15', text: 'text-primary' },
  wealth: { bg: 'bg-accent/15', text: 'text-accent-strong' },
  bill: { bg: 'bg-danger/15', text: 'text-danger' },
  system: { bg: 'bg-info/15', text: 'text-info' },
};

export const NotificationPanel = React.forwardRef<HTMLDivElement, NotificationPanelProps>(
  (
    { isOpen, onClose, notifications: propNotifications, onMarkAllAsRead, onMarkAsRead, className },
    ref
  ) => {
    const [items, setItems] = React.useState<NotificationItem[]>(
      propNotifications ?? DEFAULT_NOTIFICATIONS
    );
    const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

    // Keep internal items synchronized if prop changes
    React.useEffect(() => {
      if (propNotifications) {
        setItems(propNotifications);
      }
    }, [propNotifications]);

    const handleMarkAll = () => {
      setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
      onMarkAllAsRead?.();
    };

    const handleItemClick = (id: string) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
      onMarkAsRead?.(id);
    };

    const filteredItems = React.useMemo(() => {
      if (filter === 'unread') {
        return items.filter((item) => !item.is_read);
      }
      return items;
    }, [items, filter]);

    const unreadCount = items.filter((item) => !item.is_read).length;

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
              'border-border/80 bg-surface-raised fixed right-3 top-16 z-50 flex w-[calc(100vw-24px)] max-w-sm flex-col overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md select-none',
              'sm:absolute sm:right-0 sm:top-full sm:mt-2.5 sm:w-96',
              className
            )}
          >
            {/* Header */}
            <div className="border-border/70 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-body-md text-text-primary font-semibold tracking-tight">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-primary/10 text-primary text-caption rounded-full px-2 py-0.5 font-bold leading-none">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    className="text-caption text-text-muted hover:text-text-primary rounded-xs flex items-center gap-1 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <CheckCheck size={14} className="shrink-0" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close notifications"
                  className="text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-md p-1 transition-colors sm:hidden"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-border/50 flex gap-2 border-b px-4 py-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={cn(
                  'text-caption rounded-full px-2.5 py-1 font-medium transition-colors',
                  filter === 'all'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-text-secondary hover:bg-surface'
                )}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={cn(
                  'text-caption rounded-full px-2.5 py-1 font-medium transition-colors',
                  filter === 'unread'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-text-secondary hover:bg-surface'
                )}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto px-1 py-1 divide-y divide-border/40 scrollbar-none">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <div className="bg-surface border-border flex h-10 w-10 items-center justify-center rounded-full border mb-2 text-text-muted">
                    <Check size={18} />
                  </div>
                  <p className="text-body-sm text-text-primary font-medium">All caught up!</p>
                  <p className="text-caption text-text-muted mt-0.5">
                    No {filter === 'unread' ? 'unread' : 'pending'} alerts right now.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const IconComponent = (item.type && TYPE_ICONS[item.type]) || Bell;
                  const colors = (item.type && TYPE_COLORS[item.type]) || {
                    bg: 'bg-primary/10',
                    text: 'text-primary',
                  };

                  const content = (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={cn(
                        'group flex items-start gap-3 rounded-xl p-3 text-left transition-colors cursor-pointer',
                        item.is_read
                          ? 'hover:bg-surface/70 opacity-80 hover:opacity-100'
                          : 'bg-primary-subtle/50 hover:bg-primary-subtle'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs mt-0.5',
                          colors.bg,
                          colors.text
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'text-body-sm truncate font-medium',
                              item.is_read ? 'text-text-primary' : 'text-text-primary font-semibold'
                            )}
                          >
                            {item.title}
                          </span>
                          <span className="text-caption font-numeric text-text-muted shrink-0">
                            {item.created_at}
                          </span>
                        </div>
                        <p className="text-caption text-text-secondary line-clamp-2 mt-0.5 leading-snug">
                          {item.message}
                        </p>
                      </div>

                      {!item.is_read && (
                        <span className="bg-accent h-2 w-2 rounded-full shrink-0 self-center ring-2 ring-surface" />
                      )}
                    </div>
                  );

                  return item.href ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className="block outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-xl"
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-border/70 bg-surface/50 flex items-center justify-between border-t px-4 py-2.5">
              <Link
                href="/dashboard/alerts"
                onClick={onClose}
                className="text-caption text-text-secondary hover:text-primary flex items-center gap-1 font-medium transition-colors"
              >
                <span>View all activity feed</span>
                <ArrowRight size={13} className="shrink-0" />
              </Link>

              <span className="font-numeric text-text-muted text-[10.5px]">Real-time Sync</span>
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
