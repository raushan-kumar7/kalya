import type { Metadata } from 'next';
import { SplitContacts } from '@/components/dashboard/finances/splits/contacts';

export const metadata: Metadata = {
  title: 'Split Contacts & Groups',
  description:
    'Organize frequent contacts, roommates, and trip groups for rapid and fair shared expense settlements.',
  openGraph: {
    title: 'Split Contacts & Groups | Kalya',
    description:
      'Organize frequent contacts, roommates, and trip groups for rapid and fair shared expense settlements.',
  },
};

export default function SplitContactsPage() {
  return <SplitContacts />;
}
