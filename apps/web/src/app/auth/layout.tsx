import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthLayoutClient } from '@/layouts';

export const metadata: Metadata = {
  title: {
    template: '%s | Kalya',
    default: 'Authentication | Kalya',
  },
  description: 'Access your Kalya financial fitness platform securely.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
