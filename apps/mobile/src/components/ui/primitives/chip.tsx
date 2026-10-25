import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { HapticTouchable } from './haptic-touchable';
import { cn } from '@/libs/utils';

export interface ChipProps {
  /**
   * Display text label.
   */
  label: string;

  /**
   * Whether the chip is currently selected.
   * @default false
   */
  selected?: boolean;

  /**
   * Callback when chip is tapped.
   */
  onPress?: () => void;

  /**
   * Optional leading icon or emoji.
   */
  icon?: React.ReactNode;

  /**
   * Sizing tier.
   * @default 'md'
   */
  size?: 'sm' | 'md';

  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * Chip provides a fluid, selectable pill control with spring-physics feedback
 * and seamless color interpolation.
 *
 * @param props - ChipProps
 * @returns React.JSX.Element
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  size = 'md',
  disabled = false,
  className,
}) => {
  const progress = useSharedValue(selected ? 1 : 0);
  const scale = useSharedValue(selected ? 1.04 : 1);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, {
      duration: 200,
    });
    scale.value = withSpring(selected ? 1.04 : 1, {
      damping: 18,
      stiffness: 240,
    });
  }, [selected, progress, scale]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(progress.value, [0, 1], ['#ffffff', '#0d3e26']),
      borderColor: interpolateColor(progress.value, [0, 1], ['#cde8d7', '#0d3e26']),
      transform: [{ scale: scale.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(progress.value, [0, 1], ['#475569', '#ffffff']),
    };
  });

  return (
    <HapticTouchable
      disabled={disabled}
      hapticTier="selection"
      scaleTo={0.97}
      onPress={onPress}
      className={className}
    >
      <Animated.View
        style={[
          {
            borderWidth: 1,
            borderRadius: 9999,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: size === 'sm' ? 10 : 14,
            paddingVertical: size === 'sm' ? 5 : 7,
            opacity: disabled ? 0.5 : 1,
            gap: size === 'sm' ? 4 : 6,
          },
          animatedContainerStyle,
        ]}
      >
        {icon ? <View className="items-center justify-center">{icon}</View> : null}
        <Animated.Text
          style={animatedTextStyle}
          className={cn(
            size === 'sm' ? 'text-xs' : 'text-sm leading-normal',
            selected ? 'font-inter-bold' : 'font-inter-medium'
          )}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </HapticTouchable>
  );
};
