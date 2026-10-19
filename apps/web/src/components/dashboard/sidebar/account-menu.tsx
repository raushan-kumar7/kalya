'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsUpDown, ShieldAlert, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { cn } from '@/libs/utils';
import { type AccountNavItem, DEFAULT_ACCOUNT_NAV } from './constants';
import { User } from '@kalya/types';

const MENU_CLOSE_DELAY = 150;
const PROFILE_HREF = '/dashboard/settings/account';

export interface AccountMenuProps {
  user?: User;
  isCollapsed: boolean;
  pathname?: string;
  onNavigate?: (href: string) => void;
  onSignOut?: () => void;
  items?: AccountNavItem[];
}

export function AccountMenu({
  user,
  isCollapsed,
  pathname,
  onNavigate,
  onSignOut,
  items = DEFAULT_ACCOUNT_NAV,
}: AccountMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<{
    bottom: number;
    left: number;
    width?: number;
  } | null>(null);

  // createPortal requires document.body, which is only present client-side
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = user?.name || user?.username || 'User';
  const displayEmail = user?.email ?? '';

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  // Automatically close when sidebar collapse state toggles
  useEffect(() => {
    setIsOpen(false);
  }, [isCollapsed]);

  // Clean up any pending close timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimeout();
    const el = triggerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setAnchor(
        isCollapsed
          ? {
              bottom: window.innerHeight - rect.top + 8,
              left: rect.right + 8,
            }
          : {
              bottom: window.innerHeight - rect.top + 8,
              left: rect.left,
              width: Math.max(rect.width, 220),
            }
      );
    }
    setIsOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, MENU_CLOSE_DELAY);
  };

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(href);
    } else {
      router.push(href);
    }
  };

  const handleSignOut = () => {
    setIsOpen(false);
    if (onSignOut) {
      onSignOut();
    } else {
      router.push('/sign-out');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative w-full', isCollapsed && 'flex justify-center')}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={isCollapsed ? `${displayName} — account menu` : undefined}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onFocus={openMenu}
        onBlur={scheduleClose}
        className={cn(
          'flex items-center gap-3 rounded-full text-left transition-all duration-150 active:scale-[0.98]',
          'hover:bg-primary-subtle focus-visible:ring-accent/40 focus-visible:ring-offset-surface-raised outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          isCollapsed ? 'h-10 w-10 justify-center p-0.5' : 'w-full px-3 py-2',
          isOpen && 'bg-primary-subtle ring-1 ring-border'
        )}
      >
        <Avatar size="sm" className="ring-1 ring-border shrink-0">
          {user?.image && <AvatarImage src={user.image} alt={displayName} />}
          <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!isCollapsed && (
          <>
            <div className="flex flex-1 flex-col overflow-hidden leading-tight">
              <span className="text-body-sm text-text-primary truncate font-medium">
                {displayName}
              </span>
              <span className="text-caption text-text-muted truncate">
                {displayEmail || 'View profile'}
              </span>
            </div>
            <ChevronsUpDown
              size={14}
              className="text-text-muted shrink-0 transition-transform duration-150"
            />
          </>
        )}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && anchor && (
              <motion.div
                ref={menuRef}
                role="menu"
                aria-label="Account menu"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
                style={{
                  position: 'fixed',
                  bottom: anchor.bottom,
                  left: anchor.left,
                  width: anchor.width,
                }}
                className="bg-surface-raised border-border text-text-primary z-50 flex min-w-56 flex-col gap-1 rounded-2xl border p-1.5 shadow-xl backdrop-blur-md"
              >
                {/* User Header */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar size="sm" className="ring-1 ring-border shrink-0">
                    {user?.image && <AvatarImage src={user.image} alt={displayName} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden leading-tight">
                    <span className="text-body-sm text-text-primary truncate font-semibold">
                      {displayName}
                    </span>
                    {displayEmail && (
                      <span className="text-caption text-text-muted truncate">{displayEmail}</span>
                    )}
                  </div>
                </div>

                <div className="border-border flex flex-col gap-0.5 border-t pt-1">
                  {/* Admin Console link */}
                  {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleNavigate('/admin')}
                      className="text-body-sm flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors duration-150"
                    >
                      <ShieldAlert size={16} className="shrink-0 text-rose-500" />
                      <span className="flex-1 truncate">Admin Console</span>
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 uppercase">
                        {user?.role === 'SUPER_ADMIN' ? 'Super' : 'Admin'}
                      </span>
                    </button>
                  )}

                  {/* Direct Profile Link if not already present in items */}
                  {!items.some((i) => i.href === PROFILE_HREF) && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleNavigate(PROFILE_HREF)}
                      className={cn(
                        'text-body-sm flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left font-medium transition-colors duration-150',
                        pathname === PROFILE_HREF
                          ? 'bg-primary-subtle text-primary font-semibold'
                          : 'text-text-secondary hover:bg-primary-subtle hover:text-primary'
                      )}
                    >
                      <UserCircle size={16} className="shrink-0" />
                      <span>View Profile</span>
                    </button>
                  )}

                  {/* Configured Account Nav Items */}
                  {items.map((item) => {
                    const isSignout = item.href === '/sign-out' || item.variant === 'danger';
                    const isCurrent = pathname === item.href;

                    return (
                      <button
                        key={item.href}
                        type="button"
                        role="menuitem"
                        onClick={() => (isSignout ? handleSignOut() : handleNavigate(item.href))}
                        className={cn(
                          'text-body-sm flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left font-medium transition-colors duration-150',
                          isSignout
                            ? 'text-danger hover:bg-danger-subtle'
                            : isCurrent
                              ? 'bg-primary-subtle text-primary font-semibold'
                              : 'text-text-secondary hover:bg-primary-subtle hover:text-primary'
                        )}
                      >
                        <item.icon size={16} className="shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.description && !isCollapsed && (
                          <span className="text-caption text-text-muted truncate">
                            {item.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
