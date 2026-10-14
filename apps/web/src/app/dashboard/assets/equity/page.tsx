import type { Metadata } from 'next';
import { Equities } from '@/components/dashboard/finances/assets';

export const metadata: Metadata = {
  title: 'Equities & Mutual Funds',
  description:
    'Track listed shares, direct mutual fund portfolios, average buy prices, unrealized gains, and SIP allocations.',
  openGraph: {
    title: 'Equities & Mutual Funds | Kalya',
    description:
      'Track listed shares, direct mutual fund portfolios, average buy prices, unrealized gains, and SIP allocations.',
  },
};

export default function EquityPage() {
  return <Equities />;
}
