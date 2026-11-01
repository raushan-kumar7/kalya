import React, { useCallback, useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Header, Screen } from '@/components/ui';
import { cn } from '@/libs/utils';
import { useTabStore } from '@/stores/tabs';
import { FAB_CLEARANCE } from './config';

const SCROLL_THRESHOLD = 12;

export interface TabScreenWrapperProps {
  children: React.ReactNode;
  /** Default title text. Ignored if custom `header` slot is passed */
  title?: string;
  subtitle?: string;
  /** Fully custom header slot */
  header?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Fixed overlay slot rendered above scroll area (e.g. UndoSnackBar) */
  overlay?: React.ReactNode;
  contentClassName?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  backgroundColor?: string;
  /** Whether to hide the global FAB on this screen @default false */
  hideFab?: boolean;
}

/**
 * TabScreenWrapper provides a standardized wrapper for all tab screens,
 * delegating safe-area insets, keyboard avoidance, and background color to `Screen`,
 * while automatically handling header formatting, FAB clearance padding,
 * and scroll-to-hide FAB mechanics.
 */
export const TabScreenWrapper: React.FC<TabScreenWrapperProps> = ({
  children,
  title,
  subtitle,
  header,
  onRefresh,
  refreshing = false,
  overlay,
  contentClassName,
  contentContainerStyle,
  scrollable = true,
  backgroundColor = '#edfdf2',
  hideFab = false,
}) => {
  const lastY = useRef(0);

  // Sync FAB visibility on screen focus
  useFocusEffect(
    useCallback(() => {
      useTabStore.getState().setFabVisible(!hideFab);
    }, [hideFab])
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (hideFab) return;
      const y = Math.max(0, e.nativeEvent.contentOffset.y);
      const delta = y - lastY.current;
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;

      useTabStore.getState().setFabVisible(delta < 0 || y < 50);
      lastY.current = y;
    },
    [hideFab]
  );

  const resolvedHeader =
    header !== undefined ? (
      header
    ) : title ? (
      <Header showBack={false} title={title} subtitle={subtitle} />
    ) : null;

  return (
    <Screen
      scrollable={scrollable}
      edges={['top', 'left', 'right']}
      backgroundColor={backgroundColor}
      header={resolvedHeader}
      overlay={overlay}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerClassName={cn('gap-6 px-6 pt-4', contentClassName)}
      contentContainerStyle={[
        { paddingBottom: hideFab ? 32 : FAB_CLEARANCE },
        contentContainerStyle,
      ]}
    >
      {children}
    </Screen>
  );
};
