'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { Menu, PanelLeftClose, PanelRightClose, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, Logo } from '@/components/shared';
import { AnimatedTooltip } from '@/components/ui';
import { cn } from '@/libs/utils';
import { AccountMenu } from './account-menu';
import { type NavSection, SIDEBAR_NAVS_ITEMS } from './constants';
import { SidebarNavList } from './nav';
import { User } from '@kalya/types';
import { useSidebar } from '@/hooks/use-sidebar';

// ---------------------------------------------------------------------------
// CONFIGURATION CONSTANTS
// ---------------------------------------------------------------------------

export const SIDEBAR_WIDTH = {
  expanded: 256,
  collapsed: 80,
  mobile: 280,
} as const;

const SPRING = { type: 'spring', stiffness: 400, damping: 32 } as const;

const SCROLL_AREA =
  'scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2';

// ---------------------------------------------------------------------------
// PROPS INTERFACE
// ---------------------------------------------------------------------------

export interface SidebarProps {
  /** User profile information for the bottom account menu */
  user?: User | null;
  /**
   * Controlled collapse state.
   * If provided, the component behaves as controlled.
   * If omitted, internal state manages the collapse state.
   */
  isCollapsed?: boolean;
  /** Optional collapse toggle callback */
  onToggleCollapse?: () => void;
  /**
   * Live counts for nav items with a badgeKey (e.g. unread alerts).
   * Example: `{ alerts: 3, insights: 1 }`
   */
  badgeCounts?: Partial<Record<string, number>>;
  /** Navigation callback handler. Defaults to Next.js router.push */
  onNavigate?: (href: string) => void;
  /** Sign out callback handler. Defaults to redirecting to /sign-out */
  onSignOut?: () => void;
  /** Custom navigation taxonomy if overriding defaults */
  sections?: NavSection[];
  /** Optional custom CSS class */
  className?: string;
}

// ---------------------------------------------------------------------------
// MAIN SIDEBAR COMPONENT
// ---------------------------------------------------------------------------

