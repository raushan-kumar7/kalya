import { create } from 'zustand';

/** Supported primary tab navigation route identifiers */
export type TabRoute = 'index' | 'history' | 'budgets' | 'splits' | 'portfolio';

/** Supported quick financial action workflow types */
export type QuickActionType = 'expense' | 'income' | 'split' | 'transfer' | 'scan';

export interface TabState {
  /** Identifier of the currently focused tab screen */
  activeTab: TabRoute;
  /** Whether the global floating action button is currently visible */
  isFabVisible: boolean;
  /** Whether the quick actions bottom sheet modal is open */
  isQuickActionsOpen: boolean;
  /** Per-screen override callback for the FAB press. Null defaults to opening Quick Actions */
  fabHandler: (() => void) | null;
  /** Whether the bottom tab navigation bar is currently rendered */
  isTabBarVisible: boolean;
  /** Key-value dictionary of numeric badge indicators per tab route */
  badges: Partial<Record<TabRoute, number>>;
  /** The specific quick action currently being executed or configured */
  activeQuickAction: QuickActionType | null;
}

export interface TabActions {
  /**
   * Sets the currently active tab route identifier.
   *
   * @description Updates active tab state if different from current to prevent redundant renders.
   * @param {TabRoute} tab - Target tab route identifier.
   * @returns {void}
   */
  setActiveTab: (tab: TabRoute) => void;

  /**
   * Sets the global Floating Action Button (FAB) visibility state.
   *
   * @description Skips state notification if the requested state matches the current state.
   * High-frequency scroll handlers call this continuously.
   * @param {boolean} visible - True to reveal FAB, false to conceal.
   * @returns {void}
   */
  setFabVisible: (visible: boolean) => void;

  /**
   * Inverts the current visibility state of the Floating Action Button.
   *
   * @description Toggles between true and false.
   * @returns {void}
   */
  toggleFab: () => void;

  /**
   * Opens the luxury quick financial actions bottom sheet.
   *
   * @description Sets isQuickActionsOpen to true.
   * @returns {void}
   */
  openQuickActions: () => void;

  /**
   * Closes the quick financial actions bottom sheet.
   *
   * @description Sets isQuickActionsOpen to false and resets active quick action.
   * @returns {void}
   */
  closeQuickActions: () => void;

  /**
   * Attaches a contextual press handler override to the global FAB.
   *
   * @description Overrides the default quick actions menu with a screen-specific action.
   * @param {(() => void) | null} handler - Custom callback function or null to reset.
   * @returns {void}
   */
  setFabHandler: (handler: (() => void) | null) => void;

  /**
   * Clears any active contextual FAB press handler override.
   *
   * @description Restores default behavior of opening the quick actions bottom sheet.
   * @returns {void}
   */
  clearFabHandler: () => void;

  /**
   * Controls the visibility of the primary bottom tab bar.
   *
   * @description Can be hidden when presenting full-screen overlays, modals, or camera capture.
   * @param {boolean} visible - True to display tab bar, false to hide.
   * @returns {void}
   */
  setTabBarVisible: (visible: boolean) => void;

  /**
   * Sets or updates a numeric badge counter for a specific tab route.
   *
   * @description Displays badge over the tab icon (e.g. pending splits or unread alerts).
   * @param {TabRoute} tab - Target tab route.
   * @param {number} [count] - Positive integer count or undefined to clear.
   * @returns {void}
   */
  setTabBadge: (tab: TabRoute, count?: number) => void;

  /**
   * Clears the badge counter for a specific tab route.
   *
   * @description Removes the badge indicator from the tab.
   * @param {TabRoute} tab - Target tab route to clear.
   * @returns {void}
   */
  clearTabBadge: (tab: TabRoute) => void;

  /**
   * Clears badge counters across all tab routes simultaneously.
   *
   * @description Resets the badges dictionary to empty.
   * @returns {void}
   */
  clearAllBadges: () => void;

  /**
   * Sets the active quick action workflow type.
   *
   * @description Tracks whether the user is executing an expense, income, transfer, or split.
   * @param {QuickActionType | null} action - Target action type or null to reset.
   * @returns {void}
   */
  setActiveQuickAction: (action: QuickActionType | null) => void;

  /**
   * Resets all tab navigation and FAB state back to initial defaults.
   *
   * @description Restores INITIAL_STATE values.
   * @returns {void}
   */
  reset: () => void;
}

export type TabStore = TabState & TabActions;

