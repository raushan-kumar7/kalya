import type { Metadata } from 'next';
import { FinancialInsights } from '@/components/dashboard/finances/insights';

export const metadata: Metadata = {
  title: 'Financial Insights | Kalya',
  description: 'Holistic financial trends, spending habits, budget adherence, and statements',
};

export default function FinancialInsightsPage() {
  return <FinancialInsights />;
}
