import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@kalya/types';

export interface AuthState {
  /** Authenticated user profile */
  user: User | null;
  /** Active session metadata */
  session: Session | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether an auth operation is in flight */
  isLoading: boolean;
  /** Whether the store has completed initial hydration from AsyncStorage */
  isInitialized: boolean;
  /** Any last encountered auth error message */
  error: string | null;

  // ---- Multi-step Authentication Flow State ----
  /** Email currently undergoing OTP verification or password recovery */
  pendingEmail: string | null;

  // ---- Biometric Authentication State ----
  /** Whether the hardware supports biometrics (Face ID / Fingerprint) */
  isBiometricSupported: boolean;
  /** Whether user has enrolled biometrics in device settings */
  isBiometricEnrolled: boolean;
  /** Whether user has opted-in to biometric unlock for this app */
  isBiometricEnabled: boolean;
}

export interface AuthActions {
  /**
   * Sets the current user profile in the auth store.
   *
   * @description Updates profile and recalculates isAuthenticated status based on presence of active session.
   * @param {User | null} user - The user entity or null to clear.
   * @returns {void}
   */
  setUser: (user: User | null) => void;

  /**
   * Sets the active session metadata in the auth store.
   *
   * @description Updates session and recalculates isAuthenticated status based on presence of active user.
   * @param {Session | null} session - The session entity or null to clear.
   * @returns {void}
   */
  setSession: (session: Session | null) => void;

  /**
   * Concurrently updates user profile and session upon successful login or sign-up.
   *
   * @description Sets user, session, flips isAuthenticated to true, stops loading, and clears any error.
   * @param {User} user - Authenticated user profile entity.
   * @param {Session} session - Active session metadata entity.
   * @returns {void}
   */
  setAuth: (user: User, session: Session) => void;

  /**
   * Performs partial in-memory updates on the current user profile.
   *
   * @description Merges partial fields into the existing user entity without full overwrite.
   * @param {Partial<User>} partial - Object containing fields to update.
   * @returns {void}
   */
  updateUser: (partial: Partial<User>) => void;

  /**
   * Resets the store to an unauthenticated state.
   *
   * @description Clears user, session, and flips isAuthenticated to false while preserving initialization state.
   * @returns {void}
   */
  clearAuth: () => void;

  /**
   * Updates the global authentication loading state flag.
   *
   * @description Indicates whether a background auth check or mutation is in flight.
   * @param {boolean} isLoading - Loading state boolean.
   * @returns {void}
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Sets the store's hydration initialization status flag.
   *
   * @description Indicates that persistent storage hydration from AsyncStorage has completed.
   * @param {boolean} isInitialized - Initialization state boolean.
   * @returns {void}
   */
  setInitialized: (isInitialized: boolean) => void;

  /**
   * Sets or clears the active error message.
   *
   * @description Records the last encountered error string or null to reset.
   * @param {string | null} error - Error message string or null.
   * @returns {void}
   */
  setError: (error: string | null) => void;

  // ---- Multi-step Authentication Flow Actions ----

  /**
   * Sets the email currently undergoing OTP verification or password recovery.
   *
   * @description Kept in memory only (not persisted) so it survives screen navigation but not an app restart.
   * @param {string | null} email - Email address or null to clear.
   * @returns {void}
   */
  setPendingEmail: (email: string | null) => void;

  // ---- Biometric Actions ----

  /**
   * Sets the hardware biometric capability flag.
   *
   * @description Records whether the current device possesses biometric sensors.
   * @param {boolean} supported - True if hardware is supported.
   * @returns {void}
   */
  setBiometricSupported: (supported: boolean) => void;

  /**
   * Sets the biometric enrollment status flag.
   *
   * @description Records whether user has registered fingerprints/faces in OS settings.
   * @param {boolean} enrolled - True if credentials are enrolled.
   * @returns {void}
   */
  setBiometricEnrolled: (enrolled: boolean) => void;

