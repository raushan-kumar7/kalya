import React from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import type { barDataItem, BarChartPropsType, stackDataItem } from 'react-native-gifted-charts';
import { cn } from '@/libs/utils';

export interface FinancialBarChartProps {
  /**
   * Array of bar data items or stacked data items.
   */
  data: barDataItem[] | stackDataItem[];

  /**
   * Chart canvas height in pixels.
   * @default 200
   */
  height?: number;

  /**
   * Chart canvas width in pixels. If omitted, takes full container width.
   */
  width?: number;

  /**
   * Width of individual bar pillars in pixels.
   * @default 24
   */
  barWidth?: number;

  /**
   * Horizontal spacing between adjacent bars in pixels.
   * @default 16
   */
  spacing?: number;

  /**
   * Initial horizontal spacing offset from y-axis.
   * @default 16
   */
  initialSpacing?: number;

  /**
   * Whether to round top corners of the bars.
   * @default true
   */
  roundedTop?: boolean;

  /**
   * Top left border radius in pixels.
   * @default 6
   */
  barBorderTopLeftRadius?: number;

  /**
   * Top right border radius in pixels.
   * @default 6
   */
  barBorderTopRightRadius?: number;

  /**
   * Default primary bar color (Kalya Sovereign Emerald).
   * @default '#0d3e26'
   */
  frontColor?: string;

  /**
   * Secondary gradient color for vertical shimmer.
   * @default '#1b5e3a'
   */
  gradientColor?: string;

  /**
   * Whether to render vertical gradients on bars.
   * @default true
   */
  showGradient?: boolean;

  /**
   * Whether to trigger entry rising animation.
   * @default true
   */
  isAnimated?: boolean;

  /**
   * Duration of entry animation in milliseconds.
   * @default 650
   */
  animationDuration?: number;

  /**
   * Whether to trigger tactile haptics when bars are pressed.
   * @default true
   */
  enableHaptics?: boolean;

  /**
   * Optional callback fired when any bar is pressed.
   */
  onPressItem?: (item: barDataItem, index: number) => void;

  /**
   * Custom NativeWind className.
   */
  className?: string;

  /**
   * Pass-through overrides for underlying react-native-gifted-charts BarChart.
   */
  giftedProps?: Partial<BarChartPropsType>;
}

/**
 * FinancialBarChart renders monthly cash flows, expense vs income comparisons,
 * and category spending distributions using react-native-gifted-charts.
 *
 * @param props - FinancialBarChartProps
 * @returns React.JSX.Element
 */
export const FinancialBarChart: React.FC<FinancialBarChartProps> = ({
  data,
  height = 200,
  width,
  barWidth = 24,
  spacing = 16,
  initialSpacing = 16,
  roundedTop = true,
  barBorderTopLeftRadius = 6,
  barBorderTopRightRadius = 6,
  frontColor = '#0d3e26',
  gradientColor = '#1b5e3a',
  showGradient = true,
  isAnimated = true,
  animationDuration = 650,
  enableHaptics = true,
  onPressItem,
  className,
  giftedProps,
}) => {
  const formattedData: barDataItem[] = (data as barDataItem[]).map((item, index) => {
    return {
      ...item,
      onPress: (e?: any) => {
        if (enableHaptics) {
          Haptics.selectionAsync().catch(() => {});
        }
        if (item.onPress) {
          item.onPress(e);
        }
        if (onPressItem) {
          onPressItem(item, index);
        }
      },
    };
  });

  return (
    <View className={cn('py-2 items-center', className)}>
      <GiftedBarChart
        data={formattedData}
        height={height}
        width={width}
        barWidth={barWidth}
        spacing={spacing}
        initialSpacing={initialSpacing}
        roundedTop={roundedTop}
        barBorderTopLeftRadius={barBorderTopLeftRadius}
        barBorderTopRightRadius={barBorderTopRightRadius}
        frontColor={frontColor}
        gradientColor={gradientColor}
        showGradient={showGradient}
        isAnimated={isAnimated}
        animationDuration={animationDuration}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#e2e8f0"
        rulesColor="#f1f5f9"
        rulesType="solid"
        noOfSections={4}
        yAxisTextStyle={{ color: '#64748b', fontSize: 10, fontFamily: 'font-ibm-plex' }}
        xAxisLabelTextStyle={{ color: '#64748b', fontSize: 11, fontFamily: 'font-inter' }}
        {...giftedProps}
      />
    </View>
  );
};
