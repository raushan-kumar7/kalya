import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface ProgressRingProps {
  /**
   * Progress value (either 0.0-1.0 or 0-100).
   */
  progress: number;

  /**
   * Diameter size in pixels.
   * @default 64
   */
  size?: number;

  /**
   * Stroke width in pixels.
   * @default 6
   */
  strokeWidth?: number;

  /**
   * Ring progress stroke color.
   * @default '#d4af37' (Gold)
   */
  color?: string;

  /**
   * Optional custom center content (e.g. percentage text or icon).
   */
  children?: React.ReactNode;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * ProgressRing renders a circular progress gauge for savings goals and asset milestones.
 *
 * @param props - ProgressRingProps
 * @returns React.JSX.Element
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 64,
  strokeWidth = 6,
  color = '#d4af37',
  children,
  className,
}) => {
  const ratio = progress > 1 ? progress / 100 : progress;
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedRatio);

  const percentageInt = Math.round(clampedRatio * 100);

  return (
    <View
      style={{ width: size, height: size }}
      className={cn('relative items-center justify-center', className)}
    >
      <Svg width={size} height={size}>
        <Circle
          stroke="rgba(13, 62, 38, 0.12)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View className="absolute inset-0 items-center justify-center">
        {children ? (
          children
        ) : (
          <Text variant="caption" tone="primary" className="font-ibm-plex-bold text-[11px]">
            {percentageInt}%
          </Text>
        )}
      </View>
    </View>
  );
};
