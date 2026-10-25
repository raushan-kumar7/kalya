import React from 'react';
import { View } from 'react-native';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface CurrencyInputProps {
  /**
   * Value represented strictly in minor units (integer paise)
   * e.g., 100000 = ₹1,000.00
   */
  valuePaise: number;

  /**
   * Change callback passing updated minor unit paise value.
   */
  onChangePaise?: (paise: number) => void;

  /**
   * Currency ISO code.
   * @default 'INR'
   */
  currencyCode?: string;

  /**
   * Currency symbol prefix.
   * @default '₹'
   */
  symbol?: string;

  /**
   * Typographic scale tier.
   * @default 'xl'
   */
  size?: 'md' | 'lg' | 'xl';

  /**
   * Optional field label.
   */
  label?: string;

  /**
   * Optional error message.
   */
  error?: string | null;

  /**
   * Container className.
   */
  className?: string;
}

/**
 * Formats minor units (paise) into an Indian localized currency display string.
 *
 * @param paise - Integer paise minor units
 * @returns Formatted major and minor amount string (e.g., "1,24,500.00")
 */
export function formatPaise(paise: number): { major: string; minor: string } {
  const safePaise = Math.max(0, Math.round(isNaN(paise) ? 0 : paise));
  const majorUnits = Math.floor(safePaise / 100);
  const minorUnits = safePaise % 100;

  const formattedMajor = new Intl.NumberFormat('en-IN').format(majorUnits);
  const formattedMinor = minorUnits.toString().padStart(2, '0');

  return { major: formattedMajor, minor: formattedMinor };
}

const sizeConfig = {
  md: {
    symbolSize: 'text-lg',
    majorVariant: 'numeral-md' as const,
    minorVariant: 'numeral-sm' as const,
  },
  lg: {
    symbolSize: 'text-2xl',
    majorVariant: 'numeral-lg' as const,
    minorVariant: 'numeral-md' as const,
  },
  xl: {
    symbolSize: 'text-4xl',
    majorVariant: 'numeral-xl' as const,
    minorVariant: 'numeral-md' as const,
  },
};

/**
 * CurrencyInput displays financial ledger amounts with high numerical craft.
 *
 * @param props - CurrencyInputProps
 * @returns React.JSX.Element
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  valuePaise,
  symbol = '₹',
  size = 'xl',
  label,
  error,
  className,
}) => {
  const { major, minor } = formatPaise(valuePaise);
  const cfg = sizeConfig[size];

  return (
    <View className={cn('flex-col items-center justify-center p-4', className)}>
      {label ? (
        <Text
          variant="caption"
          tone="secondary"
          className="mb-1 font-inter-bold tracking-wider uppercase"
        >
          {label}
        </Text>
      ) : null}

      <View className="flex-row items-baseline justify-center gap-1">
        <Text
          variant={cfg.majorVariant}
          tone="accent"
          className={cn('font-outfit-bold text-kalya-gold mr-0.5', cfg.symbolSize)}
        >
          {symbol}
        </Text>

        <Text
          variant={cfg.majorVariant}
          tone="primary"
          className="font-ibm-plex-bold tracking-tight text-kalya-text-primary"
        >
          {major}
        </Text>

        <Text
          variant={cfg.minorVariant}
          tone="tertiary"
          className="font-ibm-plex text-kalya-text-tertiary"
        >
          .{minor}
        </Text>
      </View>

      {error ? (
        <Text variant="caption" tone="outflow" className="mt-1 font-inter text-center">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
