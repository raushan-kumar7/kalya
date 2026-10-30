import React, { useState } from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from '@/libs/utils';

export type HapticTier =
  'none' | 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export type ExtendedHapticTier = HapticTier | 'notificationSuccess';

export interface HapticTouchableProps extends Omit<RNPressableProps, 'style'> {
  /**
   * Calibrated haptic intensity triggered on press down.
   * @default 'light'
   */
  hapticTier?: ExtendedHapticTier;

  /**
   * Target scale down factor on touch down.
   * @default 0.97
   */
  scaleTo?: number;

  /**
   * Optional custom view style or style array or render function.
   */
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);

  /**
   * Tailwind utility class name for NativeWind styling.
   */
  className?: string;

  /**
   * Children components or render prop.
   */
  children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
}

/**
 * Triggers a calibrated physical tactile response using expo-haptics.
 * Non-blocking and fail-safe across platforms.
 *
 * @param tier - The haptic intensity tier
 */
export async function triggerHaptic(tier: ExtendedHapticTier = 'light'): Promise<void> {
  if (tier === 'none') return;
  try {
    const mappedTier: HapticTier = tier === 'notificationSuccess' ? 'success' : tier;
    switch (mappedTier) {
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'light':
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch {
    // Fail silently on devices without haptic engines (e.g. web/simulators)
  }
}

/**
 * HapticTouchable provides a unified, physical tactile touchable base
 * for the Kalya mobile application.
 *
 * @param props - HapticTouchableProps
 * @returns React.JSX.Element
 */
export const HapticTouchable: React.FC<HapticTouchableProps> = ({
  hapticTier = 'light',
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  disabled,
  style,
  className,
  children,
  ...rest
}) => {
  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      triggerHaptic(hapticTier);
    }
    onPressIn?.(event);
  };

  return (
    <RNPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={onPressOut}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && !disabled && scaleTo !== 1 ? { transform: [{ scale: scaleTo }] } : null,
      ]}
      className={cn(disabled && 'opacity-50', className)}
    >
      {typeof children === 'function'
        ? (state) => (children as (state: { pressed: boolean }) => React.ReactNode)(state)
        : children}
    </RNPressable>
  );
};
