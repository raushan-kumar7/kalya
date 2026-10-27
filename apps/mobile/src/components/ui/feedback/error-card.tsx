import React from 'react';
import { View } from 'react-native';
import { ShieldAlert, RefreshCw } from 'lucide-react-native';
import { Card } from '../layout/card';
import { Typo } from '../primitives/typo';
import { Button } from '../primitives/button';
import { HapticTouchable } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface ErrorCardProps {
  /**
   * Title describing the interrupted state.
   */
  title: string;

  /**
   * Plain English description detailing what occurred and reassuring
   * what local data was preserved.
   */
  description: string;

  /**
   * Primary retry action callback.
   */
  onRetry?: () => void;

  /**
   * Custom label for the retry button.
   * @default 'Tap to Retry'
   */
  retryLabel?: string;

  /**
   * Whether retry operation is currently in flight.
   * @default false
   */
  isRetrying?: boolean;

  /**
   * Optional secondary action callback (e.g. "Check Server Status" or "Continue Offline").
   */
  onSecondaryAction?: () => void;

  /**
   * Optional secondary action label.
   */
  secondaryActionLabel?: string;

  /**
   * Optional custom icon override.
   */
  icon?: React.ReactNode;

  /**
   * Optional container className.
   */
  className?: string;
}

/**
 * ErrorCard provides a human-centered, diagnostic failure recovery surface.
 *
 * @param props - ErrorCardProps
 * @returns React.JSX.Element
 */
export const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  description,
  onRetry,
  retryLabel = 'Tap to Retry',
  isRetrying = false,
  onSecondaryAction,
  secondaryActionLabel,
  icon,
  className,
}) => {
  return (
    <Card
      variant="surface"
      padding="lg"
      rounded="xl"
      className={cn(
        'border-l-4 border-l-kalya-gold border-kalya-border-subtle bg-kalya-surface',
        className
      )}
    >
      <View className="flex-row items-start gap-3 mb-3">
        <View
          style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)' }}
          className="p-2 rounded-kalya-md items-center justify-center"
        >
          {icon ? icon : <ShieldAlert size={20} color="#b8912e" />}
        </View>

        <View className="flex-1">
          <Typo variant="title-sm" tone="primary" className="font-outfit-bold">
            {title}
          </Typo>
          <Typo variant="body-sm" tone="secondary" className="mt-1 font-inter leading-relaxed">
            {description}
          </Typo>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-3 pt-2 border-t border-kalya-border-subtle mt-1">
        {onRetry ? (
          <Button
            title={retryLabel}
            variant="primary"
            size="sm"
            isLoading={isRetrying}
            leftIcon={<RefreshCw size={14} color="#ffffff" />}
            onPress={onRetry}
          />
        ) : null}

        {onSecondaryAction && secondaryActionLabel ? (
          <HapticTouchable
            hapticTier="light"
            onPress={onSecondaryAction}
            className="py-2 px-3 rounded-kalya-md items-center justify-center"
          >
            <Typo variant="body-sm" tone="secondary" className="font-inter-bold">
              {secondaryActionLabel}
            </Typo>
          </HapticTouchable>
        ) : null}
      </View>
    </Card>
  );
};
