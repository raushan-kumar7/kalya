export interface ThrottledFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

interface ThrottleOptions {
  /** Invoke on the leading edge of the window. Default: true. */
  leading?: boolean;
  /** Invoke on the trailing edge with the last call's args. Default: true. */
  trailing?: boolean;
}

/**
 * Standard throttle: invokes `fn` at most once per `wait` ms, regardless
 * of how many times it's called in between.
 *
 * Use for: scroll handlers, mousemove/drag, rate-limiting button clicks —
 * anything firing continuously where you want steady, capped-rate calls
 * rather than waiting for things to go quiet (that's debounce's job).
 */
export function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
  { leading = true, trailing = true }: ThrottleOptions = {},
): ThrottledFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastArgs: Parameters<T> | null = null;

  const invoke = (args: Parameters<T>) => {
    lastCallTime = Date.now();
    fn(...args);
  };

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);

    lastArgs = args;

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (leading || lastCallTime !== 0) {
        invoke(args);
      }
      lastCallTime = now;
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (lastArgs) invoke(lastArgs);
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    lastCallTime = 0;
    lastArgs = null;
  };

  return throttled;
}
