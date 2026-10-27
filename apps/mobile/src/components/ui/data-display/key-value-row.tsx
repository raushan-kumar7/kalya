import React from 'react';
import { View } from 'react-native';
import { Typo } from '../primitives/typo';
import { cn } from '@/libs/utils';

export interface KeyValueRowProps {
  /**
   * Field key/label string.
   */
  label: string;

  /**
   * Value string or custom component.
   */
  value: React.ReactNode;

  /**
   * Whether to render an inset bottom divider.
   * @default true
   */
  bottomDivider?: boolean;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * KeyValueRow provides a clean label/value pair row for detail screens.
 *
 * Implements Excel Data Display #54.
 *
 * @param props - KeyValueRowProps
 * @returns React.JSX.Element
 */
export const KeyValueRow: React.FC<KeyValueRowProps> = ({
  label,
  value,
  bottomDivider = true,
  className,
}) => {
  return (
    <View
      className={cn(
        'w-full flex-row items-center justify-between py-3 px-1',
        bottomDivider && 'border-b border-kalya-border-subtle',
        className
      )}
    >
      <Typo variant="body-sm" tone="secondary" className="font-inter">
        {label}
      </Typo>

      {typeof value === 'string' ? (
        <Typo variant="body-sm" tone="primary" className="font-inter-bold text-right">
          {value}
        </Typo>
      ) : (
        value
      )}
    </View>
  );
};
