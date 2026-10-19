import { Metadata } from 'next';
import { ReactNode } from 'react';
import { AdminLayoutClient } from '@/layouts';

export const metadata: Metadata = {
  title: 'Super-Admin Console | Kalya',
  description:
    'Authoritative administrative operations, platform observability, and user governance.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
