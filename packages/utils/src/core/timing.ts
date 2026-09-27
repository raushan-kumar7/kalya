/**
 * Interface for a debounced function.
 * @template T - The type of the function's arguments.
 */
export interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  /** Cancels any pending invocation. */
  cancel: () => void;
  /** Immediately invokes any pending call, then clears it. */
  flush: () => void;
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until `wait` milliseconds have elapsed since the last time it was invoked.
 *
 * @param fn The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @returns A new debounced function with `cancel` and `flush` methods.
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number
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
 * Creates a throttled function that only invokes the provided function at most
 * once per every `wait` milliseconds.
 *
 * @param fn The function to throttle.
 * @param wait The number of milliseconds to throttle invocations to.
 * @param options Options to configure leading and trailing edge execution.
 * @returns A new throttled function with a `cancel` method.
 */
export function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
  { leading = true, trailing = true }: ThrottleOptions = {}
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
