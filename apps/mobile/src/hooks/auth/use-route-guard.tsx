import { useAuthStore } from '@/stores/auth';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

export interface RouteGuardOptions {
  /** If true, unverified users will be directed to the verify-email screen */
  requireVerifiedEmail?: boolean;
}

/**
 * High-performance route protection hook for Expo Router.
 *
 * Enforces:
 * 1. Guests cannot enter protected groups (`(tabs)`).
 * 2. Authenticated users cannot re-enter guest groups (`(auth)`).
 * 3. Unverified users can be routed to email verification if strict verification is required.
 * 4. Cold boots at root `/` are deferred to `index.tsx`.
 */
export const useRouteGuard = (options: RouteGuardOptions = { requireVerifiedEmail: false }) => {
  const router = useRouter();
  const segments = useSegments();

  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  const isRoutingRef = useRef(false);

  useEffect(() => {
    // Wait for Zustand hydration and initial bootstrap before evaluating routes
    if (!isInitialized || isLoading) return;

    const rootSegment = segments[0];

    // Let the bootstrap splash screen at `app/index.tsx` complete its cold launch sequence
    if (!rootSegment) return;

    const inAuthGroup = rootSegment === '(auth)';
    const inProtectedGroup = rootSegment === '(tabs)';

    // Prevent navigation queue flooding
    if (isRoutingRef.current) return;

    if (!isAuthenticated && inProtectedGroup) {
      isRoutingRef.current = true;
      router.replace('/(auth)/welcome');
      setTimeout(() => {
        isRoutingRef.current = false;
      }, 500);
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      // Don't bounce user away if they are deliberately on the verify-email screen
      const currentScreen = segments[1];
      if (currentScreen === 'verify-email' && !user?.emailVerified) {
        return;
      }

      isRoutingRef.current = true;
      router.replace('/(tabs)');
      setTimeout(() => {
        isRoutingRef.current = false;
      }, 500);
      return;
    }

    if (
      isAuthenticated &&
      inProtectedGroup &&
      options.requireVerifiedEmail &&
      user &&
      !user.emailVerified
    ) {
      isRoutingRef.current = true;
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: user.email },
      });
      setTimeout(() => {
        isRoutingRef.current = false;
      }, 500);
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    user?.emailVerified,
    user?.email,
    segments,
    router,
    options.requireVerifiedEmail,
    user,
  ]);
};
