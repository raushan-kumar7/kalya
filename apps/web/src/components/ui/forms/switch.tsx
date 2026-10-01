'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';
import { FOCUS_RING, INTERACTION_STATES, TRANSITIONS_CSS } from '@/components/ui/constants';

const switchVariants = cva(
  cn(
    'peer inline-flex shrink-0 items-center rounded-full border-2 border-transparent',
    TRANSITIONS_CSS.slow,
    FOCUS_RING.primary,
    INTERACTION_STATES.disabled,
    INTERACTION_STATES.cursorPointer,
    'data-[state=checked]:bg-primary data-[state=unchecked]:bg-border'
  ),
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        default: 'h-6 w-11',
        md: 'h-6 w-11',
        lg: 'h-7 w-13',
      },
      error: {
        true: 'data-[state=checked]:bg-danger focus-visible:ring-danger',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
    },
  }
);

export interface SwitchProps
  extends
    React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  error?: boolean;
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, size = 'default', error = false, ...props }, ref) => {
    const isSm = size === 'sm';
    const isLg = size === 'lg';

    const thumbSize = isSm
      ? 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      : isLg
        ? 'h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0'
        : 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0';

    return (
      <SwitchPrimitive.Root
        ref={ref}
        className={cn(switchVariants({ size, error }), className)}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block rounded-full bg-surface shadow-card ring-0 transition-transform duration-200',
            thumbSize
          )}
        />
      </SwitchPrimitive.Root>
    );
  }
);
Switch.displayName = SwitchPrimitive.Root.displayName;

/**
 * SwitchField
 * -----------
 * Molecule pairing a binary Switch with setting label, description, and dynamic state indicator.
 */
export interface SwitchFieldProps extends SwitchProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  /**
   * Show current state text (e.g. "Enabled" / "Disabled", or custom labels).
   */
  stateLabel?: { on: string; off: string } | boolean;
  wrapperClassName?: string;
}

const SwitchField = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchFieldProps
>(
  (
    {
      id,
      label,
      description,
      stateLabel = false,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      wrapperClassName,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const descId = `${switchId}-desc`;

    const [internalChecked, setInternalChecked] = React.useState(
      checked !== undefined ? checked : defaultChecked !== undefined ? defaultChecked : false
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setInternalChecked(checked);
      }
    }, [checked]);

    const handleCheckedChange = (val: boolean) => {
      setInternalChecked(val);
      onCheckedChange?.(val);
    };

    const isChecked = checked !== undefined ? checked : internalChecked;

    const onText = typeof stateLabel === 'object' ? stateLabel.on : 'Enabled';
    const offText = typeof stateLabel === 'object' ? stateLabel.off : 'Disabled';

    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 py-2 select-none',
          disabled && 'opacity-60 pointer-events-none',
          wrapperClassName
        )}
      >
        <div className="flex flex-col pr-2">
          <label
            htmlFor={switchId}
            className="font-body text-body-sm font-medium text-text-primary cursor-pointer leading-tight"
          >
            {label}
          </label>
          {description && (
            <p id={descId} className="text-caption text-text-muted mt-0.5 leading-normal">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {stateLabel && (
            <span className="font-numeric text-caption font-medium text-text-secondary select-none">
              {isChecked ? onText : offText}
            </span>
          )}
          <Switch
            ref={ref}
            id={switchId}
            checked={isChecked}
            onCheckedChange={handleCheckedChange}
            disabled={disabled}
            aria-describedby={description ? descId : undefined}
            className={className}
            {...props}
          />
        </div>
      </div>
    );
  }
);
SwitchField.displayName = 'SwitchField';

export { Switch, SwitchField, switchVariants };
