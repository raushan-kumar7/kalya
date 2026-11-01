import React from 'react';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFabVisible, useTabStore } from '@/stores/tabs';
import { FAB } from '@/components/ui';
import { FAB_MARGIN, TAB_BAR_HEIGHT } from './config';

export const TabsFab: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isVisible = useIsFabVisible();

  if (!isVisible) return null;

  const onPress = () => {
    const { fabHandler, openQuickActions } = useTabStore.getState();
    (fabHandler ?? openQuickActions)();
  };

  return (
    <Animated.View
      entering={ZoomIn.duration(180)}
      exiting={ZoomOut.duration(140)}
      style={{
        position: 'absolute',
        right: 20,
        bottom: insets.bottom + TAB_BAR_HEIGHT + FAB_MARGIN,
      }}
    >
      <FAB
        onPress={onPress}
        position="relative"
        variant="glass"
        accessibilityLabel="Open quick financial actions"
        className="shadow-xl border-2 border-kalya-gold rounded-full"
      />
    </Animated.View>
  );
};
