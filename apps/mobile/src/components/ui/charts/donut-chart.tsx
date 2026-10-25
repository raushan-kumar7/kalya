import React from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';
import type { pieDataItem, PieChartPropsType } from 'react-native-gifted-charts';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface ChartSegment {
  /**
   * Label descriptor for slice segment.
   */
  label: string;

  /**
   * Numeric quantity or percentage value.
   */
  value: number;

  /**
   * Hex or rgba slice color string.
   */
  color: string;

  /**
   * Optional inner text displayed on segment.
   */
  text?: string;

  /**
   * Whether slice is initially focused or elevated.
   */
  focused?: boolean;

  /**
   * Optional slice press callback.
   */
  onPress?: () => void;
}

export interface DonutChartProps {
  /**
   * Array of chart segments or raw pieDataItems representing allocation portions.
   */
  data: (ChartSegment | pieDataItem)[];

  /**
   * Total diameter dimension in pixels.
   * @default 140
   */
  size?: number;

  /**
   * Donut ring thickness in pixels.
   * @default 18
   */
  strokeWidth?: number;

  /**
   * Primary title or value rendered in center circle.
   */
  centerLabel?: string;

  /**
   * Supporting caption or subtitle rendered beneath centerLabel.
   */
  centerSubtitle?: string;

  /**
   * Inner circle background color.
   * @default '#ffffff'
   */
  innerCircleColor?: string;

  /**
   * Whether slices animate on initial mount.
   * @default true
   */
  isAnimated?: boolean;

  /**
   * Duration of entry sweep animation in milliseconds.
   * @default 650
   */
  animationDuration?: number;

  /**
   * Whether tapping a slice elevates and focuses it.
   * @default true
   */
  focusOnPress?: boolean;

  /**
   * Whether to trigger physical haptic feedback when a slice is tapped.
   * @default true
   */
  enableHaptics?: boolean;

  /**
   * Callback fired when a slice is tapped.
   */
  onPressItem?: (item: pieDataItem, index: number) => void;

  /**
   * Custom NativeWind className.
   */
  className?: string;

  /**
   * Pass-through overrides for underlying react-native-gifted-charts PieChart.
   */
  giftedProps?: Partial<PieChartPropsType>;
}

/**
 * DonutChart renders a luxury circular allocation chart powered by react-native-gifted-charts.
 * Calibrated for Kalya's 50/30/20 buckets, category spending splits, and asset allocation breakdown.
 *
 * @param props - DonutChartProps
 * @returns React.JSX.Element
 */
export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 140,
  strokeWidth = 18,
  centerLabel,
  centerSubtitle,
  innerCircleColor = '#ffffff',
  isAnimated = true,
  animationDuration = 650,
  focusOnPress = true,
  enableHaptics = true,
  onPressItem,
  className,
  giftedProps,
}) => {
  const radius = size / 2;
  const innerRadius = Math.max(0, (size - 2 * strokeWidth) / 2);

  const formattedData: pieDataItem[] = data.map((item, index) => {
    return {
      ...item,
      value: item.value,
      color: item.color,
      text: 'text' in item ? (item as any).text : undefined,
      focused: 'focused' in item ? (item as any).focused : undefined,
      onPress: () => {
        if (enableHaptics) {
          Haptics.selectionAsync().catch(() => {});
        }
        if (item.onPress) {
          item.onPress();
        }
        if (onPressItem) {
          onPressItem(item as pieDataItem, index);
        }
      },
    };
  });

  const renderCenter = () => {
    if (!centerLabel && !centerSubtitle) return null;
    return (
      <View className="items-center justify-center pointer-events-none px-1">
        {centerLabel ? (
          <Text variant="numeral-sm" tone="primary" className="font-ibm-plex-bold text-center">
            {centerLabel}
          </Text>
        ) : null}
        {centerSubtitle ? (
          <Text
            variant="caption"
            tone="tertiary"
            className="font-inter text-[10px] text-center mt-0.5"
          >
            {centerSubtitle}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View
      style={{ width: size, height: size }}
      className={cn('relative items-center justify-center', className)}
    >
      <GiftedPieChart
        donut
        data={formattedData}
        radius={radius}
        innerRadius={innerRadius}
        innerCircleColor={innerCircleColor}
        isAnimated={isAnimated}
        animationDuration={animationDuration}
        focusOnPress={focusOnPress}
        centerLabelComponent={centerLabel || centerSubtitle ? renderCenter : undefined}
        {...giftedProps}
      />
    </View>
  );
};
