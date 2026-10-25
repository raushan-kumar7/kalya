import React from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import type { lineDataItem, LineChartPropsType } from 'react-native-gifted-charts';
import { cn } from '@/libs/utils';

export interface FinancialLineChartProps {
  /**
   * Array of sequential line data points.
   */
  data: lineDataItem[];

  /**
   * Optional secondary comparison dataset.
   */
  data2?: lineDataItem[];

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
   * Primary line stroke color (Kalya Sovereign Emerald).
   * @default '#0d3e26'
   */
  color?: string;

  /**
   * Secondary line stroke color if data2 is provided (Kalya Radiant Gold).
   * @default '#d4af37'
   */
  color2?: string;

  /**
   * Line stroke thickness in pixels.
   * @default 2.5
   */
  thickness?: number;

  /**
   * Horizontal spacing between sequential data points in pixels.
   * @default 36
   */
  spacing?: number;

  /**
   * Initial offset spacing from y-axis.
   * @default 16
   */
  initialSpacing?: number;

  /**
   * Whether to render smooth bezier curved line paths.
   * @default true
   */
  curved?: boolean;

  /**
   * Whether to render translucent gradient fill beneath the line.
   * @default true
   */
  areaChart?: boolean;

  /**
   * Area fill gradient starting color.
   * @default 'rgba(13, 62, 38, 0.28)'
   */
  startFillColor?: string;

  /**
   * Area fill gradient ending color.
   * @default 'rgba(13, 62, 38, 0.01)'
   */
  endFillColor?: string;

  /**
   * Whether to animate line drawing on mount.
   * @default true
   */
  isAnimated?: boolean;

  /**
   * Duration of entry drawing animation in milliseconds.
   * @default 700
   */
  animationDuration?: number;

  /**
   * Radius of circular markers on data points in pixels.
   * @default 3.5
   */
  dataPointsRadius?: number;

  /**
   * Whether to trigger tactile haptics on data point touch.
   * @default true
   */
  enableHaptics?: boolean;

  /**
   * Optional callback fired when a data point is tapped.
   */
  onPressItem?: (item: lineDataItem, index: number) => void;

  /**
   * Custom NativeWind className.
   */
  className?: string;

  /**
   * Pass-through overrides for underlying react-native-gifted-charts LineChart.
   */
  giftedProps?: Partial<LineChartPropsType>;
}

/**
 * FinancialLineChart renders wealth accumulation curves, net worth trajectories,
 * and spending velocity over time with smooth bezier geometry and area gradients.
 *
 * @param props - FinancialLineChartProps
 * @returns React.JSX.Element
 */
export const FinancialLineChart: React.FC<FinancialLineChartProps> = ({
  data,
  data2,
  height = 200,
  width,
  color = '#0d3e26',
  color2 = '#d4af37',
  thickness = 2.5,
  spacing = 36,
  initialSpacing = 16,
  curved = true,
  areaChart = true,
  startFillColor = 'rgba(13, 62, 38, 0.28)',
  endFillColor = 'rgba(13, 62, 38, 0.01)',
  isAnimated = true,
  animationDuration = 700,
  dataPointsRadius = 3.5,
  enableHaptics = true,
  onPressItem,
  className,
  giftedProps,
}) => {
  const formattedData: lineDataItem[] = data.map((item, index) => {
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
      <GiftedLineChart
        data={formattedData}
        data2={data2}
        height={height}
        width={width}
        color={color}
        color2={color2}
        thickness={thickness}
        spacing={spacing}
        initialSpacing={initialSpacing}
        curved={curved}
        areaChart={areaChart}
        startFillColor={startFillColor}
        endFillColor={endFillColor}
        startOpacity={0.8}
        endOpacity={0.05}
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
        dataPointsColor={color}
        dataPointsRadius={dataPointsRadius}
        {...giftedProps}
      />
    </View>
  );
};
