import React from 'react';
import { View } from 'react-native';
import { Text } from '../primitives/text';
import { HapticTouchable } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface SectionProps {
  /**
   * Title heading for the section group.
   */
  title: string;

  /**
   * Optional descriptive subtitle.
   */
  subtitle?: string;

  /**
   * Optional label for trailing action button (e.g., "See all").
   */
  actionLabel?: string;

  /**
   * Callback invoked when trailing action is pressed.
   */
  onAction?: () => void;

  /**
   * Content items inside the section.
   */
  children?: React.ReactNode;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * Section renders a titled group of content with an optional header action.
 *
 * @param props - SectionProps
 * @returns React.JSX.Element
 */
export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
  className,
}) => {
  return (
    <View className={cn('w-full flex-col gap-2.5 my-2', className)}>
      <View className="flex-row items-baseline justify-between px-1">
        <View className="flex-1 mr-2">
          <Text variant="title-sm" tone="primary" className="font-outfit-bold tracking-tight">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="tertiary" className="font-inter mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {actionLabel && onAction ? (
          <HapticTouchable
            hapticTier="light"
            onPress={onAction}
            className="py-1 px-2 rounded-kalya-sm"
          >
            <Text variant="body-sm" tone="accent" className="font-inter-bold text-kalya-gold-warm">
              {actionLabel}
            </Text>
          </HapticTouchable>
        ) : null}
      </View>

      {children}
    </View>
  );
};
