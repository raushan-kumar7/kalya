'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';

const avatarVariants = cva(
  'relative inline-flex shrink-0 select-none overflow-hidden rounded-full font-body font-medium',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-caption',
        default: 'h-10 w-10 text-body-sm',
        md: 'h-10 w-10 text-body-sm',
        lg: 'h-12 w-12 text-body-md',
        xl: 'h-16 w-16 text-body-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const statusColors = {
  online: 'bg-success ring-surface',
  offline: 'bg-text-muted ring-surface',
  away: 'bg-warning ring-surface',
  busy: 'bg-danger ring-surface',
} as const;

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'default', status, children, ...props }, ref) => {
    const isSmall = size === 'xs' || size === 'sm';

    return (
      <div className="relative inline-block">
        <div ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
          {children}
        </div>
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full ring-2',
              isSmall ? 'h-2 w-2 ring-1' : 'h-3 w-3',
              statusColors[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = '', onLoadingStatusChange, ...props }, ref) => {
    const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');

    React.useEffect(() => {
      if (!src) {
        setStatus('error');
        onLoadingStatusChange?.('error');
        return;
      }
      setStatus('loading');
      onLoadingStatusChange?.('loading');
    }, [src, onLoadingStatusChange]);

    if (status === 'error') {
      return null;
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        onLoad={() => {
          setStatus('loaded');
          onLoadingStatusChange?.('loaded');
        }}
        onError={() => {
          setStatus('error');
          onLoadingStatusChange?.('error');
        }}
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-primary-subtle text-primary font-semibold uppercase tracking-wider',
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  total?: number;
}

export function AvatarGroup({ children, max = 4, total, className, ...props }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const remainingCount = (total ?? childrenArray.length) - max;

  return (
    <div className={cn('flex items-center -space-x-2 overflow-hidden', className)} {...props}>
      {visibleAvatars.map((child, idx) => (
        <div key={idx} className="relative ring-2 ring-surface rounded-full">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="relative ring-2 ring-surface rounded-full">
          <Avatar size="sm">
            <AvatarFallback className="bg-surface-raised border border-border text-caption font-numeric text-text-secondary">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
