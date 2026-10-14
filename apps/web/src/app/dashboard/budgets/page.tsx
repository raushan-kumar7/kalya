import type { Metadata } from 'next';
import { Budgets } from '@/components/dashboard/finances/budgets';

export const metadata: Metadata = {
  title: '50/30/20 Budgets',
  description:
    'Plan and control monthly spending with the 50/30/20 rule: 50% Needs, 30% Wants, and 20% Investments & Savings.',
  openGraph: {
    title: '50/30/20 Budgets | Kalya',
    description:
      'Plan and control monthly spending with the 50/30/20 rule: 50% Needs, 30% Wants, and 20% Investments & Savings.',
  },
};

export default function BudgetsPage() {
  return <Budgets />;
}
