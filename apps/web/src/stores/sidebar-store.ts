import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface SidebarState {
  /** Whether the desktop sidebar rail is collapsed (80px) or expanded (256px) */
  collapsed: boolean;
  /** Whether the mobile slideout navigation drawer is currently open */
  mobileOpen: boolean;
  /** Whether the persisted store state has finished client-side hydration */
  isHydrated: boolean;
}

export interface SidebarActions {
  /** Toggle desktop sidebar collapsed state */
  toggleSidebar: () => void;
  /** Explicitly set desktop sidebar collapsed state */
  setCollapsed: (collapsed: boolean) => void;
  /** Expand the desktop sidebar to full width */
  expandSidebar: () => void;
  /** Collapse the desktop sidebar to an icon rail */
  collapseSidebar: () => void;
  /** Toggle mobile slideout drawer */
  toggleMobileSidebar: () => void;
  /** Explicitly set mobile slideout drawer state */
  setMobileOpen: (open: boolean) => void;
  /** Open mobile drawer */
  openMobileSidebar: () => void;
  /** Close mobile drawer */
  closeMobileSidebar: () => void;
  /** Mark store hydration complete */
  setHydrated: (isHydrated: boolean) => void;
  /** Reset sidebar state to initial defaults */
  reset: () => void;
}

export type SidebarStore = SidebarState & SidebarActions;

// ---------------------------------------------------------------------------
// INITIAL STATE
// ---------------------------------------------------------------------------

const INITIAL_STATE: SidebarState = {
  collapsed: false,
  mobileOpen: false,
  isHydrated: false,
};

// ---------------------------------------------------------------------------
// STORE
// ---------------------------------------------------------------------------

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      toggleSidebar: () =>
        set((state) => ({
          collapsed: !state.collapsed,
        })),

      setCollapsed: (collapsed: boolean) =>
        set(() => ({
          collapsed,
        })),

      expandSidebar: () =>
        set(() => ({
          collapsed: false,
        })),

      collapseSidebar: () =>
        set(() => ({
          collapsed: true,
        })),

      toggleMobileSidebar: () =>
        set((state) => ({
          mobileOpen: !state.mobileOpen,
        })),

      setMobileOpen: (mobileOpen: boolean) =>
        set(() => ({
          mobileOpen,
        })),

      openMobileSidebar: () =>
        set(() => ({
          mobileOpen: true,
        })),

      closeMobileSidebar: () =>
        set(() => ({
          mobileOpen: false,
        })),

      setHydrated: (isHydrated: boolean) =>
        set(() => ({
          isHydrated,
        })),

      reset: () =>
        set(() => ({
          ...INITIAL_STATE,
        })),
    }),
    {
      name: 'kalya-sidebar-store',
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      // Only persist user's layout preference (collapsed); never persist mobileOpen drawer
      partialize: (state) => ({
        collapsed: state.collapsed,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
