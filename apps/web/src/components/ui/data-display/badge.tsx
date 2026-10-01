'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/libs/utils';
import { TRANSITIONS_CSS } from '@/components/ui/constants';

const badgeVariants = cva(
  cn(
    'inline-flex items-center gap-1.5 font-body font-medium select-none whitespace-nowrap',
    TRANSITIONS_CSS.colors
  ),
  {
    variants: {
      variant: {
        /** Primary evergreen fill */
        default: 'bg-primary text-on-primary shadow-xs',
        /** Neutral secondary surface */
        secondary: 'bg-surface-raised border border-border text-text-primary',
        /** Warm gold accent */
        accent: 'bg-accent text-on-accent shadow-xs',
        /** Soft primary subtle */
        subtle: 'bg-primary-subtle text-primary border border-primary/20',
        /** Clean border outline */
        outline: 'border border-border text-text-secondary bg-surface',
        /** Positive financial yield / verified */
        success: 'bg-success-subtle text-success border border-success/30',
        /** Warning / cautionary */
        warning: 'bg-warning-subtle text-warning border border-warning/30',
        /** Danger / liquidation */
        danger: 'bg-danger-subtle text-danger border border-danger/30',
      },
      size: {
        sm: 'h-5 px-1.5 text-[11px] rounded-xs',
        default: 'h-6 px-2.5 text-caption rounded-sm',
        md: 'h-6 px-2.5 text-caption rounded-sm',
        lg: 'h-7 px-3 text-body-sm rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  /** Leading icon slot */
  leadingIcon?: React.ReactNode;
  /** Trailing icon slot */
  trailingIcon?: React.ReactNode;
  /** Display a pulsing status dot before the text */
  dot?: boolean;
  /** Dot tone color */
  dotColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  /** Show a dismiss (×) button */
  removable?: boolean;
  /** Callback fired when remove button is clicked */
  onRemove?: () => void;
}

const DOT_COLORS = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      leadingIcon,
      trailingIcon,
      dot = false,
      dotColor = 'primary',
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    return (
      <Comp ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        {dot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0 animate-pulse',
              DOT_COLORS[dotColor] || 'bg-current'
            )}
          />
        )}
        {leadingIcon && <span className="shrink-0 flex items-center">{leadingIcon}</span>}
        <span>{children}</span>
        {trailingIcon && <span className="shrink-0 flex items-center">{trailingIcon}</span>}
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="hover:opacity-75 rounded-xs p-0.5 cursor-pointer ml-0.5"
            aria-label="Remove badge"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </Comp>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
