'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SignInSchema, type SignInInput } from '@kalya/validations';
import type { AuthResponse } from '@kalya/types';
import { cn } from '@/libs/utils';
import { useAuth } from '@/hooks/auth';
import { Button, Input, CheckboxField } from '@/components/ui/forms';
import { Alert } from '@/components/ui/feedback/alert';
import { Spinner } from '@/components/ui/states/spinner';

/**
 * Pixel-perfect official 4-color Google brand mark SVG
 */
export function GoogleIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export interface SignInProps {
  /** Optional callback fired upon successful sign in */
  onSuccess?: (response: AuthResponse) => void;
  /** Explicit redirect destination upon success. Defaults to /dashboard or ?callbackUrl */
  redirectTo?: string;
  /** Whether to render the Google OAuth button. Defaults to true */
  showGoogleSignIn?: boolean;
  /** Whether to render the 'Forgot password?' anchor. Defaults to true */
  showForgotPasswordLink?: boolean;
  /** Whether to render the 'Create an account' footer anchor. Defaults to true */
  showSignUpLink?: boolean;
  /** Card presentation style: 'card' (elevated) or 'flat' */
  variant?: 'card' | 'flat';
  /** Additional wrapper class names */
  className?: string;
}

/**
 * Kalya Luxury Sign In Form
 *
 * Implements full credential authentication (email or username) plus Google OAuth,
 * Zod validation via React Hook Form, rich micro-interactions, responsive states,
 * and seamless session establishment.
 */
