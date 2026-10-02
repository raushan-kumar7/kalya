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
        // Ensure Zustand store is rehydrated from localStorage first
        await useAuthStore.persist?.rehydrate?.();

        const hasCachedAuth = useAuthStore.getState().isAuthenticated;
        // Only set blocking loading spinner if user was not already cached as authenticated
        if (!hasCachedAuth) {
          setLoading(true);
        }

        const data = await AuthService.getSession();

        if (!isMounted) return;

        if (data?.user && data?.session) {
          setAuth(data.user, data.session);
        } else {
          // If server returned no active session, verify if local session has genuinely expired
          const cachedSession = useAuthStore.getState().session;
          const isExpired = cachedSession?.expiresAt
            ? new Date(cachedSession.expiresAt).getTime() <= Date.now()
            : true;

          // Only clear auth if the session actually expired or no user was cached
          if (isExpired || !useAuthStore.getState().user) {
            clearAuth();
          }
        }
      } catch {
        // On network error or connection timeout, preserve cached user from localStorage
        // instead of forcing a logout. Only clear if no local session was found.
        if (isMounted) {
          const cachedUser = useAuthStore.getState().user;
          if (!cachedUser) {
            clearAuth();
          }
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
