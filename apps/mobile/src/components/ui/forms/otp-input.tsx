import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AUTH_LIMITS } from '@kalya/types';
import { cn } from '@/libs/utils';
import { triggerHaptic, Typo } from '../primitives';

export interface OtpInputProps {
  /** Current code, digits only. */
  value: string;
  onChange: (code: string) => void;
  /** Fires once, when the code first reaches full length. */
  onComplete?: (code: string) => void;
  /** @default AUTH_LIMITS.OTP_LENGTH */
  length?: number;
  /** Error message. Truthy turns the boxes red and shows the text. */
  error?: string | null;
  disabled?: boolean;
  /** Focus the field on mount. @default true */
  autoFocus?: boolean;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  length = AUTH_LIMITS.OTP_LENGTH,
  error,
  disabled = false,
  autoFocus = true,
  className,
}) => {
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [isFocused, setIsFocused] = useState(false);
  const completedRef = useRef(false);

  // Allow onComplete to fire again after the code is cleared or edited.
  useEffect(() => {
    if (value.length < length) completedRef.current = false;
  }, [value, length]);

  const handleTextChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, length);
    if (cleaned !== value) triggerHaptic('selection');
    onChange(cleaned);

    if (cleaned.length === length && !completedRef.current) {
      completedRef.current = true;
      triggerHaptic('notificationSuccess');
      onComplete?.(cleaned);
    }
  };

  const digits = value.split('');

  return (
    <View className={cn('w-full items-center gap-2', className)}>
      <Pressable
        onPress={() => !disabled && inputRef.current?.focus()}
        accessibilityRole="none"
        className="w-full max-w-[340px] flex-row justify-between px-2"
      >
        {/* Hidden real input: handles keyboard, paste and native autofill */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={length}
          keyboardType="number-pad"
          returnKeyType="done"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          autoFocus={autoFocus}
          editable={!disabled}
          caretHidden
          accessibilityLabel={`Verification code, ${length} digits`}
          style={styles.hiddenInput}
        />

        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] ?? '';
          const isCurrent = isFocused && index === digits.length;
          const isFilled = Boolean(digit);

          return (
            <View
              key={`otp-box-${index}`}
              className={cn(
                'h-14 w-12 items-center justify-center rounded-kalya-md border-2 bg-kalya-surface',
                error
                  ? 'border-kalya-outflow bg-kalya-outflow/5'
                  : isCurrent
                    ? 'border-kalya-primary bg-kalya-mint-subtle'
                    : isFilled
                      ? 'border-kalya-primary'
                      : 'border-kalya-border-subtle',
                disabled && 'opacity-60'
              )}
            >
              {isCurrent && !digit ? (
                <View className="h-6 w-0.5 animate-pulse rounded-full bg-kalya-primary" />
              ) : (
                <Typo
                  size="title-lg"
                  className="text-center font-inter-bold text-kalya-text-primary"
                >
                  {digit}
                </Typo>
              )}
            </View>
          );
        })}
      </Pressable>

      {error ? (
        <Typo size="caption" tone="outflow" className="mt-1 text-center">
          {error}
        </Typo>
      ) : null}
    </View>
  );
};

/**
 * Backward-compatibility alias for OTPInput.
 */
export const OTPInput = OtpInput;
export type OTPInputProps = OtpInputProps;

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
  },
});
