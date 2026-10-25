import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { cn } from '@/libs/utils';

export interface ScreenProps {
  /**
   * Children components rendered inside screen body.
   */
  children: React.ReactNode;

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

  /**
   * Callback invoked on pull-to-refresh.
   */
  onRefresh?: () => void;

  /**
   * Safe area edges to inset.
   * @default ['top', 'left', 'right']
   */
  edges?: Edge[];

  /**
   * Status bar style.
   * @default 'dark'
   */
  statusBarStyle?: 'light' | 'dark' | 'auto';

  /**
   * Optional custom style for inner content container.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom NativeWind className for wrapper.
   */
  className?: string;
}

/**
 * Screen provides a standardized view container with safe area insets,
 * optional scroll with pull-to-refresh, keyboard avoidance, and status bar management.
 *
 * @param props - ScreenProps
 * @returns React.JSX.Element
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  refreshing = false,
  onRefresh,
  edges = ['top', 'left', 'right'],
  statusBarStyle = 'dark',
  contentContainerStyle,
  className,
}) => {
  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
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
    <View className="flex-1" style={contentContainerStyle}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-kalya-canvas', className)}>
      <StatusBar style={statusBarStyle} />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};
