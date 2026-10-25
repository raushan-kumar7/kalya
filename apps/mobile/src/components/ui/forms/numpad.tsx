import React from 'react';
import { View } from 'react-native';
import { Delete } from 'lucide-react-native';
import { HapticTouchable, triggerHaptic } from '../primitives/haptic-touchable';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface NumpadProps {
  /**
   * Invoked when a numeric key ('0'-'9', '.') is pressed.
   */
  onKeyPress: (key: string) => void;

  /**
   * Invoked when the backspace key is pressed.
   */
  onBackspace: () => void;

  /**
   * Optional long-press handler on the backspace key to clear the entire entry.
   */
  onClearAll?: () => void;

  /**
   * Quick preset values in major currency units (e.g. [500, 1000, 5000]).
   */
  quickPresets?: number[];

  /**
   * Callback invoked when a quick preset chip is tapped.
   */
  onSelectPreset?: (amount: number) => void;

  /**
   * Whether the decimal point button is disabled.
   * @default false
   */
  disableDecimal?: boolean;

  /**
   * Optional container className.
   */
  className?: string;
}

const keyPadLayout = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'delete'],
];

/**
 * Numpad provides a dedicated, tactile financial keypad.
 *
 * @param props - NumpadProps
 * @returns React.JSX.Element
 */
export const Numpad: React.FC<NumpadProps> = ({
  onKeyPress,
  onBackspace,
  onClearAll,
  quickPresets = [500, 1000, 2000, 5000],
  onSelectPreset,
  disableDecimal = false,
  className,
}) => {
  const handleKeyTap = (key: string) => {
    if (key === 'delete') {
      onBackspace();
    } else if (key === '.') {
      if (!disableDecimal) {
        onKeyPress('.');
      }
    } else {
      onKeyPress(key);
    }
  };

  const handleBackspaceLongPress = () => {
    if (onClearAll) {
      triggerHaptic('warning');
      onClearAll();
    }
  };

  return (
    <View className={cn('w-full flex-col items-center gap-3', className)}>
      {/* Quick Presets Row */}
      {quickPresets && quickPresets.length > 0 ? (
        <View className="flex-row items-center justify-center gap-2 mb-2 w-full px-4">
          {quickPresets.map((amount) => (
            <HapticTouchable
              key={`preset-${amount}`}
              hapticTier="selection"
              onPress={() => onSelectPreset?.(amount)}
              className="flex-1 py-1.5 px-2 rounded-kalya-pill bg-kalya-surface border border-kalya-border-subtle items-center justify-center"
            >
              <Text variant="caption" tone="secondary" className="font-ibm-plex-bold">
                +₹{amount.toLocaleString('en-IN')}
              </Text>
            </HapticTouchable>
          ))}
        </View>
      ) : null}

      {/* Grid of Keys */}
      <View className="w-full max-w-[340px] flex-col gap-2.5">
        {keyPadLayout.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} className="flex-row justify-between gap-3">
            {row.map((key) => {
              const isDelete = key === 'delete';
              const isDot = key === '.';
              const isDisabled = isDot && disableDecimal;

              return (
                <HapticTouchable
                  key={`key-${key}`}
                  disabled={isDisabled}
                  hapticTier={isDelete ? 'medium' : 'light'}
                  onPress={() => handleKeyTap(key)}
                  onLongPress={isDelete ? handleBackspaceLongPress : undefined}
                  className={cn(
                    'flex-1 h-14 rounded-kalya-lg items-center justify-center border',
                    isDelete
                      ? 'bg-kalya-surface-subtle border-kalya-border-subtle'
                      : 'bg-kalya-surface border-kalya-border-subtle'
                  )}
                >
                  {isDelete ? (
                    <Delete size={22} color="#0d3e26" />
                  ) : (
                    <Text
                      variant="numeral-lg"
                      tone={isDisabled ? 'tertiary' : 'primary'}
                      className="font-ibm-plex-bold"
                    >
                      {key}
                    </Text>
                  )}
                </HapticTouchable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};
