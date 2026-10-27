// import React, { useCallback } from 'react';
// import {
//   View,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   RefreshControl,
//   StyleProp,
//   ViewStyle,
// } from 'react-native';
// import { SafeAreaView, Edge } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { cn } from '@/libs/utils';
// import { SCREEN_DEFAULT_BG } from '@/constants/color';
// import * as SystemUI from "expo-system-ui"
// import { useFocusEffect } from 'expo-router';

// export interface ScreenProps {
//   /**
//    * Children components rendered inside screen body.
//    */
//   children: React.ReactNode;

//   /**
//    * Whether content is scrollable via ScrollView.
//    * @default true
//    */
//   scrollable?: boolean;

//   /**
//    * Whether to wrap in KeyboardAvoidingView.
//    * @default true
//    */
//   keyboardAvoiding?: boolean;

//   /**
//    * Refreshing state for pull-to-refresh.
//    * @default false
//    */
//   refreshing?: boolean;

//   /**
//    * Callback invoked on pull-to-refresh.
//    */
//   onRefresh?: () => void;

//   /**
//    * Safe area edges to inset.
//    * @default ['top', 'left', 'right']
//    */
//   edges?: Edge[];

//   /**
//    * Status bar style.
//    * @default 'dark'
//    */
//   statusBarStyle?: 'light' | 'dark' | 'auto';

//   /**
//    * Optional custom style for inner content container.
//    */
//   contentContainerStyle?: StyleProp<ViewStyle>;

//   /**
//    * Custom NativeWind className for wrapper.
//    */
//   className?: string;

//   /**
//    * Hex color painted behind the whole screen, including the
//    * status bar and system navigation bar areas.
//    * @default '#edfdf2'
//    */
//   backgroundColor?: string;
// }

// /**
//  * Screen provides a standardized view container with safe area insets,
//  * optional scroll with pull-to-refresh, keyboard avoidance, and status bar management.
//  *
//  * @param props - ScreenProps
//  * @returns React.JSX.Element
//  */
// export const Screen: React.FC<ScreenProps> = ({
//   children,
//   scrollable = true,
//   keyboardAvoiding = true,
//   refreshing = false,
//   onRefresh,
//   edges = ['top', 'left', 'right'],
//   statusBarStyle = 'dark',
//   contentContainerStyle,
//   className,
//   backgroundColor = SCREEN_DEFAULT_BG,
// }) => {

//   useFocusEffect(
//     useCallback(() => {
//       SystemUI.setBackgroundColorAsync(backgroundColor);
//     }, [backgroundColor]),
//   );

//   const content = scrollable ? (
//     <ScrollView
//       className="flex-1"
//       style={{ backgroundColor }}
//       contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
//       keyboardShouldPersistTaps="handled"
//       showsVerticalScrollIndicator={false}
//       refreshControl={
//         onRefresh ? (
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor="#0d3e26"
//             colors={['#0d3e26', '#d4af37']}
//           />
//         ) : undefined
//       }
//     >
//       {children}
//     </ScrollView>
//   ) : (
//     <View className="flex-1" style={[{ backgroundColor }, contentContainerStyle]}>
//       {children}
//     </View>
//   );

//   return (
//     <SafeAreaView edges={edges} className={cn('flex-1', className)} style={{ backgroundColor }}>
//       <StatusBar style={statusBarStyle}  />
//       {keyboardAvoiding ? (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           className="flex-1"
//           style={{backgroundColor}}
//         >
//           {content}
//         </KeyboardAvoidingView>
//       ) : (
//         content
//       )}
//     </SafeAreaView>
//   );
// };

import React, { useCallback } from 'react';
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
import { useFocusEffect } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { cn } from '@/libs/utils';
import { SCREEN_DEFAULT_BG } from '@/constants/color';

export interface ScreenProps {
  /** Children rendered inside the screen body. */
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

  /** Callback invoked on pull-to-refresh. */
  onRefresh?: () => void;

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

  /** Extra NativeWind classes for the outer wrapper. */
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
 * optional scrolling with pull-to-refresh, keyboard avoidance,
 * status bar handling, and a single background color applied at every layer.
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
  backgroundColor = SCREEN_DEFAULT_BG,
}) => {
  // Sync the native root window color with whichever screen is focused.
  // This is the layer visible through a transparent system navigation bar.
  useFocusEffect(
    useCallback(() => {
      SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => {});
    }, [backgroundColor])
  );

  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor }}
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
    <View className="flex-1" style={[{ backgroundColor }, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} className={cn('flex-1', className)} style={{ backgroundColor }}>
      <StatusBar style={statusBarStyle} />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
          style={{ backgroundColor }}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};
