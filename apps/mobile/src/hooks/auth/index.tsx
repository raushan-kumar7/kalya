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
import { queryKeys } from '@/hooks/query-keys';
import { useBiometric } from './use-biometric';
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

/* ------------------------------------------------------------------ */
/* Query Hooks                                                        */
/* ------------------------------------------------------------------ */

/**
 * Query hook validating the active session with the backend server.
 *
 * @description Injects Bearer token from secure storage, calls `/api/v1/auth/get-session`,
 * and synchronizes the authenticated user and session into the Zustand auth store.
 * Clears auth state if token is invalid or expired.
 * @param {Omit<UseQueryOptions<SessionResponse | null, Error>, 'queryKey' | 'queryFn'>} [options] - Optional TanStack Query configuration.
 * @returns {import('@tanstack/react-query').UseQueryResult<SessionResponse | null, Error>} Query result containing session response.
 */
export function useSessionQuery(
  options?: Omit<UseQueryOptions<SessionResponse | null, Error>, 'queryKey' | 'queryFn'>
) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useQuery({
    queryKey: queryKeys.auth.session(),
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
 * Query hook checking real-time availability of a username handle or email address.
 *
 * @description Performs asynchronous availability check against `/api/v1/auth/check-availability`.
 * Automatically enabled when input length is at least 3 characters.
 * @param {'username' | 'email'} [field] - Target field to verify.
 * @param {string} [value] - Proposed value to test.
 * @param {Omit<UseQueryOptions<AvailabilityResponse, Error>, 'queryKey' | 'queryFn'>} [options] - Optional TanStack Query configuration.
 * @returns {import('@tanstack/react-query').UseQueryResult<AvailabilityResponse, Error>} Query result containing availability report.
 */
export function useCheckAvailabilityQuery(
  field?: 'username' | 'email',
  value?: string,
  options?: Omit<UseQueryOptions<AvailabilityResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const trimmedValue = value?.trim().toLowerCase() || '';

  return useQuery({
    queryKey: queryKeys.auth.availability(field || '', trimmedValue),
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

export interface UseUsernameAvailabilityReturn {
  /** High-level availability classification status */
  status: AvailabilityStatus;
  /** Whether debounced network availability check is currently in flight */
  isChecking: boolean;
  /** Whether the username handle is free to claim */
  isAvailable: boolean;
  /** Feedback or validation message */
  message: string | null;
  /** Triggers immediate query execution without waiting for debounce timeout */
  checkNow: () => void;
}

/**
 * Debounced username availability validation hook tailored for text inputs.
 *
 * @description Combines synchronous character validation (length 3-30, alphanumeric and underscores)
 * with a configurable debounce delay before querying the backend.
 * @param {string} rawUsername - Raw text string from the username input component.
 * @param {number} [debounceMs=500] - Debounce delay in milliseconds before dispatching server request.
 * @returns {UseUsernameAvailabilityReturn} Composite validation state, loading flag, and check trigger.
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

  const isTooShort = trimmed.length < 3;
  const isTooLong = trimmed.length > 30;
  const hasInvalidChars = trimmed.length > 0 && !/^[a-zA-Z0-9_]+$/.test(trimmed);

  const isDebouncedMatch = normalizedRaw === normalizedDebounced;
  const shouldQuery =
    isDebouncedMatch &&
    !isTooShort &&
    !isTooLong &&
    !hasInvalidChars &&
    normalizedDebounced.length >= 3 &&
    normalizedDebounced.length <= 30 &&
    /^[a-zA-Z0-9_]+$/.test(normalizedDebounced);

  const query = useCheckAvailabilityQuery('username', normalizedDebounced, {
    enabled: shouldQuery,
  });

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
 * Mutation hook for authenticating user with credentials.
 *
 * @description Dispatches sign-in request, writes token to SecureStore,
 * updates the Zustand auth store, and invalidates session query cache.
 * @param {UseMutationOptions<AuthResponse, Error, SignInDto>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<AuthResponse, Error, SignInDto>} Mutation controls.
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
      queryClient.setQueryData(queryKeys.auth.session(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for registering a new user account.
 *
 * @description Submits sign-up payload, stores returned session token, and updates Zustand auth state.
 * @param {UseMutationOptions<AuthResponse, Error, SignUpDto>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<AuthResponse, Error, SignUpDto>} Mutation controls.
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
      queryClient.setQueryData(queryKeys.auth.session(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for ending the active session and logging out.
 *
 * @description Invalidates session on backend, purges hardware token from SecureStore,
 * clears Zustand auth store, and resets TanStack Query cache.
 * @param {UseMutationOptions<void, Error, void>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, void>} Mutation controls.
 */
export function useSignOutMutation(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    ...options,
    mutationFn: () => AuthService.signOut(),
    onSuccess: (...args) => {
      clearAuth();
      queryClient.setQueryData(queryKeys.auth.session(), null);
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.removeQueries({ queryKey: queryKeys.users.all });
      options?.onSuccess?.(...args);
    },
    onError: (...args) => {
      clearAuth();
      queryClient.setQueryData(queryKeys.auth.session(), null);
      options?.onError?.(...args);
    },
  });
}

/**
 * Mutation hook requesting a password reset email.
 *
 * @description Triggers password recovery email dispatch from the server.
 * @param {UseMutationOptions<{ success: boolean; message?: string }, Error, ForgotPasswordDto>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ success: boolean; message?: string }, Error, ForgotPasswordDto>} Mutation controls.
 */
export function useForgotPasswordMutation(
  options?: UseMutationOptions<{ success: boolean; message?: string }, Error, ForgotPasswordDto>
) {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => AuthService.forgotPassword(dto),
    ...options,
  });
}

/**
 * Mutation hook completing password reset using token and new password.
 *
 * @description Submits verified token and new credentials.
 * @param {UseMutationOptions<{ success: boolean; message?: string }, Error, ResetPasswordDto>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ success: boolean; message?: string }, Error, ResetPasswordDto>} Mutation controls.
 */
export function useResetPasswordMutation(
  options?: UseMutationOptions<{ success: boolean; message?: string }, Error, ResetPasswordDto>
) {
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => AuthService.resetPassword(dto),
    ...options,
  });
}

