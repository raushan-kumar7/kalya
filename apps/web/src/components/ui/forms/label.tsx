'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';

export const labelVariants = cva(
  'font-body font-medium leading-none text-text-primary transition-colors select-none ' +
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
  {
    variants: {
      size: {
        default: 'text-body-sm',
        sm: 'text-caption',
        md: 'text-body-sm',
        lg: 'text-body-md',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {
  /** Renders an asterisk indicating the field is required */
  required?: boolean;
  /** Optional secondary action or link next to the label (e.g. "Forgot password?") */
  action?: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size, required, action, children, ...props }, ref) => {
    return (
      <div className="flex items-center justify-between gap-2">
        <label ref={ref} className={cn(labelVariants({ size }), className)} {...props}>
          {children}
          {required && (
            <span className="ml-1 text-danger font-semibold" aria-hidden="true" title="Required">
              *
            </span>
          )}
        </label>
        {action && <span className="text-caption text-text-secondary">{action}</span>}
      </div>
    );
  }
);
Label.displayName = 'Label';

export { Label };
