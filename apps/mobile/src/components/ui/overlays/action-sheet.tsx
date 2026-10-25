import React from 'react';
import { View, Modal, Pressable } from 'react-native';
import { Text } from '../primitives/text';
import { HapticTouchable, triggerHaptic } from '../primitives/haptic-touchable';
import { Button } from '../primitives/button';
import { cn } from '@/libs/utils';

export interface ActionSheetItem {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
}

export interface ActionSheetProps {
  /**
   * Visibility flag.
   */
  visible: boolean;

  /**
   * Dismiss callback.
   */
  onClose: () => void;

  /**
   * Optional header title.
   */
  title?: string;

  /**
   * Actions list.
   */
  actions: ActionSheetItem[];

  /**
   * Cancel button title.
   * @default 'Cancel'
   */
  cancelLabel?: string;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * ActionSheet displays a bottom modal sheet of actions triggered by
 * long-press or overflow menus.
 *
 * @param props - ActionSheetProps
 * @returns React.JSX.Element
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  actions,
  cancelLabel = 'Cancel',
  className,
}) => {
  const handleItemPress = (item: ActionSheetItem) => {
    triggerHaptic(item.destructive ? 'warning' : 'light');
    onClose();
    item.onPress();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        className="flex-1 justify-end p-3 pb-8"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={cn(
            'w-full bg-kalya-surface rounded-kalya-xl border border-kalya-border-subtle p-2 mb-2',
            className
          )}
        >
          {title ? (
            <View className="px-4 py-2.5 border-b border-kalya-border-subtle mb-1">
              <Text
                variant="caption"
                tone="tertiary"
                className="font-inter-bold uppercase tracking-wider text-center"
              >
                {title}
              </Text>
            </View>
          ) : null}

          {actions.map((action, idx) => (
            <HapticTouchable
              key={`action-${idx}`}
              hapticTier={action.destructive ? 'warning' : 'light'}
              onPress={() => handleItemPress(action)}
              className="flex-row items-center gap-3 py-3 px-4 rounded-kalya-md"
            >
              {action.icon ? <View>{action.icon}</View> : null}
              <Text
                variant="body-md"
                className={cn(
                  'font-inter flex-1',
                  action.destructive
                    ? 'font-inter-bold text-kalya-outflow'
                    : 'text-kalya-text-primary'
                )}
              >
                {action.label}
              </Text>
            </HapticTouchable>
          ))}
        </Pressable>

        <Button title={cancelLabel} variant="glass" size="lg" fullWidth onPress={onClose} />
      </Pressable>
    </Modal>
  );
};
