import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

export interface UseCooldownOptions {
  /** Start counting as soon as the component mounts. @default false */
  startOnMount?: boolean;
}

export interface UseCooldownResult {
  /** Whole seconds left. 0 when idle. */
  remaining: number;
  /** True while the countdown is running. */
  isActive: boolean;
  /** Start (or restart) the countdown. Defaults to the hook's `duration`. */
  start: (seconds?: number) => void;
  /** Stop the countdown and set remaining to 0. */
  reset: () => void;
}

/**
 * Countdown for "Resend code" style buttons.
 *
 * Stores an end timestamp and derives `remaining` from it, so the value stays
 * correct after the app is backgrounded or the JS timer is throttled.
 */
export const useCooldown = (
  duration: number,
  { startOnMount = false }: UseCooldownOptions = {}
): UseCooldownResult => {
  const [endsAt, setEndsAt] = useState<number | null>(() =>
    startOnMount && duration > 0 ? Date.now() + duration * 1000 : null
  );
  const [now, setNow] = useState(() => Date.now());

  // Subscribe to external time sources. setState only runs inside callbacks.
  useEffect(() => {
    if (endsAt === null) return;

    const sync = () => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) setEndsAt(null);
    };

    const id = setInterval(sync, 1000);
    // Refresh immediately when returning from the background.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [endsAt]);

  const start = useCallback(
    (seconds: number = duration) => {
      if (seconds <= 0) return;
      const current = Date.now();
      setNow(current);
      setEndsAt(current + seconds * 1000);
    },
    [duration]
  );

  const reset = useCallback(() => setEndsAt(null), []);

  const remaining = endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));

  return { remaining, isActive: remaining > 0, start, reset };
};
