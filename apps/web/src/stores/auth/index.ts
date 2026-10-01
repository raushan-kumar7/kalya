import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session, User } from '@kalya/types';

export interface AuthState {
  /** Authenticated user profile */
  user: User | null;
  /** Active session metadata */
  session: Session | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether an auth operation or initial check is in flight */
  isLoading: boolean;
  /** Whether the store has completed initial hydration */
  isInitialized: boolean;
  /** Any last encountered auth error message */
  error: string | null;
}

export interface AuthActions {
  /** Sets the current authenticated user */
  setUser: (user: User | null) => void;
  /** Sets the active session */
  setSession: (session: Session | null) => void;
  /** Concurrently updates user and session upon login/signup */
  setAuth: (user: User, session: Session) => void;
  /** Updates partial fields on the current user profile in state */
  updateUser: (partial: Partial<User>) => void;
  /** Resets state to unauthenticated */
  clearAuth: () => void;
  /** Sets loading state */
  setLoading: (isLoading: boolean) => void;
  /** Sets initialization state */
  setInitialized: (isInitialized: boolean) => void;
  /** Sets error message */
  setError: (error: string | null) => void;
  /** Full reset back to initial state */
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;

const INITIAL_STATE: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(user && state.session),
          error: null,
        })),

      setSession: (session) =>
        set((state) => ({
          session,
          isAuthenticated: Boolean(state.user && session),
          error: null,
        })),

      setAuth: (user, session) =>
        set({
          user,
          session,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      clearAuth: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      setError: (error) => set({ error }),

      reset: () =>
        set({
          ...INITIAL_STATE,
          isLoading: false,
          isInitialized: true,
        }),
    }),
    {
      name: 'kalya-auth-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitialized(true);
          state.setLoading(false);
        }
      },
    }
  )
);

/* ------------------------------------------------------------------ */
/* Granular Selectors                                                  */
/* ------------------------------------------------------------------ */

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useCurrentSession = () => useAuthStore((state) => state.session);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);
export const useAuthError = () => useAuthStore((state) => state.error);
