import type { ReactNode } from 'react';

/**
 * Visual variant tone for toast notifications.
 *
 * - `success`: Positive operations (e.g. saved, copied, verified). Green accent badge.
 * - `error`: Failed operations or validation rejections. Red accent badge.
 * - `info`: Neutral announcements and operational status updates. Slate accent badge.
 * - `warning`: Cautionary alerts (e.g. rate limits, weak network). Amber accent badge.
 * - `loading`: Ongoing background operations with an animated spinner. Persistent by default.
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

/**
 * Screen vertical viewport placement for toast notifications.
 *
 * - `top`: Anchors below the status bar, dynamic island, or camera notch.
 * - `bottom`: Anchors above the bottom navigation bar or iOS home indicator.
 *
 * @default 'top'
 */
export type ToastPosition = 'top' | 'bottom';

/**
 * Interactive button action embedded within a toast notification.
 */
export interface ToastAction {
  /**
   * Action button text label (e.g. "Undo", "Retry", "View").
   */
  label: string;

  /**
   * Callback invoked when the user taps the action button.
   */
  onPress: () => void;
}

/**
 * Configuration options provided when dispatching a toast notification.
 */
export interface ToastOptions {
  /**
   * Unique toast identifier.
   * If an existing toast ID is passed, the toast is updated in-place without re-mounting.
   * Auto-generated with a collision-resistant timestamp string if omitted.
   */
  id?: string;

  /**
   * Visual tone variant governing badge colors, icons, and haptic feedback.
   *
   * @default 'info'
   */
  type?: ToastType;

  /**
   * Optional bold uppercase header line rendered immediately above the message body.
   */
  title?: string;

  /**
   * Auto-dismiss countdown threshold in milliseconds.
   * Setting duration to `0` makes the toast persistent until programmatically dismissed or swiped away.
   *
   * @default 4000 (loading toasts default to 0)
   */
  duration?: number;

  /**
   * Custom React icon element to render instead of the standard variant badge icon.
   */
  icon?: ReactNode;

  /**
   * Optional actionable button displayed on the trailing side of the toast.
   */
  action?: ToastAction;

  /**
   * Screen anchor placement (top below notch, or bottom above navigation bar).
   *
   * @default 'top'
   */
  position?: ToastPosition;

  /**
   * Whether to trigger device tactile haptics (`expo-haptics`) when the toast is displayed.
   *
   * @default true
   */
  haptics?: boolean;
}

/**
 * Normalized runtime entity stored in Zustand representing an active, visible toast.
 */
export interface ToastData extends ToastOptions {
  /**
   * Guaranteed unique identifier for the active toast item.
   */
  id: string;

  /**
   * Primary notification message text body.
   */
  message: string;

  /**
   * Resolved toast variant tone.
   */
  type: ToastType;

  /**
   * Resolved duration in milliseconds (0 = persistent).
   */
  duration: number;

  /**
   * Resolved screen anchor placement.
   */
  position: ToastPosition;

  /**
   * Resolved haptic feedback toggle.
   */
  haptics: boolean;

  /**
   * Timestamp in milliseconds when the toast was initially enqueued.
   */
  createdAt: number;
}

/**
 * Toast options with the `type` property omitted, used for variant-specific helper methods
 * (e.g. `toast.success(message, options)`).
 */
export type VariantOptions = Omit<ToastOptions, 'type'>;

/**
 * Message configurations for tracking asynchronous promises via `toast.promise()`.
 *
 * @template T - The resolution type of the tracked Promise.
 */
export interface ToastPromiseMessages<T> {
  /**
   * Message displayed while the asynchronous promise remains pending.
   */
  loading: string;

  /**
   * Success message string or dynamic formatter function receiving resolved promise data.
   */
  success: string | ((data: T) => string);

  /**
   * Error message string or dynamic formatter function receiving the caught rejection error.
   */
  error: string | ((err: unknown) => string);
}
