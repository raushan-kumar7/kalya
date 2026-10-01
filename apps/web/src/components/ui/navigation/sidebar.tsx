'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/libs/utils';
import { FOCUS_RING, TRANSITIONS_CSS } from '@/components/ui/constants';

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        'flex flex-col border-r border-border bg-surface text-text-primary transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex h-16 items-center px-4 border-b border-border', className)}
      {...props}
    />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar', className)}
      {...props}
    />
  )
);
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-3 border-t border-border mt-auto', className)} {...props} />
  )
);
SidebarFooter.displayName = 'SidebarFooter';

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, label, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props}>
      {label && (
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
);
SidebarGroup.displayName = 'SidebarGroup';

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  active?: boolean;
  badge?: React.ReactNode;
}

const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, icon, active = false, badge, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors cursor-pointer select-none text-left',
        FOCUS_RING.primary,
        active
          ? 'bg-primary-subtle text-primary font-semibold'
          : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
        className
      )}
      {...props}
    >
      {/* Active state indicator bar */}
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
      )}
      {icon && (
        <span
          className={cn(
            'shrink-0 text-text-muted transition-colors group-hover:text-text-primary',
            active && 'text-primary'
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {badge && <span className="shrink-0">{badge}</span>}
    </button>
  )
);
SidebarItem.displayName = 'SidebarItem';

export interface SidebarSubMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

export function SidebarSubMenu({
  title,
  icon,
  defaultOpen = false,
  children,
  className,
  ...props
}: SidebarSubMenuProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('space-y-0.5', className)} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'group flex w-full items-center justify-between rounded-lg px-3 py-2 text-body-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary cursor-pointer select-none',
          FOCUS_RING.primary
        )}
      >
        <div className="flex items-center gap-3 truncate">
          {icon && (
            <span className="shrink-0 text-text-muted transition-colors group-hover:text-text-primary">
              {icon}
            </span>
          )}
          <span className="truncate">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-text-muted shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden pl-7 space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem };
