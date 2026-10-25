import React from 'react';
import { View } from 'react-native';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface FormFieldProps {
  /**
   * Field label text.
   */
  label?: string;

  /**
   * Whether the field is mandatory (displays subtle gold asterisk).
   * @default false
   */
  required?: boolean;

  /**
   * Validation error string.
   */
  error?: string | null;

  /**
   * Helpful instructional copy rendered below input.
   */
  helperText?: string;

  /**
   * Input element child.
   */
  children: React.ReactNode;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * FormField is the shared wrapper that provides standardized labels,
 * asterisks, helper text, and validation error messages for all form inputs.
 *
 * @param props - FormFieldProps
 * @returns React.JSX.Element
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helperText,
  children,
  className,
}) => {
  return (
    <View className={cn('w-full flex-col gap-1.5 my-1', className)}>
      {label ? (
        <View className="flex-row items-center gap-1">
          <Text variant="body-sm" tone="secondary" className="font-inter-bold">
            {label}
          </Text>
          {required ? (
            <Text variant="caption" tone="accent" className="font-inter-bold text-kalya-gold">
              *
            </Text>
          ) : null}
        </View>
      ) : null}

      {children}

      {error ? (
        <Text variant="caption" tone="outflow" className="font-inter">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" tone="tertiary" className="font-inter">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};
