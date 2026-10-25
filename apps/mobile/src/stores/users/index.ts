import { create } from 'zustand';
import type { Session, User } from '@kalya/types';

export interface UserState {
  /** Detailed user profile */
  profile: User | null;
  /** Active concurrent sessions across devices */
  sessions: Session[];
  /** Directory of platform users */
  users: User[];
  /** General operation loading flag */
  isLoading: boolean;
  /** Profile update loading state */
  isUpdatingProfile: boolean;
  /** Avatar upload loading state */
  isUploadingAvatar: boolean;
  /** Last encountered error message */
  error: string | null;
}

export interface UserActions {
  /**
   * Sets the current user profile in the user store.
   *
   * @description Overwrites in-memory profile and clears active errors.
   * @param {User | null} profile - The user entity or null to clear.
   * @returns {void}
   */
  setProfile: (profile: User | null) => void;

  /**
   * Updates partial fields on the user profile in state.
   *
   * @description Merges partial updates without replacing the entire user object.
   * @param {Partial<User>} partial - Object containing fields to update.
   * @returns {void}
   */
  updateProfileState: (partial: Partial<User>) => void;

  /**
   * Replaces the list of active user sessions across devices.
   *
   * @description Overwrites the current active sessions array.
   * @param {Session[]} sessions - Array of session objects.
   * @returns {void}
   */
  setSessions: (sessions: Session[]) => void;

  /**
   * Removes a single session from the in-memory sessions list by ID.
   *
   * @description Filters out the revoked session without refetching from the server.
   * @param {string} sessionId - ID of the session to remove.
   * @returns {void}
   */
  removeSession: (sessionId: string) => void;

  /**
   * Replaces the platform users directory cache.
   *
   * @description Updates list of users retrieved via search or pagination.
   * @param {User[]} users - Array of platform user profiles.
   * @returns {void}
   */
  setUsers: (users: User[]) => void;

  /**
   * Sets the general loading state flag.
   *
   * @description Indicates whether a background user data operation is active.
   * @param {boolean} isLoading - Loading state boolean.
   * @returns {void}
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Sets the profile update operation loading state flag.
   *
   * @description Indicates whether a profile update mutation is in flight.
   * @param {boolean} isUpdating - Updating state boolean.
   * @returns {void}
   */
  setIsUpdatingProfile: (isUpdating: boolean) => void;

  /**
   * Sets the avatar upload operation loading state flag.
   *
   * @description Indicates whether a multipart avatar image upload is active.
   * @param {boolean} isUploading - Uploading state boolean.
   * @returns {void}
   */
  setIsUploadingAvatar: (isUploading: boolean) => void;

  /**
   * Sets or clears the active error message.
   *
   * @description Records the last error string or null to reset.
   * @param {string | null} error - Error message string or null.
   * @returns {void}
   */
  setError: (error: string | null) => void;

  /**
   * Resets the user store back to its initial empty state.
   *
   * @description Reverts all fields back to default initial values.
   * @returns {void}
   */
  reset: () => void;
}

export type UserStore = UserState & UserActions;

const INITIAL_STATE: UserState = {
  profile: null,
  sessions: [],
  users: [],
  isLoading: false,
  isUpdatingProfile: false,
  isUploadingAvatar: false,
  error: null,
};

export const useUserStore = create<UserStore>()((set) => ({
  ...INITIAL_STATE,

  setProfile: (profile) => set({ profile, error: null }),

  updateProfileState: (partial) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    })),

  setSessions: (sessions) => set({ sessions, error: null }),

  removeSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    })),

  setUsers: (users) => set({ users, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setIsUpdatingProfile: (isUpdatingProfile) => set({ isUpdatingProfile }),
  setIsUploadingAvatar: (isUploadingAvatar) => set({ isUploadingAvatar }),
  setError: (error) => set({ error }),
  reset: () => set(INITIAL_STATE),
}));

/* ------------------------------------------------------------------ */
/* Granular Selectors                                                  */
/* ------------------------------------------------------------------ */

/**
 * Hook selector returning the detailed user profile.
 *
 * @description Subscribes only to changes in the current user's profile state.
 * @returns {User | null} Current user profile or null if not yet loaded.
 */
export const useUserProfile = (): User | null => useUserStore((s) => s.profile);

/**
 * Hook selector returning the array of active device sessions.
 *
 * @description Subscribes only to sessions list changes.
 * @returns {Session[]} Array of active session records.
 */
export const useUserSessions = (): Session[] => useUserStore((s) => s.sessions);

/**
 * Hook selector returning the cached directory of platform users.
 *
 * @description Subscribes only to platform users list changes.
 * @returns {User[]} Array of cached platform users.
 */
export const useUsers = (): User[] => useUserStore((s) => s.users);

/**
 * Hook selector returning the general loading state flag.
 *
 * @description Indicates whether a background user query is in progress.
 * @returns {boolean} True if loading.
 */
export const useUserLoading = (): boolean => useUserStore((s) => s.isLoading);

/**
 * Hook selector returning the profile update loading state flag.
 *
 * @description Indicates whether a profile update mutation is in progress.
 * @returns {boolean} True if updating profile.
 */
export const useUserUpdatingProfile = (): boolean => useUserStore((s) => s.isUpdatingProfile);

/**
 * Hook selector returning the avatar upload loading state flag.
 *
 * @description Indicates whether an avatar upload mutation is in progress.
 * @returns {boolean} True if uploading avatar.
 */
export const useUserUploadingAvatar = (): boolean => useUserStore((s) => s.isUploadingAvatar);

/**
 * Hook selector returning the last recorded user operation error message.
 *
 * @description Returns the error string or null if none exists.
 * @returns {string | null} Last error message.
 */
export const useUserError = (): string | null => useUserStore((s) => s.error);
