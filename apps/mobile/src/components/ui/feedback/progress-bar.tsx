import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { cn } from '@/libs/utils';

export interface ProgressBarProps {
  /**
   * Progress value represented either as 0.0-1.0 or 0-100.
   */
  progress: number;

  /**
   * Threshold where progress turns amber (warning limit).
   * @default 0.8 (80%)
   */
  amberThreshold?: number;

  /**
   * Threshold where progress turns red (budget exceeded).
   * @default 1.0 (100%)
   */
  redThreshold?: number;

  /**
   * Height in pixels.
   * @default 8
   */
  height?: number;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * ProgressBar displays budget usage and savings goal progress with
 * amber warning and red overrun color thresholds.
 *
 * @param props - ProgressBarProps
 * @returns React.JSX.Element
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  amberThreshold = 0.8,
  redThreshold = 1.0,
  height = 8,
  className,
}) => {
  const ratio = progress > 1 ? progress / 100 : progress;
  const clampedRatio = Math.max(0, Math.min(1.5, ratio));
  const displayPercentage = Math.min(100, Math.max(0, ratio * 100));

  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(displayPercentage, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [displayPercentage, animatedWidth]);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const getFillColor = () => {
    if (ratio >= redThreshold) return 'bg-kalya-outflow';
    if (ratio >= amberThreshold) return 'bg-kalya-gold';
    return 'bg-kalya-primary';
  };

  return (
    <View
      style={{ height }}
      className={cn('w-full rounded-full bg-kalya-border-subtle overflow-hidden', className)}
    >
      <Animated.View
        style={[fillAnimatedStyle, { height: '100%' }]}
        className={cn('rounded-full', getFillColor())}
      />
    </View>
  );
};
