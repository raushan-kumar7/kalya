import {
  ToastData,
  ToastOptions,
  ToastPromiseMessages,
  type VariantOptions,
} from '@/components/ui/feedback/toast';
import { create } from 'zustand';

/** Maximum number of toasts visible simultaneously before older entries are trimmed */
const MAX_VISIBLE_TOASTS = 3;

/** Default auto-dismiss duration in milliseconds for transient notifications */
const DEFAULT_DURATION = 4000;

/** Internal registry of active auto-dismiss timeout references keyed by toast ID */
const timers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Clears and unregisters an active auto-dismiss timeout for a given toast ID.
 *
 * @description Cancels the timeout handle and deletes the reference from memory.
 * @param {string} id - Unique toast identifier.
 * @returns {void}
 */
const clearTimer = (id: string): void => {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
};

let counter = 0;

/**
 * Generates a unique, collision-resistant identifier for newly dispatched toasts.
 *
 * @description Combines a static prefix, timestamp, and incrementing counter.
 * @returns {string} Unique toast identifier string.
 */
const generateId = (): string => `toast_${Date.now()}_${++counter}`;

export interface ToastState {
  /** Active in-app notification toasts currently queued or visible */
  toasts: ToastData[];
}

export interface ToastActions {
  /**
   * Dispatches a new toast notification or updates an existing one in-place by ID.
   *
   * @description Appends the toast to the queue, enforces MAX_VISIBLE_TOASTS cap, and schedules an auto-dismiss timer when duration > 0.
   * @param {string} message - Primary notification message text.
   * @param {ToastOptions} [options] - Configuration options (variant, duration, position, icon, action, haptics, custom id).
   * @returns {string} Unique toast identifier string.
   */
  show: (message: string, options?: ToastOptions) => string;

  /**
   * Dismisses a single toast by ID, or clears all active toasts when no ID is provided.
   *
   * @description Cleans up associated timers and filters out dismissed toast(s) from state.
   * @param {string} [id] - Optional ID of the specific toast to dismiss. If omitted, all toasts are dismissed.
   * @returns {void}
   */
  dismiss: (id?: string) => void;
}

export type ToastStore = ToastState & ToastActions;

const INITIAL_STATE: ToastState = {
  toasts: [],
};

/**
 * Global Toast Notification Store
 *
 * @description Manages global in-app notification toasts, auto-dismiss timers, queue caps, and imperative triggers across mobile screens and services.
 */
export const useToastStore = create<ToastStore>((set, get) => ({
  ...INITIAL_STATE,

  show: (message, options = {}) => {
    const id = options.id ?? generateId();
    const type = options.type ?? 'info';
    const duration = options.duration ?? (type === 'loading' ? 0 : DEFAULT_DURATION);

    const data: ToastData = {
      ...options,
      id,
      message,
      type,
      duration,
      position: options.position ?? 'top',
      haptics: options.haptics ?? true,
      createdAt: Date.now(),
    };

    clearTimer(id);

    const current = get().toasts;
    const exists = current.some((t) => t.id === id);

    let next = exists
      ? current.map((t) => (t.id === id ? { ...data, createdAt: t.createdAt } : t))
      : [...current, data];

    if (next.length > MAX_VISIBLE_TOASTS) {
      next.slice(0, next.length - MAX_VISIBLE_TOASTS).forEach((t) => clearTimer(t.id));
      next = next.slice(-MAX_VISIBLE_TOASTS);
    }

    set({ toasts: next });

    if (duration > 0) {
      timers.set(
        id,
        setTimeout(() => get().dismiss(id), duration)
      );
    }

    return id;
  },

  dismiss: (id) => {
    if (id) {
      clearTimer(id);
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      return;
    }
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    set({ toasts: [] });
  },
}));

/* ------------------------------------------------------------------ */
/* Granular Selectors                                                  */
/* ------------------------------------------------------------------ */

/**
 * Hook selector returning the current array of active toasts.
 *
 * @description Subscribes only to changes in the active toasts array to optimize rendering performance.
 * @returns {ToastData[]} Array of current active toast entities.
 */
export const useToasts = (): ToastData[] => useToastStore((s) => s.toasts);

/* ------------------------------------------------------------------ */
/* Imperative Toast API                                               */
/* ------------------------------------------------------------------ */

export type { VariantOptions };

/**
 * Imperative Toast API
 *
 * @description Provides a fluent, callable API matching `react-hot-toast` / `sonner` patterns.
 * Usable anywhere across components, custom hooks, or background modules (e.g. Axios interceptors).
 */
