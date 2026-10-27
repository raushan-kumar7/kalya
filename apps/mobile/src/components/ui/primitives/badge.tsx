import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Typo } from './typo';
import { cn } from '@/libs/utils';

export type BadgeVariant =
  | 'needs'
  | 'wants'
  | 'savings'
  | 'inflow'
  | 'outflow'
  | 'sync-live'
  | 'sync-offline'
  | 'sync-queued'
  | 'gold-pro'
  | 'neutral';

export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps {
  /**
   * Display text inside badge.
   */
  label: string;

  /**
   * Visual variant representing category or status.
   * @default 'neutral'
   */
  variant?: BadgeVariant;

  /**
   * Size tier.
   * @default 'sm'
   */
  size?: BadgeSize;

  /**
   * Shows a circular status dot indicator before label.
   * @default false
   */
  showDot?: boolean;

  /**
   * Animates the status dot with a continuous breathing pulse.
   * @default false
   */
  pulseDot?: boolean;

  /**
   * Optional custom NativeWind className.
   */
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string; dot: string }> = {
  needs: {
    container: 'bg-kalya-surface-subtle border-kalya-border',
    text: 'text-kalya-primary font-inter-bold',
    dot: 'bg-kalya-primary',
  },
  wants: {
    container: 'bg-kalya-gold-soft border-kalya-gold-warm',
    text: 'text-kalya-primary-dark font-inter-bold',
    dot: 'bg-kalya-gold',
  },
  savings: {
    container: 'bg-kalya-surface-subtle border-kalya-border',
    text: 'text-kalya-savings font-inter-bold',
    dot: 'bg-kalya-savings',
  },
  inflow: {
    container: 'bg-kalya-surface-subtle border-kalya-border',
    text: 'text-kalya-inflow font-inter-bold',
    dot: 'bg-kalya-inflow',
  },
  outflow: {
    container: 'bg-kalya-surface border-kalya-outflow',
    text: 'text-kalya-outflow font-inter-bold',
    dot: 'bg-kalya-outflow',
  },
  'sync-live': {
    container: 'bg-kalya-surface-subtle border-kalya-border',
    text: 'text-kalya-primary font-inter-bold',
    dot: 'bg-kalya-primary',
  },
  'sync-offline': {
    container: 'bg-kalya-gold-soft border-kalya-gold-warm',
    text: 'text-kalya-gold-dark font-inter-bold',
    dot: 'bg-kalya-gold-warm',
  },
  'sync-queued': {
    container: 'bg-kalya-gold-soft border-kalya-gold-warm',
    text: 'text-kalya-gold-dark font-inter-bold',
    dot: 'bg-kalya-gold',
  },
  'gold-pro': {
    container: 'bg-kalya-gold-soft border-kalya-gold-warm',
    text: 'text-kalya-gold-dark font-inter-bold',
    dot: 'bg-kalya-gold-dark',
  },
  neutral: {
    container: 'bg-kalya-surface-muted border-kalya-border-subtle',
    text: 'text-kalya-text-tertiary font-inter',
    dot: 'bg-kalya-text-tertiary',
  },
};

const sizeStyles: Record<BadgeSize, { container: string; text: string; dot: string }> = {
  xs: { container: 'px-2 py-0.5', text: 'text-[10px]', dot: 'w-1.5 h-1.5' },
  sm: { container: 'px-2.5 py-1', text: 'text-xs', dot: 'w-2 h-2' },
  md: { container: 'px-3 py-1.5', text: 'text-xs', dot: 'w-2.5 h-2.5' },
};

/**
 * Badge provides micro-status indications for financial allocations (50/30/20)
 * and system synchronization status.
 *
 * @param props - BadgeProps
 * @returns React.JSX.Element
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  showDot = false,
  pulseDot = false,
  className,
}) => {
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];

  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (pulseDot) {
      pulseOpacity.value = withRepeat(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [pulseDot, pulseOpacity]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View
      className={cn(
        'flex-row items-center justify-center rounded-kalya-pill border',
        vStyle.container,
        sStyle.container,
        className
      )}
    >
      {showDot ? (
        <Animated.View
          style={animatedDotStyle}
          className={cn('rounded-full mr-1.5', sStyle.dot, vStyle.dot)}
        />
      ) : null}

      <Typo className={cn(vStyle.text, sStyle.text)}>{label}</Typo>
    </View>
  );
};

/**
 * StatusPill is a specialized ambient pill for network & vault synchronization.
 *
 * @param isOnline - Whether network connection is active
 * @param isSyncing - Whether background sync is in flight
 * @returns React.JSX.Element
 */
export const StatusPill: React.FC<{ isOnline: boolean; isSyncing?: boolean }> = ({
  isOnline,
  isSyncing = false,
}) => {
  if (!isOnline) {
    return <Badge label="VAULT MODE · OFFLINE" variant="sync-offline" showDot size="xs" />;
  }

  if (isSyncing) {
    return <Badge label="SYNCING VAULT..." variant="sync-queued" showDot pulseDot size="xs" />;
  }

  return <Badge label="LIVE VAULT" variant="sync-live" showDot size="xs" />;
};
