'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '@/libs/utils';

const bannerVariants = cva(
  'relative w-full border-b px-4 py-3 font-body text-body-sm transition-all select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary border-primary-hover',
        accent: 'bg-accent text-on-accent border-accent-strong',
        info: 'bg-info text-on-info border-info/80',
        success: 'bg-success text-on-success border-success/80',
        warning: 'bg-warning text-on-warning border-warning/80',
        danger: 'bg-danger text-on-danger border-danger/80',
        subtle: 'bg-primary-subtle text-primary border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const DEFAULT_BANNER_ICONS = {
  default: Sparkles,
  accent: Sparkles,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  subtle: Sparkles,
} as const;

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof bannerVariants> {
  icon?: React.ReactNode | false;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

export function Banner({
  className,
  variant = 'default',
  icon,
  dismissible = true,
  onDismiss,
  action,
  children,
  ...props
}: BannerProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const resolvedVariant = variant ?? 'default';

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const IconComponent = DEFAULT_BANNER_ICONS[resolvedVariant];
  const renderedIcon =
    icon === false ? null : (icon ?? <IconComponent className="h-4.5 w-4.5 shrink-0" />);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div
            role="status"
            aria-live="polite"
            className={cn(bannerVariants({ variant }), className)}
            {...props}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {renderedIcon}
                <div className="truncate font-medium">{children}</div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {action && <div className="text-caption font-semibold">{action}</div>}
                {dismissible && (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss banner"
                    className="p-1 rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
