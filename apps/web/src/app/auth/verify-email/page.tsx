import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmail } from '@/components/forms/auth';
import { Spinner } from '@/components/ui/states/spinner';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Confirm and verify your Kalya account email address.',
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-105 w-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <VerifyEmail />
    </Suspense>
  );
}
