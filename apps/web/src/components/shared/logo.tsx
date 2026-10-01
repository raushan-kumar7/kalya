'use client';

import * as React from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/libs/utils';
import { buttonHoverProps } from '@/libs/animations';

/**
 * Detects whether hydration is complete without calling setState inside an effect body.
 * Adheres to modern React 19 standards via useSyncExternalStore:
 * - subscribe: no-op, state never mutates post-mount
 * - getSnapshot: true on client
 * - getServerSnapshot: false during SSR
 */
export function useHasMounted(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Resolves active dark mode status matching Kalya's ThemeProvider configuration
 * (attribute="data-theme", enableSystem). Reads resolvedTheme to avoid system ambiguities.
 */
export function useIsDarkTheme(): boolean {
  const { resolvedTheme } = useTheme();
  const hasMounted = useHasMounted();

  // Default to light prior to mount to prevent SSR mismatch flashes.
  return hasMounted && resolvedTheme === 'dark';
}

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const LOGO_DIMENSIONS: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 110, height: 26 },
  md: { width: 140, height: 32 },
  lg: { width: 175, height: 40 },
  xl: { width: 210, height: 48 },
};

const ICON_DIMENSIONS: Record<LogoIconSize, { width: number; height: number }> = {
  xs: { width: 20, height: 20 },
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 40, height: 40 },
  xl: { width: 48, height: 48 },
};

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Size preset (sm, md, lg, xl). Overridden if explicit width/height provided. */
  size?: LogoSize;
  /** Explicit custom width in pixels. */
  width?: number;
  /** Explicit custom height in pixels. */
  height?: number;
  /** Preload critical brand asset above the fold. Defaults to true. */
  priority?: boolean;
  /** Optional navigation target (e.g. '/' or '/dashboard'). When provided, wraps in Next Link. */
  href?: string;
  /** Whether to apply tactile spring hover micro-interaction when interactive. Defaults to false. */
  animated?: boolean;
  /** Alt text for accessibility. Defaults to 'Kalya'. */
  alt?: string;
  className?: string;
}

/**
 * Kalya Primary Wordmark Logo
 *
 * Automatically responds to light and dark theme modes using Kalya's high-contrast
 * PNG brand assets. Prevents hydration mismatch flashes during server-side rendering.
 */
export function Logo({
  size = 'md',
  width,
  height,
  priority = true,
  href,
  animated = false,
  alt = 'Kalya',
  className,
  ...props
}: LogoProps) {
  const isDark = useIsDarkTheme();
  const reduceMotion = useReducedMotion();
  const dimensions = LOGO_DIMENSIONS[size];
  const finalWidth = width ?? dimensions.width;
  const finalHeight = height ?? dimensions.height;

  const src = isDark ? '/kalya_logo_white1.png' : '/kalya_logo1.png';

  const imageElement = (
    <NextImage
      key={src}
      src={src}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      priority={priority}
      className={cn(
        'h-auto w-auto object-contain transition-opacity duration-200 select-none',
        className
      )}
    />
  );

  const content =
    animated && !reduceMotion ? (
      <motion.div
        className="inline-flex items-center justify-center cursor-pointer"
        {...buttonHoverProps}
      >
        {imageElement}
      </motion.div>
    ) : (
      <div className="inline-flex items-center justify-center" {...props}>
        {imageElement}
      </div>
    );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${alt} - Return to homepage`}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export interface IconProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Icon size preset (xs, sm, md, lg, xl). Overridden if explicit width/height provided. */
  size?: LogoIconSize;
  /** Explicit custom width in pixels. */
  width?: number;
  /** Explicit custom height in pixels. */
  height?: number;
  /** Standalone mark or encased squircle app-icon. Defaults to 'mark'. */
  variant?: 'mark' | 'squircle' | 'app';
  /** Preload brand asset. Defaults to true. */
  priority?: boolean;
  /** Optional navigation target. */
  href?: string;
  /** Whether to apply hover spring physics. */
  animated?: boolean;
  /** Alt text for accessibility. */
  alt?: string;
  className?: string;
}

/**
 * Kalya Standalone Icon Mark
 *
 * Renders the emerald leaf & golden growth arrow brand emblem.
 * Supports standard emblem, enclosed squircle container, and app tile variants.
 */
export function Icon({
  size = 'md',
  width,
  height,
  variant = 'mark',
  priority = true,
  href,
  animated = false,
  alt = 'Kalya Mark',
  className,
  ...props
}: IconProps) {
  const isDark = useIsDarkTheme();
  const reduceMotion = useReducedMotion();
  const dimensions = ICON_DIMENSIONS[size];
  const finalWidth = width ?? dimensions.width;
  const finalHeight = height ?? dimensions.height;

  // Variant source determination
  let src = isDark ? '/kalya_icon_white1.png' : '/kalya_icon1.png';
  if (variant === 'app') {
    src = '/kalya_app_icon.png';
  }

  const imageElement = (
    <NextImage
      key={src}
      src={src}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      priority={priority}
      className={cn(
        'h-auto w-auto object-contain transition-opacity duration-200 select-none',
        className
      )}
    />
  );

  const containerContent =
    variant === 'squircle' ? (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-xl p-2 border border-border shadow-card transition-colors',
          isDark ? 'bg-surface-raised' : 'bg-surface'
        )}
      >
        {imageElement}
      </div>
    ) : (
      imageElement
    );

  const content =
    animated && !reduceMotion ? (
      <motion.div
        className="inline-flex items-center justify-center cursor-pointer"
        {...buttonHoverProps}
      >
        {containerContent}
      </motion.div>
    ) : (
      <div className="inline-flex items-center justify-center" {...props}>
        {containerContent}
      </div>
    );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${alt} - Return to homepage`}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/** Re-export for standard naming compatibility */
export { Icon as LogoIcon };
export type { IconProps as LogoIconProps };

export interface BrandBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size scale. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Optional subtitle or tagline. Defaults to 'READY FOR TOMORROW.' */
  tagline?: string;
  className?: string;
}

/**
 * Kalya Brand Eyebrow Lockup
 *
 * Combining the brand emblem with editorial typography and wide-tracked tagline.
 */
export function BrandBadge({
  size = 'md',
  tagline = 'READY FOR TOMORROW.',
  className,
  ...props
}: BrandBadgeProps) {
  const iconSizeMap: Record<'sm' | 'md' | 'lg', LogoIconSize> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)} {...props}>
      <Icon size={iconSizeMap[size]} priority />
      <div className="flex flex-col">
        <span className="font-display font-bold tracking-tight text-text-primary text-sm leading-none">
          KALYA
        </span>
        {tagline && (
          <span className="eyebrow text-[9px] font-semibold tracking-brand text-accent-strong leading-normal mt-0.5">
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