export function Sidebar({
  user,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  badgeCounts,
  onNavigate,
  onSignOut,
  sections = SIDEBAR_NAVS_ITEMS,
  className,
}: SidebarProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const pathname = currentPathname ?? '/dashboard';

  const {
    collapsed: storeCollapsed,
    toggleSidebar: storeToggleSidebar,
    mobileOpen: isMobileOpen,
    setMobileOpen: setIsMobileOpen,
  } = useSidebar();

  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : storeCollapsed;

  const drawerRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  // Tooltip for desktop rail collapse toggle button
  const [showToggleTooltip, setShowToggleTooltip] = useState(false);
  const [toggleAnchor, setToggleAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const toggleRotate = useMotionValue(0);
  const toggleTranslateX = useMotionValue(0);

  const hideToggleTip = useCallback(() => {
    setShowToggleTooltip(false);
    setToggleAnchor(null);
  }, []);

  const handleToggleCollapse = () => {
    hideToggleTip();
    if (onToggleCollapse) {
      onToggleCollapse();
    }
    if (!isControlled) {
      storeToggleSidebar();
    }
  };

  const showToggleTip = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setToggleAnchor({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    setShowToggleTooltip(true);
  };

  const toggleTooltipHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => showToggleTip(e.currentTarget),
    onMouseLeave: hideToggleTip,
    onFocus: (e: React.FocusEvent<HTMLElement>) => showToggleTip(e.currentTarget),
    onBlur: hideToggleTip,
    onPointerDown: hideToggleTip,
  };

  // Automatically dismiss toggle tooltip when collapse state changes
  useEffect(() => {
    hideToggleTip();
  }, [collapsed, hideToggleTip]);

  // Dismiss tooltip on scroll or window resize to prevent floating/stuck tooltips
  useEffect(() => {
    if (!showToggleTooltip) return;

    const handleDismiss = () => {
      hideToggleTip();
    };

    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);

    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [showToggleTooltip, hideToggleTip]);

  // Keep layout CSS variable in sync with desktop sidebar width
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(
      '--sidebar-w',
      `${collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded}px`
    );
  }, [collapsed]);

  // Lock background body scroll and manage keyboard trap when mobile drawer is open
  useEffect(() => {
    if (!isMobileOpen || typeof document === 'undefined') return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>('button, a, [tabindex]');
    firstFocusable?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
      mobileTriggerRef.current?.focus();
    };
  }, [isMobileOpen]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const goTo = (href: string) => {
    setIsMobileOpen(false);
    if (onNavigate) {
      onNavigate(href);
    } else {
      router.push(href);
    }
  };

  const handleSignOut = () => {
    setIsMobileOpen(false);
    if (onSignOut) {
      onSignOut();
    } else {
      router.push('/sign-out');
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* 1. MOBILE TRIGGER BUTTON (Visible on < md screens)                 */}
      {/* ------------------------------------------------------------------ */}
      <button
        ref={mobileTriggerRef}
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation sidebar"
        className={cn(
          'bg-surface-raised border-border fixed top-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-md md:hidden',
          'transition-all duration-150 hover:shadow-lg active:scale-90',
          FOCUS_RING,
          'focus-visible:ring-offset-bg'
        )}
      >
        <Menu size={18} className="text-text-secondary" />
      </button>

      {/* ------------------------------------------------------------------ */}
      {/* 2. MOBILE BACKDROP                                                */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* 3. DESKTOP SIDEBAR RAIL (Hidden on mobile, flex on md+)            */}
      {/* ------------------------------------------------------------------ */}
      <motion.aside
        animate={{
          width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
        }}
        transition={SPRING}
        className={cn(
          'bg-surface-raised border-border fixed top-0 left-0 z-30 hidden h-screen flex-col border-r select-none md:flex',
          className
        )}
      >
        {/* LOGO & COLLAPSE HEADER */}
        {!collapsed ? (
          <div className="group flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3.5">
            <div className="w-36 transition-opacity duration-150">
              <Logo width={120} height={36} priority className="h-auto w-auto" />
            </div>

            <div className="relative ml-2" {...toggleTooltipHandlers}>
              <button
                type="button"
                onClick={handleToggleCollapse}
                aria-label="Collapse sidebar"
                aria-expanded={!collapsed}
                className={cn(
                  'bg-primary text-on-primary hover:bg-primary-hover flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  'opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 hover:scale-105 focus-visible:opacity-100 active:scale-95',
                  FOCUS_RING,
                  'focus-visible:ring-offset-surface'
                )}
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center border-b border-border/60 px-3 py-3.5">
            <div className="relative" {...toggleTooltipHandlers}>
              <button
                type="button"
                onClick={handleToggleCollapse}
                aria-label="Expand sidebar"
                aria-expanded={!collapsed}
                className={cn(
                  'group hover:bg-primary-subtle relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  'transition-colors duration-150 active:scale-95',
                  FOCUS_RING,
                  'focus-visible:ring-offset-surface'
                )}
              >
                <Icon
                  width={32}
                  height={32}
                  className="transition-opacity duration-150 group-hover:opacity-0"
                />
                <PanelRightClose
                  size={16}
                  className="text-text-secondary absolute h-5 w-5 scale-90 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100"
                />
              </button>
            </div>
          </div>
        )}

        {/* SCROLLABLE NAVIGATION LINKS */}
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-2 pt-3',
            collapsed && 'items-center',
            SCROLL_AREA
          )}
        >
          <SidebarNavList
            isCollapsed={collapsed}
            pathname={pathname}
            sections={sections}
            badgeCounts={badgeCounts}
            onNavigate={goTo}
          />
        </div>

        {/* BOTTOM USER ACCOUNT FOOTER */}
        <div
          className={cn(
            'border-border/60 shrink-0 border-t px-2 py-3',
            collapsed && 'flex justify-center'
          )}
        >
          <AccountMenu
            user={user!}
            isCollapsed={collapsed}
            pathname={pathname}
            onNavigate={goTo}
            onSignOut={handleSignOut}
          />
        </div>
      </motion.aside>

      {/* ------------------------------------------------------------------ */}
      {/* 4. MOBILE DRAWER SLIDEOUT                                          */}
      {/* ------------------------------------------------------------------ */}
      <motion.aside
        ref={drawerRef}
        initial={false}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        style={{ width: SIDEBAR_WIDTH.mobile }}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
        aria-hidden={!isMobileOpen}
        inert={!isMobileOpen}
        className="bg-surface-raised fixed inset-y-0 left-0 z-50 flex h-screen flex-col shadow-2xl md:hidden"
      >
        {/* Drawer Header */}
        <div className="border-border/60 flex h-16 w-full shrink-0 items-center justify-between border-b px-4">
          <Logo width={120} height={36} className="h-auto w-auto" priority />
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
            className={cn(
              'text-text-secondary hover:bg-primary-subtle flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              'transition-all duration-150 active:scale-90',
              FOCUS_RING,
              'focus-visible:ring-offset-surface'
            )}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isMobileOpen ? 1 : 0 }}
          transition={{ duration: 0.2, delay: isMobileOpen ? 0.08 : 0 }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className={cn('min-h-0 flex-1 overflow-y-auto px-3 pt-4', SCROLL_AREA)}>
            <SidebarNavList
              isCollapsed={false}
              pathname={pathname}
              sections={sections}
              badgeCounts={badgeCounts}
              onNavigate={goTo}
            />
          </div>

          <div className="border-border/60 shrink-0 border-t px-3 py-3">
            <AccountMenu
              user={user!}
              isCollapsed={false}
              pathname={pathname}
              onNavigate={goTo}
              onSignOut={handleSignOut}
            />
          </div>
        </motion.div>
      </motion.aside>

      {/* ------------------------------------------------------------------ */}
      {/* 5. COLLAPSE TOGGLE TOOLTIP                                         */}
      {/* ------------------------------------------------------------------ */}
      {showToggleTooltip &&
        toggleAnchor &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatedTooltip
            key={collapsed ? 'expand-sidebar-tooltip' : 'collapse-sidebar-tooltip'}
            show={showToggleTooltip}
            text={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            rotate={toggleRotate}
            translateX={toggleTranslateX}
            isLink={false}
            placement="right"
            anchor={toggleAnchor}
          />,
          document.body
        )}
    </>
  );
}

// ---------------------------------------------------------------------------
// RE-EXPORTS (Barrel entry point for sidebar module)
// ---------------------------------------------------------------------------

export default Sidebar;
export * from './constants';
export * from './account-menu';
export * from './nav-item';
export * from './nav';
