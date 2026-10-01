'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/libs/utils';
import { fadeInUp, TRANSITIONS } from '@/libs/animations';

export interface ErrorStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'color' | 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
> {
  /** Error heading */
  title?: string;
  /** Detailed error explanation or error message */
  message?: React.ReactNode;
  /** Technical error code (e.g. "ERR_NETWORK_DISCONNECTED", "500") */
  errorCode?: string | number;
  /** Callback fired when user clicks Retry */
  onRetry?: () => void;
  /** Custom label for retry button (default: "Try Again") */
  retryLabel?: string;
  /** Custom icon override */
  icon?: React.ReactNode;
  /** Optional secondary action slot */
  action?: React.ReactNode;
  /** Whether to animate entrance with Framer Motion */
  animated?: boolean;
}

/**
 * ErrorState component displayed on network exceptions, API failures, or boundary catches.
 * Utilizes Kalya semantic danger tokens with full light & dark mode support.
 */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      title = 'Something went wrong',
      message = 'An unexpected error occurred while fetching your financial data. Please try again.',
      errorCode,
      onRetry,
      retryLabel = 'Try Again',
      icon,
      action,
      animated = true,
      ...props
    },
    ref
  ) => {
    const content = (
      <>
        {/* Danger Icon Container */}
        <div className="w-14 h-14 rounded-xl bg-danger-subtle text-danger border border-danger/25 flex items-center justify-center mb-4 shadow-sm">
          {icon ?? <AlertCircle className="w-7 h-7 stroke-[2.2]" />}
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-text-primary text-body-lg text-center tracking-tight">
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p className="text-text-secondary text-body-sm text-center max-w-sm mt-1.5 leading-relaxed">
            {message}
          </p>
        )}

        {/* Optional Error Code Badge */}
        {errorCode && (
          <div className="mt-3 px-2 py-0.5 rounded-xs bg-surface-raised border border-border text-text-muted font-numeric text-[11px] select-all">
            Code: {errorCode}
          </div>
        )}

        {/* Action Controls */}
        {(onRetry || action) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-on-primary hover:bg-primary-hover font-medium text-body-sm shadow-card transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{retryLabel}</span>
              </button>
            )}
            {action}
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

ErrorState.displayName = 'ErrorState';
