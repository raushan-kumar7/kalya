import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { HapticTouchable, HapticTouchableProps } from './haptic-touchable';
import { Text } from './text';
import { cn } from '@/libs/utils';

export type ButtonVariant =
  'primary' | 'gold' | 'glass' | 'glass-emerald' | 'outline' | 'ghost' | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'pill';

export interface ButtonProps extends Omit<HapticTouchableProps, 'children'> {
  /**
   * Button title label text.
   */
  title: string;

  /**
   * Visual aesthetic variant.
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Sizing tier.
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * In-flight loading state. Replaces content with activity spinner.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Optional text displayed alongside the loading spinner.
   */
  loadingText?: string;

  /**
   * Optional icon component placed to the left of the title.
   */
  leftIcon?: React.ReactNode;

  /**
   * Optional icon component placed to the right of the title.
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether button should expand to fill full width.
   * @default false
   */
  fullWidth?: boolean;
}

export interface IconButtonProps extends Omit<HapticTouchableProps, 'children'> {
  /**
   * Icon component to render inside the button.
   */
  icon: React.ReactNode;

  /**
   * Visual variant style.
   * @default 'glass'
   */
  variant?: ButtonVariant;

  /**
   * Size tier for square button.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Accessibility description for screen readers.
   */
  accessibilityLabel: string;
}

const variantContainerStyles: Record<ButtonVariant, string> = {
  primary: 'bg-kalya-primary border border-kalya-border-strong',
  gold: 'bg-kalya-gold border border-kalya-gold-warm',
  glass: 'bg-kalya-glass-base border border-kalya-glass-border',
  'glass-emerald': 'bg-kalya-glass-emerald border border-kalya-glass-border-emerald',
  outline: 'bg-transparent border border-kalya-border',
  ghost: 'bg-transparent border border-transparent',
  destructive: 'bg-kalya-surface border border-kalya-outflow',
};

const variantTextColors: Record<ButtonVariant, string> = {
  primary: 'text-kalya-text-inverse font-inter-bold',
  gold: 'text-kalya-primary-dark font-inter-bold',
  glass: 'text-kalya-primary-dark font-inter-bold',
  'glass-emerald': 'text-kalya-text-inverse font-inter-bold',
  outline: 'text-kalya-primary font-inter-bold',
  ghost: 'text-kalya-text-secondary font-inter-bold',
  destructive: 'text-kalya-outflow font-inter-bold',
};

const spinnerColors: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  gold: '#082919',
  glass: '#082919',
  'glass-emerald': '#ffffff',
  outline: '#0d3e26',
  ghost: '#2d5e46',
  destructive: '#c83535',
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'px-3 py-1.5 rounded-kalya-sm', text: 'text-xs' },
  md: { container: 'px-4 py-2.5 rounded-kalya-md', text: 'text-sm' },
  lg: { container: 'px-6 py-3.5 rounded-kalya-lg', text: 'text-base' },
  pill: { container: 'px-5 py-2.5 rounded-kalya-pill', text: 'text-sm' },
};

const iconSizeStyles = {
  sm: 'w-8 h-8 rounded-kalya-sm',
  md: 'w-10 h-10 rounded-kalya-md',
  lg: 'w-12 h-12 rounded-kalya-lg',
};

/**
 * Button is the primary interactive trigger for the Kalya mobile application.
 *
 * @param props - ButtonProps
 * @returns React.JSX.Element
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  hapticTier = 'medium',
  disabled,
  className,
  ...rest
}) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <HapticTouchable
      disabled={isButtonDisabled}
      hapticTier={hapticTier}
      className={cn(
        'flex-row items-center justify-center gap-2',
        variantContainerStyles[variant],
        sizeStyles[size].container,
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator size="small" color={spinnerColors[variant]} />
          {loadingText ? (
            <Text className={cn(variantTextColors[variant], sizeStyles[size].text)}>
              {loadingText}
            </Text>
          ) : null}
        </View>
      ) : (
        <>
          {leftIcon ? <View className="items-center justify-center">{leftIcon}</View> : null}
          <Text className={cn(variantTextColors[variant], sizeStyles[size].text)}>{title}</Text>
          {rightIcon ? <View className="items-center justify-center">{rightIcon}</View> : null}
        </>
      )}
    </HapticTouchable>
  );
};

/**
 * IconButton renders a compact, accessible icon trigger with tactile feedback.
 *
 * @param props - IconButtonProps
 * @returns React.JSX.Element
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'glass',
  size = 'md',
  accessibilityLabel,
  hapticTier = 'light',
  className,
  ...rest
}) => {
  return (
    <HapticTouchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hapticTier={hapticTier}
      className={cn(
        'items-center justify-center',
        variantContainerStyles[variant],
        iconSizeStyles[size],
        className
      )}
      {...rest}
    >
      {icon}
    </HapticTouchable>
  );
};
