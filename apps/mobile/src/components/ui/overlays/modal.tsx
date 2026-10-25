import React from 'react';
import { View, Modal as RNModal, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface ModalProps {
  /**
   * Visibility flag.
   */
  visible: boolean;

  /**
   * Close callback.
   */
  onClose: () => void;

  /**
   * Modal dialog title.
   */
  title?: string;

  /**
   * Children content.
   */
  children: React.ReactNode;

  /**
   * Whether tapping the backdrop closes the modal.
   * @default true
   */
  dismissible?: boolean;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * Modal provides a centered dialog overlay for critical tasks and alerts.
 *
 * @param props - ModalProps
 * @returns React.JSX.Element
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  dismissible = true,
  className,
}) => {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={dismissible ? onClose : undefined}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
        className="flex-1 items-center justify-center p-5"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={cn(
            'w-full max-w-[340px] bg-kalya-surface rounded-kalya-xl border border-kalya-border-subtle p-5',
            className
          )}
        >
          {title ? (
            <View className="flex-row items-center justify-between pb-3 border-b border-kalya-border-subtle mb-3">
              <Text variant="title-sm" tone="primary" className="font-outfit-bold">
                {title}
              </Text>
              {dismissible ? (
                <Pressable onPress={onClose} className="p-1">
                  <X size={18} color="#5d8a72" />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};
