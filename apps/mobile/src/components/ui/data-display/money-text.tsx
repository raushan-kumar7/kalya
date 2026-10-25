import React from 'react';
import { formatInr, formatInrPrecise } from '@kalya/utils';
import { Text, TextProps, TextVariant } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface MoneyTextProps extends Omit<TextProps, 'children'> {
  /**
   * Financial amount represented strictly in integer minor units (paise).
   * e.g., 250000 = ₹2,500.00
   */
  paise: number;

  /**
   * Currency prefix symbol.
   * @default '₹'
   */
  symbol?: string;

  /**
   * Whether to explicitly display positive '+' or negative '-' prefix.
   * @default false
   */
  showSign?: boolean;

  /**
   * Whether to apply inflow (green) / outflow (red) semantic colors.
   * @default false
   */
  colored?: boolean;

  /**
   * Hide minor paise units (.00) if zero.
   * @default false
   */
  hideZeroDecimals?: boolean;

  /**
   * Typographic variant tier.
   * @default 'numeral-md'
   */
  variant?: TextVariant;
}

/**
 * MoneyText formats integer paise into Indian localized currency with
 * optional sign indicators and semantic inflow/outflow tones.
 *
 * Uses formatInr and formatInrPrecise from @kalya/utils.
 *
 * @param props - MoneyTextProps
 * @returns React.JSX.Element
 */
export const MoneyText: React.FC<MoneyTextProps> = ({
  paise,
  symbol = '₹',
  showSign = false,
  colored = false,
  hideZeroDecimals = false,
  variant = 'numeral-md',
  className,
  ...rest
}) => {
  const isPositive = paise > 0;
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const majorAmount = absPaise / 100;

  const formattedStr =
    hideZeroDecimals && absPaise % 100 === 0
      ? formatInr(majorAmount)
      : formatInrPrecise(majorAmount);

  // If custom symbol is specified instead of default ₹
  const displayAmount = symbol !== '₹' ? formattedStr.replace('₹', symbol) : formattedStr;

  const sign = showSign && isPositive ? '+' : isNegative ? '-' : '';

  const getColorClass = () => {
    if (!colored) return undefined;
    if (isPositive) return 'text-kalya-inflow';
    if (isNegative) return 'text-kalya-outflow';
    return undefined;
  };

  return (
    <Text
      variant={variant}
      className={cn('font-ibm-plex-bold tracking-tight', getColorClass(), className)}
      {...rest}
    >
      {sign}
      {displayAmount}
    </Text>
  );
};
