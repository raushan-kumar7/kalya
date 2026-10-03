import { create } from 'zustand';
import type { Session, User } from '@kalya/types';

export interface UserState {
  /** Detailed user profile */
  profile: User | null;
  /** Active concurrent sessions */
  sessions: Session[];
  /** Directory of platform users */
  users: User[];
  /** General user operation loading status */
  isLoading: boolean;
  /** Specific profile update loading state */
  isUpdatingProfile: boolean;
  /** Avatar upload loading state */
  isUploadingAvatar: boolean;
  /** Last encountered error message */
  error: string | null;
}

export interface UserActions {
  /** Sets the current user profile */
  setProfile: (profile: User | null) => void;
  /** Performs partial in-memory update to user profile state */
  updateProfileState: (partial: Partial<User>) => void;
  /** Replaces list of active user sessions */
  setSessions: (sessions: Session[]) => void;
  /** Removes a session from the in-memory list */
  removeSession: (sessionId: string) => void;
  /** Replaces list of platform users */
  setUsers: (users: User[]) => void;
  /** Sets general loading state */
  setLoading: (isLoading: boolean) => void;
  /** Sets profile updating state */
  setIsUpdatingProfile: (isUpdating: boolean) => void;
  /** Sets avatar uploading state */
  setIsUploadingAvatar: (isUploading: boolean) => void;
  /** Sets error message */
  setError: (error: string | null) => void;
  /** Resets user store back to initial values */
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

  setProfile: (profile) =>
    set({
      profile,
      error: null,
    }),

  updateProfileState: (partial) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    })),

  setSessions: (sessions) =>
    set({
      sessions,
      error: null,
    }),

  removeSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    })),

  setUsers: (users) =>
    set({
      users,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setIsUpdatingProfile: (isUpdatingProfile) => set({ isUpdatingProfile }),

  setIsUploadingAvatar: (isUploadingAvatar) => set({ isUploadingAvatar }),

  setError: (error) => set({ error }),

  reset: () => set(INITIAL_STATE),
}));

/* ------------------------------------------------------------------ */
/* Selectors                                                          */
/* ------------------------------------------------------------------ */

export const useUserProfile = () => useUserStore((s) => s.profile);
export const useUserSessions = () => useUserStore((s) => s.sessions);
export const useUsers = () => useUserStore((s) => s.users);
export const useUserLoading = () => useUserStore((s) => s.isLoading);
export const useUserUpdatingProfile = () => useUserStore((s) => s.isUpdatingProfile);
export const useUserUploadingAvatar = () => useUserStore((s) => s.isUploadingAvatar);
export const useUserError = () => useUserStore((s) => s.error);
