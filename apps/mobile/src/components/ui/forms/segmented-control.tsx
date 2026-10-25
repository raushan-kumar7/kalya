import React, { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { HapticTouchable, triggerHaptic } from '../primitives/haptic-touchable';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  badgeCount?: number;
}

export interface SegmentedControlProps<T extends string> {
  /**
   * Currently active selected segment value.
   */
  value: T;

  /**
   * Available segment options.
   */
  options: SegmentOption<T>[];

  /**
   * Selection change callback.
   */
  onChange: (value: T) => void;

  /**
   * Whether the control expands across full container width.
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Custom container className.
   */
  className?: string;
}

/**
 * SegmentedControl provides a tactile sliding pill tab switcher.
 *
 * @param props - SegmentedControlProps
 * @returns React.JSX.Element
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  fullWidth = true,
  className,
}: SegmentedControlProps<T>): React.JSX.Element {
  const [containerWidth, setContainerWidth] = useState(0);
  const selectedIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === value)
  );

  const segmentWidth =
    containerWidth > 0 && options.length > 0 ? (containerWidth - 8) / options.length : 0;

  const translateX = useSharedValue(0);

  React.useEffect(() => {
    if (segmentWidth > 0) {
      translateX.value = withSpring(selectedIndex * segmentWidth, {
        damping: 20,
        stiffness: 280,
      });
    }
  }, [selectedIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth,
  }));

  const handleSelect = (val: T, index: number) => {
    if (val !== value) {
      triggerHaptic('selection');
      onChange(val);
      if (segmentWidth > 0) {
        translateX.value = withSpring(index * segmentWidth, {
          damping: 20,
          stiffness: 280,
        });
      }
    }
  };

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleContainerLayout}
      className={cn(
        'relative flex-row p-1 bg-kalya-surface-muted rounded-kalya-pill border border-kalya-border-subtle items-center',
        fullWidth && 'w-full',
        className
      )}
    >
      {/* Animated Sliding Pill Background */}
      {segmentWidth > 0 ? (
        <Animated.View
          style={indicatorStyle}
          className="absolute left-1 top-1 bottom-1 rounded-kalya-pill bg-kalya-primary"
        />
      ) : null}

      {/* Segment Option Buttons */}
      {options.map((option, index) => {
        const isSelected = option.value === value;

        return (
          <HapticTouchable
            key={option.value}
            hapticTier="none"
            onPress={() => handleSelect(option.value, index)}
            className="flex-1 py-2 px-3 rounded-kalya-pill items-center justify-center flex-row gap-1.5 z-10"
          >
            <Text
              className={cn(
                'text-xs',
                isSelected
                  ? 'font-outfit-bold text-kalya-text-inverse'
                  : 'font-outfit text-kalya-text-secondary'
              )}
            >
              {option.label}
            </Text>

            {option.badgeCount !== undefined ? (
              <View
                className={cn(
                  'px-1.5 py-0.2 rounded-full',
                  isSelected
                    ? 'bg-kalya-gold text-kalya-primary-dark'
                    : 'bg-kalya-border text-kalya-text-tertiary'
                )}
              >
                <Text
                  className={cn(
                    'text-[10px] font-ibm-plex-bold',
                    isSelected ? 'text-kalya-primary-dark' : 'text-kalya-text-secondary'
                  )}
                >
                  {option.badgeCount}
                </Text>
              </View>
            ) : null}
          </HapticTouchable>
        );
      })}
    </View>
  );
}
