import { AuthSection, User } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  updating: Partial<Record<AuthSection, boolean>>;
  errors: Partial<Record<AuthSection, string | null>>;
}

interface Actions {
  /** Accepts either a value or an updater — the updater form lets callers
   *  (e.g. an avatar-upload mutation) patch the cached user without
   *  waiting for the next authClient.useSession() tick. */
  setSession: (user: User | null | ((prev: User | null) => User | null)) => void;
  setInitializing: (value: boolean) => void;
  setUpdating: (section: AuthSection, value: boolean) => void;
  setError: (section: AuthSection, error: string | null) => void;
  reset: (section?: AuthSection) => void;
  clearSession: () => void;
}

const INITIAL_STATE: State = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  updating: {},
  errors: {},
};

export const useAuthStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setSession: (user) =>
        set((state) => {
          const next = typeof user === "function" ? user(state.user) : user;
          return { user: next, isAuthenticated: Boolean(next) };
        }),

      setInitializing: (value) => set({ isInitializing: value }),

      setUpdating: (section, value) =>
        set((state) => ({ updating: { ...state.updating, [section]: value } })),

      setError: (section, error) =>
        set((state) => ({ errors: { ...state.errors, [section]: error } })),

      reset: (section) =>
        set((state) =>
          section
            ? {
                updating: { ...state.updating, [section]: false },
                errors: { ...state.errors, [section]: null },
              }
            : { updating: {}, errors: {} }
        ),

      clearSession: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "kalya-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const getAuthState = () => {
  return useAuthStore.getState();
};
