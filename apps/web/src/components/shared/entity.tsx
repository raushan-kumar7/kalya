'use client';

import React, {
  ComponentType,
  isValidElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/libs/utils';
import { Card } from '@/components/ui/data-display/card';
import { Progress } from '@/components/ui/feedback/progress';
import { roundMoney, formatTimeAgo, type TimestampInput } from '@kalya/utils';

// ---------------------------------------------------------------------------
// HELPER: Flexible Icon Renderer (supports LucideIcon component or Node)
// ---------------------------------------------------------------------------

function renderIcon(icon?: ReactNode | LucideIcon, className = 'h-5 w-5'): ReactNode {
  if (!icon) return null;
  if (isValidElement(icon)) {
    return icon;
  }
  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && 'render' in icon)
  ) {
    const IconComponent = icon as ComponentType<{ className?: string }>;
    return <IconComponent className={className} />;
  }
  return <>{icon}</>;
}

// ---------------------------------------------------------------------------
// 1. FOOTER ROW COMPONENT
// ---------------------------------------------------------------------------

export interface FooterRowProps {
  /** Optional icon displayed before the label */
  icon?: ReactNode | LucideIcon;
  /** Label describing the meta information (e.g. 'Updated', 'Spent', 'Target') */
  label: ReactNode;
  /** Value string or node rendered on the right */
  value?: ReactNode;
  /** Optional date/instant to auto-format using formatTimeAgo from @kalya/utils */
  date?: TimestampInput;
  /** Optional numeric amount to round and format using roundMoney from @kalya/utils */
  amount?: number;
  /** Currency prefix for formatted amount (defaults to '₹') */
  currencyPrefix?: string;
  /** Custom wrapper class */
  className?: string;
}

/**
 * High-density metadata row designed for Entity card footers.
 * Aligns label/icon on the left and numeric/status value on the right.
 */
export function FooterRow({
  icon,
  label,
  value,
  date,
  amount,
  currencyPrefix = '₹',
  className,
}: FooterRowProps) {
  let displayValue = value;

  if (date !== undefined) {
    displayValue = formatTimeAgo(date);
  } else if (amount !== undefined) {
    displayValue = `${currencyPrefix}${roundMoney(amount).toLocaleString('en-IN')}`;
  }

  return (
    <span className={cn('flex w-full items-center justify-between gap-2', className)}>
      <span className="flex items-center gap-1.5 text-text-muted">
        {icon && <span className="shrink-0">{renderIcon(icon, 'h-3.5 w-3.5')}</span>}
        <span>{label}</span>
      </span>
      <span className="font-numeric text-text-secondary tabular-nums">{displayValue}</span>
    </span>
  );
}

export const EntityFooterRow = FooterRow;

// ---------------------------------------------------------------------------
// 2. MAIN ENTITY CARD COMPONENT
// ---------------------------------------------------------------------------

