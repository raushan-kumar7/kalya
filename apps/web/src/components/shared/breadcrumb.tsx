'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { EASINGS, createStaggerContainer } from '@/libs/animations';
import { cn } from '@/libs/utils';

/* ============================================================
   Breadcrumb — Kalya design system
   ------------------------------------------------------------
   Hierarchical navigation trail with staggered entrance animation,
   fluid link micro-interactions, and optional context description.
   ============================================================ */

export interface BreadcrumbItem {
  /** Visible label for the crumb */
  label: string;
  /** Destination route — omit on the final/current crumb */
  href?: string;
  /** Optional per-item icon, rendered before the label */
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  /** Ordered trail, e.g. [{ label: "Finances", href: "/dashboard/finance" }, { label: "Transactions" }] */
  path: BreadcrumbItem[];
  /**
   * Leading icon shown before the first crumb.
   * Pass `null` to hide it entirely. Defaults to a Home icon.
   */
  icon?: React.ReactNode | null;
  /** Destination for the leading home icon. Defaults to '/dashboard'. */
  homeHref?: string;
  /** Optional caption rendered under the trail */
  description?: string;
  /** Extra classes on the outer wrapper */
  className?: string;
  /** Custom separator between crumbs (defaults to a ChevronRight) */
  separator?: React.ReactNode;
  /** Disable the entrance animation */
  animated?: boolean;
  /** Called when a crumb link is clicked (in addition to normal navigation) */
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
}

// ------------------------------------------------------------
// ANIMATION VARIANTS (from @/libs/animations)
// ------------------------------------------------------------

const listVariants: Variants = createStaggerContainer(0.045, 0.02);

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: EASINGS.editorial,
    },
  },
};

const descriptionVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: EASINGS.editorial,
    },
  },
};

export function Breadcrumb({
  path,
  icon,
  homeHref = '/dashboard',
  description,
  className,
  separator,
  animated = true,
  onNavigate,
}: BreadcrumbProps) {
  const shouldReduceMotion = useReducedMotion();
  const isAnimated = animated && !shouldReduceMotion;

  const defaultLeadingIcon = <Home size={14} strokeWidth={1.8} className="shrink-0" />;
  const leadingIcon = icon === null ? null : (icon ?? defaultLeadingIcon);
  const Sep = separator ?? (
    <ChevronRight
      size={13}
      strokeWidth={2}
      className="text-text-muted/50 shrink-0"
      aria-hidden="true"
    />
  );

  const List = isAnimated ? motion.ol : 'ol';
  const Item = isAnimated ? motion.li : 'li';

  return (
    <nav aria-label="Breadcrumb" className={cn('flex flex-col gap-1', className)}>
      <List
        className="text-body-sm font-body flex flex-wrap items-center gap-1.5 leading-none"
        {...(isAnimated ? { variants: listVariants, initial: 'hidden', animate: 'visible' } : {})}
      >
        {/* Leading Home / Root Icon */}
        {leadingIcon && (
          <Item className="flex items-center" {...(isAnimated ? { variants: itemVariants } : {})}>
            {homeHref ? (
              <Link
                href={homeHref}
                aria-label="Dashboard home"
                className="text-text-muted hover:text-text-primary rounded-xs flex items-center transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {leadingIcon}
              </Link>
            ) : (
              <span className="text-text-muted flex items-center">{leadingIcon}</span>
            )}

            {path.length > 0 && <span className="mx-1.5 flex items-center">{Sep}</span>}
          </Item>
        )}

        {/* Trail Items */}
        {path.map((item, index) => {
          const isLast = index === path.length - 1;

          return (
            <Item
              key={`${item.label}-${index}`}
              className="flex items-center"
              {...(isAnimated ? { variants: itemVariants } : {})}
            >
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'flex items-center gap-1.5 font-medium tracking-tight select-none',
                    isLast ? 'text-text-primary font-semibold' : 'text-text-secondary'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => onNavigate?.(item, index)}
                  className={cn(
                    'group relative flex items-center gap-1.5 font-medium text-text-secondary transition-colors duration-150',
                    'hover:text-primary rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-accent/40'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {/* Subtle hover underline indicator */}
                  <span className="bg-primary/80 pointer-events-none absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-200 group-hover:w-full" />
                </Link>
              )}

              {!isLast && <span className="mx-1.5 flex items-center">{Sep}</span>}
            </Item>
          );
        })}
      </List>

      {/* Optional Context Description */}
      {description && (
        <motion.p
          className="text-caption text-text-muted font-normal tracking-normal"
          {...(isAnimated
            ? {
                variants: descriptionVariants,
                initial: 'hidden',
                animate: 'visible',
                transition: { delay: (path.length + 1) * 0.045 },
              }
            : {})}
        >
          {description}
        </motion.p>
      )}
    </nav>
  );
}

export default Breadcrumb;
