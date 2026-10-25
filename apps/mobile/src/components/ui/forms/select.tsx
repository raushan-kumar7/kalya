import React, { useState } from 'react';
import { View, Modal, Pressable, ScrollView } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { Text } from '../primitives/text';
import { HapticTouchable, triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  /**
   * Available choices.
   */
  options: SelectOption[];

  /**
   * Currently chosen value.
   */
  value?: string;

  /**
   * Change callback.
   */
  onChange: (value: string) => void;

  /**
   * Placeholder string when no value is selected.
   * @default 'Select option...'
   */
  placeholder?: string;

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
 * Select provides an accessible bottom-sheet option picker.
 *
 * @param props - SelectProps
 * @returns React.JSX.Element
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  error,
  className,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleOpen = () => {
    triggerHaptic('light');
    setModalVisible(true);
  };

  const handleSelect = (val: string) => {
    triggerHaptic('selection');
    onChange(val);
    setModalVisible(false);
  };

  return (
    <View className={cn('w-full flex-col gap-1.5', className)}>
      {label ? (
        <Text variant="body-sm" tone="secondary" className="font-inter-bold">
          {label}
        </Text>
      ) : null}

      <HapticTouchable
        hapticTier="light"
        onPress={handleOpen}
        className={cn(
          'flex-row items-center justify-between px-3.5 py-3 rounded-kalya-md border bg-kalya-surface',
          error ? 'border-kalya-outflow' : 'border-kalya-border-subtle'
        )}
      >
        <View className="flex-row items-center gap-2 flex-1 mr-2">
          {selectedOption?.icon ? (
            <View className="items-center justify-center">{selectedOption.icon}</View>
          ) : null}
          <Text
            variant="body-md"
            className={
              selectedOption
                ? 'font-inter text-kalya-text-primary'
                : 'font-inter text-kalya-text-tertiary'
            }
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>

        <ChevronDown size={18} color="#5d8a72" />
      </HapticTouchable>

      {error ? (
        <Text variant="caption" tone="outflow">
          {error}
        </Text>
      ) : null}

      {/* Bottom Sheet Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          onPress={() => setModalVisible(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
          className="flex-1 justify-end"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full bg-kalya-surface rounded-t-kalya-xl border-t border-kalya-border-subtle p-5 max-h-[70%]"
          >
            {/* Sheet Handle & Header */}
            <View className="w-10 h-1 rounded-kalya-pill bg-kalya-border self-center mb-3" />
            <View className="flex-row items-center justify-between pb-3 border-b border-kalya-border-subtle mb-2">
              <Text variant="title-sm" className="font-outfit-bold text-kalya-text-primary">
                {label || 'Select Option'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} className="p-1">
                <X size={20} color="#5d8a72" />
              </Pressable>
            </View>

            {/* Options List */}
            <ScrollView showsVerticalScrollIndicator={false} className="py-1">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <HapticTouchable
                    key={opt.value}
                    hapticTier="selection"
                    onPress={() => handleSelect(opt.value)}
                    className={cn(
                      'flex-row items-center justify-between py-3 px-3 rounded-kalya-md my-0.5',
                      isSelected ? 'bg-kalya-mint-subtle' : 'bg-kalya-surface'
                    )}
                  >
                    <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                      {opt.icon ? <View>{opt.icon}</View> : null}
                      <View className="flex-1">
                        <Text
                          variant="body-md"
                          className={cn(
                            'font-inter',
                            isSelected
                              ? 'font-inter-bold text-kalya-primary'
                              : 'text-kalya-text-primary'
                          )}
                        >
                          {opt.label}
                        </Text>
                        {opt.description ? (
                          <Text variant="caption" tone="tertiary">
                            {opt.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {isSelected ? <Check size={18} color="#0d3e26" /> : null}
                  </HapticTouchable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
