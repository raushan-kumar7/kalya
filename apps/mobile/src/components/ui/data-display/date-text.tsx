import React from 'react';
import {
  formatRelativeTime,
  formatDateTime,
  formatTime,
  formatCardDate,
  TimestampInput,
} from '@kalya/utils';
import { Text, TextProps } from '../primitives/text';

export type DateFormat = 'relative' | 'short' | 'full' | 'time' | 'month-year';

export interface DateTextProps extends Omit<TextProps, 'children'> {
  /**
   * ISO string, Date object, or epoch millisecond number.
   */
  date: TimestampInput;

  /**
   * Formatting mode.
   * @default 'short'
   */
  format?: DateFormat;
}

/**
 * Formats a date using @kalya/utils core date/timestamp functions.
 */
export function formatDisplayDate(dateInput: TimestampInput, format: DateFormat = 'short'): string {
  try {
    if (format === 'relative') {
      return formatRelativeTime(dateInput);
    }
    if (format === 'time') {
      return formatTime(dateInput);
    }
    if (format === 'full') {
      return formatDateTime(dateInput);
    }
    // Default 'short'
    return formatCardDate(
      typeof dateInput === 'string'
        ? dateInput
        : new Date(dateInput as any).toISOString().split('T')[0]
    );
  } catch {
    return String(dateInput);
  }
}

/**
 * DateText renders relative and absolute localized date strings.
 *
 * Uses formatRelativeTime, formatDateTime, formatTime, and formatCardDate from @kalya/utils.
 *
 * @param props - DateTextProps
 * @returns React.JSX.Element
 */
export const DateText: React.FC<DateTextProps> = ({
  date,
  format = 'short',
  variant = 'caption',
  tone = 'tertiary',
  ...rest
}) => {
  return (
    <Text variant={variant} tone={tone} {...rest}>
      {formatDisplayDate(date, format)}
    </Text>
  );
};
