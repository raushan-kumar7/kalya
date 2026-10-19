'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/libs/utils';
import { cardHoverProps, FOCUS_RING, INTERACTION_STATES } from '@/components/ui/constants';

const cardVariants = cva(
  'rounded-xl text-text-primary transition-all duration-200 overflow-hidden',
  {
    variants: {
      variant: {
        /** Standard surface container with soft card shadow */
        default: 'bg-surface border border-border shadow-card',
        /** Raised surface container for prominent floating modules */
        raised: 'bg-surface-raised border border-border shadow-raised',
        /** Subtle outlined container without shadow */
        outlined: 'bg-surface border border-border/80',
        /** Translucent glassmorphism container with backdrop blur */
        glass: 'bg-surface/90 backdrop-blur-md border border-border/80 shadow-raised',
        /** Interactive card with hover elevation lift and clickable states */
        interactive: cn(
          'bg-surface border border-border shadow-card cursor-pointer',
          'hover:shadow-raised hover:border-primary/40',
          INTERACTION_STATES.activeTap,
          FOCUS_RING.primary
        ),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  /** If true and variant is interactive, adds Framer Motion hover float physics */
  animated?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', animated = false, children, ...props }, ref) => {
    const isInteractive = variant === 'interactive';

    if (isInteractive && animated) {
      return (
        <motion.div
          ref={ref}
          whileHover={cardHoverProps.whileHover}
          whileTap={cardHoverProps.whileTap}
          className={cn(cardVariants({ variant }), className)}
          tabIndex={0}
          role="button"
          {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        {...(isInteractive ? { tabIndex: 0, role: 'button' } : {})}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional action or badge on the right of the header */
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4 p-5 pb-3', className)}
      {...props}
    >
      <div className="flex flex-1 flex-col space-y-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'font-display text-body-lg font-semibold tracking-tight text-text-primary leading-tight',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-body text-caption text-text-muted leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between border-t border-border/60 bg-surface-raised/40 p-4 px-5 text-caption text-text-secondary',
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
}

const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, src, alt, aspectRatio = 'video', children, ...props }, ref) => {
    const ratioClass =
      aspectRatio === 'square'
        ? 'aspect-square'
        : aspectRatio === 'wide'
          ? 'aspect-21/9'
          : 'aspect-video';

    return (
      <div
        ref={ref}
        className={cn('relative w-full overflow-hidden bg-surface-raised', ratioClass, className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || ''}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          children
        )}
      </div>
    );
  }
);
CardMedia.displayName = 'CardMedia';

/**
 * ExpandableCard
 * --------------
 * Interactive card with a collapsible body triggered by header click.
 */
export interface ExpandableCardProps extends Omit<CardProps, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ExpandableCard({
  title,
  subtitle,
  defaultExpanded = false,
  children,
  className,
  ...props
}: ExpandableCardProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-surface-raised/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none"
        aria-expanded={expanded}
      >
        <div className="flex flex-col space-y-1 pr-4">
          <span className="font-display text-body-md font-semibold text-text-primary">{title}</span>
          {subtitle && <span className="text-caption text-text-muted">{subtitle}</span>}
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted shrink-0"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/70 p-5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMedia,
  cardVariants,
};
