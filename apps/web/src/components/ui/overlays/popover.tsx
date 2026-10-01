'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/libs/utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverPortal = PopoverPrimitive.Portal;
const PopoverClose = PopoverPrimitive.Close;

export const popoverVariants = cva(
  [
    'z-50 rounded-lg border text-text-primary outline-none font-body transition-shadow',
    // Micro-animations with Radix data attributes & directional origins
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
    'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
    'data-[side=bottom]:origin-top data-[side=top]:origin-bottom',
    'data-[side=left]:origin-right data-[side=right]:origin-left',
    'duration-150 ease-out will-change-[transform,opacity]',
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-surface shadow-raised',
        glass: 'border-border/80 bg-surface/90 backdrop-blur-md shadow-raised',
        raised: 'border-border bg-surface-raised shadow-card',
        subtle: 'border-border/60 bg-surface-raised/80 shadow-sm',
        dark: 'border-white/10 bg-[#0d1f16] text-white shadow-2xl',
      },
      size: {
        auto: 'w-auto',
        sm: 'w-60',
        default: 'w-72',
        md: 'w-80',
        lg: 'w-96',
        full: 'w-(--radix-popover-trigger-width) min-w-[200px]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      padding: 'default',
    },
  }
);

export interface PopoverContentProps
  extends
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverVariants> {
  /** Optional custom portal container element */
  container?: HTMLElement | null;
  /** Whether to show a built-in accessible close (×) button */
  showCloseButton?: boolean;
  /** Custom label for screen readers on the close button */
  closeLabel?: string;
  /** Automatically render an arrow pointing toward trigger */
  hasArrow?: boolean;
  /** Match trigger width automatically (sets w-(--radix-popover-trigger-width)) */
  matchTriggerWidth?: boolean;
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = 'center',
      sideOffset = 6,
      collisionPadding = 8,
      container,
      showCloseButton = false,
      closeLabel = 'Close popover',
      hasArrow = false,
      matchTriggerWidth = false,
      variant,
      size,
      padding,
      children,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          popoverVariants({
            variant,
            size: matchTriggerWidth ? 'full' : size,
            padding,
          }),
          matchTriggerWidth && 'w-(--radix-popover-trigger-width)',
          className
        )}
        {...props}
      >
        {children}

        {hasArrow && (
          <PopoverArrow
            className={
              variant === 'dark'
                ? 'fill-[#0d1f16] stroke-white/10'
                : variant === 'raised'
                  ? 'fill-surface-raised stroke-border'
                  : 'fill-surface stroke-border'
            }
          />
        )}

        {showCloseButton && (
          <PopoverPrimitive.Close
            aria-label={closeLabel}
            className="absolute right-3 top-3 rounded-xs p-1 text-text-muted transition-colors hover:text-text-primary hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </PopoverPrimitive.Close>
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export interface PopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const PopoverHeader = React.forwardRef<HTMLDivElement, PopoverHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1 text-left pb-2', className)} {...props} />
  )
);
PopoverHeader.displayName = 'PopoverHeader';

export interface PopoverTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const PopoverTitle = React.forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(
        'font-display text-body-sm font-semibold text-text-primary tracking-tight',
        className
      )}
      {...props}
    />
  )
);
PopoverTitle.displayName = 'PopoverTitle';

export interface PopoverDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const PopoverDescription = React.forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-caption text-text-secondary leading-relaxed', className)}
      {...props}
    />
  )
);
PopoverDescription.displayName = 'PopoverDescription';

export interface PopoverBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const PopoverBody = React.forwardRef<HTMLDivElement, PopoverBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('py-1 text-body-sm text-text-primary', className)} {...props} />
  )
);
PopoverBody.displayName = 'PopoverBody';

export interface PopoverFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const PopoverFooter = React.forwardRef<HTMLDivElement, PopoverFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end gap-2 pt-3 mt-2 border-t border-border',
        className
      )}
      {...props}
    />
  )
);
PopoverFooter.displayName = 'PopoverFooter';

export interface PopoverArrowProps extends React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Arrow
> {}

const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  PopoverArrowProps
>(({ className, width = 11, height = 5, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    width={width}
    height={height}
    className={cn('fill-surface stroke-border stroke-[1px]', className)}
    {...props}
  />
));
PopoverArrow.displayName = PopoverPrimitive.Arrow.displayName;

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverPortal,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
};
