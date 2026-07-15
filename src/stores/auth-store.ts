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
  setSession: (user: User | null) => void;
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

      setSession: (user) => set({ user, isAuthenticated: Boolean(user) }),

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
