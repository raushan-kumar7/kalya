import type { Metadata } from 'next';
import { BalancesAndSettlements } from '@/components/dashboard/finances/splits';

export const metadata: Metadata = {
  title: 'Bill Splits & Settlements',
  description:
    'Manage shared expenses, view who owes whom, and settle balances effortlessly with peer-to-peer calculations.',
  openGraph: {
    title: 'Bill Splits & Settlements | Kalya',
    description:
      'Manage shared expenses, view who owes whom, and settle balances effortlessly with peer-to-peer calculations.',
  },
};

export default function SplitsPage() {
  return <BalancesAndSettlements />;
}
