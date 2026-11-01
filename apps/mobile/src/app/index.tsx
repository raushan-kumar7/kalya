// import { useCallback, useEffect, useRef } from 'react';
// import { View, useWindowDimensions } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Image } from 'expo-image';
// import * as SplashScreen from 'expo-splash-screen';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo from '@react-native-community/netinfo';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Animated, {
//   Easing,
//   useAnimatedStyle,
//   useSharedValue,
//   withDelay,
//   withRepeat,
//   withTiming,
// } from 'react-native-reanimated';
// import { useAuth, useSessionQuery } from '@/hooks/auth';
// import { SecureStoreTokenService } from '@/libs/services/auth/token';
// import { logoColored } from '@/constants/images';
// import { SETUP_DONE_KEY } from '@/constants/storage-keys';

// const LOGO_ASPECT = 2.7;
// const TRACK_WIDTH = 48;
// const BAR_WIDTH = 18;

// export const Index = () => {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { width } = useWindowDimensions();
//   const logoWidth = Math.min(width * 0.68, 300);

//   const { isAuthenticated, isInitialized, clearAuth, unlockWithBiometrics, biometric } = useAuth();
//   const { refetch: refetchSession } = useSessionQuery({ enabled: false });

//   const started = useRef(false);
//   const enter = useSharedValue(0);
//   const loaderIn = useSharedValue(0);
//   const sweep = useSharedValue(0);

//   useEffect(() => {
//     enter.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
//     loaderIn.value = withDelay(900, withTiming(1, { duration: 500 }));
//     sweep.value = withDelay(
//       900,
//       withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, false)
//     );
//   }, [enter, loaderIn, sweep]);

//   // Hide the native splash once, when our own view is on screen
//   const onLayout = useCallback(() => {
//     SplashScreen.hideAsync().catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (!isInitialized) return;

//     const bootstrap = async () => {
//       if (started.current) return; // auth state changes must not re-run this
//       started.current = true;

//       try {
//         const [hasToken, setupRaw, net] = await Promise.all([
//           SecureStoreTokenService.hasToken(),
//           AsyncStorage.getItem(SETUP_DONE_KEY),
//           NetInfo.fetch(),
//         ]);

//         const setupDone = setupRaw === 'true';
//         console.log(setupDone);
//         const isOnline = Boolean(net.isConnected && net.isInternetReachable !== false);
//         // const goHome = () => router.replace(setupDone ? '/(tabs)' : '/(setup)/profile');
//         const goHome = () => router.replace('/(tabs)');

//         if (!hasToken) {
//           clearAuth();
//           router.replace('/(auth)/welcome');
//           return;
//         }

//         if (biometric.isEnabled && biometric.isSupported && biometric.isEnrolled) {
//           const ok = await unlockWithBiometrics(`Unlock Kalya with ${biometric.biometricLabel}`);
//           if (ok) return goHome();
//           router.replace('/(auth)/sign-in');
//           return;
//         }

//         if (isOnline) {
//           const result = await refetchSession();
//           if (result.data?.user && result.data.session) return goHome();

//           // Only wipe the token when the server actually rejected it
//           const err = result.error as any;
//           const status = err?.response?.status ?? err?.status;
//           if (status === 401 || status === 403) {
//             await SecureStoreTokenService.removeToken();
//             clearAuth();
//             router.replace('/(auth)/sign-in');
//             return;
//           }
//           // Server down or 5xx: fall through to the offline path
//         }

//         if (isAuthenticated) return goHome();
//         router.replace('/(auth)/welcome');
//       } catch {
//         router.replace('/(auth)/welcome');
//       }
//     };

//     const timer = setTimeout(bootstrap, 800); // lets the logo animation play
//     return () => clearTimeout(timer);
//   }, [
//     isInitialized,
//     isAuthenticated,
//     biometric,
//     unlockWithBiometrics,
//     refetchSession,
//     clearAuth,
//     router,
//   ]);

//   const logoStyle = useAnimatedStyle(() => ({
//     opacity: enter.value,
//     transform: [{ scale: 0.94 + 0.06 * enter.value }],
//   }));
//   const loaderStyle = useAnimatedStyle(() => ({ opacity: loaderIn.value }));
//   const barStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: -BAR_WIDTH + sweep.value * (TRACK_WIDTH + BAR_WIDTH) }],
//   }));

