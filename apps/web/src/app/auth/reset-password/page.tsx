import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPassword } from '@/components/forms/auth';
import { Spinner } from '@/components/ui/states/spinner';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Enter your new Kalya account password to regain secure access.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-105 w-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
}
