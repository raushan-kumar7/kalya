'use client';

import { useAuth } from '@/hooks/auth';
import { useStoreHydration } from '@/hooks/use-store-hydration';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';

export function AdminLayoutClient({ children }: Readonly<{ children: ReactNode }>) {
  useStoreHydration();
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isAuthenticated, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.replace('/auth/sign-in');
    }
  }, [isInitialized, isAuthenticated, isLoading, router]);

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          <span className="text-xs font-medium text-slate-400">
            Verifying Super-Admin privileges…
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated guard
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role Access Guard (Strict Super-Admin)
  if (user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold tracking-tight text-white">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-400">
            This command center requires <strong className="text-rose-400">SUPER_ADMIN</strong>{' '}
            privileges. Your account ({user.email}) has role{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300">
              [{user.role}]
            </code>
            .
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Personal Finances
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/admin', icon: Activity, exact: true },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Platform Activities', href: '/admin/activity', icon: ShieldCheck },
    { name: 'System Diagnostics', href: '/admin/services', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-rose-500/30 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Brand & Badge */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-black text-sm tracking-tighter shadow-lg shadow-rose-600/20">
                K
              </span>
              <span className="font-bold text-base tracking-tight text-white">Kalya</span>
            </Link>

            <span className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                Super-Admin
              </span>

              <span className="hidden md:inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Operational
              </span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">My Finances</span>
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            {/* User Profile snippet */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-rose-300 ring-1 ring-white/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-white/[0.06] bg-slate-900/40">
          <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Page Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Kalya Super-Admin Operational Console</span>
          <span className="font-mono text-[11px] text-slate-600">
            v1.0.0-core | Fastify + SQLite WAL + Better-Auth
          </span>
        </div>
      </footer>
    </div>
  );
}
