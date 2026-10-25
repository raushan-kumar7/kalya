import * as React from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  UserService,
  type GetUsersParams,
  type SuggestUsernameParams,
} from '@/libs/services/users';
import { useUserStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth';
import { queryKeys } from '@/hooks/query-keys';
import type { Session, UpdateProfileDto, UpdateUsernameDto, User } from '@kalya/types';

/* ------------------------------------------------------------------ */
/* Query Hooks                                                        */
/* ------------------------------------------------------------------ */

/**
 * Query hook retrieving the profile of the current authenticated user.
 *
 * @description Calls `/api/v1/users/me` and simultaneously synchronizes both
 * the `useUserStore` profile state and `useAuthStore` user state.
 * @param {Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>} [options] - Optional TanStack Query configuration.
 * @returns {import('@tanstack/react-query').UseQueryResult<User, Error>} Query result containing the user profile.
 */
export function useProfileQuery(
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) {
  const setProfile = useUserStore((s) => s.setProfile);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: async () => {
      const user = await UserService.getMe();
      if (user) {
        setProfile(user);
        setUser(user);
      }
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Query hook retrieving the platform user directory.
 *
 * @description Fetches a paginated or filtered list of platform users and caches in `useUserStore`.
 * @param {GetUsersParams} [params] - Search parameters, limits, and pagination offsets.
 * @param {Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>} [options] - Optional TanStack Query configuration.
 * @returns {import('@tanstack/react-query').UseQueryResult<User[], Error>} Query result containing array of users.
 */
export function useUsersQuery(
  params?: GetUsersParams,
  options?: Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>
) {
  const setUsers = useUserStore((s) => s.setUsers);

  return useQuery({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: async () => {
      const users = await UserService.searchUsers(params);
      setUsers(users || []);
      return users || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}

export interface UseUserSearchOptions {
  /** Debounce delay in milliseconds before dispatching search request */
  debounceMs?: number;
  /** Maximum number of records to return */
  limit?: number;
}

export interface UseUserSearchReturn {
  /** Array of matching user profile records */
  results: User[];
  /** Whether the network search query is actively in progress */
  isSearching: boolean;
  /** Whether the user is actively typing and the debounce timer is active */
  isDebouncing: boolean;
  /** Any error encountered during search */
  error: Error | null;
  /** Dispatches immediate search without waiting for debounce timeout */
  searchNow: (overrideQuery?: string) => void;
  /** Triggers query refetch */
  refetch: () => void;
}

/**
 * Debounced user search hook for split-bill participants or friend suggestions.
 *
 * @description Automatically debounces search text by 300ms. Dispatches query only
 * when input length is at least 2 characters.
 * @param {string} query - Raw search term from input field.
 * @param {UseUserSearchOptions} [options] - Configuration for debounce and limits.
 * @returns {UseUserSearchReturn} Search results, loading indicators, and search triggers.
 */
export function useUserSearch(
  query: string,
  options: UseUserSearchOptions = {}
): UseUserSearchReturn {
  const { debounceMs = 300, limit = 20 } = options;
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);
  const [isDebouncing, setIsDebouncing] = React.useState(false);

  React.useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setIsDebouncing(false);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  const searchNow = React.useCallback(
    (overrideQuery?: string) => {
      setIsDebouncing(false);
      setDebouncedQuery((overrideQuery ?? query).trim());
    },
    [query]
  );

  const enabled = debouncedQuery.length >= 2;

  const { data, isLoading, error, refetch } = useQuery<User[], Error>({
    queryKey: queryKeys.users.search(debouncedQuery),
    queryFn: async () => {
      try {
        const results = await UserService.searchUsers({
          q: debouncedQuery,
          limit,
        });
        return results || [];
      } catch {
        return [];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  });

  return {
    results: data ?? [],
    isSearching: enabled && isLoading,
    isDebouncing,
    error,
    searchNow,
    refetch,
  };
}

/**
 * Query hook retrieving all active device sessions for current user.
 *
 * @description Queries `/api/v1/users/sessions` and updates the active sessions list in `useUserStore`.
 * @param {Omit<UseQueryOptions<Session[], Error>, 'queryKey' | 'queryFn'>} [options] - Optional TanStack Query configuration.
 * @returns {import('@tanstack/react-query').UseQueryResult<Session[], Error>} Query result containing array of sessions.
 */
export function useSessionsQuery(
  options?: Omit<UseQueryOptions<Session[], Error>, 'queryKey' | 'queryFn'>
) {
  const setSessions = useUserStore((s) => s.setSessions);

  return useQuery({
    queryKey: queryKeys.users.sessions(),
    queryFn: async () => {
      const sessions = await UserService.getSessions();
      setSessions(sessions || []);
      return sessions || [];
    },
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}

/**
 * Query hook generating smart username suggestions based on name components.
 *
 * @description Calls `/api/v1/users/suggest-username` when first or last name is present.
 * @param {SuggestUsernameParams} [params] - First name, middle name, or last name inputs.
 * @param {Omit<UseQueryOptions<{ username: string }, Error>, 'queryKey' | 'queryFn'>} [options] - Optional TanStack Query configuration.
 * @returns {import('@tanstack/react-query').UseQueryResult<{ username: string }, Error>} Suggested unique username.
 */
export function useSuggestUsernameQuery(
  params?: SuggestUsernameParams,
  options?: Omit<UseQueryOptions<{ username: string }, Error>, 'queryKey' | 'queryFn'>
) {
  const hasInput = Boolean(params?.first_name || params?.last_name);

  return useQuery({
    queryKey: queryKeys.users.suggestUsername(
      `${params?.first_name || ''}_${params?.last_name || ''}`
    ),
    queryFn: () => UserService.suggestUsername(params),
    enabled: hasInput && options?.enabled !== false,
    staleTime: 1000 * 60,
    ...options,
  });
}

/* ------------------------------------------------------------------ */
/* Mutation Hooks                                                     */
/* ------------------------------------------------------------------ */

/**
 * Mutation hook for updating mutable user profile fields.
 *
 * @description Submits partial profile modifications and synchronizes `useUserStore`,
 * `useAuthStore`, and invalidates the user profile query cache.
 * @param {UseMutationOptions<User, Error, UpdateProfileDto>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<User, Error, UpdateProfileDto>} Mutation controls.
 */
export function useUpdateProfileMutation(
  options?: UseMutationOptions<User, Error, UpdateProfileDto>
) {
  const queryClient = useQueryClient();
  const updateProfileState = useUserStore((s) => s.updateProfileState);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    ...options,
    mutationFn: (dto: UpdateProfileDto) => UserService.updateProfile(dto),
    onSuccess: (...args) => {
      const [updatedUser] = args;
      updateProfileState(updatedUser);
      updateUser(updatedUser);
      queryClient.setQueryData(queryKeys.users.me(), updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for updating the user's unique username handle.
 *
 * @description Validates and persists the new handle, updating stores and query caches.
 * @param {UseMutationOptions<User, Error, UpdateUsernameDto>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<User, Error, UpdateUsernameDto>} Mutation controls.
 */
export function useUpdateUsernameMutation(
  options?: UseMutationOptions<User, Error, UpdateUsernameDto>
) {
  const queryClient = useQueryClient();
  const updateProfileState = useUserStore((s) => s.updateProfileState);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    ...options,
    mutationFn: (dto: UpdateUsernameDto) => UserService.updateUsername(dto),
    onSuccess: (...args) => {
      const [updatedUser] = args;
      updateProfileState(updatedUser);
      updateUser(updatedUser);
      queryClient.setQueryData(queryKeys.users.me(), updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for uploading user avatar image via React Native multipart FormData.
 *
 * @description Submits local file descriptor with native URI and MIME type, updating avatar URL across stores.
 * @param {UseMutationOptions<{ avatarUrl: string }, Error, { uri: string; name: string; type: string }>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ avatarUrl: string }, Error, { uri: string; name: string; type: string }>} Mutation controls.
 */
export function useUploadAvatarMutation(
  options?: UseMutationOptions<
    { avatarUrl: string },
    Error,
    { uri: string; name: string; type: string }
  >
) {
  const queryClient = useQueryClient();
  const updateProfileState = useUserStore((s) => s.updateProfileState);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    ...options,
    mutationFn: (file) => UserService.uploadAvatar(file),
    onSuccess: (...args) => {
      const [data] = args;
      updateProfileState({ image: data.avatarUrl });
      updateUser({ image: data.avatarUrl });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for terminating a specific device session by ID.
 *
 * @description Revokes the session on the backend and removes it from the `useUserStore` sessions array.
 * @param {UseMutationOptions<{ revoked: boolean }, Error, string>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ revoked: boolean }, Error, string>} Mutation controls.
 */
export function useRevokeSessionMutation(
  options?: UseMutationOptions<{ revoked: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  const removeSession = useUserStore((s) => s.removeSession);

  return useMutation({
    ...options,
    mutationFn: (sessionId: string) => UserService.revokeSession(sessionId),
    onSuccess: (...args) => {
      const [, sessionId] = args;
      removeSession(sessionId);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for terminating all active sessions except the currently active device session.
 *
 * @description Revokes non-current sessions on the backend and refreshes active sessions cache.
 * @param {UseMutationOptions<{ revokedCount: number }, Error, void>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ revokedCount: number }, Error, void>} Mutation controls.
 */
export function useRevokeOtherSessionsMutation(
  options?: UseMutationOptions<{ revokedCount: number }, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => UserService.revokeOtherSessions(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for scheduling account deletion with regulatory grace period.
 *
 * @description Sets the account deletion schedule on the backend and invalidates user profile cache.
 * @param {UseMutationOptions<{ scheduledDate: string; gracePeriodDays: number }, Error, void>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ scheduledDate: string; gracePeriodDays: number }, Error, void>} Mutation controls.
 */
export function useScheduleDeletionMutation(
  options?: UseMutationOptions<{ scheduledDate: string; gracePeriodDays: number }, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => UserService.scheduleDeletion(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for cancelling a scheduled account deletion.
 *
 * @description Restores active account status during the active grace period.
 * @param {UseMutationOptions<{ restored: boolean }, Error, void>} [options] - Optional mutation configuration.
 * @returns {import('@tanstack/react-query').UseMutationResult<{ restored: boolean }, Error, void>} Mutation controls.
 */
export function useCancelDeletionMutation(
  options?: UseMutationOptions<{ restored: boolean }, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => UserService.cancelDeletion(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      options?.onSuccess?.(...args);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Primary Unified useUser Hook                                       */
/* ------------------------------------------------------------------ */

/**
 * Primary unified user management hook.
 *
 * @description Consolidates user profile state, active sessions, mutation triggers
 * (profile updates, avatar upload, session revocation), and loading flags into a single interface.
 * @returns {object} Consolidated user context and action handlers.
 * @example
 * const { profile, updateProfile, uploadAvatar, isUpdatingProfile } = useUser();
 */
export function useUser() {
  const profile = useUserStore((s) => s.profile);
  const sessions = useUserStore((s) => s.sessions);
  const users = useUserStore((s) => s.users);
  const isLoading = useUserStore((s) => s.isLoading);
  const isUpdatingProfile = useUserStore((s) => s.isUpdatingProfile);
  const isUploadingAvatar = useUserStore((s) => s.isUploadingAvatar);
  const error = useUserStore((s) => s.error);

  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const updateUsernameMutation = useUpdateUsernameMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const revokeSessionMutation = useRevokeSessionMutation();
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();
  const scheduleDeletionMutation = useScheduleDeletionMutation();
  const cancelDeletionMutation = useCancelDeletionMutation();

  return {
    // State
    profile: profile ?? profileQuery.data ?? null,
    sessions,
    users,
    isLoading: profileQuery.isLoading || isLoading,
    isUpdatingProfile: updateProfileMutation.isPending || isUpdatingProfile,
    isUploadingAvatar: uploadAvatarMutation.isPending || isUploadingAvatar,
    error,

    // Actions
    updateProfile: updateProfileMutation.mutateAsync,
    updateUsername: updateUsernameMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    revokeSession: revokeSessionMutation.mutateAsync,
    revokeOtherSessions: revokeOtherSessionsMutation.mutateAsync,
    scheduleDeletion: scheduleDeletionMutation.mutateAsync,
    cancelDeletion: cancelDeletionMutation.mutateAsync,
    refetchProfile: profileQuery.refetch,

    // Raw Mutations
    updateProfileMutation,
    updateUsernameMutation,
    uploadAvatarMutation,
    revokeSessionMutation,
    revokeOtherSessionsMutation,
    scheduleDeletionMutation,
    cancelDeletionMutation,
  };
}
