'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/libs/utils';
import { fadeIn, TRANSITIONS } from '@/libs/animations';

const separatorVariants = cva('shrink-0 bg-border transition-colors duration-200', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'h-full w-[1px]',
    },
    variant: {
      default: 'bg-border',
      subtle: 'bg-border/60',
      strong: 'bg-text-muted/40',
      primary: 'bg-primary/25',
      accent: 'bg-accent/30',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'default',
  },
});

export interface SeparatorProps
  extends
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'color' | 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
    >,
    VariantProps<typeof separatorVariants> {
  /**
   * Whether the element is purely decorative. If true, semantic accessibility trees ignore it (`role="none"`).
   * If false, exposes `role="separator"` to screen readers.
   * @default true
   */
  decorative?: boolean;
  /**
   * Optional text or node displayed centered in a horizontal divider.
   */
  label?: React.ReactNode;
  /**
   * Whether to animate entrance using Framer Motion.
   * @default false
   */
  animated?: boolean;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      orientation = 'horizontal',
      variant = 'default',
      decorative = true,
      label,
      animated = false,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation !== 'vertical';
    const ariaOrientation: 'horizontal' | 'vertical' | undefined = decorative
      ? undefined
      : (orientation ?? 'horizontal');

    // Horizontal divider with centered label (e.g. "OR", "TRANSACTION HISTORY")
    if (isHorizontal && label) {
      if (animated) {
        return (
          <motion.div
            ref={ref}
            role={decorative ? 'none' : 'separator'}
            aria-orientation={ariaOrientation}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={TRANSITIONS.fast}
            className={cn(
              'flex items-center w-full my-3 gap-3 text-text-muted text-caption select-none',
              className
            )}
            {...props}
          >
            <div
              className={cn(separatorVariants({ orientation: 'horizontal', variant }), 'flex-1')}
            />
            <span className="shrink-0 font-medium px-1 text-text-muted uppercase tracking-wider font-numeric">
              {label}
            </span>
            <div
              className={cn(separatorVariants({ orientation: 'horizontal', variant }), 'flex-1')}
            />
          </motion.div>
        );
      }

      return (
        <div
          ref={ref}
          role={decorative ? 'none' : 'separator'}
          aria-orientation={ariaOrientation}
          className={cn(
            'flex items-center w-full my-3 gap-3 text-text-muted text-caption select-none',
            className
          )}
          {...props}
        >
          <div
            className={cn(separatorVariants({ orientation: 'horizontal', variant }), 'flex-1')}
          />
          <span className="shrink-0 font-medium px-1 text-text-muted uppercase tracking-wider font-numeric">
            {label}
          </span>
          <div
            className={cn(separatorVariants({ orientation: 'horizontal', variant }), 'flex-1')}
          />
        </div>
      );
    }

    if (animated) {
      return (
        <motion.div
          ref={ref}
          role={decorative ? 'none' : 'separator'}
          aria-orientation={ariaOrientation}
          initial={{
            opacity: 0,
            scaleX: isHorizontal ? 0.8 : 1,
            scaleY: !isHorizontal ? 0.8 : 1,
          }}
          animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
          transition={TRANSITIONS.fast}
          className={cn(separatorVariants({ orientation, variant, className }))}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={ariaOrientation}
        className={cn(separatorVariants({ orientation, variant, className }))}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

export { separatorVariants };
