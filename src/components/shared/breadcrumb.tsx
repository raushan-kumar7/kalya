"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   Breadcrumb — Kalya design system
   ------------------------------------------------------------
   Icon > Dashboard > Page path
   Description
   ============================================================ */

export interface BreadcrumbItem {
  /** Visible label for the crumb */
  label: string;
  /** Destination — omit on the final/current crumb */
  href?: string;
  /** Optional per-item icon, rendered before the label */
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  /** Ordered trail, e.g. [{ label: "Components", href: "/components" }, { label: "Breadcrumb" }] */
  path: BreadcrumbItem[];
  /**
   * Leading icon shown before the first crumb.
   * Pass `null` to hide it entirely. Defaults to a home icon.
   */
  icon?: React.ReactNode | null;
  /** Optional caption rendered under the trail */
  description?: string;
  /** Extra classes on the outer wrapper */
  className?: string;
  /** Custom separator between crumbs (defaults to a chevron) */
  separator?: React.ReactNode;
  /** Disable the entrance animation */
  animated?: boolean;
  /** Called when a crumb link is clicked (in addition to normal navigation) */
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
}

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
};

const descriptionVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Breadcrumb({
  path,
  icon,
  description,
  className,
  separator,
  animated = true,
  onNavigate,
}: BreadcrumbProps) {
  const leadingIcon = icon === null ? null : icon ?? <Home size={14} strokeWidth={2} />;
  const Sep = separator ?? <ChevronRight size={14} strokeWidth={2} />;

  const List = animated ? motion.ol : "ol";
  const Item = animated ? motion.li : "li";

  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-col gap-1.5", className)}>
      <List
        className="flex flex-wrap items-center gap-1.5 text-body-sm font-body"
        {...(animated
          ? { variants: listVariants, initial: "hidden", animate: "show" }
          : {})}
      >
        {leadingIcon && (
          <Item
            className="flex items-center text-text-muted"
            {...(animated ? { variants: itemVariants } : {})}
          >
            {leadingIcon}
            {path.length > 0 && (
              <span className="mx-1.5 flex items-center text-text-muted/60">{Sep}</span>
            )}
          </Item>
        )}

        {path.map((item, index) => {
          const isLast = index === path.length - 1;

          return (
            <Item
              key={`${item.label}-${index}`}
              className="flex items-center"
              {...(animated ? { variants: itemVariants } : {})}
            >
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    isLast ? "text-text-primary" : "text-text-secondary"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={() => onNavigate?.(item, index)}
                  className="group relative flex items-center gap-1 text-text-secondary transition-colors duration-150 hover:text-primary"
                >
                  {item.icon}
                  {item.label}
                  <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-200 group-hover:w-full" />
                </a>
              )}

              {!isLast && (
                <span className="mx-1.5 flex items-center text-text-muted/60">{Sep}</span>
              )}
            </Item>
          );
        })}
      </List>

      {description && (
        <motion.p
          className="text-body-sm text-text-secondary"
          {...(animated
            ? {
                variants: descriptionVariants,
                initial: "hidden",
                animate: "show",
                transition: { delay: (path.length + 1) * 0.06 },
              }
            : {})}
        >
          {description}
        </motion.p>
      )}
    </nav>
  );
}