import { Metadata } from 'next';
import { Alerts } from '@/components/dashboard/finances/alerts';

export const metadata: Metadata = {
  title: 'Alerts & Activity Feed | Kalya',
  description: 'Real-time financial notifications, threshold alerts, and transaction milestones.',
};

export default function AlertsPage() {
  return <Alerts />;
}
