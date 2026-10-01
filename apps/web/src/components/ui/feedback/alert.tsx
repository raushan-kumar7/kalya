'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles, X } from 'lucide-react';
import { cn } from '@/libs/utils';

export const alertVariants = cva(
  'relative flex w-full items-start gap-3.5 rounded-xl border p-4 font-body transition-all duration-200 shadow-card',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-text-primary [&>svg]:text-primary',
        info: 'border-info/30 bg-info-subtle/80 text-text-primary [&>svg]:text-info',
        success: 'border-success/30 bg-success-subtle/80 text-text-primary [&>svg]:text-success',
        warning: 'border-warning/30 bg-warning-subtle/80 text-text-primary [&>svg]:text-warning',
        danger: 'border-danger/30 bg-danger-subtle/80 text-text-primary [&>svg]:text-danger',
        accent: 'border-accent/30 bg-accent-subtle/80 text-text-primary [&>svg]:text-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const DEFAULT_ICONS = {
  default: Sparkles,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  accent: Sparkles,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** Custom leading icon. If false, suppresses icon. If omitted, uses default variant icon. */
  icon?: React.ReactNode | false;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Callback fired when dismiss button is clicked */
  onDismiss?: () => void;
  /** Action slot rendered beside or below the copy */
  action?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      icon,
      dismissible = false,
      onDismiss,
      action,
      children,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);
    const resolvedVariant = variant ?? 'default';

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    const isUrgent = resolvedVariant === 'danger' || resolvedVariant === 'warning';

    const IconComponent = DEFAULT_ICONS[resolvedVariant];
    const renderedIcon =
      icon === false ? null : (icon ?? <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />);

    return (
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, height: 0, margin: 0, padding: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              ref={ref}
              role={isUrgent ? 'alert' : 'status'}
              aria-live={resolvedVariant === 'danger' ? 'assertive' : 'polite'}
              className={cn(alertVariants({ variant }), className)}
              {...props}
            >
              {renderedIcon}

              <div className="flex-1 space-y-1 pt-0.5">
                {children}
                {action && <div className="pt-2">{action}</div>}
              </div>

              {dismissible && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Dismiss notification"
                  className="text-text-muted hover:text-text-primary rounded-md p-1 transition-colors hover:bg-surface-raised/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
Alert.displayName = 'Alert';

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn(
        'font-display text-body-sm font-semibold tracking-tight text-text-primary leading-tight',
        className
      )}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'font-body text-caption text-text-secondary leading-relaxed [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
