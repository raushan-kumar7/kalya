'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatedTooltip } from '@/components/ui';
import { useTooltip } from '@/hooks/use-tooltip';
import { cn } from '@/libs/utils';
import { AccountMenu } from './account-menu';
import { type NavSection, SIDEBAR_NAVS_ITEMS } from './constants';
import { NavItemRow } from './nav-item';
import { User } from '@kalya/types';

/**
 * Builds a fast lookup map for item labels to support hovering tooltips when in collapsed rail mode.
 */
function buildLabelMap(sections: readonly NavSection[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const section of sections) {
    for (const item of section.items) {
      map.set(item.href, item.label);
      if (item.children) {
        for (const child of item.children) {
          map.set(child.href, child.label);
        }
      }
    }
  }
  return map;
}

export interface SidebarNavListProps {
  /** Icon-only rail vs full labeled layout. */
  isCollapsed: boolean;
  /** Active pathname. Defaults to usePathname() if omitted. */
  pathname?: string;
  /** Custom navigation sections if overriding the default taxonomy. */
  sections?: NavSection[];
  /** Live counts for each NavItem.badgeKey (e.g. { alerts: unreadCount }). */
  badgeCounts?: Partial<Record<string, number>>;
  /** Navigation callback handler. Defaults to router.push. */
  onNavigate?: (href: string) => void;
  className?: string;
}

/**
 * Core navigation items list renderer with section headers, collapsible groups, and rail tooltips.
 */
export function SidebarNavList({
  isCollapsed,
  pathname: propPathname,
  sections = SIDEBAR_NAVS_ITEMS,
  badgeCounts = {},
  onNavigate,
  className,
}: SidebarNavListProps) {
  const currentPathname = usePathname();
  const router = useRouter();
  const pathname = propPathname ?? currentPathname ?? '/dashboard';

  const { hoveredItem, rotate, translateX, handleHover } = useTooltip();
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

  const itemLabels = useMemo(() => buildLabelMap(sections), [sections]);

  const showTooltip = (id: string, el: HTMLElement) => {
    if (!isCollapsed) return;
    const rect = el.getBoundingClientRect();
    setAnchor({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    handleHover(id);
  };

  const hideTooltip = () => {
    handleHover(null);
    setAnchor(null);
  };

  // Automatically dismiss tooltip when collapsing, expanding, or navigating
  useEffect(() => {
    hideTooltip();
  }, [isCollapsed, pathname]);

  // Dismiss tooltip on scroll or resize to prevent floating/frozen tooltips
  useEffect(() => {
    if (!hoveredItem) return;

    const handleDismiss = () => {
      hideTooltip();
    };

    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);

    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [hoveredItem]);

  const activeLabel = hoveredItem ? itemLabels.get(hoveredItem) : undefined;

  const handleNav = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      router.push(href);
    }
  };

  return (
    <nav
      aria-label="Sidebar Navigation"
      className={cn(
        'flex flex-col gap-1 py-2 transition-[width] duration-200',
        isCollapsed ? 'w-full items-center px-2' : 'w-full px-3',
        className
      )}
    >
      {sections.map((section, sectionIdx) => (
        <div
          key={section.label ?? `section-${sectionIdx}`}
          role="group"
          aria-label={section.label}
          className={cn(
            'flex w-full flex-col gap-1',
            isCollapsed && 'items-center',
            sectionIdx > 0 &&
              (isCollapsed
                ? 'border-border/60 mt-2 w-8 self-center border-t pt-2'
                : 'border-border/60 mt-3 border-t pt-3')
          )}
        >
          {section.label && !isCollapsed && (
            <span className="text-caption text-text-muted select-none overflow-hidden px-3 pb-1 font-semibold tracking-wider whitespace-nowrap uppercase">
              # {section.label}
            </span>
          )}

          {section.items.map((item) => (
            <NavItemRow
              key={item.href}
              item={item}
              pathname={pathname}
              isCollapsed={isCollapsed}
              badgeCounts={badgeCounts}
              onNavigate={handleNav}
              onHoverStart={showTooltip}
              onHoverEnd={hideTooltip}
            />
          ))}
        </div>
      ))}

      {/* Portal tooltips for collapsed rail */}
      {isCollapsed &&
        anchor &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatedTooltip
            show={Boolean(hoveredItem)}
            text={activeLabel ?? ''}
            rotate={rotate}
            translateX={translateX}
            isLink={false}
            placement="right"
            anchor={anchor}
          />,
          document.body
        )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// BRAND EMBLEM
// ---------------------------------------------------------------------------

function LeafEmblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 16c0-6.5 4.5-11 12-11 0 7.5-4.5 11-12 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4 16 13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// COMPLETE DASHBOARD SIDEBAR CONTAINER
// ---------------------------------------------------------------------------

export interface SidebarProps {
  /** Active user profile information */
  user?: User | null;
  /** Whether sidebar is collapsed into an icon rail */
  isCollapsed?: boolean;
  /** Collapse state toggle callback */
  onToggleCollapse?: () => void;
  /** Current URL pathname */
  pathname?: string;
  /** Reactive badge counts (alerts, etc.) */
  badgeCounts?: Partial<Record<string, number>>;
  /** Navigation callback handler */
  onNavigate?: (href: string) => void;
  /** Sign out callback handler */
  onSignOut?: () => void;
  /** Custom navigation sections */
  sections?: NavSection[];
  className?: string;
}

/**
 * Complete, state-of-the-art Kalya dashboard sidebar.
 * Integrates brand header, scrollable navigation list, collapse toggle, and account menu footer.
 */
export function DashboardSidebar({
  user,
  isCollapsed = false,
  onToggleCollapse,
  pathname,
  badgeCounts,
  onNavigate,
  onSignOut,
  sections = SIDEBAR_NAVS_ITEMS,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'bg-surface-raised border-border relative flex h-full flex-col border-r transition-[width] duration-300 ease-in-out select-none',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'border-border/60 flex h-16 shrink-0 items-center border-b px-3 transition-all',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 rounded-lg outline-none transition-transform active:scale-95',
            'focus-visible:ring-accent/40 focus-visible:ring-2'
          )}
        >
          <div className="bg-primary text-on-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
            <LeafEmblem className="h-5 w-5" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden leading-none">
              <span className="font-display text-body-md text-text-primary font-bold tracking-tight">
                KALYA
              </span>
              <span className="text-caption text-text-muted tracking-brand uppercase">
                कल्य · FINANCES
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle button */}
        {onToggleCollapse && !isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="text-text-muted hover:text-text-primary hover:bg-primary-subtle rounded-lg p-1.5 transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Center Navigation Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <SidebarNavList
          isCollapsed={isCollapsed}
          pathname={pathname}
          sections={sections}
          badgeCounts={badgeCounts}
          onNavigate={onNavigate}
        />
      </div>

      {/* Bottom Footer Section with AccountMenu & Toggle (if collapsed) */}
      <div className="border-border/60 flex shrink-0 flex-col gap-2 border-t p-2">
        {onToggleCollapse && isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="text-text-muted hover:text-text-primary hover:bg-primary-subtle mx-auto flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <AccountMenu
          user={user!}
          isCollapsed={isCollapsed}
          pathname={pathname}
          onNavigate={onNavigate}
          onSignOut={onSignOut}
        />
      </div>
    </aside>
  );
}