const INITIAL_STATE: TabState = {
  activeTab: 'index',
  isFabVisible: true,
  isQuickActionsOpen: false,
  fabHandler: null,
  isTabBarVisible: true,
  badges: {},
  activeQuickAction: null,
};

/**
 * Global Tab Navigation & Action Store
 *
 * @description Coordinates bottom navigation state, persistent Floating Action Button (FAB) visibility,
 * contextual action overrides, and the quick actions bottom sheet across all tab routes.
 */
export const useTabStore = create<TabStore>()((set) => ({
  ...INITIAL_STATE,

  setActiveTab: (activeTab) => set((s) => (s.activeTab === activeTab ? s : { activeTab })),

  // Returning the same state object skips notifying subscribers (scroll fires this a lot).
  setFabVisible: (visible) =>
    set((s) => (s.isFabVisible === visible ? s : { isFabVisible: visible })),

  toggleFab: () => set((s) => ({ isFabVisible: !s.isFabVisible })),

  openQuickActions: () => set({ isQuickActionsOpen: true }),

  closeQuickActions: () => set({ isQuickActionsOpen: false, activeQuickAction: null }),

  setFabHandler: (fabHandler) => set({ fabHandler }),

  clearFabHandler: () => set({ fabHandler: null }),

  setTabBarVisible: (visible) =>
    set((s) => (s.isTabBarVisible === visible ? s : { isTabBarVisible: visible })),

  setTabBadge: (tab, count) =>
    set((s) => ({
      badges: {
        ...s.badges,
        [tab]: count !== undefined && count > 0 ? count : undefined,
      },
    })),

  clearTabBadge: (tab) =>
    set((s) => {
      const nextBadges = { ...s.badges };
      delete nextBadges[tab];
      return { badges: nextBadges };
    }),

  clearAllBadges: () => set({ badges: {} }),

  setActiveQuickAction: (activeQuickAction) => set({ activeQuickAction }),

  reset: () => set({ ...INITIAL_STATE }),
}));

/**
 * Alias for useTabStore maintaining backward compatibility with previous iterations.
 */
export const useTabActionStore = useTabStore;

/* ------------------------------------------------------------------ */
/* Granular Selectors                                                  */
/* ------------------------------------------------------------------ */

/**
 * Hook selector returning whether the global FAB is currently visible.
 *
 * @description Subscribes only to FAB visibility changes.
 * @returns {boolean} True if FAB is visible.
 */
export const useIsFabVisible = (): boolean => useTabStore((s) => s.isFabVisible);

/**
 * Hook selector returning whether the quick actions modal is open.
 *
 * @description Subscribes only to modal open state.
 * @returns {boolean} True if quick actions sheet is open.
 */
export const useIsQuickActionsOpen = (): boolean => useTabStore((s) => s.isQuickActionsOpen);

/**
 * Hook selector returning the current contextual FAB press handler.
 *
 * @description Subscribes only to custom handler changes.
 * @returns {(() => void) | null} Handler callback or null for default behavior.
 */
export const useFabHandler = (): (() => void) | null => useTabStore((s) => s.fabHandler);

/**
 * Hook selector returning the currently active tab route identifier.
 *
 * @description Subscribes only to active tab route changes.
 * @returns {TabRoute} Active route identifier.
 */
export const useActiveTab = (): TabRoute => useTabStore((s) => s.activeTab);

/**
 * Hook selector returning whether the bottom tab bar is visible.
 *
 * @description Subscribes only to tab bar visibility changes.
 * @returns {boolean} True if tab bar is visible.
 */
export const useIsTabBarVisible = (): boolean => useTabStore((s) => s.isTabBarVisible);

/**
 * Hook selector returning the complete dictionary of tab badges.
 *
 * @description Subscribes only to badge count updates.
 * @returns {Partial<Record<TabRoute, number>>} Badge counts map.
 */
export const useTabBadges = (): Partial<Record<TabRoute, number>> => useTabStore((s) => s.badges);

/**
 * Hook selector returning the badge count for a specific tab route.
 *
 * @description Subscribes only to badge count changes for the specified route.
 * @param {TabRoute} tab - Target tab route.
 * @returns {number | undefined} Badge count or undefined if none.
 */
export const useTabBadge = (tab: TabRoute): number | undefined => useTabStore((s) => s.badges[tab]);

/**
 * Hook selector returning the current active quick action type.
 *
 * @description Subscribes only to active quick action changes.
 * @returns {QuickActionType | null} Active action type or null.
 */
export const useActiveQuickAction = (): QuickActionType | null =>
  useTabStore((s) => s.activeQuickAction);
