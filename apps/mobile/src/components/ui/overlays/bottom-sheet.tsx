import React from 'react';
import { View, Modal as RNModal, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface BottomSheetProps {
  /**
   * Visibility flag.
   */
  visible: boolean;

  /**
   * Dismiss callback.
   */
  onClose: () => void;

  /**
   * Optional sheet title.
   */
  title?: string;

  /**
   * Optional subtitle.
   */
  subtitle?: string;

  /**
   * Children components.
   */
  children: React.ReactNode;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * BottomSheet renders an accessible, gesture-dismissible bottom surface
 * for pickers, filters, and transaction forms.
 *
 * @param props - BottomSheetProps
 * @returns React.JSX.Element
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  className,
}) => {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        className="flex-1 justify-end"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={cn(
            'w-full bg-kalya-surface rounded-t-kalya-xl border-t border-kalya-border-subtle p-5 max-h-[85%]',
            className
          )}
        >
          {/* Grab Handle */}
          <View className="w-10 h-1.5 rounded-kalya-pill bg-kalya-border self-center mb-3" />

          {/* Header Bar */}
          {title ? (
            <View className="flex-row items-center justify-between pb-3 border-b border-kalya-border-subtle mb-3">
              <View className="flex-1 mr-2">
                <Text variant="title-sm" tone="primary" className="font-outfit-bold">
                  {title}
                </Text>
                {subtitle ? (
                  <Text variant="caption" tone="tertiary" className="font-inter mt-0.5">
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <Pressable
                accessibilityLabel="Close bottom sheet"
                onPress={onClose}
                className="p-1 rounded-full bg-kalya-surface-subtle"
              >
                <X size={18} color="#5d8a72" />
              </Pressable>
            </View>
          ) : null}

          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};
