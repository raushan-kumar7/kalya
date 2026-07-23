// import { UserSection } from "@/types/auth";
// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// interface State {
//   updating: Partial<Record<UserSection, boolean>>;
//   errors: Partial<Record<UserSection, string | null>>;
// }

// interface Actions {
//   setUpdating: (section: UserSection, value: boolean) => void;
//   setError: (section: UserSection, error: string | null) => void;
//   reset: (section?: UserSection) => void;
// }

// export const useUserStore = create<State & Actions>()(
//   persist(
//     (set) => ({
//       updating: {},
//       errors: {},

//       setUpdating: (section, value) =>
//         set((state) => ({ updating: { ...state.updating, [section]: value } })),

//       setError: (section, error) =>
//         set((state) => ({ errors: { ...state.errors, [section]: error } })),

//       reset: (section) =>
//         set((state) =>
//           section
//             ? {
//                 updating: { ...state.updating, [section]: false },
//                 errors: { ...state.errors, [section]: null },
//               }
//             : { updating: {}, errors: {} }
//         ),
//     }),
//     {
//       name: "kalya-user",
//       // Persist only errors, not `updating`. A save that was genuinely
//       // in-flight when the tab closed is never actually still in-flight
//       // after a reload — rehydrating `updating: true` would show a
//       // spinner that never resolves. Errors are fine to keep, since
//       // "your last save failed" is still true after a refresh.
//       partialize: (state) => ({ errors: state.errors }),
//       skipHydration: true,
//     }
//   )
// );

import { UserSection } from "@/types/auth";
import { create } from "zustand";

interface State {
  updating: Partial<Record<UserSection, boolean>>;
  errors: Partial<Record<UserSection, string | null>>;
}

interface Actions {
  setUpdating: (section: UserSection, value: boolean) => void;
  setError: (section: UserSection, error: string | null) => void;
  reset: (section?: UserSection) => void;
}

// No persist() here, unlike useAuthStore — this is just transient loading/
// error UI state for the settings forms, nothing worth surviving a reload.
export const useUserStore = create<State & Actions>()((set) => ({
  updating: {},
  errors: {},

  setUpdating: (section, value) =>
    set((state) => ({ updating: { ...state.updating, [section]: value } })),

  setError: (section, error) => set((state) => ({ errors: { ...state.errors, [section]: error } })),

  reset: (section) =>
    set((state) =>
      section
        ? {
            updating: { ...state.updating, [section]: false },
            errors: { ...state.errors, [section]: null },
          }
        : { updating: {}, errors: {} }
    ),
}));
