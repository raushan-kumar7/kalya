import React, { useState } from 'react';
import { View, TextInput, TextInputProps, Pressable, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { Typo } from '../primitives/typo';
import { triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';
import { FIELD_HEIGHT, FIELD_ICON_SLOT } from './constants';

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
  cursorColor,
  selectionColor,
  selectionHandleColor,
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

  // Blinking cursor / pointer and selection colors consistent with tailwind.config.js palette
  const defaultCursorColor = error ? '#c83535' : glowColor === 'gold' ? '#d4af37' : '#0d3e26';

  const defaultSelectionColor =
    Platform.OS === 'ios'
      ? defaultCursorColor
      : error
        ? 'rgba(200, 53, 53, 0.25)'
        : glowColor === 'gold'
          ? 'rgba(212, 175, 55, 0.25)'
          : 'rgba(13, 62, 38, 0.2)';

  const activeCursorColor = cursorColor ?? defaultCursorColor;
  const activeSelectionColor = selectionColor ?? defaultSelectionColor;
  const activeSelectionHandleColor = selectionHandleColor ?? defaultCursorColor;

  const caretClass = error
    ? 'caret-kalya-outflow'
    : glowColor === 'gold'
      ? 'caret-kalya-gold'
      : 'caret-kalya-primary';

  return (
    <View className={cn('w-full flex-col gap-1.5', containerClassName)}>
      {label ? (
        <Typo variant="body-sm" className="font-inter-bold text-kalya-text-secondary">
          {label}
        </Typo>
      ) : null}

      <View
        className={cn(
          FIELD_HEIGHT,
          'flex-row items-center px-3.5 rounded-kalya-md border',
          getBorderClasses()
        )}
      >
        {leftIcon ? <View className={cn('mr-2.5', FIELD_ICON_SLOT)}>{leftIcon}</View> : null}

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
          cursorColor={activeCursorColor}
          selectionColor={activeSelectionColor}
          selectionHandleColor={activeSelectionHandleColor}
          placeholderTextColor="#5d8a72"
          textAlignVertical="center"
          className={cn(
            'min-w-0 flex-1 h-full font-inter text-sm text-kalya-text-primary p-0',
            caretClass,
            className
          )}
          {...rest}
        />

        {/* {clearable && value && value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear input"
            onPress={handleClear}
            className="p-1 rounded-kalya-pill bg-kalya-surface-muted ml-1"
          >
            <X size={14} color="#5d8a72" />
          </Pressable>
        ) : null} */}

        {clearable && value && value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear input"
            onPress={handleClear}
            hitSlop={8}
            className={cn('ml-1 rounded-kalya-pill bg-kalya-surface-muted', FIELD_ICON_SLOT)}
          >
            <X size={14} color="#5d8a72" />
          </Pressable>
        ) : null}

        {rightIcon ? <View className={cn('ml-2', FIELD_ICON_SLOT)}>{rightIcon}</View> : null}
      </View>

      {error ? (
        <Typo variant="caption" tone="outflow" className="font-inter">
          {error}
        </Typo>
      ) : helperText ? (
        <Typo variant="caption" tone="tertiary">
          {helperText}
        </Typo>
      ) : null}
    </View>
  );
};
