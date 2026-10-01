'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';
import { Label } from './label';
import { FOCUS_RING, INTERACTION_STATES, TRANSITIONS_CSS } from '@/components/ui/constants';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root className={cn('grid gap-2.5', className)} {...props} ref={ref} />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const radioVariants = cva(
  cn(
    'aspect-square rounded-full border border-border bg-surface text-primary ring-offset-bg shrink-0',
    TRANSITIONS_CSS.all,
    FOCUS_RING.primary,
    INTERACTION_STATES.disabled,
    INTERACTION_STATES.cursorPointer,
    INTERACTION_STATES.activeTapSm,
    'data-[state=checked]:border-primary hover:border-text-secondary'
  ),
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-4.5 w-4.5',
        md: 'h-4.5 w-4.5',
        lg: 'h-5.5 w-5.5',
      },
      error: {
        true: 'border-danger focus-visible:ring-danger data-[state=checked]:border-danger',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
    },
  }
);

export interface RadioGroupItemProps
  extends
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioVariants> {
  error?: boolean;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size = 'default', error = false, ...props }, ref) => {
  const dotSize = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-2.5 w-2.5';

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioVariants({ size, error }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle
          className={cn(dotSize, 'fill-primary text-primary animate-in zoom-in-75 duration-100')}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

/**
 * RadioField
 * ----------
 * Molecule pairing a RadioGroupItem with a clear, clickable label and description.
 */
export interface RadioFieldProps extends RadioGroupItemProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  wrapperClassName?: string;
}

const RadioField = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioFieldProps
>(({ id, label, description, wrapperClassName, disabled, className, ...props }, ref) => {
  const generatedId = React.useId();
  const radioId = id ?? generatedId;
  const descId = `${radioId}-desc`;

  return (
    <div className={cn('flex items-start gap-3 select-none', wrapperClassName)}>
      <div className="pt-0.5">
        <RadioGroupItem
          ref={ref}
          id={radioId}
          disabled={disabled}
          aria-describedby={description ? descId : undefined}
          className={className}
          {...props}
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor={radioId}
          className={cn(
            'font-body text-body-sm font-medium text-text-primary cursor-pointer leading-tight',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
        {description && (
          <p id={descId} className="text-caption text-text-muted mt-0.5 leading-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});
RadioField.displayName = 'RadioField';

/**
 * RadioCard
 * ---------
 * Organism pairing rich card layouts (icon, title, description, badge) with radio selection.
 */
export interface RadioCardProps extends RadioGroupItemProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

const RadioCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioCardProps
>(
  (
    { id, label, description, badge, icon, wrapperClassName, disabled, className, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const radioId = id ?? generatedId;
    const descId = `${radioId}-desc`;

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'group relative flex items-start gap-3.5 rounded-xl border border-border bg-surface p-4 shadow-card transition-all cursor-pointer',
          'hover:border-primary/50 hover:bg-surface-raised',
          'has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary-subtle/30 has-data-[state=checked]:shadow-raised',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          wrapperClassName
        )}
      >
        <div className="pt-0.5">
          <RadioGroupItem
            ref={ref}
            id={radioId}
            disabled={disabled}
            aria-describedby={description ? descId : undefined}
            className={className}
            {...props}
          />
        </div>

        {icon && <div className="text-primary shrink-0 mt-0.5">{icon}</div>}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-body text-body-sm font-semibold text-text-primary leading-tight">
              {label}
            </span>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {description && (
            <p id={descId} className="text-caption text-text-secondary mt-1 leading-normal">
              {description}
            </p>
          )}
        </div>
      </label>
    );
  }
);
RadioCard.displayName = 'RadioCard';

/**
 * RadioGroupField
 * ---------------
 * Complete RadioGroup container with accessible label, helper text, and error validation.
 */
export interface RadioGroupFieldProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {
  label?: string;
  description?: string;
  errorMessage?: string;
  required?: boolean;
}

const RadioGroupField = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupFieldProps
>(({ label, description, errorMessage, required, children, className, ...props }, ref) => {
  return (
    <div className={cn('flex flex-col space-y-2.5 font-body', className)}>
      {label && (
        <div>
          <Label required={required}>{label}</Label>
          {description && <p className="text-caption text-text-muted mt-0.5">{description}</p>}
        </div>
      )}
      <RadioGroup ref={ref} {...props}>
        {children}
      </RadioGroup>
      {errorMessage && (
        <p role="alert" className="text-caption font-medium text-danger mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
});
RadioGroupField.displayName = 'RadioGroupField';

export { RadioGroup, RadioGroupItem, RadioField, RadioCard, RadioGroupField, radioVariants };
