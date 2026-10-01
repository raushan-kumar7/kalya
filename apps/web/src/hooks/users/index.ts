'use client';

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
  type CancelDeletionResponse,
  type RequestEmailChangeResponse,
  type RevokeOtherSessionsResponse,
  type RevokeSessionResponse,
  type ScheduleDeletionResponse,
  type SuggestUsernameParams,
  type SuggestUsernameResponse,
} from '@/libs/services/users';
import { useUserStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth';
import { authKeys } from '@/hooks/auth';
import { runAction, type RunActionOptions } from '@/libs/run-actions';
import type { Session, UpdateProfileDto, UpdateUsernameDto, User } from '@kalya/types';

/**
 * Standard Query Keys factory for User domain
 */
export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  sessions: () => [...userKeys.all, 'sessions'] as const,
  suggestUsername: (name?: string) => [...userKeys.all, 'suggest-username', name] as const,
};

/* ------------------------------------------------------------------ */
/* Query Hooks                                                        */
/* ------------------------------------------------------------------ */

/**
 * Query hook retrieving current user's profile.
 * Synchronizes both useUserStore and useAuthStore.
 */
export function useProfileQuery(
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) {
  const setProfile = useUserStore((s) => s.setProfile);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: userKeys.me(),
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
 * Query hook retrieving current active user sessions.
 */
export function useSessionsQuery(
  options?: Omit<UseQueryOptions<Session[], Error>, 'queryKey' | 'queryFn'>
) {
  const setSessions = useUserStore((s) => s.setSessions);

  return useQuery({
    queryKey: userKeys.sessions(),
    queryFn: async () => {
      const sessions = await UserService.getSessions();
      setSessions(sessions || []);
      return sessions || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}

/**
 * Query hook suggesting a unique username based on name parameters.
 */
export function useSuggestUsernameQuery(
  params?: SuggestUsernameParams,
  options?: Omit<UseQueryOptions<SuggestUsernameResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const hasName = Boolean(params?.first_name || params?.last_name || params?.middle_name);

  return useQuery({
    queryKey: userKeys.suggestUsername(
      `${params?.first_name || ''}_${params?.last_name || ''}_${params?.middle_name || ''}`
    ),
    queryFn: () => UserService.suggestUsername(params),
    enabled: Boolean(hasName && options?.enabled !== false),
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}

/* ------------------------------------------------------------------ */
/* Mutation Hooks                                                     */
/* ------------------------------------------------------------------ */

/**
 * Mutation hook updating user profile fields.
 */
export function useUpdateProfileMutation(
  options?: UseMutationOptions<User, Error, UpdateProfileDto>
) {
  const queryClient = useQueryClient();
  const setProfile = useUserStore((s) => s.setProfile);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    ...options,
    mutationFn: (dto: UpdateProfileDto) => UserService.updateProfile(dto),
    onSuccess: (...args) => {
      const [updatedUser] = args;
      if (updatedUser) {
        setProfile(updatedUser);
        updateUser(updatedUser);
      }
      queryClient.setQueryData(userKeys.me(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook updating user public username handle.
 */
export function useUpdateUsernameMutation(
  options?: UseMutationOptions<User, Error, UpdateUsernameDto>
) {
  const queryClient = useQueryClient();
  const setProfile = useUserStore((s) => s.setProfile);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    ...options,
    mutationFn: (dto: UpdateUsernameDto) => UserService.updateUsername(dto),
    onSuccess: (...args) => {
      const [updatedUser] = args;
      if (updatedUser) {
        setProfile(updatedUser);
        updateUser(updatedUser);
      }
      queryClient.setQueryData(userKeys.me(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook uploading new user profile avatar image.
 */
export function useUploadAvatarMutation(options?: UseMutationOptions<User, Error, File | Blob>) {
  const queryClient = useQueryClient();
  const setProfile = useUserStore((s) => s.setProfile);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    ...options,
    mutationFn: (file: File | Blob) => UserService.uploadAvatar(file),
    onSuccess: (...args) => {
      const [updatedUser] = args;
      if (updatedUser) {
        setProfile(updatedUser);
        updateUser(updatedUser);
      }
      queryClient.setQueryData(userKeys.me(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook deleting user profile avatar.
 */
export function useDeleteAvatarMutation(options?: UseMutationOptions<User, Error, void>) {
  const queryClient = useQueryClient();
  const setProfile = useUserStore((s) => s.setProfile);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    ...options,
    mutationFn: () => UserService.deleteAvatar(),
    onSuccess: (...args) => {
      const [updatedUser] = args;
      if (updatedUser) {
        setProfile(updatedUser);
        updateUser(updatedUser);
      }
      queryClient.setQueryData(userKeys.me(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook revoking a specific user session.
 */
export function useRevokeSessionMutation(
  options?: UseMutationOptions<RevokeSessionResponse, Error, string>
) {
  const queryClient = useQueryClient();
  const removeSession = useUserStore((s) => s.removeSession);

  return useMutation({
    ...options,
    mutationFn: (sessionId: string) => UserService.revokeSession(sessionId),
    onSuccess: (...args) => {
      const [, sessionId] = args;
      removeSession(sessionId);
      queryClient.invalidateQueries({ queryKey: userKeys.sessions() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook revoking all other active user sessions.
 */
export function useRevokeOtherSessionsMutation(
  options?: UseMutationOptions<RevokeOtherSessionsResponse, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => UserService.revokeOtherSessions(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook scheduling account deletion.
 */
export function useScheduleDeletionMutation(
  options?: UseMutationOptions<ScheduleDeletionResponse, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => UserService.scheduleAccountDeletion(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook canceling pending scheduled account deletion.
 */
export function useCancelDeletionMutation(
  options?: UseMutationOptions<CancelDeletionResponse, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => UserService.cancelAccountDeletion(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook requesting primary email change.
 */
export function useRequestEmailChangeMutation(
  options?: UseMutationOptions<RequestEmailChangeResponse, Error, string>
) {
  return useMutation({
    ...options,
    mutationFn: (newEmail: string) => UserService.requestEmailChange(newEmail),
  });
}

/* ------------------------------------------------------------------ */
/* Primary Unified useUser Hook                                       */
/* ------------------------------------------------------------------ */

/**
 * Primary user management hook integrating reactive state, TanStack Query mutations,
 * and toast-integrated runAction wrappers.
 */
export function useUser() {
  const queryClient = useQueryClient();
  const profile = useUserStore((s) => s.profile);
  const sessions = useUserStore((s) => s.sessions);
  const isUpdatingProfileStore = useUserStore((s) => s.isUpdatingProfile);
  const isUploadingAvatarStore = useUserStore((s) => s.isUploadingAvatar);
  const error = useUserStore((s) => s.error);

  const updateProfileMutation = useUpdateProfileMutation();
  const updateUsernameMutation = useUpdateUsernameMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();
  const revokeSessionMutation = useRevokeSessionMutation();
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();
  const scheduleDeletionMutation = useScheduleDeletionMutation();
  const cancelDeletionMutation = useCancelDeletionMutation();
  const requestEmailChangeMutation = useRequestEmailChangeMutation();

  /**
   * Updates user profile with toast feedback
   */
  const updateProfile = React.useCallback(
    async (dto: UpdateProfileDto, options?: RunActionOptions<User>) => {
      return runAction(
        async () => {
          return updateProfileMutation.mutateAsync(dto);
        },
        {
          loading: 'Updating profile…',
          success: 'Profile updated successfully!',
          ...options,
        }
      );
    },
    [updateProfileMutation]
  );

  /**
   * Updates public username with toast feedback
   */
  const updateUsername = React.useCallback(
    async (dto: UpdateUsernameDto, options?: RunActionOptions<User>) => {
      return runAction(
        async () => {
          return updateUsernameMutation.mutateAsync(dto);
        },
        {
          loading: 'Updating username…',
          success: 'Username updated successfully!',
          ...options,
        }
      );
    },
    [updateUsernameMutation]
  );

  /**
   * Uploads avatar with toast feedback
   */
  const uploadAvatar = React.useCallback(
    async (file: File | Blob, options?: RunActionOptions<User>) => {
      return runAction(
        async () => {
          return uploadAvatarMutation.mutateAsync(file);
        },
        {
          loading: 'Uploading avatar…',
          success: 'Avatar updated successfully!',
          ...options,
        }
      );
    },
    [uploadAvatarMutation]
  );

  /**
   * Deletes avatar with toast feedback
   */
  const deleteAvatar = React.useCallback(
    async (options?: RunActionOptions<User>) => {
      return runAction(
        async () => {
          return deleteAvatarMutation.mutateAsync();
        },
        {
          loading: 'Removing avatar…',
          success: 'Avatar removed successfully!',
          ...options,
        }
      );
    },
    [deleteAvatarMutation]
  );

  /**
   * Revokes a session with toast feedback
   */
  const revokeSession = React.useCallback(
    async (sessionId: string, options?: RunActionOptions<RevokeSessionResponse>) => {
      return runAction(
        async () => {
          return revokeSessionMutation.mutateAsync(sessionId);
        },
        {
          loading: 'Revoking session…',
          success: 'Session terminated',
          ...options,
        }
      );
    },
    [revokeSessionMutation]
  );

  /**
   * Revokes all other sessions with toast feedback
   */
  const revokeOtherSessions = React.useCallback(
    async (options?: RunActionOptions<RevokeOtherSessionsResponse>) => {
      return runAction(
        async () => {
          return revokeOtherSessionsMutation.mutateAsync();
        },
        {
          loading: 'Revoking other sessions…',
          success: 'All other sessions have been terminated',
          ...options,
        }
      );
    },
    [revokeOtherSessionsMutation]
  );

  /**
   * Schedules account deletion with toast feedback
   */
  const scheduleAccountDeletion = React.useCallback(
    async (options?: RunActionOptions<ScheduleDeletionResponse>) => {
      return runAction(
        async () => {
          return scheduleDeletionMutation.mutateAsync();
        },
        {
          loading: 'Scheduling deletion…',
          success: 'Account scheduled for deletion with 14-day grace period',
          ...options,
        }
      );
    },
    [scheduleDeletionMutation]
  );

  /**
   * Cancels pending scheduled account deletion with toast feedback
   */
  const cancelAccountDeletion = React.useCallback(
    async (options?: RunActionOptions<CancelDeletionResponse>) => {
      return runAction(
        async () => {
          return cancelDeletionMutation.mutateAsync();
        },
        {
          loading: 'Cancelling deletion…',
          success: 'Account deletion cancelled. Your account is fully restored.',
          ...options,
        }
      );
    },
    [cancelDeletionMutation]
  );

  /**
   * Requests email change with verification link
   */
  const requestEmailChange = React.useCallback(
    async (newEmail: string, options?: RunActionOptions<RequestEmailChangeResponse>) => {
      return runAction(
        async () => {
          return requestEmailChangeMutation.mutateAsync(newEmail);
        },
        {
          loading: 'Sending verification email…',
          success: 'Verification link sent to new email address',
          ...options,
        }
      );
    },
    [requestEmailChangeMutation]
  );

  /**
   * Manually refetches user profile from API
   */
  const refetchProfile = React.useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: userKeys.me(),
      queryFn: () => UserService.getMe(),
    });
  }, [queryClient]);

  /**
   * Manually refetches active sessions from API
   */
  const refetchSessions = React.useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: userKeys.sessions(),
      queryFn: () => UserService.getSessions(),
    });
  }, [queryClient]);

  return {
    // State
    profile,
    sessions,
    isLoading:
      updateProfileMutation.isPending ||
      updateUsernameMutation.isPending ||
      uploadAvatarMutation.isPending ||
      deleteAvatarMutation.isPending,
    isUpdatingProfile: isUpdatingProfileStore || updateProfileMutation.isPending,
    isUploadingAvatar: isUploadingAvatarStore || uploadAvatarMutation.isPending,
    error,

    // High-level Actions with Toasts
    updateProfile,
    updateUsername,
    uploadAvatar,
    deleteAvatar,
    revokeSession,
    revokeOtherSessions,
    scheduleAccountDeletion,
    cancelAccountDeletion,
    requestEmailChange,
    refetchProfile,
    refetchSessions,

    // Raw Mutations
    updateProfileMutation,
    updateUsernameMutation,
    uploadAvatarMutation,
    deleteAvatarMutation,
    revokeSessionMutation,
    revokeOtherSessionsMutation,
    scheduleDeletionMutation,
    cancelDeletionMutation,
    requestEmailChangeMutation,

    // Status indicators
    isUpdating: updateProfileMutation.isPending,
    isChangingUsername: updateUsernameMutation.isPending,
    isRevokingSession: revokeSessionMutation.isPending,
    isRevokingOthers: revokeOtherSessionsMutation.isPending,
  };
}
