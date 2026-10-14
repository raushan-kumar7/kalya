import type { Metadata } from 'next';
import { GoldSilver } from '@/components/dashboard/finances/assets';

export const metadata: Metadata = {
  title: 'Gold & Silver Bullion',
  description:
    'Track physical 24K gold and 999 silver holdings, live market valuations, tax-deducted net worth, and custody records.',
  openGraph: {
    title: 'Gold & Silver Bullion | Kalya',
    description:
      'Track physical 24K gold and 999 silver holdings, live market valuations, tax-deducted net worth, and custody records.',
  },
};

export default function GoldSilverPage() {
  return <GoldSilver />;
}
