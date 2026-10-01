'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/libs/utils';
import { fadeIn, TRANSITIONS } from '@/libs/animations';

export interface AspectRatioProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'color' | 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
> {
  /**
   * Desired aspect ratio expressed as width / height (e.g. 16 / 9, 4 / 3, 1 / 1).
   * @default 16 / 9
   */
  ratio?: number;
  /**
   * Whether to animate entrance with Framer Motion.
   * @default false
   */
  animated?: boolean;
}

/**
 * AspectRatio displays content within a constrained aspect ratio container.
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 16 / 9, style, children, animated = false, ...props }, ref) => {
    const combinedStyle: React.CSSProperties = {
      ...style,
      aspectRatio: `${ratio}`,
      position: 'relative',
      width: '100%',
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={TRANSITIONS.gentle}
          style={combinedStyle}
          className={cn('overflow-hidden rounded-md', className)}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        style={combinedStyle}
        className={cn('overflow-hidden rounded-md', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AspectRatio.displayName = 'AspectRatio';
