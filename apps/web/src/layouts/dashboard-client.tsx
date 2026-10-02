'use client';

import { Footer, Sidebar, Top } from '@/components/dashboard';
import { useAuth } from '@/hooks/auth';
import { useStoreHydration } from '@/hooks/use-store-hydration';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export function DashboardLayoutClient({ children }: Readonly<{ children: ReactNode }>) {
  useStoreHydration();
  const router = useRouter();
  const { user, signOut, isAuthenticated, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if auth verification has completed and user is definitely unauthenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.replace('/auth/sign-in');
    }
  }, [isInitialized, isAuthenticated, isLoading, router]);

  // While auth store is initializing, show a graceful loader to prevent flash/premature redirect
  if (!isInitialized || isLoading) {
    return (
      <div className="bg-bg flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-caption text-text-muted">Loading your finances…</span>
        </div>
      </div>
    );
  }

  // If initialized and not authenticated, do not render dashboard while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-bg flex min-h-full overflow-x-clip">
      <Sidebar user={user} onSignOut={signOut} />
      <div className="flex min-h-full w-full flex-1 flex-col transition-[margin] duration-300 md:ml-(--sidebar-w,255px)">
        <Top user={user} />
        <main className="flex-1 px-4 pb-24 sm:px-6 md:px-8 md:pb-16">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
