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

        // Check if redirected from OAuth callback with a token query parameter
        let urlToken: string | null = null;
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          urlToken = params.get('token');
        }

        const hasCachedAuth = useAuthStore.getState().isAuthenticated;
        // Only set blocking loading spinner if user was not already cached as authenticated
        if (!hasCachedAuth || urlToken) {
          setLoading(true);
        }

        const data = await AuthService.getSession(urlToken || undefined);

        if (!isMounted) return;

        if (data?.user && data?.session) {
          setAuth(data.user, data.session);

          // Clean token from browser address bar without reload
          if (urlToken && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            const cleanUrl =
              url.pathname +
              (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') +
              url.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          }
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