/**
 * Mutation hook for changing active user password while authenticated.
 *
 * @description Verifies current password before persisting updated password.
 * @param {UseMutationOptions<{ success: boolean; message?: string }, Error, ChangePasswordDto>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ success: boolean; message?: string }, Error, ChangePasswordDto>} Mutation controls.
 */
export function useChangePasswordMutation(
  options?: UseMutationOptions<{ success: boolean; message?: string }, Error, ChangePasswordDto>
) {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => AuthService.changePassword(dto),
    ...options,
  });
}

/**
 * Mutation hook completing email verification via token.
 *
 * @description Submits verification token and invalidates active session cache upon completion.
 * @param {UseMutationOptions<{ success: boolean; message?: string }, Error, VerifyEmailDto>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ success: boolean; message?: string }, Error, VerifyEmailDto>} Mutation controls.
 */
export function useVerifyEmailMutation(
  options?: UseMutationOptions<{ success: boolean; message?: string }, Error, VerifyEmailDto>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (dto: VerifyEmailDto) => AuthService.verifyEmail(dto),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Primary Unified useAuth Hook                                       */
/* ------------------------------------------------------------------ */

/**
 * Primary unified authentication hook providing state, mutations, and biometric access.
 *
 * @description Exposes current user profile, active session, authentication flags,
 * mutation triggers (signIn, signUp, signOut, etc.), and biometric unlock helpers.
 * @returns {object} Consolidated auth context and action handlers.
 * @example
 * const { user, isAuthenticated, signIn, unlockWithBiometrics, isSigningIn } = useAuth();
 */
export function useAuth() {
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

  const biometric = useBiometric();

  return {
    // Reactive State
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

    // High-Level Actions
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,

    // Biometric Authentication
    biometric,
    unlockWithBiometrics: biometric.authenticateWithBiometrics,

    // Raw Mutations
    signInMutation,
    signUpMutation,
    signOutMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    changePasswordMutation,
    verifyEmailMutation,

    // Status Flags
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isRequestingPasswordReset: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
  };
}

export * from './use-biometric';
