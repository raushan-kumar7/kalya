import React, { useState } from 'react';
import { View, TextInput, TextInputProps, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { Text } from '../primitives/text';
import { triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface InputProps extends TextInputProps {
  /**
   * Accessible input field label.
   */
  label?: string;

  /**
   * Instructional helper text rendered below the input field.
   */
  helperText?: string;

  /**
   * Error message string. When present, renders input with error border.
   */
  error?: string | null;

  /**
   * Optional icon component placed inside the input on the left.
   */
  leftIcon?: React.ReactNode;

  /**
   * Optional icon component placed inside the input on the right.
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether to display a clear button when text is present.
   * @default false
   */
  clearable?: boolean;

  /**
   * Custom callback triggered when clear button is pressed.
   */
  onClear?: () => void;

  /**
   * Accent color glow on focus.
   * @default 'emerald'
   */
  glowColor?: 'emerald' | 'gold';

  /**
   * Custom container class name.
   */
  containerClassName?: string;
}

/**
 * Input is the standard text field primitive for Kalya Mobile.
 *
 * @param props - InputProps
 * @returns React.JSX.Element
 */
export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  glowColor = 'emerald',
  containerClassName,
  className,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    triggerHaptic('light');
    onChangeText?.('');
    onClear?.();
  };

  const getBorderClasses = () => {
    if (error) {
      return 'border-kalya-outflow bg-kalya-surface';
    }
    if (isFocused) {
      return glowColor === 'gold'
        ? 'border-kalya-gold bg-kalya-surface'
        : 'border-kalya-primary bg-kalya-surface';
    }
    return 'border-kalya-border-subtle bg-kalya-surface';
  };

  return (
    <View className={cn('w-full flex-col gap-1.5', containerClassName)}>
      {label ? (
        <Text variant="body-sm" className="font-inter-bold text-kalya-text-secondary">
          {label}
        </Text>
      ) : null}

      <View
        className={cn(
          'flex-row items-center px-3.5 py-2.5 rounded-kalya-md border',
          getBorderClasses()
        )}
      >
        {leftIcon ? <View className="mr-2.5 items-center justify-center">{leftIcon}</View> : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor="#5d8a72"
          className={cn('flex-1 font-inter text-sm text-kalya-text-primary p-0', className)}
          {...rest}
        />

        {clearable && value && value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear input"
            onPress={handleClear}
            className="p-1 rounded-kalya-pill bg-kalya-surface-muted ml-1"
          >
            <X size={14} color="#5d8a72" />
          </Pressable>
        ) : null}

        {rightIcon ? <View className="ml-2 items-center justify-center">{rightIcon}</View> : null}
      </View>

      {error ? (
        <Text variant="caption" tone="outflow" className="font-inter">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" tone="tertiary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};
