'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { User } from '@kalya/types';
import { NotificationPanel } from '@/components/notifications';
import { Breadcrumb } from '@/components/shared';
import { ThemeToggle } from '@/components/ui';
import { cn } from '@/libs/utils';
import { usePageHeading } from './helper';
import { useUnreadAlertCountQuery } from '@/hooks/finances';
import { useSidebar } from '@/hooks/use-sidebar';
import { SearchPalette } from './search-palette';
import { SearchTrigger } from './search-trigger';

export interface TopProps {
  /** Signed-in user profile */
  user?: User | null;
  /** Whether unread alerts/notifications are pending */
  hasNotifications?: boolean;
  /** Explicit unread notification badge count */
  unreadNotificationCount?: number;
  className?: string;
}

/**
 * Top Navigation Header for the Kalya dashboard layout.
 * Features dynamic greetings, route-aware breadcrumbs, mobile sidebar toggle, search overlay, and notification flyout.
 */
export const Top = ({
  user,
  hasNotifications = false,
  unreadNotificationCount,
  className,
}: TopProps) => {
  const pathname = usePathname();
  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'there';
  const { title, subtitle, breadcrumbPath, isOverview } = usePageHeading(firstName);
  const { data: liveUnreadData } = useUnreadAlertCountQuery();
  const { setMobileOpen } = useSidebar();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Detect platform for keyboard shortcut display (⌘K on macOS, Ctrl K on Windows/Linux)
  useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent));
  }, []);

  // Global keyboard shortcut to open search palette (⌘K, Ctrl+K, or /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      if (
        e.key === '/' &&
        !searchOpen &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        )
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchOpen]);

  // Automatically publish the header's real rendered height as --header-h
  // so subsequent sticky elements (e.g. tabs, filters) stick flush underneath
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof document === 'undefined') return;

    const setHeaderVar = () => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    };

    setHeaderVar();
    const ro = new ResizeObserver(setHeaderVar);
    ro.observe(el);

    return () => ro.disconnect();
  }, [pathname, isOverview]);

  // Handle outside clicks and keyboard escape for notifications dropdown
  useEffect(() => {
    if (!notificationsOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        !notificationButtonRef.current?.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen]);

  // Close notifications and search on route change
  useEffect(() => {
    setNotificationsOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const effectiveUnreadCount = unreadNotificationCount ?? liveUnreadData?.count ?? 0;
  const hasUnread = hasNotifications || effectiveUnreadCount > 0;

  return (
    <header
      ref={headerRef}
      aria-label="Dashboard top navigation"
      className={cn(
        'sticky top-0 z-20 flex items-center justify-between gap-2.5 sm:gap-3 border-b border-border/70 bg-bg/85 px-3 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-md transition-all select-none',
        className
      )}
    >
      {/* -------------------------------------------------------------- */}
      {/* 1. LEFT: MOBILE MENU TRIGGER + TITLE / BREADCRUMB               */}
      {/* -------------------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation sidebar"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-surface-raised text-text-secondary shadow-card transition-colors hover:bg-surface hover:text-text-primary active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none! md:hidden"
        >
          <Menu size={18} />
        </button>

        {/* Title or Breadcrumb */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {isOverview ? (
            <div className="flex min-w-0 flex-col">
              <h1 className="truncate font-display text-body-lg font-bold tracking-tight text-text-primary sm:text-display-md">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 hidden truncate text-caption text-text-secondary sm:block sm:text-body-sm">
                  {subtitle}
                </p>
              )}
            </div>
          ) : (
            <div className="min-w-0">
              <Breadcrumb
                path={breadcrumbPath}
                description={subtitle ?? undefined}
                descriptionClassName="hidden sm:block"
              />
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* 2. RIGHT SEARCH & ACTIONS                                       */}
      {/* -------------------------------------------------------------- */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Search: desktop pill + mobile icon button */}
        <SearchTrigger onClick={() => setSearchOpen(true)} isMac={isMac} />

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            ref={notificationButtonRef}
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-label="Toggle notifications"
            aria-expanded={notificationsOpen}
            className={cn(
              'relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-surface-raised text-text-secondary shadow-card transition-all hover:bg-surface hover:text-text-primary active:scale-95',
              'focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none!',
              notificationsOpen &&
                'border-primary/30 bg-primary-subtle text-primary ring-1 ring-primary/20'
            )}
          >
            <Bell size={16} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-accent ring-2 ring-surface-raised">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              </span>
            )}
          </button>

          <NotificationPanel
            ref={notificationsRef}
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        {/* Subtle Vertical Divider */}
        <div className="hidden h-5 w-px bg-border/80 sm:block" aria-hidden="true" />

        {/* Theme Mode Toggle */}
        <ThemeToggle className="h-9 w-9 shrink-0 rounded-full border border-border/80 bg-surface-raised text-text-secondary shadow-card transition-all hover:bg-surface hover:text-text-primary active:scale-95" />
      </div>

      {/* -------------------------------------------------------------- */}
      {/* 3. GLOBAL COMMAND PALETTE SEARCH MODAL                         */}
      {/* -------------------------------------------------------------- */}
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Top;
export * from './helper';
export * from './search-palette';
export * from './search-trigger';
export * from './use-search-data';
