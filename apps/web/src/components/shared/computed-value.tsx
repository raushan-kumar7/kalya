'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { Card } from '../ui';

/**
 * Tone styling lives in one place. Card supplies the surface, radius,
 * border and transition; the tone only tints them.
 */
const computedValueVariants = cva(
  'flex items-center justify-between gap-3 px-3.5 py-2.5 shadow-none',
  {
    variants: {
      tone: {
        accent: 'border-accent/20 bg-accent-subtle',
        primary: 'border-primary/20 bg-primary-subtle',
      },
    },
    defaultVariants: {
      tone: 'accent',
    },
  }
);

const valueVariants = cva('font-numeric text-body-sm font-semibold tabular-nums text-right', {
  variants: {
    tone: {
      accent: 'text-accent',
      primary: 'text-primary',
    },
  },
  defaultVariants: {
    tone: 'accent',
  },
});

export interface ComputedValueProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof computedValueVariants> {
  label: ReactNode;
  value: ReactNode;
  /** Optional unit or secondary text shown after the value, e.g. "/ mo" */
  suffix?: ReactNode;
}

const ComputedValue = forwardRef<HTMLDivElement, ComputedValueProps>(
  ({ label, value, suffix, tone = 'accent', className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="outlined"
        role="group"
        className={cn(computedValueVariants({ tone }), className)}
        {...props}
      >
        <span className="text-body-sm text-text-secondary">{label}</span>
        <span className="flex items-baseline gap-1">
          {/* Live region so screen readers hear recalculated values */}
          <output aria-live="polite" className={valueVariants({ tone })}>
            {value}
          </output>
          {suffix && <span className="text-caption text-text-muted">{suffix}</span>}
        </span>
      </Card>
    );
  }
);
ComputedValue.displayName = 'ComputedValue';

export { ComputedValue, computedValueVariants };
