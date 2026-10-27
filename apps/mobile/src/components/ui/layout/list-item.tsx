import React from 'react';
import { View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Typo } from '../primitives/typo';
import { HapticTouchable } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface ListItemProps {
  /**
   * Primary title label.
   */
  title: string;

  /**
   * Optional descriptive secondary subtitle.
   */
  subtitle?: string;

  /**
   * Leading icon, avatar, or badge element.
   */
  leading?: React.ReactNode;

  /**
   * Trailing element slot (amount text, switch, or status pill).
   */
  trailing?: React.ReactNode;

  /**
   * Optional tap callback. Makes the row interactive with haptics.
   */
  onPress?: () => void;

  /**
   * Shows a trailing chevron arrow for drill-down navigation.
   * @default false
   */
  showChevron?: boolean;

  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean;

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
 * ListItem renders a standardized list row with leading/trailing slots and tactile response.
 *
 * @param props - ListItemProps
 * @returns React.JSX.Element
 */
export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  showChevron = false,
  disabled = false,
  bottomDivider = true,
  className,
}) => {
  const content = (
    <View
      className={cn(
        'w-full flex-row items-center justify-between py-3 px-3.5 min-h-[52px]',
        bottomDivider && 'border-b border-kalya-border-subtle',
        disabled && 'opacity-50',
        className
      )}
    >
      <View className="flex-row items-center gap-3 flex-1 mr-3">
        {leading ? <View className="items-center justify-center">{leading}</View> : null}

        <View className="flex-1 justify-center">
          <Typo
            variant="body-md"
            tone="primary"
            className="font-inter-bold leading-snug"
            numberOfLines={1}
          >
            {title}
          </Typo>

          {subtitle ? (
            <Typo
              variant="caption"
              tone="tertiary"
              className="font-inter mt-0.5 leading-tight"
              numberOfLines={1}
            >
              {subtitle}
            </Typo>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {trailing ? <View>{trailing}</View> : null}
        {showChevron ? <ChevronRight size={16} color="#5d8a72" /> : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <HapticTouchable disabled={disabled} hapticTier="light" onPress={onPress}>
        {content}
      </HapticTouchable>
    );
  }

  return content;
};
