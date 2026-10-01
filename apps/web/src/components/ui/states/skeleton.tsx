'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';

const skeletonVariants = cva(
  'relative overflow-hidden bg-surface-raised border border-border/40 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'rounded-md',
        circular: 'rounded-full',
        text: 'h-4 w-full rounded-sm',
        card: 'rounded-xl p-6 shadow-card',
      },
      animation: {
        shimmer:
          'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 dark:before:via-white/5 before:to-transparent',
        pulse: 'animate-pulse',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animation: 'pulse',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

/**
 * Skeleton placeholder for async content loading states.
 * Uses theme-aware surface-raised tokens for light & dark mode.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animation, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(skeletonVariants({ variant, animation, className }))}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { skeletonVariants };
