import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ForgotPassword } from '@/components/forms/auth';
import { Spinner } from '@/components/ui/states/spinner';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Recover access to your Kalya account with a secure password reset link.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-105 w-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ForgotPassword />
    </Suspense>
  );
}
