'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/libs/utils';

export const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-surface-raised border border-border/40',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export const indicatorVariants = cva(
  'h-full w-full flex-1 transition-all duration-300 ease-out will-change-[transform,width] rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-primary shadow-sm',
        accent: 'bg-accent shadow-sm',
        success: 'bg-success shadow-sm',
        warning: 'bg-warning shadow-sm',
        danger: 'bg-danger shadow-sm',
        gradient:
          'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  /** Current progress value (0 to max) */
  value?: number;
  /** Maximum progress value (defaults to 100) */
  max?: number;
  /** Label displayed above the progress bar */
  label?: React.ReactNode;
  /** Whether to display the percentage/numerical value text */
  showValue?: boolean;
  /** Custom formatter for the displayed value */
  formatValue?: (value: number, percentage: number) => React.ReactNode;
  /** Enables an animated infinite progress pulse for uncertain async tasks */
  indeterminate?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 'md',
      variant = 'default',
      label,
      showValue = false,
      formatValue,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(Math.max(value, 0), max);
    const percentage = Math.round((clampedValue / max) * 100);

    const displayVal = formatValue ? formatValue(clampedValue, percentage) : `${percentage}%`;

    return (
      <div className="w-full space-y-1.5 font-body">
        {(label || showValue) && (
          <div className="flex items-center justify-between text-caption font-medium">
            {label && <span className="text-text-primary">{label}</span>}
            {showValue && !indeterminate && (
              <span className="font-numeric text-text-secondary ml-auto">{displayVal}</span>
            )}
            {indeterminate && (
              <span className="font-numeric text-text-muted ml-auto animate-pulse">
                In progress...
              </span>
            )}
          </div>
        )}

        <div
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={indeterminate ? undefined : clampedValue}
          aria-label={typeof label === 'string' ? label : undefined}
          className={cn(progressVariants({ size }), className)}
          {...props}
        >
          {indeterminate ? (
            <motion.div
              className={cn(
                indicatorVariants({ variant }),
                'absolute inset-y-0 w-1/3 rounded-full'
              )}
              animate={{
                x: ['-100%', '300%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeInOut',
              }}
            />
          ) : (
            <div
              className={cn(indicatorVariants({ variant }))}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
