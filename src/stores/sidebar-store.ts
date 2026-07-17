import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  collapsed: boolean;
}

interface Actions {
  toggleSidebar: () => void;
  setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<State & Actions>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (value) => set({ collapsed: value }),
    }),
    {
      name: "kalya-sidebar",
      skipHydration: true,
    }
  )
);
