'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';
import { Label } from './label';
import { FOCUS_RING, INTERACTION_STATES, TRANSITIONS_CSS } from '@/components/ui/constants';

const checkboxVariants = cva(
  cn(
    'peer shrink-0 rounded-xs border border-border bg-surface ring-offset-bg',
    TRANSITIONS_CSS.all,
    FOCUS_RING.primary,
    INTERACTION_STATES.disabled,
    INTERACTION_STATES.cursorPointer,
    INTERACTION_STATES.activeTapSm,
    'data-[state=checked]:bg-primary data-[state=checked]:text-on-primary data-[state=checked]:border-primary',
    'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-on-primary data-[state=indeterminate]:border-primary',
    'hover:border-text-secondary/60'
  ),
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-4.5 w-4.5',
        md: 'h-4.5 w-4.5',
        lg: 'h-5.5 w-5.5 rounded-sm',
      },
      error: {
        true: 'border-danger focus-visible:ring-danger data-[state=checked]:bg-danger data-[state=checked]:border-danger data-[state=indeterminate]:bg-danger data-[state=indeterminate]:border-danger',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
    },
  }
);

export interface CheckboxProps
  extends
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  error?: boolean;
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, size = 'default', error = false, checked, ...props }, ref) => {
    const isIndeterminate = checked === 'indeterminate';

    const iconSize =
      size === 'sm'
        ? 'h-3 w-3 stroke-[2.5]'
        : size === 'lg'
          ? 'h-4 w-4 stroke-[2.5]'
          : 'h-3.5 w-3.5 stroke-[2.5]';

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        className={cn(checkboxVariants({ size, error }), className)}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current animate-in zoom-in-75 duration-100">
          {isIndeterminate ? <Minus className={iconSize} /> : <Check className={iconSize} />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

/**
 * CheckboxField
 * -------------
 * Molecule pairing a Checkbox with a clear, clickable label, supporting description,
 * and error message to fulfill accessibility and UX guidelines.
 */
export interface CheckboxFieldProps extends CheckboxProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string;
  wrapperClassName?: string;
}

const CheckboxField = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxFieldProps
>(
  (
    {
      id,
      label,
      description,
      errorMessage,
      wrapperClassName,
      error,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    const descId = `${checkboxId}-desc`;
    const errId = `${checkboxId}-err`;

    const hasError = Boolean(errorMessage) || Boolean(error);

    return (
      <div className={cn('flex items-start gap-3 select-none', wrapperClassName)}>
        <div className="pt-0.5">
          <Checkbox
            ref={ref}
            id={checkboxId}
            disabled={disabled}
            error={hasError}
            aria-describedby={hasError ? errId : description ? descId : undefined}
            className={className}
            {...props}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor={checkboxId}
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
          {errorMessage && (
            <p id={errId} role="alert" className="text-caption font-medium text-danger mt-1">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }
);
CheckboxField.displayName = 'CheckboxField';

/**
 * CheckboxGroup
 * -------------
 * Organism managing sets of multi-choice options with a group label and validation status.
 */
export interface CheckboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  errorMessage?: string;
  required?: boolean;
}

export function CheckboxGroup({
  label,
  description,
  errorMessage,
  required,
  children,
  className,
  ...props
}: CheckboxGroupProps) {
  return (
    <div
      role="group"
      aria-labelledby={label ? 'checkbox-group-label' : undefined}
      className={cn('flex flex-col space-y-2.5 font-body', className)}
      {...props}
    >
      {label && (
        <div>
          <Label id="checkbox-group-label" required={required}>
            {label}
          </Label>
          {description && <p className="text-caption text-text-muted mt-0.5">{description}</p>}
        </div>
      )}
      <div className="flex flex-col space-y-2 pt-1">{children}</div>
      {errorMessage && (
        <p role="alert" className="text-caption font-medium text-danger mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export { Checkbox, CheckboxField, checkboxVariants };
