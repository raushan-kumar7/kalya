import { useAuthStore } from '@/stores/auth';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

const AuthLayout = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#edfdf2' },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
};

export default AuthLayout;
