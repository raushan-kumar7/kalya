'use client';

import * as React from 'react';
import { cn } from '@/libs/utils';
import { CONTROL_SIZES, FOCUS_WITHIN_RING, type ControlSize } from '@/components/ui/constants';

export type AddonPosition = 'prefix' | 'suffix' | 'middle';
export type AddonVariant = 'filled' | 'outline' | 'subtle';

type AnyElement = React.ReactElement<Record<string, unknown>>;

function isAddonElement(child: React.ReactElement): boolean {
  if (!child) return false;
  const childType = child.type;
  if (
    typeof childType !== 'string' &&
    (childType as { displayName?: string }).displayName === 'InputAddon'
  ) {
    return true;
  }
  const props = child.props as Record<string, unknown> | undefined;
  if (props && 'position' in props && ('variant' in props || typeof props.children === 'string')) {
    return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* InputGroup                                                          */
/* ------------------------------------------------------------------ */

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
  disabled?: boolean;
  size?: ControlSize;
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  (
    {
      className,
      error = false,
      disabled = false,
      size = 'default',
      id,
      'aria-invalid': ariaInvalid,
      'aria-describedby': ariaDescribedBy,
      'aria-required': ariaRequired,
      children,
      ...props
    },
    ref
  ) => {
    const items = React.Children.toArray(children).filter(React.isValidElement) as AnyElement[];
    const count = items.length;

    const resolvedSize = size === 'default' ? 'md' : size;
    const config = CONTROL_SIZES[resolvedSize] || CONTROL_SIZES.md;

    const containerRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const handleGroupClick = (e: React.MouseEvent<HTMLDivElement>) => {
      props.onClick?.(e);
      if (e.defaultPrevented || disabled) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = target.closest('input, textarea, select, button, a, [role="button"]');
      if (!isInteractive && containerRef.current) {
        const inputEl = containerRef.current.querySelector(
          'input:not([disabled]), textarea:not([disabled]), [contenteditable="true"]'
        ) as HTMLInputElement | null;
        inputEl?.focus();
      }
    };

    // Field passes id / aria-* to the group; forward them to the primary input control
    const controlIndex = items.findIndex((c) => !isAddonElement(c));

    const rendered = items.map((child, index) => {
      const isFirst = index === 0;
      const isLast = index === count - 1;
      const childProps = child.props;

      if (isAddonElement(child)) {
        const position: AddonPosition =
          (childProps.position as AddonPosition) ??
          (isFirst ? 'prefix' : isLast ? 'suffix' : 'middle');

        return React.cloneElement(child, {
          size: childProps.size ?? size,
          position,
          error: childProps.error ?? error,
          disabled: childProps.disabled ?? disabled,
          className: cn(childProps.className as string),
        });
      }

      const isControl = index === controlIndex;
      const isNativeInput = typeof child.type === 'string' && child.type === 'input';

      if (isNativeInput) {
        return React.cloneElement(child, {
          id: childProps.id ?? id,
          disabled: childProps.disabled ?? disabled,
          'aria-invalid': childProps['aria-invalid'] ?? (error || ariaInvalid),
          'aria-describedby':
            cn(childProps['aria-describedby'] as string, ariaDescribedBy) || undefined,
          'aria-required': childProps['aria-required'] ?? ariaRequired,
          className: cn(
            'flex-1 min-w-0 h-full border-0 bg-transparent shadow-none rounded-none px-3.5 text-text-primary placeholder:text-text-muted',
            config.text,
            'outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-transparent',
            'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent',
            childProps.className as string
          ),
        });
      }

      // Compound <Input /> or other React component
      return React.cloneElement(child, {
        size: childProps.size ?? size,
        error: childProps.error ?? error,
        disabled: childProps.disabled ?? disabled,
        inGroup: true,
        variant: 'unstyled',
        ...(isControl && {
          id: childProps.id ?? id,
          'aria-invalid': childProps['aria-invalid'] ?? (error || ariaInvalid),
          'aria-describedby':
            cn(childProps['aria-describedby'] as string, ariaDescribedBy) || undefined,
          'aria-required': childProps['aria-required'] ?? ariaRequired,
        }),
        wrapperClassName: cn(
          'flex-1 min-w-0 h-full flex flex-col justify-center',
          childProps.wrapperClassName as string
        ),
        className: cn(
          'h-full w-full border-0 bg-transparent shadow-none rounded-none',
          'outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-transparent',
          'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent',
          childProps.className as string
        ),
      });
    });

    return (
      <div
        ref={containerRef}
        role="group"
        onClick={handleGroupClick}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        className={cn(
          // 1. Container structure & sizing
          'group/input-group relative flex w-full items-stretch rounded-md border bg-surface transition-all duration-150',
          config.height,
          config.rounded,

          // 2. Default & error surface borders
          !error && !disabled && 'border-border hover:border-text-secondary/70',
          error && !disabled && 'border-danger hover:border-danger',
          disabled && 'opacity-50 pointer-events-none cursor-not-allowed bg-surface-raised',

          // 3. Container-level focus ring (consistent with constants.ts FOCUS_WITHIN_RING)
          error ? FOCUS_WITHIN_RING.danger : FOCUS_WITHIN_RING.primary,

          // 4. Total suppression of inner input borders, rings, offsets, and outlines
          '[&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none [&_input]:rounded-none',
          '[&_input]:outline-none [&_input]:ring-0 [&_input]:ring-offset-0',
          '[&_input:focus]:outline-none [&_input:focus]:ring-0 [&_input:focus]:ring-offset-0 [&_input:focus]:border-transparent',
          '[&_input:focus-visible]:outline-none [&_input:focus-visible]:ring-0 [&_input:focus-visible]:ring-offset-0 [&_input:focus-visible]:border-transparent',
          '[&_input]:h-full',
          '[&>div]:h-full',

          className
        )}
        {...props}
      >
        {rendered}
      </div>
    );
  }
);
InputGroup.displayName = 'InputGroup';

/* ------------------------------------------------------------------ */
/* InputAddon                                                          */
/* ------------------------------------------------------------------ */

export interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: AddonPosition;
  variant?: AddonVariant;
  size?: ControlSize;
  error?: boolean;
  disabled?: boolean;
}

