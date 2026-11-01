import { useAuthStore } from '@/stores/auth';

export const useAuthGate = () => {
  // Only isInitialized: isLoading can flip during mutations and would unmount the stack
  const isReady = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isVerified = useAuthStore((s) => Boolean(s.user?.emailVerified));

  return {
    isReady,
    isAuthenticated,
    canAccessApp: isAuthenticated && isVerified,
  };
};
