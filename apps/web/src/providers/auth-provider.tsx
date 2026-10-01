'use client';

import React, { useEffect } from 'react';
import { AuthService } from '@/libs/services/auth';
import { useAuthStore } from '@/stores/auth';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        setLoading(true);
        const data = await AuthService.getSession();

        if (!isMounted) return;

        if (data?.user && data?.session) {
          setAuth(data.user, data.session);
        } else {
          clearAuth();
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    initializeAuth();

    // Listen for global 401 Unauthorized events from axios interceptor
    const handleUnauthorized = () => {
      clearAuth();
    };

    window.addEventListener('kalya:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('kalya:unauthorized', handleUnauthorized);
    };
  }, [setAuth, clearAuth, setLoading, setInitialized]);

  return <>{children}</>;
}
