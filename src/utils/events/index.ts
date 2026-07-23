// /* ============================================================
//    events.ts — centralised event utilities for the Kalya app
//    ------------------------------------------------------------
//    1. KEYS            — named constants for e.key values
//    2. isHotkeyMatch    — parses "mod+k" / "shift+?" style combos
//    3. AppEventMap/appEvents — typed pub/sub bus for cross-component,
//       non-DOM events (toasts, modals, auth, sidebar, etc.) so
//       unrelated parts of the app can talk without prop drilling
//       or context providers.
//    ============================================================ */

// import type { ReactNode } from "react";

// /** Named constants for KeyboardEvent.key — avoids magic strings. */
// export const KEYS = {
//   ENTER: "Enter",
//   SPACE: " ",
//   ESCAPE: "Escape",
//   TAB: "Tab",
//   BACKSPACE: "Backspace",
//   DELETE: "Delete",
//   ARROW_UP: "ArrowUp",
//   ARROW_DOWN: "ArrowDown",
//   ARROW_LEFT: "ArrowLeft",
//   ARROW_RIGHT: "ArrowRight",
//   HOME: "Home",
//   END: "End",
//   PAGE_UP: "PageUp",
//   PAGE_DOWN: "PageDown",
// } as const;

// export type KeyName = (typeof KEYS)[keyof typeof KEYS];

// /**
//  * Parses a hotkey combo string ("mod+k", "shift+?", "g o") and checks it
//  * against a KeyboardEvent. "mod" means Cmd on Mac, Ctrl elsewhere.
//  *
//  * @example isHotkeyMatch(e, "mod+k")   // Cmd/Ctrl+K — e.g. open command palette
//  * @example isHotkeyMatch(e, "shift+/") // Shift+? — e.g. open shortcuts help
//  */
// export function isHotkeyMatch(e: KeyboardEvent, combo: string): boolean {
//   const parts = combo.toLowerCase().split("+").map((p) => p.trim());
//   const key = parts.at(-1);
//   const modifiers = parts.slice(0, -1);

//   const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform ?? "");

//   const wantCtrl = modifiers.includes("ctrl") || (modifiers.includes("mod") && !isMac);
//   const wantMeta = modifiers.includes("meta") || (modifiers.includes("mod") && isMac);
//   const wantShift = modifiers.includes("shift");
//   const wantAlt = modifiers.includes("alt") || modifiers.includes("option");

//   if (wantCtrl !== e.ctrlKey) return false;
//   if (wantMeta !== e.metaKey) return false;
//   if (wantShift !== e.shiftKey) return false;
//   if (wantAlt !== e.altKey) return false;

//   return e.key.toLowerCase() === key;
// }

// /**
//  * App-wide event payload map. Extend this via TS module augmentation in
//  * feature folders as the app grows:
//  *
//  *   declare module "@/lib/events" {
//  *     interface AppEventMap {
//  *       "budget:updated": { budgetId: string };
//  *     }
//  *   }
//  */
// export interface AppEventMap {
//   "toast:show": {
//     variant: "success" | "error" | "warning" | "info" | "loading";
//     title: ReactNode;
//     description?: ReactNode;
//     duration?: number;
//     action?: { label: string; onClick: () => void };
//     id?: string;
//   };
//   "modal:open": { id: string };
//   "modal:close": { id: string };
//   "sidebar:toggle": void;
//   "auth:session-expired": void;
//   "auth:signed-out": void;
//   "search:open": void;
//   "search:close": void;
// }

// type Listener<T> = (payload: T) => void;

// /** Minimal typed pub/sub bus. Works in SSR (no DOM dependency) and browser alike. */
// class EventBus<TMap extends Record<string, unknown>> {
//   private listeners = new Map<keyof TMap, Set<Listener<any>>>();

//   on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): () => void {
//     if (!this.listeners.has(event)) this.listeners.set(event, new Set());
//     this.listeners.get(event)!.add(listener);
//     return () => this.off(event, listener);
//   }

//   off<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void {
//     this.listeners.get(event)?.delete(listener);
//   }

//   emit<K extends keyof TMap>(
//     event: K,
//     ...payload: TMap[K] extends void ? [] : [TMap[K]]
//   ): void {
//     this.listeners.get(event)?.forEach((listener) => listener(payload[0]));
//   }
// }

// /** Singleton app-wide event bus. Import this directly for non-hook (vanilla JS) usage. */
// export const appEvents = new EventBus<AppEventMap>();

// /* ============================================================
//    events.ts — centralised event utilities for the Kalya app
//    ------------------------------------------------------------
//    1. KEYS            — named constants for e.key values
//    2. isHotkeyMatch    — parses "mod+k" / "shift+?" style combos
//    3. AppEventMap/appEvents — typed pub/sub bus for cross-component,
//       non-DOM events (toasts, modals, auth, sidebar, etc.) so
//       unrelated parts of the app can talk without prop drilling
//       or context providers.
//    ============================================================ */

