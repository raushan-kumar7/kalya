import React, { useEffect } from 'react';
import { DimensionValue, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { cn } from '@/libs/utils';

export interface SkeletonProps extends ViewProps {
  /**
   * Width dimension (number or percentage string).
   * @default '100%'
   */
  width?: DimensionValue;

  /**
   * Height dimension.
   * @default 20
   */
  height?: DimensionValue;

  /**
   * Corner radius tier.
   * @default 'md'
   */
  rounded?: 'xs' | 'sm' | 'md' | 'lg' | 'pill';

  /**
   * Shimmer pulse cycle duration in milliseconds.
   * @default 1000
   */
  shimmerDurationMs?: number;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

const roundedStyles = {
  xs: 'rounded-kalya-xs',
  sm: 'rounded-kalya-sm',
  md: 'rounded-kalya-md',
  lg: 'rounded-kalya-lg',
  pill: 'rounded-kalya-pill',
};

/**
 * Skeleton provides specular shimmer placeholders that mimic exact component geometry.
 *
 * @param props - SkeletonProps
 * @returns React.JSX.Element
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  rounded = 'md',
  shimmerDurationMs = 1000,
  style,
  className,
  ...rest
}) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: shimmerDurationMs,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [shimmerDurationMs, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width, height }, animatedStyle, style]}
      className={cn('bg-kalya-border-subtle overflow-hidden', roundedStyles[rounded], className)}
      {...rest}
    />
  );
};
