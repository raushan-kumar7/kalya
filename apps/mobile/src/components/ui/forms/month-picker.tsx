import React from 'react';
import { View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatMonthLabel, shiftMonth, getCurrentMonthString } from '@kalya/utils';
import { Text } from '../primitives/text';
import { HapticTouchable, triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface MonthPickerProps {
  /**
   * Selected Year-Month in YYYY-MM format.
   * e.g., "2026-10"
   */
  value?: string;

  /**
   * Callback invoked with updated YYYY-MM string.
   */
  onChange: (yearMonth: string) => void;

  /**
   * Optional field label.
   */
  label?: string;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * MonthPicker provides a streamlined YYYY-MM selector for monthly income and budget periods.
 *
 * Uses formatMonthLabel and shiftMonth from @kalya/utils.
 *
 * @param props - MonthPickerProps
 * @returns React.JSX.Element
 */
export const MonthPicker: React.FC<MonthPickerProps> = ({
  value = getCurrentMonthString(),
  onChange,
  label,
  className,
}) => {
  const currentVal = value || getCurrentMonthString();

  const handlePrevMonth = () => {
    triggerHaptic('selection');
    const prev = shiftMonth(currentVal, -1);
    onChange(prev);
  };

  const handleNextMonth = () => {
    triggerHaptic('selection');
    const next = shiftMonth(currentVal, 1);
    onChange(next);
  };

  const displayLabel = formatMonthLabel(currentVal);

  return (
    <View className={cn('w-full flex-col gap-1.5', className)}>
      {label ? (
        <Text
          variant="caption"
          tone="secondary"
          className="font-inter-bold uppercase tracking-wider"
        >
          {label}
        </Text>
      ) : null}

      <View className="flex-row items-center justify-between px-3 py-2 rounded-kalya-md bg-kalya-surface border border-kalya-border-subtle">
        <HapticTouchable
          accessibilityLabel="Previous month"
          hapticTier="light"
          onPress={handlePrevMonth}
          className="p-1.5 rounded-full bg-kalya-surface-subtle"
        >
          <ChevronLeft size={18} color="#0d3e26" />
        </HapticTouchable>

        <Text variant="title-sm" tone="primary" className="font-outfit-bold">
          {displayLabel}
        </Text>

        <HapticTouchable
          accessibilityLabel="Next month"
          hapticTier="light"
          onPress={handleNextMonth}
          className="p-1.5 rounded-full bg-kalya-surface-subtle"
        >
          <ChevronRight size={18} color="#0d3e26" />
        </HapticTouchable>
      </View>
    </View>
  );
};
