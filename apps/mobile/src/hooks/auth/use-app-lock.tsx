// import { useAuthStore } from '@/stores/auth';
// import { useEffect, useRef, useState } from 'react';
// import { AppState, type AppStateStatus } from 'react-native';
// import { useBiometric } from './use-biometric';

// /** Inactivity threshold before requiring biometric unlock: 60 seconds */
// const DEFAULT_INACTIVITY_TIMEOUT_MS = 60 * 1000;

// export const useAppLock = (timeoutMs: number = DEFAULT_INACTIVITY_TIMEOUT_MS) => {
//   // Provide a safe fallback ('active') since AppState.currentState can be null at launch
//   const appState = useRef<AppStateStatus | string>(AppState.currentState ?? 'active');
//   const [isVeiled, setIsVeiled] = useState(false);

//   const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
//   const isBiometricEnabled = useAuthStore((s) => s.isBiometricEnabled);
//   const isAppLocked = useAuthStore((s) => s.isAppLocked);
//   const lastBackgroundedAt = useAuthStore((s) => s.lastBackgroundedAt);

//   const setAppLocked = useAuthStore((s) => s.setAppLocked);
//   const setLastBackgroundedAt = useAuthStore((s) => s.setLastBackgroundedAt);
//   const unlockApp = useAuthStore((s) => s.unlockApp);

//   const { authenticateWithBiometrics, biometricLabel } = useBiometric();

//   useEffect(() => {
//     const handleAppStateChange = async (nextAppState: AppStateStatus) => {
//       // 1. App leaving foreground -> Show privacy veil to protect snapshot in task switcher
//       if (
//         appState.current === 'active' &&
//         (nextAppState === 'inactive' || nextAppState === 'background')
//       ) {
//         if (isAuthenticated && isBiometricEnabled) {
//           setIsVeiled(true);
//           setLastBackgroundedAt(Date.now());
//         }
//       }

//       // 2. App returning to foreground
//       if (
//         (appState.current === 'background' || appState.current === 'inactive') &&
//         nextAppState === 'active'
//       ) {
//         setIsVeiled(false);

//         if (isAuthenticated && isBiometricEnabled && lastBackgroundedAt) {
//           const elapsed = Date.now() - lastBackgroundedAt;
//           if (elapsed >= timeoutMs) {
//             setAppLocked(true);
//             // Prompt biometrics immediately upon return
//             await authenticateWithBiometrics(`Unlock Kalya with ${biometricLabel}`);
//           }
//         }
//       }

//       appState.current = nextAppState;
//     };

//     const subscription = AppState.addEventListener('change', handleAppStateChange);
//     return () => {
//       subscription.remove();
//     };
//   }, [
//     isAuthenticated,
//     isBiometricEnabled,
//     lastBackgroundedAt,
//     timeoutMs,
//     setAppLocked,
//     setLastBackgroundedAt,
//     authenticateWithBiometrics,
//     biometricLabel,
//   ]);

//   return {
//     isAppLocked: isAuthenticated && isBiometricEnabled && isAppLocked,
//     isVeiled,
//     unlockApp,
//   };
// };

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { useBiometric } from './use-biometric';

const DEFAULT_TIMEOUT_MS = 60_000;

export function useAppLock(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  const { authenticateWithBiometrics, biometricLabel } = useBiometric();
  const [isVeiledRaw, setIsVeiled] = useState(false);
  const bootChecked = useRef(false);

  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLockEnabled = useAuthStore((s) => s.isAuthenticated && s.isBiometricEnabled);
  const isAppLocked = useAuthStore((s) => s.isAppLocked);

  // Latest prompt function without re-subscribing to AppState
  const prompt = useRef({ authenticateWithBiometrics, biometricLabel });
  useEffect(() => {
    prompt.current = { authenticateWithBiometrics, biometricLabel };
  });

  const unlock = useCallback(async () => {
    try {
      const { authenticateWithBiometrics: authenticate, biometricLabel: label } = prompt.current;
      const ok = await authenticate(`Unlock Kalya with ${label}`);
      if (ok) useAuthStore.getState().unlockApp();
      return Boolean(ok);
    } catch {
      return false;
    }
  }, []);

  // Cold start: lock once right after hydration (never after a fresh sign-in)
  useEffect(() => {
    if (!isInitialized || bootChecked.current) return;
    bootChecked.current = true;
    if (isLockEnabled) useAuthStore.getState().setAppLocked(true);
  }, [isInitialized, isLockEnabled]);

  // Background / foreground transitions
  useEffect(() => {
    if (!isLockEnabled) return;

    let previous = AppState.currentState;

    const subscription = AppState.addEventListener('change', (next) => {
      const { lastBackgroundedAt, setLastBackgroundedAt, setAppLocked } = useAuthStore.getState();

      if (next !== 'active') {
        // Obscure content from app-switcher snapshots and start inactivity timer
        if (previous === 'active') setLastBackgroundedAt(Date.now());
        setIsVeiled(true);
      } else {
        setIsVeiled(false);
        const expired = lastBackgroundedAt !== null && Date.now() - lastBackgroundedAt >= timeoutMs;
        if (expired) {
          setAppLocked(true);
        } else {
          setLastBackgroundedAt(null); // Short blip (notification shade, system alert)
        }
      }
      previous = next;
    });

    return () => {
      subscription.remove();
      setIsVeiled(false); // Cleanup, not the effect body, so no cascading render
    };
  }, [isLockEnabled, timeoutMs]);

  // Prompt automatically whenever the app becomes locked while in foreground
  useEffect(() => {
    if (isAppLocked && AppState.currentState === 'active') {
      void unlock();
    }
  }, [isAppLocked, unlock]);

  return {
    isAppLocked: isLockEnabled && isAppLocked,
    isVeiled: isLockEnabled && isVeiledRaw,
    unlock,
    biometricLabel,
  };
}
