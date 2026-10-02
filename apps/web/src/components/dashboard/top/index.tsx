'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Search, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { User } from '@kalya/types';
import { NotificationPanel } from '@/components/notifications';
import { Breadcrumb } from '@/components/shared';
import { ThemeToggle } from '@/components/ui';
import { cn } from '@/libs/utils';
import { usePageHeading } from './helper';

export interface TopProps {
  /** Signed-in user profile */
  user?: User | User | null;
  /** Whether unread alerts/notifications are pending */
  hasNotifications?: boolean;
  /** Explicit unread notification badge count */
  unreadNotificationCount?: number;
  className?: string;
}

/**
 * Top Navigation Header for the Kalya dashboard layout.
 * Features dynamic greetings, route-aware breadcrumbs, search overlay, and notification flyout.
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

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

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

  // Handle outside clicks and keyboard escape for popovers
  useEffect(() => {
    if (!notificationsOpen && !mobileSearchOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notificationsOpen &&
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
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen, mobileSearchOpen]);

  // Close notifications and search on route change
  useEffect(() => {
    setNotificationsOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const hasUnread =
    hasNotifications || (unreadNotificationCount !== undefined && unreadNotificationCount > 0);

  return (
    <header
      ref={headerRef}
      aria-label="Dashboard top navigation"
      className={cn(
        'border-border/70 bg-bg/85 sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-4 py-3.5 backdrop-blur-md transition-all select-none',
        'md:px-6 md:py-4',
        className
      )}
    >
      {/* -------------------------------------------------------------- */}
      {/* 1. LEFT TITLE / BREADCRUMB                                      */}
      {/* -------------------------------------------------------------- */}
      <div className="flex min-w-0 flex-col justify-center">
        {isOverview ? (
          <div className="flex flex-col">
            <h1 className="font-display text-body-lg sm:text-display-md text-text-primary truncate font-bold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-caption sm:text-body-sm text-text-secondary hidden sm:block mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        ) : (
          <Breadcrumb path={breadcrumbPath} description={subtitle ?? undefined} />
        )}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* 2. RIGHT SEARCH & ACTIONS                                       */}
      {/* -------------------------------------------------------------- */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Desktop Search Bar */}
        <div className="relative hidden md:block">
          <Search
            className="text-text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search transactions, budgets, goals…"
            className={cn(
              'border-border/80 bg-surface-raised text-body-sm text-text-primary placeholder:text-text-muted',
              'w-60 rounded-full border py-2 pl-9 pr-10 shadow-xs transition-all duration-150',
              'focus:border-primary focus:ring-accent/40 focus:ring-2 focus:outline-none lg:w-72'
            )}
          />
          <kbd className="border-border text-caption font-numeric text-text-muted pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5 uppercase">
            ⌘K
          </kbd>
        </div>

        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Open search"
          className="border-border/80 bg-surface-raised text-text-secondary hover:bg-surface hover:text-text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-xs transition-colors md:hidden"
        >
          <Search size={16} />
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            ref={notificationButtonRef}
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-label="Toggle notifications"
            aria-expanded={notificationsOpen}
            className={cn(
              'border-border/80 bg-surface-raised text-text-secondary hover:bg-surface hover:text-text-primary relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-xs transition-all active:scale-95',
              'focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none',
              notificationsOpen &&
                'bg-primary-subtle text-primary border-primary/30 ring-1 ring-primary/20'
            )}
          >
            <Bell size={16} />
            {hasUnread && (
              <span className="bg-accent ring-surface-raised absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full ring-2">
                <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
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
        <div className="bg-border/80 hidden h-5 w-px sm:block" aria-hidden="true" />

        {/* Theme Mode Toggle */}
        <ThemeToggle />
      </div>

      {/* -------------------------------------------------------------- */}
      {/* 3. MOBILE FULL-WIDTH SEARCH OVERLAY                             */}
      {/* -------------------------------------------------------------- */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="bg-bg/95 border-border/80 absolute inset-x-0 top-0 z-30 flex h-full items-center gap-2 border-b px-4 backdrop-blur-md md:hidden"
          >
            <div className="relative flex-1">
              <Search className="text-text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                autoFocus
                type="search"
                placeholder="Search Kalya…"
                className={cn(
                  'border-border/80 bg-surface-raised text-body-sm text-text-primary placeholder:text-text-muted',
                  'w-full rounded-full border py-2 pl-9 pr-8 shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-accent/40'
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="text-body-sm text-text-secondary hover:text-text-primary rounded-lg px-2.5 py-1.5 font-medium transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Top;
export * from './helper';
