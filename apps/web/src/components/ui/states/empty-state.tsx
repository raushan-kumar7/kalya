'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { cn } from '@/libs/utils';
import { fadeInUp, TRANSITIONS } from '@/libs/animations';

export interface EmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'color' | 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
> {
  /** Visual icon or illustration */
  icon?: React.ReactNode;
  /** Primary heading */
  title: string;
  /** Descriptive supporting text or advice */
  description?: React.ReactNode;
  /** Primary call-to-action button or link */
  action?: React.ReactNode;
  /** Optional secondary action */
  secondaryAction?: React.ReactNode;
  /** Whether to animate entrance with Framer Motion */
  animated?: boolean;
}

/**
 * EmptyState component displayed when lists, portfolios, or queries return zero items.
 * Responsive and fully styled with light/dark theme tokens.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { className, icon, title, description, action, secondaryAction, animated = true, ...props },
    ref
  ) => {
    const content = (
      <>
        {/* Icon / Illustration Wrapper */}
        <div className="w-14 h-14 rounded-xl bg-surface-raised border border-dashed border-border flex items-center justify-center text-text-muted mb-4 group-hover:border-primary/40 transition-colors">
          {icon ?? <Inbox className="w-6 h-6 text-text-muted" />}
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-text-primary text-body-lg text-center tracking-tight">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-text-secondary text-body-sm text-center max-w-sm mt-1.5 leading-relaxed">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {action}
            {secondaryAction}
          </div>
        )}
      </>
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={TRANSITIONS.editorial}
          className={cn(
            'flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl bg-surface border border-border text-center shadow-card',
            className
          )}
          {...(props as HTMLMotionProps<'div'>)}
        >
          {content}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl bg-surface border border-border text-center shadow-card',
          className
        )}
        {...props}
      >
        {content}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
