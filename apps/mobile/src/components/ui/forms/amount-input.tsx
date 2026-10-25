import React from 'react';
import { View } from 'react-native';
import { CurrencyInput, CurrencyInputProps } from './currency-input';
import { Numpad } from './numpad';
import { triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface AmountInputProps extends CurrencyInputProps {
  /**
   * Whether to display the integrated tactile keypad below the amount.
   * @default false
   */
  showKeypad?: boolean;

  /**
   * Quick preset buttons in major currency units (e.g., [500, 1000, 2000, 5000]).
   */
  quickPresets?: number[];

  /**
   * Callback when value in minor units (paise) changes.
   */
  onChangePaise: (paise: number) => void;
}

/**
 * AmountInput combines high-craft currency formatting with an optional
 * financial numpad, ensuring all inputs are stored strictly as integer paise minor units.
 *
 * @param props - AmountInputProps
 * @returns React.JSX.Element
 */
export const AmountInput: React.FC<AmountInputProps> = ({
  valuePaise,
  onChangePaise,
  showKeypad = false,
  quickPresets = [500, 1000, 2000, 5000],
  className,
  ...currencyProps
}) => {
  const handleDigit = (digit: string) => {
    if (digit === '.') return;
    const currentStr = valuePaise.toString();
    if (currentStr.length >= 10) return;
    const newPaise = Number(currentStr + digit);
    onChangePaise(newPaise);
  };

  const handleBackspace = () => {
    const currentStr = valuePaise.toString();
    if (currentStr.length <= 1) {
      onChangePaise(0);
    } else {
      onChangePaise(Number(currentStr.slice(0, -1)));
    }
  };

  const handleClearAll = () => {
    onChangePaise(0);
  };

  const handleSelectPreset = (amount: number) => {
    triggerHaptic('selection');
    const additionalPaise = amount * 100;
    onChangePaise(valuePaise + additionalPaise);
  };

  return (
    <View className={cn('w-full flex-col items-center', className)}>
      <CurrencyInput valuePaise={valuePaise} onChangePaise={onChangePaise} {...currencyProps} />

      {showKeypad ? (
        <Numpad
          onKeyPress={handleDigit}
          onBackspace={handleBackspace}
          onClearAll={handleClearAll}
          quickPresets={quickPresets}
          onSelectPreset={handleSelectPreset}
          disableDecimal
          className="mt-2"
        />
      ) : null}
    </View>
  );
};
