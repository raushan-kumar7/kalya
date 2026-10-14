import type { Metadata } from 'next';
import { Goals } from '@/components/dashboard/finances/goals';

export const metadata: Metadata = {
  title: 'Milestone Goals',
  description:
    'Set targeted financial goals, track funded milestones, and simulate your path to emergency funds and debt freedom.',
  openGraph: {
    title: 'Milestone Goals | Kalya',
    description:
      'Set targeted financial goals, track funded milestones, and simulate your path to emergency funds and debt freedom.',
  },
};

export default function GoalsPage() {
  return <Goals />;
}
