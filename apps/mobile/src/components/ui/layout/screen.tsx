import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { cn } from '@/libs/utils';
import { SCREEN_DEFAULT_BG } from '@/constants/color';

export interface ScreenProps {
  /** Children rendered inside the screen body. */
  children: React.ReactNode;

  /**
   * Optional fixed top header rendered outside the scroll view,
   * directly beneath the top safe-area boundary.
   */
  header?: React.ReactNode;

  /**
   * Optional fixed bottom footer or action bar rendered outside the scroll view.
   */
  footer?: React.ReactNode;

  /**
   * Optional overlay slot rendered above content (e.g. snackbars, toasts).
   */
  overlay?: React.ReactNode;

  /**
   * Whether content is scrollable via ScrollView.
   * @default true
   */
  scrollable?: boolean;

  /**
   * Whether to wrap in KeyboardAvoidingView.
   * @default true
   */
  keyboardAvoiding?: boolean;

  /**
   * Refreshing state for pull-to-refresh.
   * @default false
   */
  refreshing?: boolean;

  /** Callback invoked on pull-to-refresh. */
  onRefresh?: () => void;

  /** Scroll event listener forwarded to the underlying ScrollView. */
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;

  /** Scroll event throttle interval in milliseconds. */
  scrollEventThrottle?: number;

  /** Whether to show vertical scroll indicator. @default false */
  showsVerticalScrollIndicator?: boolean;

  /**
   * Safe area edges to inset.
   * @default ['top', 'left', 'right']
   */
  edges?: Edge[];

  /**
   * Status bar icon style.
   * @default 'dark'
   */
  statusBarStyle?: 'light' | 'dark' | 'auto';

  /** Style for the inner content container. */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /** NativeWind classes for the inner content container (padding, alignment, gap). */
  contentContainerClassName?: string;

  /** Extra NativeWind classes for the outer SafeAreaView wrapper. */
  className?: string;

  /**
   * Color painted behind the whole screen, including the area behind
   * the system navigation bar. Also applied to the native root window.
   * @default SCREEN_DEFAULT_BG
   */
  backgroundColor?: string;
}

/**
 * Screen provides a standardized container with safe area insets,
 * fixed header/footer slots, optional scrolling with pull-to-refresh,
 * keyboard avoidance, status bar handling, and native root window background sync.
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  header,
  footer,
  overlay,
  scrollable = true,
  keyboardAvoiding = true,
  refreshing = false,
  onRefresh,
  onScroll,
  scrollEventThrottle = 16,
  showsVerticalScrollIndicator = false,
  edges = ['top', 'left', 'right'],
  statusBarStyle = 'dark',
  contentContainerStyle,
  contentContainerClassName,
  className,
  backgroundColor = SCREEN_DEFAULT_BG,
}) => {
  useFocusEffect(
    useCallback(() => {
      SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => {});
    }, [backgroundColor])
  );

  const content = scrollable ? (
    <ScrollView
      className="flex-1 w-full"
      style={{ backgroundColor }}
      contentContainerClassName={cn('flex-grow', contentContainerClassName)}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0d3e26"
            colors={['#0d3e26', '#d4af37']}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className={cn('flex-1 w-full', contentContainerClassName)}
      style={[{ backgroundColor }, contentContainerStyle]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      className={cn('flex-1 w-full', className)}
      style={{ backgroundColor }}
    >
      <StatusBar style={statusBarStyle} />

      {header}

      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 w-full"
          style={{ backgroundColor }}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}

      {footer}
      {overlay}
    </SafeAreaView>
  );
};
