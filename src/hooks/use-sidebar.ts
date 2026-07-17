"use client";

import { useSidebarStore } from "@/stores";

/**
 * Thin selector wrapper around useSidebarStore.
 *
 * Kept separate from stores/ so components can depend on @/hooks for
 * behavior-oriented APIs without reaching into @/stores directly —
 * also gives us a single seam to swap/extend later without touching
 * every consumer.
 *
 * NOTE: only selects `collapsed` + actions, not the whole state object,
 * so consumers don't re-render on unrelated store changes.
 */
export function useSidebar() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);

  return { collapsed, toggleSidebar, setCollapsed };
}
