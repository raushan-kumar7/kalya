import type {
  Alert,
  AlertReferenceType,
  AlertType,
  NotificationCategory,
  NotificationChannel,
  NotificationFrequency,
} from '@kalya/types';

export type AlertTabFilter =
  'all' | 'unread' | 'budget_alert' | 'split_update' | 'goal_milestone' | 'system';

export type AlertDateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

export type AlertSortOrder = 'newest' | 'oldest';

export type AlertViewMode = 'alerts' | 'feed';

export interface AlertDayGroup {
  dateKey: string;
  displayDate: string;
  items: Alert[];
}

export interface NotificationPreferenceGridItem {
  category: NotificationCategory;
  categoryLabel: string;
  categoryDescription: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  frequency: NotificationFrequency;
  customSchedule?: string | null;
}

export interface ActivityFeedItem {
  id: string;
  type: 'alert' | 'transaction' | 'statement' | 'split';
  title: string;
  description: string;
  timestamp: string;
  isRead?: boolean;
  severity?: 'info' | 'warning' | 'critical';
  href?: string;
  actionLabel?: string;
  referenceType?: AlertReferenceType | null;
  amount?: number;
}
