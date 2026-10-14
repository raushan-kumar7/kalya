import type { Metadata } from 'next';
import { Transactions } from '@/components/dashboard/finances/transactions';

export const metadata: Metadata = {
  title: 'Transactions Ledger',
  description:
    'Track, filter, and categorize income and expenses across your accounts with real-time balance calculations.',
  openGraph: {
    title: 'Transactions Ledger | Kalya',
    description:
      'Track, filter, and categorize income and expenses across your accounts with real-time balance calculations.',
  },
};

export default function TransactionsPage() {
  return <Transactions />;
}
