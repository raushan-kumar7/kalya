import React, { useRef } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Text } from '../primitives/text';
import { triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface OTPInputProps {
  /**
   * Current OTP string value.
   */
  value: string;

  /**
   * Change callback when digits change.
   */
  onChange: (otp: string) => void;

  /**
   * Length of the OTP code.
   * @default 6
   */
  length?: number;

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
 * OTPInput renders discrete digit boxes for Better-Auth email verification codes.
 *
 * @param props - OTPInputProps
 * @returns React.JSX.Element
 */
export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  length = 6,
  error,
  className,
}) => {
  const inputRef = useRef<any>(null);

  const handleDigitChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    triggerHaptic('light');
    onChange(cleaned);
  };

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const digits = value.split('');

  return (
    <View className={cn('w-full flex-col items-center gap-2', className)}>
      {/* Hidden real TextInput */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleDigitChange}
        maxLength={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        className="opacity-0 absolute w-1 h-1"
      />

      {/* Visual Boxes Container */}
      <Pressable
        onPress={handleContainerPress}
        className="flex-row items-center justify-center gap-2.5"
      >
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] || '';
          const isCurrent = index === digits.length;

          return (
            <View
              key={`otp-box-${index}`}
              className={cn(
                'w-12 h-14 rounded-kalya-md border items-center justify-center bg-kalya-surface',
                error
                  ? 'border-kalya-outflow'
                  : isCurrent
                    ? 'border-kalya-primary'
                    : digit
                      ? 'border-kalya-primary'
                      : 'border-kalya-border-subtle'
              )}
            >
              <Text variant="numeral-lg" tone="primary" className="font-ibm-plex-bold text-center">
                {digit}
              </Text>
            </View>
          );
        })}
      </Pressable>

      {error ? (
        <Text variant="caption" tone="outflow" className="mt-1 text-center font-inter">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
