import type { Metadata } from 'next';
import { AssetsOverview } from '@/components/dashboard/finances/assets';

export const metadata: Metadata = {
  title: 'Assets & Wealth Portfolio',
  description:
    'Consolidated overview of your physical gold & silver bullion, listed equities, mutual fund folios, and overall invested capital.',
  openGraph: {
    title: 'Assets & Wealth Portfolio | Kalya',
    description:
      'Consolidated overview of your physical gold & silver bullion, listed equities, mutual fund folios, and overall invested capital.',
  },
};

export default function AssetsPage() {
  return <AssetsOverview />;
}
