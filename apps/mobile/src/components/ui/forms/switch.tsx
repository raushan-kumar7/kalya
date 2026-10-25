import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface SwitchProps {
  /**
   * Current checked boolean state.
   */
  value: boolean;

  /**
   * Value change callback.
   */
  onValueChange: (newValue: boolean) => void;

  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean;

  /**
   * Accessibility label for screen readers.
   */
  accessibilityLabel?: string;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const PADDING = 3;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING * 2;

/**
 * Switch delivers a tactile animated toggle for settings and preferences.
 *
 * @param props - SwitchProps
 * @returns React.JSX.Element
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel = 'Toggle setting',
  className,
}) => {
  const offset = useSharedValue(value ? TRAVEL : 0);

  useEffect(() => {
    offset.value = withSpring(value ? TRAVEL : 0, {
      damping: 18,
      stiffness: 300,
    });
  }, [value, offset]);

  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic('light');
    onValueChange(!value);
  };

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      onPress={handleToggle}
      disabled={disabled}
      className={cn(
        'justify-center rounded-kalya-pill border',
        value
          ? 'bg-kalya-primary border-kalya-border-strong'
          : 'bg-kalya-border-subtle border-kalya-border',
        disabled && 'opacity-50',
        className
      )}
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        padding: PADDING,
      }}
    >
      <Animated.View
        style={[
          {
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
          },
          thumbAnimatedStyle,
        ]}
        className="bg-white"
      />
    </Pressable>
  );
};
