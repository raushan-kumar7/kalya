import React, { useRef, useState } from 'react';
import { View, PanResponder, LayoutChangeEvent } from 'react-native';
import { Text } from '../primitives/text';
import { triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface SliderProps {
  /**
   * Current value (defaults to percentage 0-100).
   */
  value: number;

  /**
   * Value change callback.
   */
  onChange: (value: number) => void;

  /**
   * Minimum value.
   * @default 0
   */
  min?: number;

  /**
   * Maximum value.
   * @default 100
   */
  max?: number;

  /**
   * Step increment.
   * @default 1
   */
  step?: number;

  /**
   * Field label.
   */
  label?: string;

  /**
   * Suffix to append to value readout (e.g. "%").
   * @default '%'
   */
  valueSuffix?: string;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * Slider provides a touchable track for adjusting budget percentages and target allocations.
 *
 * @param props - SliderProps
 * @returns React.JSX.Element
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueSuffix = '%',
  className,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);

  const clampedValue = Math.min(max, Math.max(min, value));
  const percentage = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;

  const updateValueFromX = (x: number) => {
    if (trackWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / trackWidth));
    const rawVal = min + ratio * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;
    const finalVal = Math.min(max, Math.max(min, steppedVal));
    if (finalVal !== clampedValue) {
      triggerHaptic('selection');
      onChange(finalVal);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateValueFromX(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        updateValueFromX(evt.nativeEvent.locationX);
      },
    })
  ).current;

  return (
    <View className={cn('w-full flex-col gap-2 my-1', className)}>
      <View className="flex-row items-baseline justify-between px-0.5">
        {label ? (
          <Text variant="body-sm" tone="secondary" className="font-inter-bold">
            {label}
          </Text>
        ) : null}

        <Text variant="numeral-sm" tone="primary" className="font-ibm-plex-bold">
          {clampedValue}
          {valueSuffix}
        </Text>
      </View>

      <View
        onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
        className="h-8 justify-center"
      >
        {/* Inactive Track */}
        <View className="w-full h-2 rounded-full bg-kalya-border-subtle overflow-hidden">
          {/* Active Fill */}
          <View
            style={{ width: `${percentage}%` }}
            className="h-full bg-kalya-primary rounded-full"
          />
        </View>

        {/* Thumb */}
        <View
          style={{
            left: `${percentage}%`,
            marginLeft: -10,
          }}
          className="absolute w-5 h-5 rounded-full bg-kalya-surface border-2 border-kalya-primary"
        />
      </View>
    </View>
  );
};
