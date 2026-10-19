'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';
import { FOCUS_RING } from '@/components/ui/constants';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva('inline-flex items-center text-text-secondary select-none', {
  variants: {
    variant: {
      /** Segmented pill track with container background */
      pill: 'rounded-lg bg-surface-raised p-1 border border-border/80 shadow-xs',
      /** Underline tabs with border line */
      underline: 'border-b border-border gap-6 bg-transparent p-0',
      /** Enclosed bordered tabs */
      enclosed: 'border border-border rounded-lg bg-surface p-1 gap-1',
    },
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col items-stretch',
    },
  },
  defaultVariants: {
    variant: 'pill',
    orientation: 'horizontal',
  },
});

interface TabsContextValue {
  variant: 'pill' | 'underline' | 'enclosed';
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: 'pill',
  orientation: 'horizontal',
});

export interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant = 'pill', orientation = 'horizontal', ...props }, ref) => (
    <TabsContext.Provider
      value={{ variant: variant || 'pill', orientation: orientation || 'horizontal' }}
    >
      <TabsPrimitive.List
        ref={ref}
        className={cn(tabsListVariants({ variant, orientation }), className)}
        {...props}
      />
    </TabsContext.Provider>
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, icon, badge, ...props }, ref) => {
  const { variant } = React.useContext(TabsContext);

  const variantStyles =
    variant === 'underline'
      ? 'border-b-2 border-transparent px-1 pb-3 pt-2 rounded-none font-medium hover:text-text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold'
      : variant === 'enclosed'
        ? 'rounded-md px-3.5 py-1.5 font-medium hover:bg-surface-raised data-[state=active]:bg-primary-subtle data-[state=active]:text-primary data-[state=active]:font-semibold'
        : 'rounded-md px-3.5 py-1.5 font-medium hover:text-text-primary data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-card data-[state=active]:font-semibold';

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-caption transition-all cursor-pointer',
        FOCUS_RING.primary,
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles,
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge && <span className="shrink-0">{badge}</span>}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg',
      'data-[state=inactive]:hidden animate-in fade-in-50 duration-150',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
