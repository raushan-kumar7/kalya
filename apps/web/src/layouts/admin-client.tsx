'use client';

import { useAuth } from '@/hooks/auth';
import { useStoreHydration } from '@/hooks/use-store-hydration';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Activity, Cpu, Database, LogOut, MessageSquare, ShieldCheck, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { ThemeToggle } from '@/components/ui/utilities/theme-toggle';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/libs/utils';

export function AdminLayoutClient({ children }: Readonly<{ children: ReactNode }>) {
  useStoreHydration();
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isAuthenticated, isInitialized, isLoading } = useAuth();

  const isAuthorizedAdmin =
    isInitialized &&
    !isLoading &&
    isAuthenticated &&
    Boolean(user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'));

  // Inquiry KPI Stats for Dynamic Badge (Called unconditionally at top level)
  const { data: inquiryStats } = useQuery({
    queryKey: ['admin', 'inquiry-stats'],
    queryFn: () => AdminService.getInquiryStats(),
    refetchInterval: 30000,
    enabled: isAuthorizedAdmin,
  });

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        router.replace('/auth/sign-in');
      } else if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        router.replace('/dashboard');
      }
    }
  }, [isInitialized, isAuthenticated, isLoading, user?.role, router]);

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg text-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-caption font-medium text-text-secondary">
            Verifying administrative privileges…
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated guard
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role Access Guard (Admin & Super-Admin)
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return null;
  }

  const navItems = [
    { name: 'Overview', href: '/admin', icon: Activity, exact: true },
    { name: 'Database & Backups', href: '/admin/database', icon: Database },
    { name: 'User Management', href: '/admin/users', icon: Users },
    {
      name: 'Inquiries & Support',
      href: '/admin/inquiries',
      icon: MessageSquare,
      badge: inquiryStats?.new,
    },
    { name: 'Platform Activities', href: '/admin/activity', icon: ShieldCheck },
    { name: 'System Diagnostics', href: '/admin/services', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-body antialiased selection:bg-primary-subtle selection:text-primary">
      {/* Top Banner Navigation (2-Tier Enterprise Architecture) */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-xl">
        {/* Tier 1: System Identity, Workspace Switcher & User Controls */}
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Brand with Official Logo & Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <Logo href="/admin" size="sm" priority animated />

            <span className="h-4 w-px bg-border/80 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Badge
                variant="subtle"
                dot
                dotColor="primary"
                className="text-[11px] font-semibold tracking-wider uppercase font-numeric"
              >
                {user.role === 'SUPER_ADMIN' ? 'Super-Admin' : 'Admin'}
              </Badge>

              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-0.5 text-[11px] font-medium text-success border border-success/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                </span>
                Live System
              </div>
            </div>
          </div>

          {/* Right Controls: Workspace Switch + ThemeToggle + Profile Snippet + SignOut */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle size="sm" className="h-8 w-8" />

            <span className="h-4 w-px bg-border/80" />

            {/* User Profile snippet */}
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-raised/60 px-2.5 py-1 shadow-2xs">
              <Avatar size="xs">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left leading-none">
                <span className="text-[12px] font-semibold text-text-primary">{user.name}</span>
                <span className="text-[10px] text-text-muted truncate max-w-[130px] font-numeric mt-0.5">
                  {user.email}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => signOut()}
              title="Sign Out"
              aria-label="Sign Out"
              className="h-8 w-8 text-text-secondary hover:text-danger hover:bg-danger-subtle/50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Tier 2: Dedicated Segmented Navigation Tabs & System Telemetry Heartbeat */}
        <div className="border-t border-border/60 bg-surface/75 backdrop-blur-md py-2">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-12">
            {/* Navigation Tabs - Modern Segmented Pills */}
            <nav className="flex items-center gap-1 rounded-xl border border-border/80 bg-surface-raised p-1 shadow-2xs overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-1 text-caption font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-surface text-text-primary shadow-xs font-semibold'
                        : 'text-text-muted hover:text-text-secondary'
                    )}
                  >
                    <Icon
                      className={cn('h-3.5 w-3.5', isActive ? 'text-primary' : 'text-text-muted')}
                    />
                    <span>{item.name}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[10px] font-bold font-numeric">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Telemetry Quick Heartbeat */}
            <div className="hidden lg:flex items-center gap-3 text-caption text-text-muted font-numeric">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-medium text-text-secondary">SQLite WAL</span>
              </span>
              <span className="h-3 w-px bg-border/60" />
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] text-text-secondary">Fastify API</span>
              </span>
              <span className="h-3 w-px bg-border/60" />
              <Badge variant="subtle" size="sm" className="text-[10px] font-numeric px-1.5 py-0">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      {/* Enhanced Enterprise Admin Footer */}
      <footer className="mt-auto border-t border-border bg-surface/60 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Brand + Description */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <Logo href="/admin" size="sm" />
                <Badge variant="subtle" size="sm" className="font-numeric text-[10px] uppercase">
                  Admin Console
                </Badge>
              </div>
              <p className="text-caption text-text-secondary max-w-sm leading-relaxed">
                Centralized platform governance, database explorer, real-time subsystem telemetry,
                and zero-data-loss automated disaster recovery for the Kalya Personal Finance App.
              </p>
            </div>

            {/* Center 3 Cols: System Status */}
            <div className="md:col-span-3 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                Platform Status
              </span>
              <Link
                href="/admin/services"
                className="group flex items-center gap-2.5 rounded-lg border border-border bg-surface p-2.5 hover:border-primary/40 hover:bg-surface-raised transition-all shadow-2xs"
              >
                <div className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </div>
                <div className="text-left min-w-0">
                  <p className="text-caption font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                    All Subsystems Operational
                  </p>
                  <p className="text-[10px] text-text-muted font-numeric">
                    Continuous health probes active
                  </p>
                </div>
              </Link>
            </div>

            {/* Right 4 Cols: Quick Administrative Links */}
            <div className="md:col-span-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                Administrative Tools
              </span>
              <div className="grid grid-cols-2 gap-2 text-caption">
                <Link
                  href="/admin/database"
                  className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-[12px]"
                >
                  <Database className="h-3 w-3 text-primary shrink-0" />
                  <span>Database Studio</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-[12px]"
                >
                  <Users className="h-3 w-3 text-primary shrink-0" />
                  <span>User Directory</span>
                </Link>
                <Link
                  href="/admin/activity"
                  className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-[12px]"
                >
                  <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
                  <span>Audit Logs</span>
                </Link>
                <Link
                  href="/admin/services"
                  className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-[12px]"
                >
                  <Cpu className="h-3 w-3 text-primary shrink-0" />
                  <span>Diagnostics</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sub-Footer Divider & Copyright */}
          <div className="mt-8 border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-muted font-numeric">
            <span>
              &copy; {new Date().getFullYear()} Kalya Personal Finance App. Confidential Admin
              Console.
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-surface-raised px-2 py-0.5 border border-border/80">
                SQLite WAL
              </span>
              <span className="rounded-md bg-surface-raised px-2 py-0.5 border border-border/80">
                Fastify 4
              </span>
              <span className="rounded-md bg-surface-raised px-2 py-0.5 border border-border/80">
                Next.js 16
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
