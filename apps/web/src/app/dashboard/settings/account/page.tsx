import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountLoadingSkeleton, AccountSettings } from '@/components/dashboard/account';

export const metadata: Metadata = {
  title: 'Account Settings',
  description:
    'Manage your profile details, security credentials, active sessions, and notification preferences.',
  openGraph: {
    title: 'Account Settings | Kalya',
    description:
      'Manage your profile details, security credentials, active sessions, and notification preferences.',
  },
};

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<AccountLoadingSkeleton />}>
      <AccountSettings />
    </Suspense>
  );
}
