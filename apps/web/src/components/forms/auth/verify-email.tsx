'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Check,
  RotateCw,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/forms';
import { Alert } from '@/components/ui/feedback/alert';
import { Spinner } from '@/components/ui/states/spinner';
import { AuthSeal } from '@/components/shared';

const RESEND_COOLDOWN_SECONDS = 45;

export interface VerifyEmailProps {
  /** Optional email address; defaults to URL query parameter ?email=... */
  email?: string;
  /** Optional token for direct link verification; defaults to ?token=... */
  token?: string;
  /** Card presentation style: 'card' (elevated) or 'flat' */
  variant?: 'card' | 'flat';
  /** Additional wrapper class names */
  className?: string;
}

/**
 * Kalya Luxury Email Verification Component
 *
 * Handles both:
 * 1. Post-registration confirmation screen with resend link cooldown timer
 * 2. Inbound token verification (when user clicks link in their email)
 */
export const VerifyEmail = ({
  email: initialEmail,
  token: initialToken,
  variant = 'card',
  className,
}: VerifyEmailProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = initialEmail || searchParams?.get('email') || '';
  const token = initialToken || searchParams?.get('token') || '';
  const isDirectlyVerified =
    searchParams?.get('verified') === 'true' || searchParams?.get('status') === 'verified';

  const { resendVerificationEmail, isResendingVerification, verifyEmailMutation } = useAuth();
  const [sent, setSent] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [verificationStatus, setVerificationStatus] = React.useState<
    'idle' | 'verifying' | 'verified' | 'failed'
  >(isDirectlyVerified ? 'verified' : token ? 'verifying' : 'idle');
  const [serverError, setServerError] = React.useState<string | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyMutationRef = React.useRef(verifyEmailMutation);
  verifyMutationRef.current = verifyEmailMutation;
  const verifiedTokenRef = React.useRef<string | null>(null);

  // If directly verified from redirect, navigate to dashboard shortly
  React.useEffect(() => {
    if (!isDirectlyVerified) return;
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2400);
    return () => clearTimeout(timer);
  }, [isDirectlyVerified, router]);

  // If a token is provided in the URL, verify it once
  React.useEffect(() => {
    if (!token || isDirectlyVerified || verifiedTokenRef.current === token) return;
    verifiedTokenRef.current = token;

    let isMounted = true;
    setVerificationStatus('verifying');

    verifyMutationRef.current
      .mutateAsync(token)
      .then(() => {
        if (isMounted) {
          setVerificationStatus('verified');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2400);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setVerificationStatus('failed');
          const message =
            err instanceof Error ? err.message : 'Verification link has expired or is invalid.';
          setServerError(message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, isDirectlyVerified, router]);

  // Cooldown countdown timer
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

  const handleResend = async () => {
    if (isResendingVerification || cooldown > 0 || !email) return;
    setServerError(null);

    try {
      const result = await resendVerificationEmail({
        email,
        callbackURL: '/dashboard',
      });

      if (result && result.success !== false) {
        setSent(true);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else if (result?.errorMessage) {
        setServerError(result.errorMessage);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not resend verification email.';
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
                  <span className="font-semibold text-body-sm">Verification error</span>
                  <span className="text-caption text-text-secondary">{serverError}</span>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {verificationStatus === 'verifying' ? (
          /* ======================================================== */
          /* VERIFYING TOKEN IN FLIGHT                                */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-subtle text-primary border border-primary/30">
              <Spinner size="lg" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-primary">
                Verifying Credentials
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                Confirming your account
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                Validating your secure security token and establishing your financial ledger…
              </p>
            </div>
          </div>
        ) : verificationStatus === 'verified' ? (
          /* ======================================================== */
          /* TOKEN VERIFIED SUCCESSFULLY                              */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <AuthSeal icon={Check} done variant="success" size="lg" />

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-success">
                Account Active
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                Email confirmed
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                Your email has been verified successfully. Redirecting you to your financial
                dashboard…
              </p>
            </div>

            <Link href="/dashboard" className="w-full pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                animated
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="h-12 rounded-xl"
              >
                Go to dashboard
              </Button>
            </Link>
          </div>
        ) : verificationStatus === 'failed' ? (
          /* ======================================================== */
          /* TOKEN VERIFICATION FAILED                                */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <AuthSeal icon={ShieldAlert} variant="danger" size="lg" />

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-danger">
                Link Invalid
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                Verification failed
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                This verification link is invalid or has expired. Please sign in or request a new
                confirmation link.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-3 pt-2">
              {token && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  animated
                  onClick={() => {
                    verifiedTokenRef.current = null;
                    setVerificationStatus('verifying');
                    setServerError(null);
                    verifyMutationRef.current
                      .mutateAsync(token)
                      .then(() => {
                        setVerificationStatus('verified');
                        setTimeout(() => {
                          router.push('/dashboard');
                        }, 2400);
                      })
                      .catch((err: unknown) => {
                        setVerificationStatus('failed');
                        const message =
                          err instanceof Error
                            ? err.message
                            : 'Verification link has expired or is invalid.';
                        setServerError(message);
                      });
                  }}
                  className="h-12 rounded-xl"
                >
                  Retry verification
                </Button>
              )}
              {email && (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  animated
                  onClick={() => {
                    setVerificationStatus('idle');
                    setServerError(null);
                  }}
                  className="h-12 rounded-xl"
                >
                  Request new verification link
                </Button>
              )}
              <Link href="/auth/sign-in" className="w-full">
                <Button
                  variant={token ? 'outline' : 'primary'}
                  size="lg"
                  fullWidth
                  animated
                  className="h-12 rounded-xl"
                >
                  Sign in to Kalya
                </Button>
              </Link>
              <Link
                href="/auth/sign-up"
                className="group inline-flex items-center gap-2 font-body text-body-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Return to sign up</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* INBOX CONFIRMATION & RESEND SCREEN (DEFAULT)             */
          /* ======================================================== */
          <div className="flex flex-col items-center gap-6 text-center">
            <AuthSeal icon={Mail} done={sent} variant="primary" size="lg" />

            <div className="flex flex-col gap-2">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-primary">
                Email Sent
              </span>
              <h1 className="font-display text-display-md font-semibold tracking-tight text-text-primary">
                Confirm your email
              </h1>
              <p className="font-body text-body-sm text-text-secondary leading-relaxed max-w-sm">
                We sent a verification link to
                {email ? (
                  <>
                    {' '}
                    <span className="font-numeric font-medium text-text-primary break-all">
                      {email}
                    </span>
                    .
                  </>
                ) : (
                  ' your inbox.'
                )}{' '}
                Open it to activate your account and access your ledger.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-3.5 pt-2">
              <Button
                variant={sent ? 'secondary' : 'primary'}
                size="lg"
                fullWidth
                animated
                onClick={handleResend}
                disabled={isResendingVerification || cooldown > 0 || !email}
                className="h-12 rounded-xl font-body font-semibold shadow-card hover:shadow-raised"
              >
                {isResendingVerification ? (
                  <span className="flex items-center justify-center gap-2">
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Sending verification link…</span>
                  </span>
                ) : cooldown > 0 ? (
                  `Resend email in 0:${cooldown.toString().padStart(2, '0')}`
                ) : sent ? (
                  'Resend email'
                ) : (
                  'Resend verification email'
                )}
              </Button>

              <div className="text-center">
                <span className="font-body text-body-sm text-text-muted">
                  Wrong email address?{' '}
                </span>
                <Link
                  href="/auth/sign-up"
                  className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
                >
                  Create another account
                </Link>
              </div>
            </div>

            <p className="font-body text-caption text-text-muted max-w-xs">
              Check your spam or junk folder if the confirmation email doesn&apos;t arrive within a
              few minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const VerifyEmailClient = VerifyEmail;
