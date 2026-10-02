'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CircleCheckBig,
  CircleUser,
  CircleX,
  Lock,
  Mail,
  UserPlus,
  UserRound,
  AlertCircle,
} from 'lucide-react';
import { SignUpSchema, type SignUpInput } from '@kalya/validations';
import type { AuthResponse } from '@kalya/types';
import { cn } from '@/libs/utils';
import { useAuth, useUsernameAvailability } from '@/hooks/auth';
import { Button, Input } from '@/components/ui/forms';
import { Alert } from '@/components/ui/feedback/alert';
import { Spinner } from '@/components/ui/states/spinner';
import { PasswordStrengthMeter } from '@/components/shared';
import { GoogleIcon } from './signin';

const ICON_SIZE = 16;

export interface SignUpProps {
  /** Optional callback fired upon successful sign up */
  onSuccess?: (response: AuthResponse) => void;
  /** Explicit redirect destination upon success. Defaults to /auth/verify-email or ?callbackUrl */
  redirectTo?: string;
  /** Whether to render the Google OAuth button. Defaults to true */
  showGoogleSignUp?: boolean;
  /** Whether to render the 'Sign in' footer anchor. Defaults to true */
  showSignInLink?: boolean;
  /** Card presentation style: 'card' (elevated) or 'flat' */
  variant?: 'card' | 'flat';
  /** Additional wrapper class names */
  className?: string;
}

/**
 * Kalya Luxury Sign Up Form
 *
 * Implements full user registration with responsive multi-column layout:
 * - First Name, Middle Name, Last Name in responsive 3-column grid
 * - Real-time debounced username availability verification
 * - Dynamic password complexity meter with live checklist
 * - 1-Click Google OAuth registration
 * - Seamless error normalization and email verification routing
 */
