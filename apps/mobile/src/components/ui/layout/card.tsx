import React from 'react';
import { View, ViewProps } from 'react-native';
import { HapticTouchable, HapticTier } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export type CardVariant =
  'surface' | 'subtle' | 'glass' | 'glass-emerald' | 'hero-emerald' | 'outlined';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardRounded = 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends ViewProps {
  /**
   * Surface visual variant.
   * @default 'surface'
   */
  variant?: CardVariant;

  /**
   * Inner padding tier.
   * @default 'md'
   */
  padding?: CardPadding;

  /**
   * Border radius tier.
   * @default 'lg'
   */
  rounded?: CardRounded;

  /**
   * Optional click/tap handler. When provided, the card renders as
   * an interactive HapticTouchable with spring scaling.
   */
  onPress?: () => void;

  /**
   * Haptic feedback tier when interactive.
   * @default 'light'
   */
  hapticTier?: HapticTier;

  /**
   * Custom NativeWind className.
   */
  className?: string;

  /**
   * Content children.
   */
  children?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  surface: 'bg-kalya-surface border border-kalya-border-subtle',
  subtle: 'bg-kalya-surface-subtle border border-kalya-border-subtle',
  glass: 'bg-kalya-glass-base border border-kalya-glass-border',
  'glass-emerald': 'bg-kalya-glass-emerald border border-kalya-glass-border-emerald',
  'hero-emerald': 'bg-kalya-primary-dark border border-kalya-border-strong',
  outlined: 'bg-transparent border border-kalya-border',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
};

const roundedStyles: Record<CardRounded, string> = {
  sm: 'rounded-kalya-sm',
  md: 'rounded-kalya-md',
  lg: 'rounded-kalya-lg',
  xl: 'rounded-kalya-xl',
};

/**
 * Card is the fundamental surface container for the Kalya mobile application.
 *
 * @param props - CardProps
 * @returns React.JSX.Element
 */
export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  padding = 'md',
  rounded = 'lg',
  onPress,
  hapticTier = 'light',
  className,
  children,
  ...rest
}) => {
  const containerClasses = cn(
    'overflow-hidden',
    variantStyles[variant],
    paddingStyles[padding],
    roundedStyles[rounded],
    className
  );

  if (onPress) {
    return (
      <HapticTouchable
        onPress={onPress}
        hapticTier={hapticTier}
        className={containerClasses}
        {...rest}
      >
        {children}
      </HapticTouchable>
    );
  }

  return (
    <View className={containerClasses} {...rest}>
      {children}
    </View>
  );
};

export const CardHeader: React.FC<ViewProps & { className?: string }> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between pb-3 border-b border-kalya-border-subtle',
        className
      )}
      {...rest}
    >
      {children}
    </View>
  );
};

export const CardBody: React.FC<ViewProps & { className?: string }> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <View className={cn('py-2', className)} {...rest}>
      {children}
    </View>
  );
};

export const CardFooter: React.FC<ViewProps & { className?: string }> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between pt-3 border-t border-kalya-border-subtle mt-1',
        className
      )}
      {...rest}
    >
      {children}
    </View>
  );
};
