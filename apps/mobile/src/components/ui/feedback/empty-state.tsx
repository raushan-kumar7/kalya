import React from 'react';
import { View } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { Typo } from '../primitives/typo';
import { Button } from '../primitives/button';
import { HapticTouchable } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface EmptyStateProps {
  /**
   * Title headline for the empty view.
   */
  title: string;

  /**
   * Explanatory instructional copy guiding the user on next steps.
   */
  description: string;

  /**
   * Optional custom illustration or icon graphic.
   */
  illustration?: React.ReactNode;

  /**
   * Label for primary 1-tap call-to-action button.
   */
  primaryActionLabel?: string;

  /**
   * Callback invoked when primary button is tapped.
   */
  onPrimaryAction?: () => void;

  /**
   * Optional label for secondary exploratory action.
   */
  secondaryActionLabel?: string;

  /**
   * Callback invoked when secondary action is tapped.
   */
  onSecondaryAction?: () => void;

  /**
   * Optional container className.
   */
  className?: string;
}

/**
 * EmptyState delivers educational 1-tap starters that replace cold, blank screens.
 *
 * @param props - EmptyStateProps
 * @returns React.JSX.Element
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <View
      className={cn(
        'w-full flex-col items-center justify-center py-10 px-6 text-center',
        className
      )}
    >
      {/* Graphic / Icon Container */}
      <View className="w-16 h-16 rounded-kalya-xl bg-kalya-mint-subtle border border-kalya-border items-center justify-center mb-4">
        {illustration ? illustration : <Inbox size={28} color="#0d3e26" />}
      </View>

      {/* Headings & Guidance */}
      <Typo variant="title-sm" tone="primary" className="text-center font-outfit-bold mb-1">
        {title}
      </Typo>

      <Typo
        variant="body-sm"
        tone="secondary"
        className="text-center font-inter max-w-[280px] leading-relaxed mb-6"
      >
        {description}
      </Typo>

      {/* Action Buttons */}
      <View className="flex-col items-center gap-2.5 w-full max-w-[240px]">
        {primaryActionLabel && onPrimaryAction ? (
          <Button
            title={primaryActionLabel}
            variant="primary"
            size="md"
            fullWidth
            onPress={onPrimaryAction}
          />
        ) : null}

        {secondaryActionLabel && onSecondaryAction ? (
          <HapticTouchable
            hapticTier="light"
            onPress={onSecondaryAction}
            className="py-2 px-3 rounded-kalya-pill items-center justify-center"
          >
            <Typo variant="body-sm" tone="secondary" className="font-inter-bold">
              {secondaryActionLabel}
            </Typo>
          </HapticTouchable>
        ) : null}
      </View>
    </View>
  );
};
