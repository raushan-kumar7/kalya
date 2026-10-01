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
  ChangePasswordDto,
  CheckAvailabilityDto,
  ForgotPasswordDto,
  ResetPasswordDto,
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
      if (data?.user && data?.session) {
        setAuth(data.user, data.session);
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
      if (data?.user && data?.session) {
        setAuth(data.user, data.session);
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
    resetPassword,
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
  };
}
