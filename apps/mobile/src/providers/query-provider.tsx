import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useEffect, type ReactNode } from 'react';

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
    setOnline(isOnline);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1_000 * 60 * 5, // 5 minutes
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours
      retry: (failureCount, err: any) => {
        const status = err?.response?.status || err?.status;
        if (status === 401 || status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: Platform.OS === 'web',
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (status: AppStateStatus) =>
      focusManager.setFocused(status === 'active')
    );

    return () => {
      subscription.remove();
    };
  }, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
