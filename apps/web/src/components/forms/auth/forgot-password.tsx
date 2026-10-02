'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@kalya/validations';
import { cn } from '@/libs/utils';
import { useAuth } from '@/hooks/auth';
import { Button, Input } from '@/components/ui/forms';
import { Alert } from '@/components/ui/feedback/alert';
import { Spinner } from '@/components/ui/states/spinner';
import { AuthSeal } from '@/components/shared';

const RESEND_COOLDOWN_SECONDS = 45;

export interface ForgotPasswordProps {
  /** Optional callback fired when the reset link is dispatched */
  onSuccess?: (email: string) => void;
  /** Card presentation style: 'card' (elevated) or 'flat' */
  variant?: 'card' | 'flat';
  /** Additional wrapper class names */
  className?: string;
}

/**
 * Kalya Luxury Forgot Password Form
 *
 * Implements password reset initiation with real-time validation,
 * resend cooldown timer, animated AuthSeal confirmation, and alert banners.
 */
export const ForgotPassword = ({ onSuccess, variant = 'card', className }: ForgotPasswordProps) => {
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const { requestPasswordReset, isRequestingPasswordReset } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema as any),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  // Countdown timer for resend cooldown
  React.useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const sendLink = async (data: ForgotPasswordInput) => {
    setServerError(null);
    try {
      const result = await requestPasswordReset(data);
      if (result && result.success !== false) {
        setSentTo(data.email);
        setCooldown(RESEND_COOLDOWN_SECONDS);
        onSuccess?.(data.email);
      } else if (result?.errorMessage) {
        setServerError(result.errorMessage);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not send reset link. Please check your email address and try again.';
      setServerError(message);
    }
  };

  const handleResend = () => {
    if (cooldown > 0 || isRequestingPasswordReset) return;
    const email = getValues('email') || sentTo;
    if (email) sendLink({ email });
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
                  <span className="font-semibold text-body-sm">Reset request failed</span>
                  <span className="text-caption text-text-secondary">{serverError}</span>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {sentTo ? (
          /* ======================================================== */
          /* SENT CONFIRMATION STATE                                  */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <AuthSeal icon={KeyRound} done variant="primary" size="lg" />

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-primary">
                Link Dispatched
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                Check your inbox
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                We sent a secure password reset link to{' '}
                <span className="font-numeric font-medium text-text-primary break-all">
                  {sentTo}
                </span>
                . The link expires in 30 minutes.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-3.5 pt-2">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                animated
                onClick={handleResend}
                disabled={cooldown > 0 || isRequestingPasswordReset}
                className="h-11.5 rounded-xl border border-border/90 bg-surface font-body font-semibold text-text-primary shadow-xs"
              >
                {isRequestingPasswordReset ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" /> Resending link…
                  </span>
                ) : cooldown > 0 ? (
                  `Resend link in 0:${cooldown.toString().padStart(2, '0')}`
                ) : (
                  'Resend reset link'
                )}
              </Button>

              <Link
                href="/auth/sign-in"
                className="group inline-flex items-center gap-2 font-body text-body-sm font-medium text-text-secondary hover:text-text-primary transition-colors pt-2"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* INITIAL INPUT STATE                                      */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <AuthSeal icon={KeyRound} variant="primary" size="lg" />

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-primary">
                Account Recovery
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                Forgot your password?
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                Enter your account email and we&apos;ll send you a secure link to reset your
                password.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(sendLink)}
              className="w-full space-y-4 text-left"
              noValidate
            >
              <Input
                id="forgot-password-email"
                label="Account Email"
                type="email"
                required
                placeholder="you@example.com"
                leadingIcon={<Mail className="h-4 w-4 text-text-muted" />}
                autoComplete="email"
                disabled={isRequestingPasswordReset}
                errorMessage={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                animated
                isLoading={isRequestingPasswordReset}
                disabled={isRequestingPasswordReset}
                rightIcon={
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                }
                className="group mt-2 h-12 rounded-xl text-body-md font-semibold shadow-card hover:shadow-raised"
              >
                {isRequestingPasswordReset ? 'Sending link…' : 'Send reset link'}
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
