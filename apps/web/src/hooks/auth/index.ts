'use client';

import * as React from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { AuthService } from '@/libs/services/auth';
import { useAuthStore } from '@/stores/auth';
import { runAction, type RunActionOptions } from '@/libs/run-actions';
import type {
  AuthResponse,
  AvailabilityResponse,
  AvailabilityStatus,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  Session,
  SessionResponse,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from '@kalya/types';

/**
 * Standard Query Keys factory for Authentication
 */
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  availability: (field: string, value: string) =>
    [...authKeys.all, 'availability', field, value] as const,
};

/* ------------------------------------------------------------------ */
/* Query Hooks                                                        */
/* ------------------------------------------------------------------ */

/**
 * Query hook fetching current session from the server.
 * Automatically synchronizes the Zustand store.
 */
export function useSessionQuery(
  options?: Omit<UseQueryOptions<SessionResponse | null, Error>, 'queryKey' | 'queryFn'>
) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const data = await AuthService.getSession();
      if (data?.user && data?.session) {
        setAuth(data.user, data.session);
      } else {
        clearAuth();
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    ...options,
  });
}

/**
 * Query hook checking real-time availability of username or email.
 */
export function useCheckAvailabilityQuery(
  field?: 'username' | 'email',
  value?: string,
  options?: Omit<UseQueryOptions<AvailabilityResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const trimmedValue = value?.trim().toLowerCase() || '';

  return useQuery({
    queryKey: authKeys.availability(field || '', trimmedValue),
    queryFn: () => {
      if (!field || !trimmedValue) {
        throw new Error('Field and value are required for availability check');
      }
      return AuthService.checkAvailability({ field, value: trimmedValue });
    },
    enabled: Boolean(field && trimmedValue.length >= 3 && options?.enabled !== false),
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  });
}

export type UsernameAvailabilityStatus = AvailabilityStatus;

export interface UseUsernameAvailabilityReturn {
  status: AvailabilityStatus;
  isChecking: boolean;
  isAvailable: boolean;
  message: string | null;
  /** Immediately triggers availability check without waiting for the debounce timeout (e.g. on input blur) */
  checkNow: () => void;
}

/**
 * Real-time username availability check hook with debouncing and client-side pre-validation.
 * Waits for the user to enter their username and pause typing (or blur) before searching.
 */
export function useUsernameAvailability(
  rawUsername: string,
  debounceMs: number = 500
): UseUsernameAvailabilityReturn {
  const [debouncedUsername, setDebouncedUsername] = React.useState(rawUsername);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(rawUsername);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [rawUsername, debounceMs]);

  const checkNow = React.useCallback(() => {
    setDebouncedUsername(rawUsername);
  }, [rawUsername]);

  const trimmed = (rawUsername ?? '').trim();
  const normalizedRaw = trimmed.toLowerCase();
  const normalizedDebounced = (debouncedUsername ?? '').trim().toLowerCase();

  // Local synchronous validation rules matching UsernameSchema (3-30 chars, alphanumeric + underscores)
  const isTooShort = trimmed.length < 3;
  const isTooLong = trimmed.length > 30;
  const hasInvalidChars = trimmed.length > 0 && !/^[a-zA-Z0-9_]+$/.test(trimmed);

  // Only query the server when the debounced username matches what the user typed and is valid
  const isDebouncedMatch = normalizedRaw === normalizedDebounced;
  const shouldQuery =
    isDebouncedMatch &&
    !isTooShort &&
    !isTooLong &&
    !hasInvalidChars &&
    normalizedDebounced.length >= 3 &&
    normalizedDebounced.length <= 30 &&
    /^[a-zA-Z0-9_]+$/.test(normalizedDebounced);

  // Unconditional hook execution - enabled handles whether the query actually runs!
  const query = useCheckAvailabilityQuery('username', normalizedDebounced, {
    enabled: shouldQuery,
  });

  // Calculate return state AFTER all hooks have executed
  if (!trimmed || isTooShort) {
    return {
      status: 'idle',
      isChecking: false,
      isAvailable: false,
      message: null,
      checkNow,
    };
  }

  if (isTooLong) {
    return {
      status: 'invalid',
      isChecking: false,
      isAvailable: false,
      message: 'Username cannot exceed 30 characters',
      checkNow,
    };
  }

  if (hasInvalidChars) {
    return {
      status: 'invalid',
      isChecking: false,
      isAvailable: false,
      message: 'Only letters, numbers, and underscores allowed',
      checkNow,
    };
  }

  // Only show checking when a network search is actively in flight
  const isChecking = shouldQuery && (query.isLoading || query.isFetching);

  if (isChecking) {
    return {
      status: 'checking',
      isChecking: true,
      isAvailable: false,
      message: 'Checking availability…',
      checkNow,
    };
  }

  if (query.isError) {
    return {
      status: 'error',
      isChecking: false,
      isAvailable: false,
      message: 'Could not check username availability',
      checkNow,
    };
  }

  if (shouldQuery && query.data) {
    return {
      status: query.data.available ? 'available' : 'taken',
      isChecking: false,
      isAvailable: query.data.available,
      message:
        query.data.message ??
        (query.data.available ? 'Username is available' : 'Username is already taken'),
      checkNow,
    };
  }

  return {
    status: 'idle',
    isChecking: false,
    isAvailable: false,
    message: null,
    checkNow,
  };
}