export const toast = {
  /**
   * Dispatches a generic or customized toast notification.
   *
   * @description Imperative trigger callable from components, hooks, or non-React utilities.
   * @param {string} message - Primary notification text to display.
   * @param {ToastOptions} [options] - Optional toast configuration options.
   * @returns {string} Unique toast identifier string.
   */
  show: (message: string, options?: ToastOptions): string =>
    useToastStore.getState().show(message, options),

  /**
   * Dispatches a success toast notification with positive haptic feedback and emerald accent styling.
   *
   * @description Displays a checkmark badge and green accent border for successful operations.
   * @param {string} message - Success notification text.
   * @param {VariantOptions} [options] - Optional toast configuration overrides.
   * @returns {string} Unique toast identifier string.
   */
  success: (message: string, options?: VariantOptions): string =>
    useToastStore.getState().show(message, { ...options, type: 'success' }),

  /**
   * Dispatches an error toast notification with error haptic feedback and red accent styling.
   *
   * @description Displays an alert badge and red accent border for failed operations.
   * @param {string} message - Error notification text.
   * @param {VariantOptions} [options] - Optional toast configuration overrides.
   * @returns {string} Unique toast identifier string.
   */
  error: (message: string, options?: VariantOptions): string =>
    useToastStore.getState().show(message, { ...options, type: 'error' }),

  /**
   * Dispatches an informational toast notification with subtle haptic feedback and neutral styling.
   *
   * @description Displays an info badge for neutral updates and general announcements.
   * @param {string} message - Informational notification text.
   * @param {VariantOptions} [options] - Optional toast configuration overrides.
   * @returns {string} Unique toast identifier string.
   */
  info: (message: string, options?: VariantOptions): string =>
    useToastStore.getState().show(message, { ...options, type: 'info' }),

  /**
   * Dispatches a warning toast notification with warning haptic feedback and amber accent styling.
   *
   * @description Displays a warning triangle badge and amber accent border for caution states.
   * @param {string} message - Warning notification text.
   * @param {VariantOptions} [options] - Optional toast configuration overrides.
   * @returns {string} Unique toast identifier string.
   */
  warning: (message: string, options?: VariantOptions): string =>
    useToastStore.getState().show(message, { ...options, type: 'warning' }),

  /**
   * Dispatches a persistent loading toast notification with an animated spinner.
   *
   * @description Sets duration to 0 (persistent) until explicitly dismissed or resolved via promise.
   * @param {string} message - Loading notification text.
   * @param {VariantOptions} [options] - Optional toast configuration overrides.
   * @returns {string} Unique toast identifier string for subsequent dismissal.
   */
  loading: (message: string, options?: VariantOptions): string =>
    useToastStore.getState().show(message, { ...options, type: 'loading', duration: 0 }),

  /**
   * Dismisses a single toast by ID, or all toasts when no ID is provided.
   *
   * @description Immediately clears active timers and animates toast removal.
   * @param {string} [id] - Optional toast ID to dismiss.
   * @returns {void}
   */
  dismiss: (id?: string): void => useToastStore.getState().dismiss(id),

  /**
   * Tracks an asynchronous promise, displaying loading, success, and error states sequentially.
   *
   * @description Mounts an initial loading toast with duration=0, then replaces it with success or error upon resolution or rejection. Re-throws original error so callers can handle exceptions.
   * @template T
   * @param {Promise<T>} promise - The asynchronous promise to track.
   * @param {ToastPromiseMessages<T>} messages - Messages or formatters for loading, success, and error states.
   * @param {VariantOptions} [options] - Optional toast configuration overrides.
   * @returns {Promise<T>} The original promise resolution value.
   */
  promise: async <T>(
    promise: Promise<T>,
    messages: ToastPromiseMessages<T>,
    options?: VariantOptions
  ): Promise<T> => {
    const id = toast.loading(messages.loading, options);
    try {
      const data = await promise;
      const text =
        typeof messages.success === 'function' ? messages.success(data) : messages.success;
      toast.success(text, { ...options, id, duration: options?.duration ?? DEFAULT_DURATION });
      return data;
    } catch (err) {
      const text = typeof messages.error === 'function' ? messages.error(err) : messages.error;
      toast.error(text, { ...options, id, duration: options?.duration ?? DEFAULT_DURATION });
      throw err;
    }
  },
};
