/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AppEventMap, appEvents, isHotkeyMatch, matchesKeySequence } from "@/utils/events";
import { RefObject, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ============================================================
   use-events.ts — centralised event hooks for the Kalya app
   ------------------------------------------------------------
   useEventListener   — base hook every other hook here builds on
   useKeyPress        — "is this key currently down"
   useHotkey          — "mod+k" style keyboard shortcuts
   useHotkeys         — register several combos/sequences at once
   useClickOutside    — dismiss menus/popovers/modals
   useWindowSize      — responsive layout without a resize observer
   useScrollPosition   — { x, y } scroll position (rAF-throttled)
   useOnlineStatus     — navigator.onLine, kept in sync
   usePageVisibility   — tab focused/backgrounded
   useMediaQuery       — matchMedia as a boolean
   useAppEvent         — subscribe to the app-wide EventBus
   ============================================================ */

type EventTarget = Window | Document | HTMLElement;

/**
 * Base hook: attaches any DOM event listener with a stable reference to the
 * latest handler (no stale closures, no listener re-registration on every
 * render), and cleans up automatically. SSR-safe — no-ops until mounted.
 */
export function useEventListener<
  K extends keyof WindowEventMap | keyof DocumentEventMap | keyof HTMLElementEventMap,
>(
  target: EventTarget | RefObject<HTMLElement | null> | null,
  eventName: K,
  handler: (event: any) => void,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const node = target && "current" in target ? target.current : target;
    if (!node) return;

    const listener = (event: Event) => savedHandler.current(event);
    node.addEventListener(eventName as string, listener, options);

    return () => node.removeEventListener(eventName as string, listener, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, eventName]);
}

/** True while `key` is held down. Useful for shift-click style modifiers. */
export function useKeyPress(key: string): boolean {
  const [pressed, setPressed] = useState(false);

  useEventListener(typeof window !== "undefined" ? window : null, "keydown", (e: KeyboardEvent) => {
    if (e.key === key) setPressed(true);
  });
  useEventListener(typeof window !== "undefined" ? window : null, "keyup", (e: KeyboardEvent) => {
    if (e.key === key) setPressed(false);
  });

  return pressed;
}

/**
 * Registers a global keyboard shortcut.
 * @example useHotkey("mod+k", () => setCommandPaletteOpen(true));
 */
export function useHotkey(combo: string, handler: (e: KeyboardEvent) => void, enabled = true) {
  useEventListener(typeof window !== "undefined" ? window : null, "keydown", (e: KeyboardEvent) => {
    if (!enabled) return;
    if (isHotkeyMatch(e, combo)) {
      e.preventDefault();
      handler(e);
    }
  });
}

/** How long a chorded sequence ("g s") stays "live" between keystrokes. */
const SEQUENCE_TIMEOUT_MS = 800;

/**
 * Registers several keyboard shortcuts from a single listener. Supports
 * simultaneous combos ("mod+k") and chorded sequences ("g s") typed one key
 * at a time. Ignores letter-only sequences while focus is in an input,
 * textarea, or select, so normal typing isn't hijacked.
 *
 * @example
 * useHotkeys({
 *   "mod+k": () => setPaletteOpen(true),
 *   "g s": () => setActive("sessions"),
 * });
 */
export function useHotkeys(map: Record<string, (e: KeyboardEvent) => void>, enabled = true) {
  const savedMap = useRef(map);
  useEffect(() => {
    savedMap.current = map;
  }, [map]);

  const buffer = useRef<{ key: string; time: number }[]>([]);

  useEventListener(typeof window !== "undefined" ? window : null, "keydown", (e: KeyboardEvent) => {
    if (!enabled) return;

    const target = e.target as HTMLElement | null;
    const isTyping = !!target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

    // 1. Simultaneous combos ("mod+k", "shift+/") take priority.
    for (const [combo, handler] of Object.entries(savedMap.current)) {
      if (combo.includes(" ")) continue; // sequences are handled below
      const isModified = combo.includes("mod") || combo.includes("ctrl") || combo.includes("meta");
      if (isTyping && !isModified) continue;
      if (isHotkeyMatch(e, combo)) {
        e.preventDefault();
        handler(e);
        return;
      }
    }

    if (isTyping) return;

    // 2. Chorded sequences ("g s"), tracked in a rolling, time-windowed buffer.
    const now = Date.now();
    buffer.current = [...buffer.current, { key: e.key.toLowerCase(), time: now }].filter(
      (entry) => now - entry.time < SEQUENCE_TIMEOUT_MS
    );
    const keys = buffer.current.map((entry) => entry.key);

    for (const [combo, handler] of Object.entries(savedMap.current)) {
      if (!combo.includes(" ")) continue;
      if (matchesKeySequence(keys, combo)) {
        e.preventDefault();
        buffer.current = [];
        handler(e);
        return;
      }
    }
  });
}