  /**
   * Sets the user's preference for biometric app unlock.
   *
   * @description Persisted across app restarts to allow quick unlock.
   * @param {boolean} enabled - True if user opted into biometric unlock.
   * @returns {void}
   */
  setBiometricEnabled: (enabled: boolean) => void;

  /**
   * Performs complete reset of the auth store back to initial unauthenticated values.
   *
   * @description Reverts all fields to default states while maintaining initialization.
   * @returns {void}
   */
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
  pendingEmail: null,
  isBiometricSupported: false,
  isBiometricEnrolled: false,
  isBiometricEnabled: false,
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
          pendingEmail: null,
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

      setPendingEmail: (pendingEmail) => set({ pendingEmail }),

      setBiometricSupported: (isBiometricSupported) => set({ isBiometricSupported }),
      setBiometricEnrolled: (isBiometricEnrolled) => set({ isBiometricEnrolled }),
      setBiometricEnabled: (isBiometricEnabled) => set({ isBiometricEnabled }),

      reset: () =>
        set({
          ...INITIAL_STATE,
          isLoading: false,
          isInitialized: true,
        }),
    }),
    {
      name: 'kalya-mobile-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        isBiometricEnabled: state.isBiometricEnabled,
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

/**
 * Hook selector returning the authenticated user profile entity.
 *
 * @description Subscribes only to changes in the current user state to prevent extra renders.
 * @returns {User | null} Current user profile or null if unauthenticated.
 */
export const useCurrentUser = (): User | null => useAuthStore((s) => s.user);

/**
 * Hook selector returning the active session metadata.
 *
 * @description Subscribes only to session changes.
 * @returns {Session | null} Active session or null.
 */
export const useCurrentSession = (): Session | null => useAuthStore((s) => s.session);

/**
 * Hook selector returning whether the user is fully authenticated.
 *
 * @description Returns true if both user and session are present in state.
 * @returns {boolean} True if authenticated, false otherwise.
 */
export const useIsAuthenticated = (): boolean => useAuthStore((s) => s.isAuthenticated);

/**
 * Hook selector returning the global auth loading flag.
 *
 * @description Indicates if an authentication operation or hydration is in progress.
 * @returns {boolean} True if loading.
 */
export const useAuthLoading = (): boolean => useAuthStore((s) => s.isLoading);

/**
 * Hook selector returning whether the auth store has finished initial storage hydration.
 *
 * @description Used to hold splash screen until storage hydration completes.
 * @returns {boolean} True when initialized.
 */
export const useAuthInitialized = (): boolean => useAuthStore((s) => s.isInitialized);

/**
 * Hook selector returning the last recorded authentication error message.
 *
 * @description Returns error string or null if none exists.
 * @returns {string | null} Last error message.
 */
export const useAuthError = (): string | null => useAuthStore((s) => s.error);

/**
 * Hook selector returning the email currently undergoing OTP verification or recovery.
 *
 * @description Returns the pending email or null if no multi-step flow is active.
 * @returns {string | null} Pending email address.
 */
export const usePendingEmail = (): string | null => useAuthStore((s) => s.pendingEmail);

/**
 * Hook selector returning whether device hardware supports biometrics.
 *
 * @description Queries biometric hardware availability flag.
 * @returns {boolean} True if supported.
 */
export const useIsBiometricSupported = (): boolean => useAuthStore((s) => s.isBiometricSupported);

/**
 * Hook selector returning whether user has enrolled biometrics in OS settings.
 *
 * @description Queries biometric enrollment flag.
 * @returns {boolean} True if enrolled.
 */
export const useIsBiometricEnrolled = (): boolean => useAuthStore((s) => s.isBiometricEnrolled);

/**
 * Hook selector returning whether user has opted into biometric unlock.
 *
 * @description Queries persistent biometric unlock preference.
 * @returns {boolean} True if enabled.
 */
export const useIsBiometricEnabled = (): boolean => useAuthStore((s) => s.isBiometricEnabled);
