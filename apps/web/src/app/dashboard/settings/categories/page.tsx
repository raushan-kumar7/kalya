import type { Metadata } from 'next';
import { Categories } from '@/components/dashboard/finances';

export const metadata: Metadata = {
  title: 'Transaction Categories',
  description:
    'Configure income and expense categories, custom color palettes, and default bucket mappings.',
  openGraph: {
    title: 'Transaction Categories | Kalya',
    description:
      'Configure income and expense categories, custom color palettes, and default bucket mappings.',
  },
};

export default function CategoriesPage() {
  return <Categories />;
}
