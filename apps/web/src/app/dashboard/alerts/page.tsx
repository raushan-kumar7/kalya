import type { Metadata } from 'next';
import { Alerts } from '@/components/dashboard/finances/alerts';

export const metadata: Metadata = {
  title: 'Financial Alerts & Notifications',
  description:
    'Real-time notifications for budget thresholds, recurring subscriptions, split settlements, and market movements.',
  openGraph: {
    title: 'Financial Alerts & Notifications | Kalya',
    description:
      'Real-time notifications for budget thresholds, recurring subscriptions, split settlements, and market movements.',
  },
};

export default function AlertsPage() {
  return <Alerts />;
}