// import type { ReactNode } from "react";

// /** Named constants for KeyboardEvent.key — avoids magic strings. */
// export const KEYS = {
//   ENTER: "Enter",
//   SPACE: " ",
//   ESCAPE: "Escape",
//   TAB: "Tab",
//   BACKSPACE: "Backspace",
//   DELETE: "Delete",
//   ARROW_UP: "ArrowUp",
//   ARROW_DOWN: "ArrowDown",
//   ARROW_LEFT: "ArrowLeft",
//   ARROW_RIGHT: "ArrowRight",
//   HOME: "Home",
//   END: "End",
//   PAGE_UP: "PageUp",
//   PAGE_DOWN: "PageDown",
// } as const;

// export type KeyName = (typeof KEYS)[keyof typeof KEYS];

// /**
//  * Parses a hotkey combo string ("mod+k", "shift+?", "g o") and checks it
//  * against a KeyboardEvent. "mod" means Cmd on Mac, Ctrl elsewhere.
//  *
//  * @example isHotkeyMatch(e, "mod+k")   // Cmd/Ctrl+K — e.g. open command palette
//  * @example isHotkeyMatch(e, "shift+/") // Shift+? — e.g. open shortcuts help
//  */
// export function isHotkeyMatch(e: KeyboardEvent, combo: string): boolean {
//   const parts = combo
//     .toLowerCase()
//     .split("+")
//     .map((p) => p.trim());
//   const key = parts.at(-1);
//   const modifiers = parts.slice(0, -1);

//   const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform ?? "");

//   const wantCtrl = modifiers.includes("ctrl") || (modifiers.includes("mod") && !isMac);
//   const wantMeta = modifiers.includes("meta") || (modifiers.includes("mod") && isMac);
//   const wantShift = modifiers.includes("shift");
//   const wantAlt = modifiers.includes("alt") || modifiers.includes("option");

//   if (wantCtrl !== e.ctrlKey) return false;
//   if (wantMeta !== e.metaKey) return false;
//   if (wantShift !== e.shiftKey) return false;
//   if (wantAlt !== e.altKey) return false;

//   return e.key.toLowerCase() === key;
// }

// /**
//  * True if `buffer` (recently pressed keys, oldest first, lowercase) ends with
//  * the chorded sequence described by a space-separated combo like "g o" —
//  * press g, then o, Gmail/Linear style. Complements `isHotkeyMatch`, which
//  * only matches simultaneous combos ("mod+k"); a sequence can't be detected
//  * from a single KeyboardEvent because it depends on what was pressed before,
//  * so the stateful buffer lives in the `useHotkeys` hook and this stays a
//  * pure function.
//  *
//  * @example matchesKeySequence(["a", "g", "o"], "g o") // true
//  * @example matchesKeySequence(["g", "p"], "g o")      // false
//  */
// export function matchesKeySequence(buffer: string[], combo: string): boolean {
//   const steps = combo.toLowerCase().trim().split(/\s+/);
//   if (steps.length < 2) return false; // not a sequence — isHotkeyMatch handles single chords
//   if (buffer.length < steps.length) return false;
//   const tail = buffer.slice(-steps.length);
//   return steps.every((step, i) => tail[i] === step);
// }

// /**
//  * App-wide event payload map. Extend this via TS module augmentation in
//  * feature folders as the app grows:
//  *
//  *   declare module "@/lib/events" {
//  *     interface AppEventMap {
//  *       "budget:updated": { budgetId: string };
//  *     }
//  *   }
//  */
// export interface AppEventMap {
//   "toast:show": {
//     variant: "success" | "error" | "warning" | "info" | "loading";
//     title: ReactNode;
//     description?: ReactNode;
//     duration?: number;
//     action?: { label: string; onClick: () => void };
//     id?: string;
//   };
//   "modal:open": { id: string };
//   "modal:close": { id: string };
//   "sidebar:toggle": void;
//   "auth:session-expired": void;
//   "auth:signed-out": void;
//   "search:open": void;
//   "search:close": void;
// }

// type Listener<T> = (payload: T) => void;

// /** Minimal typed pub/sub bus. Works in SSR (no DOM dependency) and browser alike. */
// class EventBus<TMap extends object> {
//   private listeners = new Map<keyof TMap, Set<Listener<unknown>>>();

//   on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): () => void {
//     if (!this.listeners.has(event)) this.listeners.set(event, new Set());
//     this.listeners.get(event)!.add(listener as Listener<unknown>);
//     return () => this.off(event, listener);
//   }

//   off<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void {
//     this.listeners.get(event)?.delete(listener as Listener<unknown>);
//   }

