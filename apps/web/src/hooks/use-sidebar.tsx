'use client';

import { useEffect } from 'react';
import { useSidebarStore } from '@/stores/sidebar-store';

export const SIDEBAR_WIDTH = {
  expanded: 256,
  collapsed: 80,
  mobile: 280,
} as const;

export interface UseSidebarOptions {
  /**
   * Enable keyboard shortcut (Cmd+B / Ctrl+B) to toggle the sidebar.
   * Automatically ignores keypresses when focus is inside text inputs.
   * Defaults to true.
   */
  enableKeyboardShortcut?: boolean;
  /**
   * Automatically synchronize `--sidebar-w` CSS custom property on the documentElement.
   * Defaults to true.
   */
  syncCssVariable?: boolean;
}

/**
 * High-level hook for controlling and subscribing to the Kalya sidebar state.
 * Supports desktop collapse, mobile slideout drawer, CSS variable synchronization,
 * and standard Cmd+B / Ctrl+B keyboard shortcuts.
 */
export const useSidebar = (options: UseSidebarOptions = {}) => {
  const { enableKeyboardShortcut = true, syncCssVariable = true } = options;

  const collapsed = useSidebarStore((s) => s.collapsed);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const isHydrated = useSidebarStore((s) => s.isHydrated);

  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);
  const expandSidebar = useSidebarStore((s) => s.expandSidebar);
  const collapseSidebar = useSidebarStore((s) => s.collapseSidebar);

  const toggleMobileSidebar = useSidebarStore((s) => s.toggleMobileSidebar);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);
  const openMobileSidebar = useSidebarStore((s) => s.openMobileSidebar);
  const closeMobileSidebar = useSidebarStore((s) => s.closeMobileSidebar);

  // -------------------------------------------------------------------------
  // 1. CSS Custom Property Synchronization
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!syncCssVariable || typeof document === 'undefined') return;

    const width = collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;
    document.documentElement.style.setProperty('--sidebar-w', `${width}px`);
  }, [collapsed, syncCssVariable]);

  // -------------------------------------------------------------------------
  // 2. Global Keyboard Shortcut: Mod+B (Cmd+B or Ctrl+B)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!enableKeyboardShortcut || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when active in text controls or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcut, toggleSidebar]);

  return {
    // State
    collapsed,
    mobileOpen,
    isHydrated,
    sidebarWidth: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,

    // Desktop Actions
    toggleSidebar,
    setCollapsed,
    expandSidebar,
    collapseSidebar,

    // Mobile Actions
    toggleMobileSidebar,
    setMobileOpen,
    openMobileSidebar,
    closeMobileSidebar,
  };
};

export default useSidebar;
