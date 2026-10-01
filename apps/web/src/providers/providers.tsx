'use client';

import * as React from 'react';
import { ThemeProvider } from '@/components/ui/utilities';
import { Toaster } from '@/components/ui/feedback';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { TableProvider } from './table-provider';

export interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Root providers composer unifying Theme, TanStack React Query, Auth initialization,
 * Table configurations, and Toast notifications.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <QueryProvider>
        <AuthProvider>
          <TableProvider>
            {children}
            <Toaster />
          </TableProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export { AppProviders as Providers };