//   emit<K extends keyof TMap>(event: K, ...payload: TMap[K] extends void ? [] : [TMap[K]]): void {
//     this.listeners.get(event)?.forEach((listener) => listener(payload[0]));
//   }
// }

// /** Singleton app-wide event bus. Import this directly for non-hook (vanilla JS) usage. */
// export const appEvents = new EventBus<AppEventMap>();

/* ============================================================
   events.ts — centralised event utilities for the Kalya app
   ------------------------------------------------------------
   1. KEYS                     — named constants for e.key values
   2. isHotkeyMatch            — parses "mod+k" / "shift+?" style combos
   3. matchesKeySequence       — parses "g o" style chorded sequences
   4. AppEventMap/appEvents    — typed pub/sub bus for cross-component,
      non-DOM events (toasts, modals, auth, sidebar, etc.) so
      unrelated parts of the app can talk without prop drilling
      or context providers.
   ============================================================ */

import type { ReactNode } from "react";

/** Named constants for KeyboardEvent.key — avoids magic strings. */
export const KEYS = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  BACKSPACE: "Backspace",
  DELETE: "Delete",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
} as const;

export type KeyName = (typeof KEYS)[keyof typeof KEYS];

/**
 * Parses a hotkey combo string ("mod+k", "shift+?", "g o") and checks it
 * against a KeyboardEvent. "mod" means Cmd on Mac, Ctrl elsewhere.
 *
 * @example isHotkeyMatch(e, "mod+k")   // Cmd/Ctrl+K — e.g. open command palette
 * @example isHotkeyMatch(e, "shift+/") // Shift+? — e.g. open shortcuts help
 */
export function isHotkeyMatch(e: KeyboardEvent, combo: string): boolean {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());
  const key = parts.at(-1);
  const modifiers = parts.slice(0, -1);

  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform ?? "");

  const wantCtrl = modifiers.includes("ctrl") || (modifiers.includes("mod") && !isMac);
  const wantMeta = modifiers.includes("meta") || (modifiers.includes("mod") && isMac);
  const wantShift = modifiers.includes("shift");
  const wantAlt = modifiers.includes("alt") || modifiers.includes("option");

  if (wantCtrl !== e.ctrlKey) return false;
  if (wantMeta !== e.metaKey) return false;
  if (wantShift !== e.shiftKey) return false;
  if (wantAlt !== e.altKey) return false;

  return e.key.toLowerCase() === key;
}

/**
 * True if `buffer` (recently pressed keys, oldest first, lowercase) ends with
 * the chorded sequence described by a space-separated combo like "g o" —
 * press g, then o, Gmail/Linear style. Complements `isHotkeyMatch`, which
 * only matches simultaneous combos ("mod+k"); a sequence can't be detected
 * from a single KeyboardEvent because it depends on what was pressed before,
 * so the stateful buffer lives in the `useHotkeys` hook and this stays a
 * pure function.
 *
 * @example matchesKeySequence(["a", "g", "o"], "g o") // true
 * @example matchesKeySequence(["g", "p"], "g o")      // false
 */
export function matchesKeySequence(buffer: string[], combo: string): boolean {
  const steps = combo.toLowerCase().trim().split(/\s+/);
  if (steps.length < 2) return false; // not a sequence — isHotkeyMatch handles single chords
  if (buffer.length < steps.length) return false;
  const tail = buffer.slice(-steps.length);
  return steps.every((step, i) => tail[i] === step);
}

/**
 * App-wide event payload map. Extend this via TS module augmentation in
 * feature folders as the app grows:
 *
 *   declare module "@/lib/events" {
 *     interface AppEventMap {
 *       "budget:updated": { budgetId: string };
 *     }
 *   }
 */
export interface AppEventMap {
  "toast:show": {
    variant: "success" | "error" | "warning" | "info" | "loading";
    title: ReactNode;
    description?: ReactNode;
    duration?: number;
    action?: { label: string; onClick: () => void };
    id?: string;
  };
  "modal:open": { id: string };
  "modal:close": { id: string };
  "sidebar:toggle": void;
  "auth:session-expired": void;
  "auth:signed-out": void;
  "search:open": void;
  "search:close": void;
}

type Listener<T> = (payload: T) => void;

/** Minimal typed pub/sub bus. Works in SSR (no DOM dependency) and browser alike. */
class EventBus<TMap extends object> {
  private listeners = new Map<keyof TMap, Set<Listener<unknown>>>();

  on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener as Listener<unknown>);
    return () => this.off(event, listener);
  }

  off<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<unknown>);
  }

  emit<K extends keyof TMap>(event: K, ...payload: TMap[K] extends void ? [] : [TMap[K]]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload[0]));
  }
}

/** Singleton app-wide event bus. Import this directly for non-hook (vanilla JS) usage. */
export const appEvents = new EventBus<AppEventMap>();
