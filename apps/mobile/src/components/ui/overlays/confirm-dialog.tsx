import React from 'react';
import { View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Modal } from './modal';
import { Text } from '../primitives/text';
import { Button } from '../primitives/button';
import { triggerHaptic } from '../primitives/haptic-touchable';

export interface ConfirmDialogProps {
  /**
   * Visibility flag.
   */
  visible: boolean;

  /**
   * Headline title.
   */
  title: string;

  /**
   * Explanatory copy describing the consequences of the action.
   */
  message: string;

  /**
   * Confirm button label with clear action verb (e.g. "Delete Account" or "Reset Budget").
   * @default 'Confirm'
   */
  confirmLabel?: string;

  /**
   * Cancel button label.
   * @default 'Cancel'
   */
  cancelLabel?: string;

  /**
   * Confirm action callback.
   */
  onConfirm: () => void;

  /**
   * Cancel / Dismiss callback.
   */
  onCancel: () => void;

  /**
   * Whether the action is destructive (renders crimson button).
   * @default true
   */
  destructive?: boolean;

  /**
   * In-flight loading state.
   * @default false
   */
  isLoading?: boolean;
}

/**
 * ConfirmDialog provides an unambiguous confirmation dialog for destructive actions.
 *
 * @param props - ConfirmDialogProps
 * @returns React.JSX.Element
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = true,
  isLoading = false,
}) => {
  const handleConfirm = () => {
    triggerHaptic(destructive ? 'warning' : 'medium');
    onConfirm();
  };

  return (
    <Modal visible={visible} onClose={onCancel} dismissible={!isLoading}>
      <View className="flex-col items-center text-center p-2">
        {destructive ? (
          <View
            style={{ backgroundColor: 'rgba(200, 53, 53, 0.15)' }}
            className="w-12 h-12 rounded-full items-center justify-center mb-3"
          >
            <AlertTriangle size={24} color="#c83535" />
          </View>
        ) : null}

        <Text variant="title-sm" tone="primary" className="font-outfit-bold text-center mb-1.5">
          {title}
        </Text>

        <Text
          variant="body-sm"
          tone="secondary"
          className="font-inter text-center mb-5 leading-relaxed"
        >
          {message}
        </Text>

        <View className="flex-row items-center gap-2.5 w-full">
          <Button
            title={cancelLabel}
            variant="ghost"
            size="md"
            fullWidth
            onPress={onCancel}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            title={confirmLabel}
            variant={destructive ? 'destructive' : 'primary'}
            size="md"
            fullWidth
            isLoading={isLoading}
            onPress={handleConfirm}
            className="flex-1"
          />
        </View>
      </View>
    </Modal>
  );
};
