'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/libs/utils';
import { hasActiveChild, isNavItemActive, isNavItemOrChildActive, type NavItem } from './constants';

export interface NavItemRowProps {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
  badgeCounts?: Partial<Record<string, number>>;
  onNavigate?: (href: string) => void;
  onHoverStart?: (id: string, el: HTMLElement) => void;
  onHoverEnd?: () => void;
}

const FLYOUT_CLOSE_DELAY = 180;
const PROFILE_HREF = '/dashboard/settings/account';

export function NavItemRow({
  item,
  pathname,
  isCollapsed,
  badgeCounts = {},
  onNavigate,
  onHoverStart,
  onHoverEnd,
}: NavItemRowProps) {
  const router = useRouter();
  const submenuId = useId();
  const hasChildren = Boolean(item.children && item.children.length > 0);

  // If viewing account profile page, prevent collision highlighting
  const isProfileRoute = pathname.startsWith(PROFILE_HREF);
  const isActive = isProfileRoute ? false : isNavItemActive(pathname, item);
  const isChildActive = isProfileRoute ? false : hasActiveChild(pathname, item);
  const isParentActive = isProfileRoute ? false : isNavItemOrChildActive(pathname, item);

  // Accordion state in expanded rail
  const [isOpen, setIsOpen] = useState(isParentActive);

  // Floating flyout state in collapsed rail
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [flyoutAnchor, setFlyoutAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Keep accordion synchronized when route changes
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  // Expanding/collapsing rail resets flyout
  useEffect(() => {
    if (!isCollapsed) {
      setIsFlyoutOpen(false);
    }
  }, [isCollapsed]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic badge count
  const badgeCount = item.badgeKey ? (badgeCounts[item.badgeKey] ?? 0) : 0;

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

  const openFlyout = () => {
    clearCloseTimeout();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setFlyoutAnchor({ top: rect.top, left: rect.right + 10 });
    }
    setIsFlyoutOpen(true);
  };

  const scheduleCloseFlyout = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsFlyoutOpen(false);
    }, FLYOUT_CLOSE_DELAY);
  };

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      router.push(href);
    }
  };

  // Close flyout on escape or outside click
  useEffect(() => {
    if (!isFlyoutOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (flyoutRef.current?.contains(target)) return;
      setIsFlyoutOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFlyoutOpen(false);
    };

    const handleScroll = () => {
      setIsFlyoutOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isFlyoutOpen]);

  const handleClick = () => {
    if (item.disabled) return;

    if (hasChildren) {
      if (isCollapsed) {
        if (isFlyoutOpen) {
          setIsFlyoutOpen(false);
          handleNavigate(item.href);
        } else {
          openFlyout();
        }
        return;
      }
      setIsOpen((prev) => !prev);
      return;
    }

    handleNavigate(item.href);
  };

  return (
    <div className={cn('relative w-full select-none', isCollapsed && 'flex justify-center')}>
      <motion.button
        ref={triggerRef}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-expanded={hasChildren ? (isCollapsed ? isFlyoutOpen : isOpen) : undefined}
        aria-controls={hasChildren ? submenuId : undefined}
        aria-label={isCollapsed ? item.label : undefined}
        aria-disabled={item.disabled}
        disabled={item.disabled}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (isCollapsed && hasChildren) {
            openFlyout();
          } else {
            onHoverStart?.(item.href, e.currentTarget);
          }
        }}
        onMouseLeave={() => {
          if (isCollapsed && hasChildren) {
            scheduleCloseFlyout();
          } else {
            onHoverEnd?.();
          }
        }}
        onFocus={(e) => {
          if (isCollapsed && hasChildren) {
            openFlyout();
          } else {
            onHoverStart?.(item.href, e.currentTarget);
          }
        }}
        onBlur={() => {
          if (isCollapsed && hasChildren) {
            scheduleCloseFlyout();
          } else {
            onHoverEnd?.();
          }
        }}
        whileHover={{ scale: item.disabled ? 1 : 1.02 }}
        whileTap={{ scale: item.disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'text-body-sm relative flex w-full items-center gap-3 rounded-full font-medium transition-colors duration-150',
          'focus-visible:ring-accent/40 focus-visible:ring-offset-surface-raised outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          isCollapsed ? 'h-9 w-9 justify-center' : 'px-3 py-2',
          isActive || (hasChildren && isParentActive && !isOpen)
            ? 'bg-primary text-on-primary shadow-sm'
            : 'text-text-secondary hover:bg-primary-subtle hover:text-primary',
          item.disabled &&
            'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-text-secondary'
        )}
      >
        {/* Glow pill around active item */}
        {isActive && !isCollapsed && (
          <motion.span
            layoutId="active-pill-glow"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/15 ring-inset"
          />
        )}
        {isActive && isCollapsed && (
          <motion.span
            layoutId="active-pill-glow-collapsed"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="ring-accent/50 pointer-events-none absolute -inset-1 rounded-full ring-1"
          />
        )}

        {/* Icon */}
        <item.icon size={17} className="relative shrink-0" />

        {/* Expanded Label */}
        <AnimatePresence initial={false} mode="wait">
          {!isCollapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex-1 overflow-hidden text-left whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Static Badge (e.g. 'Soon', 'Beta') */}
        {item.badge && !isCollapsed && (
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none shrink-0',
              isActive
                ? 'bg-white/20 text-on-primary'
                : 'bg-primary-subtle text-text-muted border border-border'
            )}
          >
            {item.badge}
          </span>
        )}

        {/* Dynamic Badge Count (e.g. Alerts) */}
        {badgeCount > 0 && !isCollapsed && (
          <span className="bg-danger text-on-danger text-caption relative ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 leading-none font-bold">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
        {badgeCount > 0 && isCollapsed && (
          <span className="bg-danger ring-surface-raised absolute top-1 right-1 h-2 w-2 rounded-full ring-2" />
        )}

        {/* Submenu Indicator Chevron */}
        {hasChildren && !isCollapsed && (
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'relative shrink-0 transition-colors',
              isActive ? 'text-on-primary/80' : 'text-text-muted'
            )}
          >
            <ChevronDown size={14} />
          </motion.span>
        )}
      </motion.button>

      {/* Expanded rail: inline nested submenu */}
      {hasChildren && !isCollapsed && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={submenuId}
              key="submenu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden pl-4"
            >
              <div className="border-border/70 mt-1 flex flex-col gap-1 border-l pl-3">
                {item.children!.map((child) => {
                  const childActive = isNavItemActive(pathname, child);
                  return (
                    <button
                      key={child.href}
                      type="button"
                      aria-current={childActive ? 'page' : undefined}
                      aria-disabled={child.disabled}
                      disabled={child.disabled}
                      onClick={() => handleNavigate(child.href)}
                      className={cn(
                        'text-body-sm flex items-center gap-2.5 rounded-full px-3 py-1.5 text-left transition-colors duration-150',
                        'focus-visible:ring-accent/40 outline-none focus-visible:ring-2',
                        childActive
                          ? 'bg-primary-subtle text-primary font-semibold'
                          : 'text-text-secondary hover:bg-primary-subtle hover:text-primary',
                        child.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
                      )}
                    >
                      <child.icon size={15} className="shrink-0" />
                      <span className="truncate flex-1">{child.label}</span>
                      {child.badge && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-primary-subtle text-text-muted border border-border">
                          {child.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Collapsed rail: Floating flyout menu */}
      {hasChildren &&
        isCollapsed &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isFlyoutOpen && flyoutAnchor && (
              <motion.div
                ref={flyoutRef}
                id={submenuId}
                role="menu"
                initial={{ opacity: 0, x: -6, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, scale: 0.96 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                onMouseEnter={openFlyout}
                onMouseLeave={scheduleCloseFlyout}
                style={{
                  position: 'fixed',
                  top: flyoutAnchor.top,
                  left: flyoutAnchor.left,
                }}
                className="bg-surface-raised border-border text-text-primary z-50 flex min-w-48 flex-col gap-0.5 rounded-2xl border p-1.5 shadow-xl backdrop-blur-md"
              >
                {/* Header title */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFlyoutOpen(false);
                    handleNavigate(item.href);
                  }}
                  className="text-text-muted hover:text-primary text-caption flex w-full items-center px-2.5 pt-1.5 pb-1 text-left font-semibold tracking-wider uppercase transition-colors"
                >
                  {item.label}
                </button>

                <div className="border-border/60 flex flex-col gap-0.5 border-t pt-1">
                  {item.children!.map((child) => {
                    const childActive = isNavItemActive(pathname, child);
                    return (
                      <button
                        key={child.href}
                        type="button"
                        role="menuitem"
                        aria-current={childActive ? 'page' : undefined}
                        aria-disabled={child.disabled}
                        disabled={child.disabled}
                        onClick={() => {
                          setIsFlyoutOpen(false);
                          handleNavigate(child.href);
                        }}
                        className={cn(
                          'text-body-sm flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left whitespace-nowrap font-medium transition-colors duration-150',
                          childActive
                            ? 'bg-primary text-on-primary'
                            : 'text-text-secondary hover:bg-primary-subtle hover:text-primary',
                          child.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
                        )}
                      >
                        <child.icon size={15} className="shrink-0" />
                        <span className="flex-1">{child.label}</span>
                        {child.badge && (
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-white/20 text-on-primary">
                            {child.badge}
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