export const SignIn = ({
  onSuccess,
  redirectTo,
  showGoogleSignIn = true,
  showForgotPasswordLink = true,
  showSignUpLink = true,
  variant = 'card',
  className,
}: SignInProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { signIn, signInWithGoogle, isSigningIn, isSigningInWithGoogle } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Form setup with Zod resolver
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema as any),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onTouched',
  });

  const isBusy = isSubmitting || isSigningIn || isSigningInWithGoogle;

  // Resolve search query parameters (redirect messages, oauth errors)
  const urlError = searchParams?.get('error');
  const wasRegistered = searchParams?.get('registered') === 'true';
  const wasReset = searchParams?.get('reset') === 'true';

  const resolvedUrlError = React.useMemo(() => {
    if (!urlError) return null;
    switch (urlError) {
      case 'oauth_failed':
        return 'Google authentication was cancelled or encountered an error. Please try again or use your password.';
      case 'session_expired':
        return 'Your session has expired. Please sign in again to continue.';
      case 'access_denied':
        return 'Access was denied. Please verify your credentials.';
      default:
        return 'Authentication could not be completed. Please try again.';
    }
  }, [urlError]);

  /**
   * Handle Google OAuth Sign-in initiation
   */
  const handleGoogleSignIn = async () => {
    setServerError(null);
    try {
      const callback = redirectTo || searchParams?.get('callbackUrl') || '/dashboard';
      await signInWithGoogle({
        callbackURL: callback,
        newUserCallbackURL: '/dashboard',
        errorCallbackURL: '/auth/sign-in?error=oauth_failed',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in could not be initiated.';
      setServerError(message);
    }
  };

  /**
   * Handle credential form submission
   */
  const onSubmit = async (payload: SignInInput) => {
    setServerError(null);
    try {
      const destination = redirectTo || searchParams?.get('callbackUrl') || '/dashboard';
      const result = await signIn(payload);

      if (result.success && result.data) {
        onSuccess?.(result.data);
        router.replace(destination);
      } else if (result.errorMessage) {
        setServerError(result.errorMessage);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign in. Please verify your credentials.';
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

        {/* Header Lockup */}
        <div className="mb-6 space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-primary">
              <ShieldCheck className="h-3 w-3 text-primary" aria-hidden="true" />
              Secure Sign In
            </span>
          </div>
          <h1 className="font-display text-center text-display-md font-semibold tracking-tight text-text-primary">
            Sign in to Kalya
          </h1>
          <p className="font-body text-body-sm text-text-secondary leading-relaxed">
            Access your intelligent financial ledger, net worth, and equilibrium models.
          </p>
        </div>

        {/* Global Error & Status Banners */}
        <AnimatePresence mode="wait">
          {resolvedUrlError && (
            <motion.div
              key="url-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-5"
            >
              <Alert variant="warning" icon={<AlertCircle className="h-4 w-4" />}>
                <div className="text-body-sm font-medium leading-normal">{resolvedUrlError}</div>
              </Alert>
            </motion.div>
          )}

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
                  <span className="font-semibold text-body-sm">Sign in failed</span>
                  <span className="text-caption text-text-secondary">{serverError}</span>
                </div>
              </Alert>
            </motion.div>
          )}

          {wasRegistered && (
            <motion.div
              key="registered-success"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-5"
            >
              <Alert variant="success" icon={<CheckCircle2 className="h-4 w-4" />}>
                <div className="text-body-sm font-medium leading-normal">
                  Account created successfully! Enter your credentials to sign in.
                </div>
              </Alert>
            </motion.div>
          )}

          {wasReset && (
            <motion.div
              key="reset-success"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-5"
            >
              <Alert variant="success" icon={<CheckCircle2 className="h-4 w-4" />}>
                <div className="text-body-sm font-medium leading-normal">
                  Your password has been reset. Please sign in with your new password.
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1-Click Google OAuth Entry */}
        {showGoogleSignIn && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              animated
              disabled={isBusy}
              onClick={handleGoogleSignIn}
              className="group relative h-11.5 rounded-xl border border-border/90 bg-surface hover:bg-surface-raised hover:border-text-secondary/40 font-body font-semibold text-text-primary shadow-xs transition-all duration-200"
            >
              {isSigningInWithGoogle ? (
                <div className="flex items-center justify-center gap-2.5">
                  <Spinner size="sm" />
                  <span>Connecting to Google…</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2.5">
                  <GoogleIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>

            {/* Visual Divider */}
            <div className="relative flex items-center py-1">
              <div className="grow border-t border-border/80" />
              <span className="mx-4 shrink-0 font-body text-[11px] font-semibold tracking-wider uppercase text-text-muted select-none">
                or sign in with email
              </span>
              <div className="grow border-t border-border/80" />
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4.5" noValidate>
          {/* Email or Username */}
          <Input
            id="signin-identifier"
            label="Email or Username"
            placeholder="you@domain.com or handle"
            type="text"
            autoComplete="username webauthn"
            required
            leadingIcon={<Mail className="h-4 w-4 text-text-muted" />}
            errorMessage={errors.identifier?.message}
            disabled={isBusy}
            {...register('identifier')}
          />

          {/* Password */}
          <Input
            id="signin-password"
            label="Password"
            type="password"
            placeholder="••••••••••••"
            autoComplete="current-password"
            required
            leadingIcon={<Lock className="h-4 w-4 text-text-muted" />}
            labelAction={
              showForgotPasswordLink ? (
                <Link
                  href="/auth/forgot-password"
                  className="text-caption font-medium text-primary hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs transition-colors"
                  tabIndex={isBusy ? -1 : 0}
                >
                  Forgot password?
                </Link>
              ) : undefined
            }
            errorMessage={errors.password?.message}
            disabled={isBusy}
            {...register('password')}
          />

          {/* Remember Me Checkbox */}
          <div className="pt-1">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <CheckboxField
                  id="signin-remember-me"
                  label="Remember this device"
                  description="Keep me securely signed in for 30 days"
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                  disabled={isBusy}
                />
              )}
            />
          </div>

          {/* Primary Action Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            animated
            isLoading={isSubmitting || isSigningIn}
            disabled={isBusy}
            rightIcon={
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            }
            className="group mt-2 h-12 rounded-xl text-body-md font-semibold shadow-card hover:shadow-raised"
          >
            {isSubmitting || isSigningIn ? 'Authenticating…' : 'Sign in to Kalya'}
          </Button>
        </form>
      </div>

      {/* Switch to Sign Up Action */}
      {showSignUpLink && (
        <div className="mt-6 text-center font-body text-body-sm text-text-secondary">
          <span>Don&apos;t have an account? </span>
          <Link
            href="/auth/sign-up"
            className="font-semibold text-primary hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs transition-colors"
          >
            Create an account
          </Link>
        </div>
      )}
    </div>
  );
};
