import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignIn } from '@/components/forms/auth';
import { Spinner } from '@/components/ui/states/spinner';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to Kalya to access your personal financial ledger, net worth, and wellness metrics.',
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-105 w-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <SignIn />
    </Suspense>
  );
}
