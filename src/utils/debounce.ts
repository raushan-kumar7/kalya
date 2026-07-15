export interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  /** Cancels any pending invocation. */
  cancel: () => void;
  /** Immediately invokes any pending call, then clears it. */
  flush: () => void;
}

/**
 * Standard trailing-edge debounce: delays invoking `fn` until `wait` ms
 * have passed since the last call. Each new call resets the timer.
 *
 * Use for: search-as-you-type, resize handlers, autosave-on-pause —
 * anything where you only care about the value once it "settles".
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (lastArgs) fn(...lastArgs);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      fn(...lastArgs);
    }
  };

  return debounced;
}
