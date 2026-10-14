import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Settings',
  description:
    'Manage your profile, security preferences, categories, and custom financial buckets.',
};

export default function Settings() {
  redirect('/dashboard/settings/account');
}