//   return (
//     <View onLayout={onLayout} className="flex-1 bg-kalya-canvas items-center justify-center">
//       <Animated.View style={[logoStyle, { marginTop: -32 }]}>
//         <Image
//           source={logoColored}
//           contentFit="contain"
//           style={{ width: logoWidth, height: logoWidth / LOGO_ASPECT }}
//         />
//       </Animated.View>

//       <Animated.View style={[loaderStyle, { bottom: insets.bottom + 48 }]} className="absolute">
//         <View
//           style={{ width: TRACK_WIDTH }}
//           className="h-0.5 rounded-full overflow-hidden bg-kalya-border-subtle"
//         >
//           <Animated.View
//             style={[barStyle, { width: BAR_WIDTH }]}
//             className="h-full rounded-full bg-kalya-gold"
//           />
//         </View>
//       </Animated.View>
//     </View>
//   );
// };

// export default Index;

import { useEffect, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useAuth, useAuthGate, useSessionQuery } from '@/hooks/auth';
import { SecureStoreTokenService } from '@/libs/services/auth/token';
import { logoColored } from '@/constants/images';

const LOGO_ASPECT = 2.7;
const TRACK_WIDTH = 48;
const BAR_WIDTH = 18;
const MIN_SPLASH_MS = 1600; // lets the logo animation play

const getStatus = (error: unknown): number | undefined => {
  const e = error as { response?: { status?: number }; status?: number } | null;
  return e?.response?.status ?? e?.status;
};

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.68, 300);

  const { clearAuth } = useAuth();
  const { canAccessApp } = useAuthGate();
  const { refetch: refetchSession } = useSessionQuery({ enabled: false });

  // Always-fresh values for the one-shot bootstrap below
  const latest = useRef({ canAccessApp, clearAuth, refetchSession, router });
  useEffect(() => {
    latest.current = { canAccessApp, clearAuth, refetchSession, router };
  });

  const enter = useSharedValue(0);
  const loaderIn = useSharedValue(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    loaderIn.value = withDelay(900, withTiming(1, { duration: 500 }));
    sweep.value = withDelay(
      900,
      withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, false)
    );
  }, [enter, loaderIn, sweep]);

  // One-shot cold boot: runs once on mount. The layout only renders this
  // screen after the auth store has hydrated (isReady), so no waiting is needed.
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const {
        canAccessApp: canAccess,
        clearAuth: clear,
        refetchSession: refetch,
        router: r,
      } = latest.current;

      try {
        // Not signed in (or email not verified): the auth stack handles the rest
        if (!canAccess) {
          r.replace('/(auth)/welcome');
          return;
        }

        // Signed in: confirm the session with the server when online
        const net = await NetInfo.fetch();
        const isOnline = Boolean(net.isConnected && net.isInternetReachable !== false);

        if (isOnline) {
          const result = await refetch();
          if (cancelled) return;

          if (!(result.data?.user && result.data.session)) {
            const status = getStatus(result.error);
            // Only wipe the token when the server actually rejected it
            if (status === 401 || status === 403) {
              await SecureStoreTokenService.removeToken();
              clear();
              r.replace('/(auth)/sign-in');
              return;
            }
            // Server down or 5xx: fall through and trust the local session
          }
        }

        r.replace('/(tabs)');
      } catch {
        if (!cancelled) latest.current.router.replace('/(auth)/welcome');
      }
    };

    const timer = setTimeout(() => void bootstrap(), MIN_SPLASH_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.94 + 0.06 * enter.value }],
  }));
  const loaderStyle = useAnimatedStyle(() => ({ opacity: loaderIn.value }));
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -BAR_WIDTH + sweep.value * (TRACK_WIDTH + BAR_WIDTH) }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-kalya-canvas">
      <Animated.View style={[logoStyle, { marginTop: -32 }]}>
        <Image
          source={logoColored}
          contentFit="contain"
          style={{ width: logoWidth, height: logoWidth / LOGO_ASPECT }}
        />
      </Animated.View>

      <Animated.View style={[loaderStyle, { bottom: insets.bottom + 48 }]} className="absolute">
        <View
          style={{ width: TRACK_WIDTH }}
          className="h-0.5 overflow-hidden rounded-full bg-kalya-border-subtle"
        >
          <Animated.View
            style={[barStyle, { width: BAR_WIDTH }]}
            className="h-full rounded-full bg-kalya-gold"
          />
        </View>
      </Animated.View>
    </View>
  );
}
