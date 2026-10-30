import React, { useState } from 'react';
import { View, Modal, Pressable } from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
  formatCardDate,
  buildMonthGrid,
  WEEKDAYS,
  MONTHS,
  fromISO,
  toISO,
  Temporal,
} from '@kalya/utils';
import { Typo } from '../primitives/typo';
import { HapticTouchable, triggerHaptic } from '../primitives/haptic-touchable';
import { Button } from '../primitives/button';
import { cn } from '@/libs/utils';

export interface DatePickerProps {
  /**
   * Selected date value in ISO format (YYYY-MM-DD).
   */
  value?: string;

  /**
   * Callback invoked with updated ISO date string.
   */
  onChange: (isoDate: string) => void;

  /**
   * Field label.
   */
  label?: string;

  /**
   * Error message.
   */
  error?: string | null;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * DatePicker provides an accessible date selector outputting ISO strings.
 *
 * Powered by Temporal and date utilities from @kalya/utils.
 *
 * @param props - DatePickerProps
 * @returns React.JSX.Element
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  error,
  className,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Initialize with Temporal PlainDate from @kalya/utils
  const currentDate = value
    ? (fromISO(value) ?? Temporal.Now.plainDateISO())
    : Temporal.Now.plainDateISO();
  const [viewYear, setViewYear] = useState(currentDate.year);
  const [viewMonth, setViewMonth] = useState(currentDate.month - 1); // 0-indexed for buildMonthGrid
  const [selectedDate, setSelectedDate] = useState(value || toISO(currentDate));

  const handleOpen = () => {
    triggerHaptic('light');
    setModalVisible(true);
  };

  const handleConfirm = () => {
    triggerHaptic('medium');
    onChange(selectedDate);
    setModalVisible(false);
  };

  const handlePrevMonth = () => {
    triggerHaptic('selection');
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    triggerHaptic('selection');
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate 42-day calendar grid from @kalya/utils
  const monthGrid = buildMonthGrid(viewYear, viewMonth);
  const monthName = `${MONTHS[viewMonth]} ${viewYear}`;

  return (
    <View className={cn('w-full flex-col gap-1.5', className)}>
      {label ? (
        <Typo variant="body-sm" className="font-inter-bold text-kalya-text-secondary">
          {label}
        </Typo>
      ) : null}

      <HapticTouchable
        hapticTier="light"
        onPress={handleOpen}
        className={cn(
          'flex-row items-center justify-between px-3.5 py-3 rounded-kalya-md border bg-kalya-surface',
          error
            ? 'border-kalya-outflow'
            : modalVisible
              ? 'border-kalya-primary'
              : 'border-kalya-border-subtle'
        )}
      >
        <View className="flex-row items-center gap-2.5">
          <CalendarIcon size={18} color="#0d3e26" />
          <Typo
            variant="body-md"
            className={
              value ? 'font-inter text-kalya-text-primary' : 'font-inter text-kalya-text-tertiary'
            }
          >
            {value ? formatCardDate(value) : 'Select date'}
          </Typo>
        </View>
      </HapticTouchable>

      {error ? (
        <Typo variant="caption" tone="outflow">
          {error}
        </Typo>
      ) : null}

      {/* Calendar Dialog Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          className="flex-1 items-center justify-center p-4"
        >
          <View className="w-full max-w-[340px] bg-kalya-surface rounded-kalya-xl border border-kalya-border-subtle p-5">
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-kalya-border-subtle">
              <HapticTouchable
                hapticTier="light"
                onPress={handlePrevMonth}
                className="p-1.5 rounded-full bg-kalya-surface-subtle"
              >
                <ChevronLeft size={18} color="#0d3e26" />
              </HapticTouchable>
              <Typo variant="title-sm" className="font-outfit-bold text-kalya-text-primary">
                {monthName}
              </Typo>
              <HapticTouchable
                hapticTier="light"
                onPress={handleNextMonth}
                className="p-1.5 rounded-full bg-kalya-surface-subtle"
              >
                <ChevronRight size={18} color="#0d3e26" />
              </HapticTouchable>
            </View>

            {/* Weekdays Row */}
            <View className="flex-row py-2 border-b border-kalya-border-subtle">
              {WEEKDAYS.map((day) => (
                <View key={day} className="w-[14.28%] items-center py-1">
                  <Typo variant="caption" tone="tertiary" className="font-inter-bold">
                    {day}
                  </Typo>
                </View>
              ))}
            </View>

            {/* Days Grid */}
            <View className="flex-row flex-wrap py-2">
              {monthGrid.map((plainDate) => {
                const isoStr = toISO(plainDate);
                const isSelected = selectedDate === isoStr;
                const isCurrentViewingMonth = plainDate.month === viewMonth + 1;

                return (
                  <Pressable
                    key={isoStr}
                    onPress={() => {
                      triggerHaptic('selection');
                      setSelectedDate(isoStr);
                    }}
                    className="w-[14.28%] h-9 items-center justify-center p-0.5"
                  >
                    <View
                      className={cn(
                        'w-8 h-8 rounded-full items-center justify-center',
                        isSelected ? 'bg-kalya-primary' : 'bg-transparent'
                      )}
                    >
                      <Typo
                        variant="body-sm"
                        className={cn(
                          'font-ibm-plex text-xs',
                          isSelected
                            ? 'font-ibm-plex-bold text-white'
                            : isCurrentViewingMonth
                              ? 'text-kalya-text-primary'
                              : 'text-kalya-text-tertiary opacity-40'
                        )}
                      >
                        {plainDate.day}
                      </Typo>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Footer Actions */}
            <View className="flex-row items-center justify-end gap-2 pt-3 border-t border-kalya-border-subtle mt-1">
              <Button
                title="Cancel"
                variant="ghost"
                size="sm"
                onPress={() => setModalVisible(false)}
              />
              <Button title="Confirm" variant="primary" size="sm" onPress={handleConfirm} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
