'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';
import { Spinner } from '@/components/ui/states/spinner';
import {
  FOCUS_RING,
  INTERACTION_STATES,
  TRANSITIONS_CSS,
  buttonHoverProps,
} from '@/components/ui/constants';

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center font-body font-medium select-none whitespace-nowrap',
    TRANSITIONS_CSS.all,
    FOCUS_RING.primary,
    INTERACTION_STATES.disabled,
    INTERACTION_STATES.cursorPointer,
    INTERACTION_STATES.activeTap
  ),
  {
    variants: {
      variant: {
        /** Primary brand fill — deep evergreen in light, vibrant emerald in dark */
        default: 'bg-primary text-on-primary hover:bg-primary-hover shadow-card',
        /** Primary alias for design system consistency */
        primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-card',
        /** Secondary surface button — clean bordered neutral */
        secondary:
          'border border-border bg-surface text-text-primary hover:bg-surface-raised hover:border-text-secondary/50 shadow-card',
        /** Tertiary / ghost button — subtle hover background */
        tertiary: 'text-text-secondary hover:bg-primary-subtle hover:text-primary',
        ghost: 'text-text-secondary hover:bg-primary-subtle hover:text-primary',
        /** Destructive / danger button for irreversible actions */
        destructive: 'bg-danger text-on-danger hover:opacity-95 shadow-card',
        danger: 'bg-danger text-on-danger hover:opacity-95 shadow-card',
        /** Outline variant */
        outline:
          'border border-border bg-surface text-text-primary hover:bg-surface-raised hover:border-text-secondary/40 shadow-card',
        /** Subtle tinted background */
        subtle: 'bg-primary-subtle text-primary hover:bg-primary hover:text-on-primary',
        /** Warm gold accent variant */
        accent: 'bg-accent text-on-accent hover:opacity-90 shadow-card',
        /** Success variant */
        success: 'bg-success text-on-success hover:opacity-95 shadow-card',
        /** Link style — inline action with underline */
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto font-medium focus-visible:ring-1 focus-visible:ring-primary',
      },
      size: {
        xs: 'h-7 rounded-xs px-2.5 text-[11px] gap-1.5',
        sm: 'h-8.5 rounded-sm px-3 text-caption gap-1.5',
        default: 'h-10 rounded-md px-4 py-2 text-body-sm gap-2',
        md: 'h-10 rounded-md px-4 py-2 text-body-sm gap-2',
        lg: 'h-12 rounded-md px-6 text-body-md font-semibold gap-2.5',
        xl: 'h-14 rounded-lg px-7 text-body-lg font-semibold gap-3',
        'icon-xs': 'h-7 w-7 min-w-7 p-0 rounded-xs gap-0',
        'icon-sm': 'h-8.5 w-8.5 min-w-8.5 p-0 rounded-sm gap-0',
        icon: 'h-10 w-10 min-w-10 p-0 rounded-md gap-0',
        'icon-md': 'h-10 w-10 min-w-10 p-0 rounded-md gap-0',
        'icon-lg': 'h-12 w-12 min-w-12 p-0 rounded-md gap-0',
        'icon-xl': 'h-14 w-14 min-w-14 p-0 rounded-lg gap-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  /** Enables fluid Framer Motion spring micro-interactions */
  animated?: boolean;
  /** Leading icon slot */
  leadingIcon?: React.ReactNode;
  /** Left icon alias */
  leftIcon?: React.ReactNode;
  /** Trailing icon slot */
  trailingIcon?: React.ReactNode;
  /** Right icon alias */
  rightIcon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Full width toggle */
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      isLoading = false,
      animated = false,
      leadingIcon,
      leftIcon,
      trailingIcon,
      rightIcon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isSolid =
      variant === 'default' ||
      variant === 'primary' ||
      variant === 'danger' ||
      variant === 'destructive' ||
      variant === 'success' ||
      variant === 'accent';

    const spinnerVariant = isSolid ? 'white' : 'primary';

    const resolvedLeadingIcon = leadingIcon ?? leftIcon;
    const resolvedTrailingIcon = trailingIcon ?? rightIcon;

    const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <Spinner size="xs" variant={spinnerVariant} />
            {children && <span className="opacity-80">{children}</span>}
          </>
        );
      }

      return (
        <>
          {resolvedLeadingIcon && iconPosition === 'left' && (
            <span className="shrink-0 flex items-center">{resolvedLeadingIcon}</span>
          )}
          {children}
          {resolvedTrailingIcon && iconPosition === 'left' && (
            <span className="shrink-0 flex items-center">{resolvedTrailingIcon}</span>
          )}
          {resolvedLeadingIcon && iconPosition === 'right' && (
            <span className="shrink-0 flex items-center">{resolvedLeadingIcon}</span>
          )}
        </>
      );
    };

    const classes = cn(buttonVariants({ variant, size, fullWidth, className }));

    if (asChild) {
      const hasExtraContent = Boolean(isLoading || resolvedLeadingIcon || resolvedTrailingIcon);
      const isValidChildElement =
        React.isValidElement(children) && children.type !== React.Fragment;

      if (!hasExtraContent && isValidChildElement) {
        return (
          <Slot
            className={classes}
            ref={ref}
            aria-busy={isLoading || undefined}
            aria-disabled={disabled || isLoading || undefined}
            {...props}
          >
            {children}
          </Slot>
        );
      }

      if (isValidChildElement) {
        const childElement = children as React.ReactElement<{ children?: React.ReactNode }>;
        return (
          <Slot
            className={classes}
            ref={ref}
            aria-busy={isLoading || undefined}
            aria-disabled={disabled || isLoading || undefined}
            {...props}
          >
            {React.cloneElement(childElement, {
              children: (
                <>
                  {isLoading ? (
                    <>
                      <Spinner size="xs" variant={spinnerVariant} />
                      {childElement.props.children && (
                        <span className="opacity-80">{childElement.props.children}</span>
                      )}
                    </>
                  ) : (
                    <>
                      {resolvedLeadingIcon && iconPosition === 'left' && (
                        <span className="shrink-0 flex items-center">{resolvedLeadingIcon}</span>
                      )}
                      {childElement.props.children}
                      {resolvedTrailingIcon && iconPosition === 'left' && (
                        <span className="shrink-0 flex items-center">{resolvedTrailingIcon}</span>
                      )}
                      {resolvedLeadingIcon && iconPosition === 'right' && (
                        <span className="shrink-0 flex items-center">{resolvedLeadingIcon}</span>
                      )}
                    </>
                  )}
                </>
              ),
            })}
          </Slot>
        );
      }

      return (
        <Slot
          className={classes}
          ref={ref}
          aria-busy={isLoading || undefined}
          aria-disabled={disabled || isLoading || undefined}
          {...props}
        >
          <span>{renderContent()}</span>
        </Slot>
      );
    }

    if (animated) {
      return (
        <motion.button
          ref={ref}
          whileHover={buttonHoverProps.whileHover}
          whileTap={buttonHoverProps.whileTap}
          className={classes}
          disabled={disabled || isLoading}
          aria-busy={isLoading || undefined}
          aria-disabled={disabled || isLoading || undefined}
          {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
        >
          {renderContent()}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        aria-disabled={disabled || isLoading || undefined}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface ButtonIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function ButtonIcon({ children, className, ...props }: ButtonIconProps) {
  return (
    <span className={cn('shrink-0 flex items-center justify-center', className)} {...props}>
      {children}
    </span>
  );
}

export { Button, buttonVariants };
