import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/libs/utils';

export type GlassVariant = 'ultra-thin' | 'base' | 'thick' | 'emerald' | 'gold';

export type GlassRounded = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pill';

export interface GlassViewProps extends ViewProps {
  /**
   * Refractive glass opacity and tint level.
   * @default 'base'
   */
  variant?: GlassVariant;

  /**
   * Border radius tier.
   * @default 'lg'
   */
  rounded?: GlassRounded;

  /**
   * Enables specular glowing border.
   * @default false
   */
  borderGlow?: boolean;

  /**
   * Optional custom NativeWind className.
   */
  className?: string;

  /**
   * Children components.
   */
  children?: React.ReactNode;
}

const variantStyles: Record<GlassVariant, string> = {
  'ultra-thin': 'bg-kalya-glass-ultra-thin border border-kalya-glass-border',
  base: 'bg-kalya-glass-base border border-kalya-glass-border',
  thick: 'bg-kalya-glass-thick border border-kalya-glass-border',
  emerald: 'bg-kalya-glass-emerald border border-kalya-glass-border-emerald',
  gold: 'bg-kalya-glass-gold border border-kalya-glass-border-gold',
};

const roundedStyles: Record<GlassRounded, string> = {
  none: 'rounded-none',
  xs: 'rounded-kalya-xs',
  sm: 'rounded-kalya-sm',
  md: 'rounded-kalya-md',
  lg: 'rounded-kalya-lg',
  xl: 'rounded-kalya-xl',
  pill: 'rounded-kalya-pill',
};

/**
 * GlassView delivers liquid glass aesthetics with calibrated translucency,
 * subtle inner borders, and specular highlights.
 *
 * @param props - GlassViewProps
 * @returns React.JSX.Element
 */
export const GlassView: React.FC<GlassViewProps> = ({
  variant = 'base',
  rounded = 'lg',
  borderGlow = false,
  className,
  children,
  ...rest
}) => {
  return (
    <View
      className={cn(
        'overflow-hidden',
        variantStyles[variant],
        roundedStyles[rounded],
        borderGlow && 'border-kalya-glass-border-gold',
        className
      )}
      {...rest}
    >
      {children}
    </View>
  );
};
