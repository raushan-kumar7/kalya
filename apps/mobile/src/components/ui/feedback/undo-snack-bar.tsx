import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { HapticTouchable, triggerHaptic } from '../primitives/haptic-touchable';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface UndoSnackBarProps {
  /**
   * Whether the undo snackbar is actively visible.
   */
  visible: boolean;

  /**
   * Message informing what operation was staged (e.g., "Expense removed (₹1,400)").
   */
  message: string;

  /**
   * Rollback countdown time window in milliseconds.
   * @default 5000
   */
  durationMs?: number;

  /**
   * Callback invoked if user taps the Undo action.
   */
  onUndo: () => void;

  /**
   * Callback invoked when the countdown expires and action is finalized.
   */
  onExpire: () => void;

  /**
   * Custom label for undo action.
   * @default 'Undo'
   */
  actionLabel?: string;

  /**
   * Optional custom container className.
   */
  className?: string;
}

/**
 * UndoSnackBar delivers a floating 5-second reversal safety net for destructive operations.
 *
 * @param props - UndoSnackBarProps
 * @returns React.JSX.Element | null
 */
export const UndoSnackBar: React.FC<UndoSnackBarProps> = ({
  visible,
  message,
  durationMs = 5000,
  onUndo,
  onExpire,
  actionLabel = 'Undo',
  className,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil(durationMs / 1000));

  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(1);

  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      triggerHaptic('medium');
      setSecondsRemaining(Math.ceil(durationMs / 1000));

      translateY.value = withSpring(0, { damping: 18, stiffness: 250 });
      opacity.value = withTiming(1, { duration: 200 });

      progress.value = 1;
      progress.value = withTiming(0, {
        duration: durationMs,
        easing: Easing.linear,
      });

      intervalTimerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      expireTimerRef.current = setTimeout(() => {
        handleDismiss(true);
      }, durationMs);
    } else {
      translateY.value = withTiming(100, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
      clearTimers();
    }

    return () => {
      clearTimers();
    };
  }, [visible, durationMs]);

  const clearTimers = () => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
  };

  const handleDismiss = (expired: boolean) => {
    clearTimers();
    translateY.value = withTiming(100, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 });
    if (expired) {
      onExpire();
    }
  };

  const handleUndoTap = () => {
    triggerHaptic('success');
    clearTimers();
    handleDismiss(false);
    onUndo();
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const size = 26;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - secondsRemaining / (durationMs / 1000));

  return (
    <Animated.View
      style={containerAnimatedStyle}
      className={cn(
        'absolute bottom-8 left-4 right-4 z-50 flex-row items-center justify-between',
        'bg-kalya-primary-dark border border-kalya-gold',
        'px-4 py-3 rounded-kalya-pill',
        className
      )}
    >
      <View className="flex-row items-center gap-2.5 flex-1 mr-3">
        <View className="w-[26px] h-[26px] items-center justify-center">
          <Svg width={size} height={size}>
            <Circle
              stroke="rgba(212, 175, 55, 0.2)"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke="#d4af37"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          <View className="absolute inset-0 items-center justify-center">
            <Text variant="caption" className="text-[10px] font-ibm-plex-bold text-kalya-gold">
              {secondsRemaining}
            </Text>
          </View>
        </View>

        <Text
          variant="body-sm"
          className="font-inter text-kalya-text-inverse flex-1"
          numberOfLines={1}
        >
          {message}
        </Text>
      </View>

      <HapticTouchable
        hapticTier="success"
        onPress={handleUndoTap}
        className="px-3 py-1.5 rounded-kalya-pill bg-kalya-gold-warm border border-kalya-gold items-center justify-center"
      >
        <Text variant="body-sm" className="font-inter-bold text-kalya-gold">
          {actionLabel}
        </Text>
      </HapticTouchable>
    </Animated.View>
  );
};
