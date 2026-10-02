'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { z, PasswordSchema } from '@kalya/validations';

import { cn } from '@/libs/utils';
import { useAuth } from '@/hooks/auth';
import { Button, Input } from '@/components/ui/forms';
import { Alert } from '@/components/ui/feedback/alert';
import { AuthSeal, PasswordStrengthMeter } from '@/components/shared';

const ResetPasswordFormSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof ResetPasswordFormSchema>;

export interface ResetPasswordProps {
  /** Reset token pulled from the URL by the page. Absent/invalid renders the expired-link state. */
  token?: string;
  /** Optional callback fired upon successful password reset */
  onSuccess?: () => void;
  /** Card presentation style: 'card' (elevated) or 'flat' */
  variant?: 'card' | 'flat';
  /** Additional wrapper class names */
  className?: string;
}

/**
 * Kalya Luxury Reset Password Form
 *
 * Implements password reset completion with token resolution,
 * live complexity evaluation, password confirmation match verification,
 * and seamless redirect upon completion.
 */
export const ResetPassword = ({
  token,
  onSuccess,
  variant = 'card',
  className,
}: ResetPasswordProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Resolve token from explicit prop or URL search param (?token=xyz)
  const resolvedToken = token || searchParams?.get('token') || undefined;

  const [status, setStatus] = React.useState<'idle' | 'success'>('idle');
  const [serverError, setServerError] = React.useState<string | null>(null);

  const { confirmPasswordReset, isResettingPassword } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const password = useWatch({ control, name: 'password' });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!resolvedToken) return;
    setServerError(null);

    try {
      const result = await confirmPasswordReset(resolvedToken, {
        password: data.password,
      });

      if (result && result.success !== false) {
        setStatus('success');
        onSuccess?.();

        // Redirect after brief celebration
        setTimeout(() => {
          router.push('/auth/sign-in?reset=true');
        }, 2200);
      } else if (result?.errorMessage) {
        setServerError(result.errorMessage);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reset password. The link may have expired or already been used.';
      setServerError(message);
    }
  };

  const isCard = variant === 'card';

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative w-full overflow-hidden transition-all duration-300',
          isCard
            ? 'rounded-2xl border border-border/80 bg-surface/95 p-6 sm:p-9 shadow-raised backdrop-blur-md'
            : 'bg-transparent p-0',
          className
        )}
      >
        {/* Top Luxury Gradient Accent Bar */}
        {isCard && (
          <div
            className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-accent to-primary"
            aria-hidden="true"
          />
        )}

        {/* Global Error Banner */}
        <AnimatePresence mode="wait">
          {serverError && (
            <motion.div
              key="server-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-5"
            >
              <Alert
                variant="danger"
                dismissible
                onDismiss={() => setServerError(null)}
                icon={<AlertCircle className="h-4 w-4" />}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-body-sm">Reset failed</span>
                  <span className="text-caption text-text-secondary">{serverError}</span>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {!resolvedToken ? (
          /* ======================================================== */
          /* INVALID OR MISSING TOKEN STATE                           */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <AuthSeal icon={ShieldAlert} variant="danger" size="lg" />

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-danger">
                Link Invalid
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                This link isn&apos;t valid
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                This password reset link has either expired or has already been used. Please request
                a fresh link to continue.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-3 pt-2">
              <Link href="/auth/forgot-password" className="w-full">
                <Button variant="primary" size="lg" fullWidth animated className="h-12 rounded-xl">
                  Request a new link
                </Button>
              </Link>

              <Link
                href="/auth/sign-in"
                className="group inline-flex items-center gap-2 font-body text-body-sm font-medium text-text-secondary hover:text-text-primary transition-colors pt-1"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        ) : status === 'success' ? (
          /* ======================================================== */
          /* SUCCESS STATE                                            */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <AuthSeal icon={Lock} done variant="success" size="lg" />

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-success">
                Success
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                Password updated
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                Your new password has been established securely. Taking you to the sign-in screen…
              </p>
            </div>

            <Link href="/auth/sign-in?reset=true" className="w-full pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                animated
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="h-12 rounded-xl"
              >
                Sign in now
              </Button>
            </Link>
          </div>
        ) : (
          /* ======================================================== */
          /* ACTIVE RESET FORM STATE                                  */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <AuthSeal icon={Lock} variant="primary" size="lg" />

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-primary">
                Set New Password
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                Choose a new password
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                Make it secure and something you haven&apos;t used before on Kalya.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-4 text-left"
              noValidate
            >
              <div className="space-y-2">
                <Input
                  id="reset-password"
                  label="New Password"
                  type="password"
                  required
                  placeholder="Enter new password"
                  leadingIcon={<Lock className="h-4 w-4 text-text-muted" />}
                  autoComplete="new-password"
                  disabled={isResettingPassword}
                  errorMessage={errors.password?.message}
                  {...register('password')}
                />
                <PasswordStrengthMeter password={password ?? ''} />
              </div>

              <Input
                id="reset-confirm-password"
                label="Confirm New Password"
                type="password"
                required
                placeholder="Re-enter new password"
                leadingIcon={<Lock className="h-4 w-4 text-text-muted" />}
                autoComplete="new-password"
                disabled={isResettingPassword}
                errorMessage={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                animated
                isLoading={isResettingPassword}
                disabled={isResettingPassword}
                rightIcon={
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                }
                className="group mt-2 h-12 rounded-xl text-body-md font-semibold shadow-card hover:shadow-raised"
              >
                {isResettingPassword ? 'Updating password…' : 'Reset password'}
              </Button>
            </form>

            <Link
              href="/auth/sign-in"
              className="group inline-flex items-center gap-2 font-body text-body-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to sign in</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
