import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react-native';
import { Typo } from '../../primitives';
import type { ToastData, ToastType } from './types';
import { useToastStore } from '@/stores/toast';

// Full class names (no string building) so Tailwind can detect them.
const THEME: Record<ToastType, { border: string; title: string }> = {
  success: { border: 'border-kalya-inflow/30', title: 'text-kalya-inflow' },
  error: { border: 'border-kalya-outflow/30', title: 'text-kalya-outflow' },
  warning: { border: 'border-kalya-gold/50', title: 'text-kalya-gold-dark' },
  info: { border: 'border-kalya-border-subtle', title: 'text-kalya-text-tertiary' },
  loading: { border: 'border-kalya-border-subtle', title: 'text-kalya-primary' },
};

const renderIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 size={20} color="#1b8a51" />;
    case 'error':
      return <AlertCircle size={20} color="#c83535" />;
    case 'warning':
      return <AlertTriangle size={20} color="#b8912e" />;
    case 'loading':
      return <ActivityIndicator size="small" color="#0d3e26" />;
    default:
      return <Info size={20} color="#5d8a72" />;
  }
};

const fireHaptic = (type: ToastType) => {
  switch (type) {
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'error':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    case 'warning':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    default:
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

interface ToastItemProps {
  toast: ToastData;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const dismiss = useToastStore((s) => s.dismiss);
  const translateY = useSharedValue(0);
  const isTop = toast.position !== 'bottom';
  const theme = THEME[toast.type];

  // Fires on mount and again when a loading toast becomes success or error.
  useEffect(() => {
    if (!toast.haptics) return;
    fireHaptic(toast.type).catch(() => {});
  }, [toast.type, toast.haptics]);

  // Hook-based Pan gesture (Gesture Handler 3). Replaces the deprecated Gesture.Pan() builder.
  const pan = usePanGesture({
    runOnJS: true,
    activeOffsetY: [-10, 10],
    onUpdate: (e) => {
      translateY.value = isTop ? Math.min(0, e.translationY) : Math.max(0, e.translationY);
    },
    onDeactivate: (e) => {
      const distance = isTop ? -e.translationY : e.translationY;
      const velocity = isTop ? -e.velocityY : e.velocityY;

      if (distance > 40 || velocity > 500) {
        dismiss(toast.id); // the `exiting` animation handles the visual
      } else {
        translateY.value = withSpring(0, { damping: 16, stiffness: 220 });
      }
    },
  });

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(Math.abs(translateY.value), [0, 120], [1, 0.4]),
  }));

  return (
    <Animated.View
      entering={(isTop ? FadeInUp : FadeInDown).springify().damping(16)}
      exiting={(isTop ? FadeOutUp : FadeOutDown).duration(180)}
      layout={LinearTransition.springify().damping(18)}
      className="mb-2.5 px-4"
    >
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[swipeStyle, { elevation: 6 }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className={`flex-row items-center rounded-kalya-md border bg-kalya-surface p-3.5 shadow-kalya-floating ${theme.border}`}
        >
          <View className="mr-3 h-6 w-6 items-center justify-center">
            {toast.icon ?? renderIcon(toast.type)}
          </View>

          <View className="min-w-0 flex-1 justify-center">
            {toast.title ? (
              <Typo size="caption" className={`font-inter-bold uppercase ${theme.title}`}>
                {toast.title}
              </Typo>
            ) : null}
            <Typo size="body-sm" className="font-inter text-kalya-text-primary">
              {toast.message}
            </Typo>
          </View>

          {toast.action ? (
            <Pressable
              onPress={() => {
                toast.action?.onPress();
                dismiss(toast.id);
              }}
              hitSlop={8}
              className="ml-2.5 rounded-kalya-sm bg-kalya-mint-subtle px-3 py-1.5"
            >
              <Typo size="caption" className="font-inter-bold text-kalya-primary">
                {toast.action.label}
              </Typo>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => dismiss(toast.id)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            className="ml-2 p-1"
          >
            <X size={14} color="#5d8a72" />
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};