const ADDON_RADIUS: Record<Exclude<ControlSize, 'default'>, Record<AddonPosition, string>> = {
  xs: {
    prefix: 'rounded-l-xs rounded-r-none',
    suffix: 'rounded-r-xs rounded-l-none',
    middle: 'rounded-none',
  },
  sm: {
    prefix: 'rounded-l-sm rounded-r-none',
    suffix: 'rounded-r-sm rounded-l-none',
    middle: 'rounded-none',
  },
  md: {
    prefix: 'rounded-l-[5px] rounded-r-none',
    suffix: 'rounded-r-[5px] rounded-l-none',
    middle: 'rounded-none',
  },
  lg: {
    prefix: 'rounded-l-md rounded-r-none',
    suffix: 'rounded-r-md rounded-l-none',
    middle: 'rounded-none',
  },
  xl: {
    prefix: 'rounded-l-lg rounded-r-none',
    suffix: 'rounded-r-lg rounded-l-none',
    middle: 'rounded-none',
  },
};

const ADDON_VARIANTS = {
  filled: 'bg-surface-raised text-text-secondary',
  outline: 'bg-surface text-text-secondary',
  subtle: 'bg-primary-subtle text-primary',
} as const;

export const InputAddon = React.forwardRef<HTMLDivElement, InputAddonProps>(
  (
    {
      className,
      children,
      position = 'prefix',
      variant = 'filled',
      size = 'default',
      error = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const resolvedSize = size === 'default' ? 'md' : size;
    const config = CONTROL_SIZES[resolvedSize] || CONTROL_SIZES.md;

    // Divider border styling (border-r for prefix, border-l for suffix, border-x for middle)
    const dividerBorderClass = {
      prefix: 'border-r',
      suffix: 'border-l',
      middle: 'border-x',
    }[position];

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full shrink-0 select-none items-center justify-center whitespace-nowrap font-numeric font-medium transition-colors duration-150',
          config.px,
          config.text,
          ADDON_VARIANTS[variant],
          (ADDON_RADIUS[resolvedSize] || ADDON_RADIUS.md)[position],
          dividerBorderClass,
          error ? 'border-danger text-danger' : 'border-border',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputAddon.displayName = 'InputAddon';
