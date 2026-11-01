// import '@/globals.css';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useFonts } from 'expo-font';
// import AppProviders from '@/providers';
// import { useAppLock, useAuthGate, useRouteGuard } from '@/hooks/auth';
// import { AppLockOverlay } from '@/components/shared';

// SplashScreen.preventAutoHideAsync();

// const RootNavigator = () => {
//   // Enforces global route protection across all navigation events
//   useRouteGuard({ requireVerifiedEmail: false });
//   // Monitors background inactivity and controls biometric lock
//   const { isAppLocked } = useAppLock();

//   return (
//     <>
//       <Stack screenOptions={{ headerShown: false }} />
//       <AppLockOverlay visible={isAppLocked} />
//     </>
//   );
// };

// export default function RootLayout() {
//   const [fontsLoaded, fontError] = useFonts({
//     'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
//     'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
//     'Outfit-Regular': require('../../assets/fonts/Outfit-Regular.ttf'),
//     'Outfit-Bold': require('../../assets/fonts/Outfit-Bold.ttf'),
//     'IBMPlexMono-Regular': require('../../assets/fonts/IBMPlexMono-Regular.ttf'),
//     'IBMPlexMono-Bold': require('../../assets/fonts/IBMPlexMono-Bold.ttf'),
//   });

//   const { isReady, canAccessApp } = useAuthGate();

//   if (!fontsLoaded && !fontError) return null;

//   return (
//     <AppProviders>
//       <RootNavigator />
//     </AppProviders>
//   );
// }

import '@/globals.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import AppProviders from '@/providers';
import { useAuthGate } from '@/hooks/auth';
import { AppLockGate } from '@/components/shared/app-lock-gate';

SplashScreen.preventAutoHideAsync();

const RootNavigator = () => {
  const { isReady, canAccessApp } = useAuthGate();

  // Hide the native splash only once the auth store has hydrated
  useEffect(() => {
    if (isReady) void SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null; // Native splash stays visible

  return (
    <AppLockGate>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Signed in AND email verified */}
        <Stack.Protected guard={canAccessApp}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        {/* Guests, and signed-in users who still need to verify email */}
        <Stack.Protected guard={!canAccessApp}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </AppLockGate>
  );
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
    'Outfit-Regular': require('../../assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Bold': require('../../assets/fonts/Outfit-Bold.ttf'),
    'IBMPlexMono-Regular': require('../../assets/fonts/IBMPlexMono-Regular.ttf'),
    'IBMPlexMono-Bold': require('../../assets/fonts/IBMPlexMono-Bold.ttf'),
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
