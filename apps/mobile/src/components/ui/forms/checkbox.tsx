import React from 'react';
import { View, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '../primitives/text';
import { triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface CheckboxProps {
  /**
   * Checked boolean state.
   */
  checked: boolean;

  /**
   * Change callback.
   */
  onChange: (checked: boolean) => void;

  /**
   * Optional accompanying label.
   */
  label?: string;

  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  const handlePress = () => {
    if (disabled) return;
    triggerHaptic('light');
    onChange(!checked);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      onPress={handlePress}
      disabled={disabled}
      className={cn('flex-row items-center gap-2.5 py-1', disabled && 'opacity-50', className)}
    >
      <View
        className={cn(
          'w-5 h-5 rounded-kalya-xs items-center justify-center border',
          checked
            ? 'bg-kalya-primary border-kalya-border-strong'
            : 'bg-kalya-surface border-kalya-border'
        )}
      >
        {checked ? <Check size={14} color="#ffffff" strokeWidth={3} /> : null}
      </View>

      {label ? (
        <Text variant="body-md" className="font-inter text-kalya-text-primary">
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
};

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface RadioGroupProps<T extends string> {
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function RadioGroup<T extends string>({
  value,
  options,
  onChange,
  className,
}: RadioGroupProps<T>): React.JSX.Element {
  return (
    <View className={cn('flex-col gap-2', className)}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              triggerHaptic('selection');
              onChange(opt.value);
            }}
            className="flex-row items-start gap-2.5 py-1.5"
          >
            <View
              className={cn(
                'w-5 h-5 rounded-full items-center justify-center border mt-0.5',
                isSelected ? 'border-kalya-primary' : 'border-kalya-border'
              )}
            >
              {isSelected ? <View className="w-2.5 h-2.5 rounded-full bg-kalya-primary" /> : null}
            </View>

            <View className="flex-1">
              <Text variant="body-md" className="font-inter-bold text-kalya-text-primary">
                {opt.label}
              </Text>
              {opt.description ? (
                <Text variant="caption" tone="tertiary" className="font-inter mt-0.5">
                  {opt.description}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