/** Fires `handler` on click/tap outside of `ref`. Ignores clicks on `ignoreRefs`. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  ignoreRefs: RefObject<HTMLElement | null>[] = []
) {
  const onPointerDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) return;
      if (ignoreRefs.some((r) => r.current?.contains(target))) return;
      handler(event);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handler]
  );

  useEventListener(typeof document !== "undefined" ? document : null, "mousedown", onPointerDown);
  useEventListener(typeof document !== "undefined" ? document : null, "touchstart", onPointerDown);
}

/* ------------------------------------------------------------------ */
/* External-store-backed hooks                                         */
/* ------------------------------------------------------------------ */
/* useWindowSize and useMediaQuery mirror a browser API into React      */
/* state. useSyncExternalStore is the correct primitive for this — it   */
/* subscribes to the external source and only re-renders in response to */
/* its "change" event, rather than calling setState synchronously in an */
/* effect body on mount (which causes an avoidable extra render pass    */
/* and, worse, a client/server value mismatch during hydration).        */
/* ------------------------------------------------------------------ */

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

let windowSizeSnapshot: { width: number; height: number } | null = null;

function getWindowSizeSnapshot() {
  if (
    !windowSizeSnapshot ||
    windowSizeSnapshot.width !== window.innerWidth ||
    windowSizeSnapshot.height !== window.innerHeight
  ) {
    windowSizeSnapshot = { width: window.innerWidth, height: window.innerHeight };
  }
  return windowSizeSnapshot;
}

function getWindowSizeServerSnapshot() {
  return null;
}

/** Viewport size, updated on resize. `null` until mounted (SSR-safe, no hydration flash). */
export function useWindowSize(): { width: number; height: number } | null {
  return useSyncExternalStore(
    subscribeToResize,
    getWindowSizeSnapshot,
    getWindowSizeServerSnapshot
  );
}

/** Current window scroll position, throttled to one update per animation frame. */
export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ticking = useRef(false);

  useEventListener(
    typeof window !== "undefined" ? window : null,
    "scroll",
    () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setPosition({ x: window.scrollX, y: window.scrollY });
        ticking.current = false;
      });
    },
    { passive: true }
  );

  return position;
}

/** Tracks navigator.onLine, kept in sync via the online/offline events. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEventListener(typeof window !== "undefined" ? window : null, "online", () => setOnline(true));
  useEventListener(typeof window !== "undefined" ? window : null, "offline", () =>
    setOnline(false)
  );

  return online;
}

/** True when the tab/window is visible (not backgrounded/minimized). */
export function usePageVisibility(): boolean {
  const [visible, setVisible] = useState(
    typeof document !== "undefined" ? document.visibilityState === "visible" : true
  );

  useEventListener(typeof document !== "undefined" ? document : null, "visibilitychange", () => {
    setVisible(document.visibilityState === "visible");
  });

  return visible;
}

/** Reactive matchMedia — e.g. useMediaQuery("(max-width: 768px)"). SSR-safe, defaults false on server. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Subscribes to the app-wide event bus for the lifetime of the component.
 * @example useAppEvent("toast:show", ({ title, variant }) => toast[variant](title));
 */
export function useAppEvent<K extends keyof AppEventMap>(
  event: K,
  handler: (payload: AppEventMap[K]) => void
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    return appEvents.on(event, (payload) => savedHandler.current(payload));
  }, [event]);
}
