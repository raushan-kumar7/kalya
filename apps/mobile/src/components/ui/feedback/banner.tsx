import React from 'react';
import { View } from 'react-native';
import { WifiOff, AlertTriangle, Info, X } from 'lucide-react-native';
import { Text } from '../primitives/text';
import { HapticTouchable } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export type BannerVariant = 'offline' | 'warning' | 'error' | 'info';

export interface BannerProps {
  /**
   * Main notice title.
   */
  title: string;

  /**
   * Detailed explanatory copy.
   */
  description?: string;

  /**
   * Visual theme variant.
   * @default 'offline'
   */
  variant?: BannerVariant;

  /**
   * Optional action button label.
   */
  actionLabel?: string;

  /**
   * Callback invoked when action is pressed.
   */
  onAction?: () => void;

  /**
   * Whether banner can be dismissed.
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback on dismiss.
   */
  onDismiss?: () => void;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

const variantConfig: Record<
  BannerVariant,
  { container: string; icon: React.ReactNode; text: string }
> = {
  offline: {
    container: 'bg-kalya-gold-soft border-kalya-gold-warm',
    icon: <WifiOff size={18} color="#b8912e" />,
    text: 'text-kalya-gold-dark',
  },
  warning: {
    container: 'bg-amber-50 border-amber-300',
    icon: <AlertTriangle size={18} color="#d97706" />,
    text: 'text-amber-900',
  },
  error: {
    container: 'bg-kalya-surface border-kalya-outflow',
    icon: <AlertTriangle size={18} color="#c83535" />,
    text: 'text-kalya-outflow',
  },
  info: {
    container: 'bg-kalya-mint-subtle border-kalya-border',
    icon: <Info size={18} color="#0d3e26" />,
    text: 'text-kalya-primary',
  },
};

/**
 * Banner provides a persistent inline notice for offline operation,
 * session timeouts, and critical sync alerts.
 *
 * @param props - BannerProps
 * @returns React.JSX.Element
 */
export const Banner: React.FC<BannerProps> = ({
  title,
  description,
  variant = 'offline',
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  className,
}) => {
  const cfg = variantConfig[variant];

  return (
    <View
      className={cn(
        'w-full flex-row items-start justify-between p-3.5 rounded-kalya-lg border my-1.5',
        cfg.container,
        className
      )}
    >
      <View className="flex-row items-start gap-2.5 flex-1 mr-2">
        <View className="mt-0.5">{cfg.icon}</View>
        <View className="flex-1">
          <Text variant="body-sm" className={cn('font-inter-bold', cfg.text)}>
            {title}
          </Text>
          {description ? (
            <Text variant="caption" className={cn('font-inter mt-0.5', cfg.text)}>
              {description}
            </Text>
          ) : null}

          {actionLabel && onAction ? (
            <HapticTouchable
              hapticTier="light"
              onPress={onAction}
              className="mt-2 self-start py-1 px-2.5 rounded-kalya-pill bg-kalya-surface border border-kalya-border-subtle"
            >
              <Text variant="caption" className="font-inter-bold text-kalya-text-primary">
                {actionLabel}
              </Text>
            </HapticTouchable>
          ) : null}
        </View>
      </View>

      {dismissible && onDismiss ? (
        <HapticTouchable
          accessibilityLabel="Dismiss banner"
          hapticTier="light"
          onPress={onDismiss}
          className="p-1 rounded-full"
        >
          <X size={16} color="#5d8a72" />
        </HapticTouchable>
      ) : null}
    </View>
  );
};
