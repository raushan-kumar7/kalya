import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignUp } from '@/components/forms/auth';
import { Spinner } from '@/components/ui/states/spinner';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new Kalya account to establish your personal financial equilibrium.',
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-105 w-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <SignUp />
    </Suspense>
  );
}