export const SignUp = ({
  onSuccess,
  redirectTo,
  showGoogleSignUp = true,
  showSignInLink = true,
  variant = 'card',
  className,
}: SignUpProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { signUp, signUpWithGoogle, isSigningUp, isSigningUpWithGoogle } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Form setup with Zod resolver
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema as any),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const password = useWatch({ control, name: 'password' });
  const username = useWatch({ control, name: 'username' });

  // Live real-time username availability evaluation
  const {
    status: usernameStatus,
    isChecking: isUsernameChecking,
    isAvailable: isUsernameAvailable,
    message: usernameMessage,
  } = useUsernameAvailability(username ?? '');

  const usernameErrorMessage =
    errors.username?.message ??
    (usernameStatus === 'invalid' || usernameStatus === 'taken'
      ? (usernameMessage ?? undefined)
      : undefined);

  const usernameHelperText =
    !usernameErrorMessage && (usernameStatus === 'available' || usernameStatus === 'checking')
      ? (usernameMessage ?? (usernameStatus === 'checking' ? 'Checking availability…' : undefined))
      : undefined;

  const usernameTrailingIcon =
    usernameStatus === 'available' ? (
      <CircleCheckBig size={ICON_SIZE} className="text-success" />
    ) : usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'error' ? (
      <CircleX size={ICON_SIZE} className="text-danger" />
    ) : undefined;

  const isBusy = isSubmitting || isSigningUp || isSigningUpWithGoogle;

  // Resolve search query parameters (OAuth callback errors)
  const urlError = searchParams?.get('error');
  const resolvedUrlError = React.useMemo(() => {
    if (!urlError) return null;
    switch (urlError) {
      case 'oauth_failed':
        return 'Google registration was cancelled or encountered an error. Please try again.';
      case 'access_denied':
        return 'Access was denied. Please verify your details.';
      default:
        return 'Authentication could not be completed. Please try again.';
    }
  }, [urlError]);

  /**
   * Handle Google OAuth Sign-up initiation
   */
  const handleGoogleSignUp = async () => {
    setServerError(null);
    try {
      const callback = redirectTo || searchParams?.get('callbackUrl') || '/dashboard';
      await signUpWithGoogle({
        callbackURL: callback,
        newUserCallbackURL: '/dashboard',
        errorCallbackURL: '/auth/sign-up?error=oauth_failed',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-up could not be initiated.';
      setServerError(message);
    }
  };

  /**
   * Handle credential form submission
   */
  const onSubmit = async (data: SignUpInput) => {
    setServerError(null);

    // Prevent submission while username availability check is still pending
    if (isUsernameChecking) {
      setError('username', {
        type: 'manual',
        message: 'Please wait while we verify username availability.',
      });
      return;
    }

    // Require available username if check has completed
    if (!isUsernameAvailable && usernameStatus !== 'error') {
      setError('username', {
        type: 'manual',
        message: usernameMessage ?? 'Choose an available username first.',
      });
      return;
    }

    try {
      // Normalize payload (omit empty middle_name, assign displayUsername)
      const payload: SignUpInput = {
        ...data,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        middle_name: data.middle_name?.trim() ? data.middle_name.trim() : undefined,
        username: data.username.trim().toLowerCase(),
        displayUsername: data.username.trim(),
        email: data.email.trim().toLowerCase(),
      };

      const result = await signUp(payload);

      if (result.success && result.data) {
        reset();
        onSuccess?.(result.data);

        const destination =
          redirectTo ||
          searchParams?.get('callbackUrl') ||
          `/auth/verify-email?email=${encodeURIComponent(payload.email)}`;

        router.push(destination);
        router.refresh();
      } else if (result.errorMessage) {
        setServerError(result.errorMessage);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please check your information and try again.';
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
              <UserPlus className="h-3 w-3 text-primary" aria-hidden="true" />
              Create Account
            </span>
          </div>
          <h1 className="font-display text-center sm:text-left text-display-md font-semibold tracking-tight text-text-primary">
            Join Kalya
          </h1>
          <p className="font-body text-body-sm text-text-secondary leading-relaxed">
            Start building your intelligent financial ledger and achieve lasting equilibrium.
          </p>
        </div>

        {/* Global Error Banners */}
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
                  <span className="font-semibold text-body-sm">Registration failed</span>
                  <span className="text-caption text-text-secondary">{serverError}</span>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1-Click Google OAuth Entry */}
        {showGoogleSignUp && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              animated
              disabled={isBusy}
              onClick={handleGoogleSignUp}
              className="group relative h-11.5 rounded-xl border border-border/90 bg-surface hover:bg-surface-raised hover:border-text-secondary/40 font-body font-semibold text-text-primary shadow-xs transition-all duration-200"
            >
              {isSigningUpWithGoogle ? (
                <div className="flex items-center justify-center gap-2.5">
                  <Spinner size="sm" />
                  <span>Connecting to Google…</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2.5">
                  <GoogleIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span>Sign up with Google</span>
                </div>
              )}
            </Button>

            {/* Visual Divider */}
            <div className="relative flex items-center py-1">
              <div className="grow border-t border-border/80" />
              <span className="mx-4 shrink-0 font-body text-[11px] font-semibold tracking-wider uppercase text-text-muted select-none">
                or register with email
              </span>
              <div className="grow border-t border-border/80" />
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          {/* Name Fields Grid: First, Middle, Last */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              id="signup-first-name"
              label="First Name"
              type="text"
              required
              placeholder="First name"
              leadingIcon={<UserRound size={ICON_SIZE} className="text-text-muted" />}
              autoComplete="given-name"
              errorMessage={errors.first_name?.message}
              disabled={isBusy}
              {...register('first_name')}
            />

            <Input
              id="signup-middle-name"
              label="Middle Name"
              type="text"
              placeholder="Optional"
              leadingIcon={<UserRound size={ICON_SIZE} className="text-text-muted" />}
              autoComplete="additional-name"
              errorMessage={errors.middle_name?.message}
              disabled={isBusy}
              {...register('middle_name')}
            />

            <Input
              id="signup-last-name"
              label="Last Name"
              type="text"
              required
              placeholder="Last name"
              leadingIcon={<UserRound size={ICON_SIZE} className="text-text-muted" />}
              autoComplete="family-name"
              errorMessage={errors.last_name?.message}
              disabled={isBusy}
              {...register('last_name')}
            />
          </div>

          {/* Account Credentials Grid: Username & Email */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              id="signup-username"
              label="Username"
              type="text"
              required
              placeholder="kalya_user"
              leadingIcon={<CircleUser size={ICON_SIZE} className="text-text-muted" />}
              trailingIcon={usernameTrailingIcon}
              loading={isUsernameChecking}
              errorMessage={usernameErrorMessage}
              helperText={usernameHelperText}
              autoComplete="username"
              disabled={isBusy}
              {...register('username')}
            />

            <Input
              id="signup-email"
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              leadingIcon={<Mail size={ICON_SIZE} className="text-text-muted" />}
              autoComplete="email"
              errorMessage={errors.email?.message}
              disabled={isBusy}
              {...register('email')}
            />
          </div>

          {/* Password & Live Complexity Meter */}
          <div className="space-y-2">
            <Input
              id="signup-password"
              label="Password"
              type="password"
              required
              placeholder="Create a strong password"
              leadingIcon={<Lock size={ICON_SIZE} className="text-text-muted" />}
              autoComplete="new-password"
              errorMessage={errors.password?.message}
              disabled={isBusy}
              {...register('password')}
            />
            <PasswordStrengthMeter password={password || ''} />
          </div>

          {/* Terms & Privacy Note */}
          <p className="font-body text-caption leading-relaxed text-text-muted">
            By creating an account, you agree to Kalya&apos;s{' '}
            <Link
              href="/terms"
              className="text-text-secondary hover:text-text-primary hover:underline underline-offset-2 transition-colors"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-text-secondary hover:text-text-primary hover:underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>

          {/* Primary Action Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            animated
            isLoading={isBusy}
            disabled={isBusy || isUsernameChecking}
            rightIcon={
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            }
            className="group mt-2 h-12 rounded-xl text-body-md font-semibold shadow-card hover:shadow-raised"
          >
            {isBusy ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
      </div>

      {/* Switch to Sign In Action */}
      {showSignInLink && (
        <div className="mt-6 text-center font-body text-body-sm text-text-secondary">
          <span>Already have an account? </span>
          <Link
            href="/auth/sign-in"
            className="font-semibold text-primary hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs transition-colors"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
};
