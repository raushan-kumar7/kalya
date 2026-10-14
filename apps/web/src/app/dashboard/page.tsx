import type { Metadata } from 'next';
import { DashboardOverview } from '@/components/dashboard/overview';

export const metadata: Metadata = {
  title: 'Command Center',
  description:
    'Real-time overview of your net worth, 50/30/20 budget allocations, recent transactions, and portfolio distribution.',
  openGraph: {
    title: 'Command Center | Kalya',
    description:
      'Real-time overview of your net worth, 50/30/20 budget allocations, recent transactions, and portfolio distribution.',
  },
};

export default function Dashboard() {
  return <DashboardOverview />;
}
