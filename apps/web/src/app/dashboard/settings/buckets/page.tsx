import type { Metadata } from 'next';
import { Buckets } from '@/components/dashboard/finances';

export const metadata: Metadata = {
  title: 'Financial Buckets',
  description:
    'Customize your 50/30/20 budget buckets to partition income across Needs, Wants, and Savings & Investments.',
  openGraph: {
    title: 'Financial Buckets | Kalya',
    description:
      'Customize your 50/30/20 budget buckets to partition income across Needs, Wants, and Savings & Investments.',
  },
};

export default function BucketsPage() {
  return <Buckets />;
}
