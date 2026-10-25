import React from 'react';
import { View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '../primitives/text';
import { HapticTouchable } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface HeaderProps {
  /**
   * Title text displayed in screen top bar.
   */
  title?: string;

  /**
   * Optional secondary subtitle.
   */
  subtitle?: string;

  /**
   * Whether to display the back navigation arrow.
   * @default true
   */
  showBack?: boolean;

  /**
   * Callback invoked when back button is pressed.
   */
  onBack?: () => void;

  /**
   * Optional action element slot on the right side.
   */
  rightAction?: React.ReactNode;

  /**
   * Optional status indicator pill (e.g., Live / Offline vault pill).
   */
  statusPill?: React.ReactNode;

  /**
   * Transparent background.
   * @default false
   */
  transparent?: boolean;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * Header provides a standardized top navigation bar with back navigation,
 * screen title, ambient status pill, and action slots.
 *
 * @param props - HeaderProps
 * @returns React.JSX.Element
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  statusPill,
  transparent = false,
  className,
}) => {
  return (
    <View
      className={cn(
        'w-full px-4 py-3 flex-row items-center justify-between',
        !transparent && 'bg-kalya-surface border-b border-kalya-border-subtle',
        className
      )}
    >
      <View className="flex-row items-center gap-2.5 flex-1 mr-2">
        {showBack && onBack ? (
          <HapticTouchable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hapticTier="light"
            onPress={onBack}
            className="w-9 h-9 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle items-center justify-center mr-1"
          >
            <ChevronLeft size={20} color="#0d3e26" />
          </HapticTouchable>
        ) : null}

        <View className="flex-1">
          {title ? (
            <Text
              variant="title-sm"
              tone="primary"
              className="font-outfit-bold tracking-tight"
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}

          {subtitle ? (
            <Text variant="caption" tone="tertiary" className="font-inter" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {statusPill ? <View>{statusPill}</View> : null}
        {rightAction ? <View>{rightAction}</View> : null}
      </View>
    </View>
  );
};