export interface EntityAction {
  label: string;
  icon?: ReactNode | LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export interface EntityCardProps {
  /** Icon rendered inside the leading roundel (Lucide icon component or JSX node) */
  icon: ReactNode | LucideIcon;
  /** Primary entity title */
  title: string;
  /** Secondary subtitle (e.g., category slug key, period, or type description) */
  subtitle?: ReactNode;
  /** Pills/badges rendered below header */
  badges?: ReactNode;
  /** Progress percentage number (0-100) or custom progress Node */
  progress?: ReactNode | number;
  /** Footer content, typically composed using FooterRow */
  footer?: ReactNode;
  /** Accessible label for overflow action menu */
  menuLabel?: string;
  /** Action label alias */
  actionLabel?: string;
  /** Callback fired when user clicks Edit in the action menu */
  onEdit?: () => void;
  /** Callback fired when user clicks Delete in the action menu */
  onDelete?: () => void;
  /** Additional custom actions in the dropdown menu */
  extraActions?: EntityAction[];
  /** Optional custom color accent (hex code e.g. '#10b981' from bucket/category) */
  color?: string | null;
  /** Click handler for the whole card */
  onClick?: () => void;
  /** Custom wrapper CSS class */
  className?: string;
}

/**
 * Universal Entity Card Component.
 * Serves as the primary container for Buckets, Categories, Goals, and Ledger Entities.
 */
export function EntityCard({
  icon,
  title,
  subtitle,
  badges,
  progress,
  footer,
  menuLabel,
  actionLabel,
  onEdit,
  onDelete,
  extraActions,
  color,
  onClick,
  className,
}: EntityCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMenu = Boolean(onEdit || onDelete || (extraActions && extraActions.length > 0));

  // Close overflow menu on outside click or Escape key
  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const accessibleMenuLabel = menuLabel || actionLabel || `Actions for ${title}`;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative flex w-full max-w-90 flex-col overflow-hidden rounded-xl border border-border bg-surface',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg',
        'focus-within:-translate-y-0.5 focus-within:border-primary/40 focus-within:shadow-lg',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Top accent line: uses custom entity color if specified, or brand gradient fallback */}
      {color ? (
        <div
          className="h-1 w-full opacity-80 transition-opacity duration-200 group-hover:opacity-100"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      ) : (
        <div
          className="h-1 w-full bg-linear-to-r from-primary via-primary to-accent opacity-70 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        />
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Circular Icon Roundel */}
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              'transition-transform duration-200 group-hover:scale-105',
              !color && 'bg-linear-to-br from-primary-subtle to-accent-subtle text-primary'
            )}
            style={color ? { backgroundColor: `${color}18`, color } : undefined}
          >
            {renderIcon(icon, 'h-5 w-5')}
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0">
            <h3 className="truncate font-display text-body-md font-medium text-text-primary">
              {title}
            </h3>
            {subtitle &&
              (typeof subtitle === 'string' ? (
                <p className="truncate font-body text-caption text-text-muted">{subtitle}</p>
              ) : (
                subtitle
              ))}
          </div>
        </div>

        {/* Action Overflow Menu */}
        {hasMenu && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={accessibleMenuLabel}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors',
                'hover:bg-primary-subtle hover:text-primary',
                'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
              )}
            >
              <EllipsisVertical className="h-4.5 w-4.5" />
            </button>

            {/* Animated Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  role="menu"
                  aria-label={accessibleMenuLabel}
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 z-20 mt-1 w-38 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-raised"
                >
                  {onEdit && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit();
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 font-body text-body-sm text-text-primary transition-colors hover:bg-primary-subtle hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {extraActions?.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        action.onClick();
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3.5 py-2 font-body text-body-sm transition-colors',
                        action.variant === 'danger'
                          ? 'text-danger hover:bg-danger-subtle'
                          : 'text-text-primary hover:bg-primary-subtle hover:text-primary'
                      )}
                    >
                      {action.icon && (
                        <span className="shrink-0">{renderIcon(action.icon, 'h-3.5 w-3.5')}</span>
                      )}
                      <span>{action.label}</span>
                    </button>
                  ))}

                  {onDelete && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 font-body text-body-sm text-danger transition-colors hover:bg-danger-subtle"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Badges Slot */}
      {badges && <div className="flex flex-wrap items-center gap-2 px-5 pb-4">{badges}</div>}

      {/* Progress Slot */}
      {progress !== undefined && progress !== null && (
        <div className="px-5 pb-4">
          {typeof progress === 'number' ? (
            <Progress value={progress} size="sm" variant={color ? 'default' : 'accent'} />
          ) : (
            progress
          )}
        </div>
      )}

      {/* Footer Meta Section */}
      {footer && (
        <div className="mt-auto flex flex-col gap-1.5 border-t border-border/80 bg-surface-raised/30 px-5 py-3 font-body text-caption text-text-muted">
          {footer}
        </div>
      )}
    </Card>
  );
}

/** Backward-compatible export alias */
export const Entity = EntityCard;
export type EntityProps = EntityCardProps;

// ---------------------------------------------------------------------------
// 3. CREATE ENTITY CARD COMPONENT
// ---------------------------------------------------------------------------

export interface CreateEntityCardProps {
  /** Icon displayed in the center roundel (defaults to Plus) */
  icon?: ReactNode | LucideIcon;
  /** Primary action heading */
  title: string;
  /** Helpful prompt description */
  description: string;
  /** Click callback */
  onClick?: () => void;
  /** Custom wrapper CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Dashed action card for creating new entities (e.g. "Add Category", "New Allocation Bucket").
 */
export function CreateEntityCard({
  icon = Plus,
  title,
  description,
  onClick,
  className,
  disabled = false,
}: CreateEntityCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative flex min-h-52 w-full max-w-90 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-surface p-6 text-center select-none',
        'transition-all duration-200 hover:border-primary hover:bg-surface-raised active:scale-[0.98]',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {/* Animated Action Roundel */}
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-on-primary shadow-sm',
          'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90'
        )}
      >
        {renderIcon(icon, 'h-6 w-6')}
      </div>

      <div className="space-y-1">
        <h3 className="font-display text-body-md font-medium text-text-primary transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="font-body text-body-sm text-text-muted">{description}</p>
      </div>
    </button>
  );
}

/** Backward-compatible export alias */
export const CreateEntity = CreateEntityCard;
export type CreateEntityProps = CreateEntityCardProps;