/* ------------------------------------------------------------------ */
/* Mutation Hooks                                                     */
/* ------------------------------------------------------------------ */

/**
 * Mutation hook for signing in.
 * Updates Zustand store and invalidates session query on success.
 */
export function useSignInMutation(options?: UseMutationOptions<AuthResponse, Error, SignInDto>) {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    ...options,
    mutationFn: (dto: SignInDto) => AuthService.signIn(dto),
    onSuccess: (...args) => {
      const [data] = args;
      if (data?.user) {
        const session =
          data.session ||
          ({
            id: data.token || data.user.id,
            userId: data.user.id,
            token: data.token || '',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Session);
        setAuth(data.user, session);
      }
      queryClient.setQueryData(authKeys.session(), data);
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for registering a new user.
 */
export function useSignUpMutation(options?: UseMutationOptions<AuthResponse, Error, SignUpDto>) {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    ...options,
    mutationFn: (dto: SignUpDto) => AuthService.signUp(dto),
    onSuccess: (...args) => {
      const [data] = args;
      if (data?.user) {
        const session =
          data.session ||
          ({
            id: data.token || data.user.id,
            userId: data.user.id,
            token: data.token || '',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Session);
        setAuth(data.user, session);
      }
      queryClient.setQueryData(authKeys.session(), data);
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for signing out.
 * Clears Zustand store and session cache on completion.
 */
export function useSignOutMutation(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    ...options,
    mutationFn: () => AuthService.signOut(),
    onSuccess: (...args) => {
      clearAuth();
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      options?.onSuccess?.(...args);
    },
    onError: (...args) => {
      // Even if network fails, ensure client local state is cleared
      clearAuth();
      queryClient.setQueryData(authKeys.session(), null);
      options?.onError?.(...args);
    },
  });
}

/**
 * Mutation hook for requesting password reset instructions.
 */
export function useForgotPasswordMutation(
  options?: UseMutationOptions<{ message?: string; status?: boolean }, Error, ForgotPasswordDto>
) {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => AuthService.forgotPassword(dto),
    ...options,
  });
}

/**
 * Mutation hook for completing password reset.
 */
export function useResetPasswordMutation(
  options?: UseMutationOptions<{ message?: string; status?: boolean }, Error, ResetPasswordDto>
) {
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => AuthService.resetPassword(dto),
    ...options,
  });
}

/**
 * Mutation hook for changing active user password.
 */
export function useChangePasswordMutation(
  options?: UseMutationOptions<{ message?: string; status?: boolean }, Error, ChangePasswordDto>
) {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => AuthService.changePassword(dto),
    ...options,
  });
}

/**
 * Mutation hook for verifying account email.
 */
export function useVerifyEmailMutation(
  options?: UseMutationOptions<
    { message?: string; status?: boolean },
    Error,
    VerifyEmailDto | string
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (dto: VerifyEmailDto | string) => AuthService.verifyEmail(dto),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Primary Unified useAuth Hook                                       */
/* ------------------------------------------------------------------ */

/**
 * Comprehensive hook providing auth state, TanStack Query mutations,
 * and toast-integrated runAction wrappers.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const error = useAuthStore((s) => s.error);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAuth = useAuthStore((s) => s.setAuth);

  const signInMutation = useSignInMutation();
  const signUpMutation = useSignUpMutation();
  const signOutMutation = useSignOutMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const verifyEmailMutation = useVerifyEmailMutation();

  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = React.useState(false);
  const [isSigningUpWithGoogle, setIsSigningUpWithGoogle] = React.useState(false);

  /**
   * Signs in with Google OAuth via full-page redirect to Google consent screen
   */
  const signInWithGoogle = React.useCallback(
    async (
      options?: { callbackURL?: string; newUserCallbackURL?: string; errorCallbackURL?: string },
      actionOptions?: RunActionOptions<void>
    ) => {
      setIsSigningInWithGoogle(true);
      return runAction(
        async () => {
          await AuthService.signInWithGoogle(options);
        },
        {
          loading: 'Redirecting to Google…',
          ...actionOptions,
        }
      ).finally(() => {
        setIsSigningInWithGoogle(false);
      });
    },
    []
  );

  /**
   * Signs up with Google OAuth via full-page redirect to Google consent screen
   */
  const signUpWithGoogle = React.useCallback(
    async (
      options?: { callbackURL?: string; newUserCallbackURL?: string; errorCallbackURL?: string },
      actionOptions?: RunActionOptions<void>
    ) => {
      setIsSigningUpWithGoogle(true);
      return runAction(
        async () => {
          await AuthService.signUpWithGoogle(options);
        },
        {
          loading: 'Connecting with Google…',
          ...actionOptions,
        }
      ).finally(() => {
        setIsSigningUpWithGoogle(false);
      });
    },
    []
  );

  /**
   * Signs in user with optional integrated toast notifications via runAction
   */
  const signIn = React.useCallback(
    async (dto: SignInDto, options?: RunActionOptions<AuthResponse>) => {
      return runAction(
        async () => {
          const res = await signInMutation.mutateAsync(dto);
          return res;
        },
        {
          loading: 'Signing in…',
          success: 'Welcome back!',
          ...options,
        }
      );
    },
    [signInMutation]
  );

  /**
   * Registers a new user with optional integrated toast notifications via runAction
   */
  const signUp = React.useCallback(
    async (dto: SignUpDto, options?: RunActionOptions<AuthResponse>) => {
      return runAction(
        async () => {
          const res = await signUpMutation.mutateAsync(dto);
          return res;
        },
        {
          loading: 'Creating account…',
          success: 'Account created successfully!',
          ...options,
        }
      );
    },
    [signUpMutation]
  );

  /**
   * Signs out current user with optional integrated toast notifications via runAction
   */
  const signOut = React.useCallback(
    async (options?: RunActionOptions<void>) => {
      return runAction(
        async () => {
          await signOutMutation.mutateAsync();
        },
        {
          loading: 'Signing out…',
          success: 'Signed out successfully',
          ...options,
        }
      );
    },
    [signOutMutation]
  );

  /**
   * Initiates password recovery
   */
  const forgotPassword = React.useCallback(
    async (
      dto: ForgotPasswordDto,
      options?: RunActionOptions<{ message?: string; status?: boolean }>
    ) => {
      return runAction(
        async () => {
          return forgotPasswordMutation.mutateAsync(dto);
        },
        {
          loading: 'Sending recovery email…',
          success: 'Password reset link sent to your email',
          ...options,
        }
      );
    },
    [forgotPasswordMutation]
  );

  /**
   * Completes password reset
   */
  const resetPassword = React.useCallback(
    async (
      dto: ResetPasswordDto,
      options?: RunActionOptions<{ message?: string; status?: boolean }>
    ) => {
      return runAction(
        async () => {
          return resetPasswordMutation.mutateAsync(dto);
        },
        {
          loading: 'Resetting password…',
          success: 'Password has been successfully reset',
          ...options,
        }
      );
    },
    [resetPasswordMutation]
  );

  const [isResendingVerification, setIsResendingVerification] = React.useState(false);

  /**
   * Resends verification email with toast notifications
   */
  const resendVerificationEmail = React.useCallback(
    async (
      params: { email: string; callbackURL?: string },
      options?: RunActionOptions<{ message?: string; status?: boolean }>
    ) => {
      setIsResendingVerification(true);
      return runAction(
        async () => {
          return AuthService.sendVerificationEmail(params);
        },
        {
          loading: 'Sending verification link…',
          success: 'Verification email sent! Please check your inbox.',
          ...options,
        }
      ).finally(() => {
        setIsResendingVerification(false);
      });
    },
    []
  );

  /**
   * Completes password reset using token and new password
   */
  const confirmPasswordReset = React.useCallback(
    async (
      token: string,
      dto: { password?: string; newPassword?: string },
      options?: RunActionOptions<{ message?: string; status?: boolean }>
    ) => {
      const newPassword = dto.newPassword || dto.password || '';
      return resetPassword({ token, newPassword }, options);
    },
    [resetPassword]
  );

  /**
   * Refetches and refreshes the current session from the server
   */
  const refreshSession = React.useCallback(async () => {
    const data = await queryClient.fetchQuery({
      queryKey: authKeys.session(),
      queryFn: () => AuthService.getSession(),
    });
    if (data?.user && data?.session) {
      setAuth(data.user, data.session);
    } else {
      clearAuth();
    }
    return data;
  }, [queryClient, setAuth, clearAuth]);

  return {
    // State
    user,
    session,
    isAuthenticated,
    isLoading:
      isLoading ||
      signInMutation.isPending ||
      signUpMutation.isPending ||
      signOutMutation.isPending,
    isInitialized,
    error,

    // Store Actions
    updateUser,
    clearAuth,
    setAuth,

    // High-level Actions with Toasts
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signUpWithGoogle,
    forgotPassword,
    requestPasswordReset: forgotPassword,
    resetPassword,
    confirmPasswordReset,
    resendVerificationEmail,
    refreshSession,

    // Raw Mutations
    signInMutation,
    signUpMutation,
    signOutMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    changePasswordMutation,
    verifyEmailMutation,

    // Pending indicators
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isSigningInWithGoogle,
    isSigningUpWithGoogle,
    isRequestingPasswordReset: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isResendingVerification,
    isVerifyingEmail: verifyEmailMutation.isPending,
  };
}
