import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Trash2, Edit3 } from 'lucide-react-native';
import { triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface SwipeableRowProps {
  /**
   * Primary row content.
   */
  children: React.ReactNode;

  /**
   * Callback invoked when delete action is confirmed.
   */
  onDelete?: () => void;

  /**
   * Optional callback when edit action is tapped.
   */
  onEdit?: () => void;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * SwipeableRow reveals contextual actions (Delete, Edit) on swipe.
 *
 * @param props - SwipeableRowProps
 * @returns React.JSX.Element
 */
export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onDelete,
  onEdit,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const translateX = useSharedValue(0);

  const actionWidth = (onDelete ? 60 : 0) + (onEdit ? 60 : 0);

  const toggleOpen = () => {
    triggerHaptic('light');
    const target = isOpen ? 0 : -actionWidth;
    translateX.value = withSpring(target, { damping: 20, stiffness: 280 });
    setIsOpen(!isOpen);
  };

  const handleDelete = () => {
    triggerHaptic('warning');
    translateX.value = withSpring(0);
    setIsOpen(false);
    onDelete?.();
  };

  const handleEdit = () => {
    triggerHaptic('medium');
    translateX.value = withSpring(0);
    setIsOpen(false);
    onEdit?.();
  };

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className={cn('relative w-full overflow-hidden bg-kalya-surface-subtle', className)}>
      {/* Hidden Action Buttons Revealed Underneath */}
      <View className="absolute right-0 top-0 bottom-0 flex-row items-center justify-end z-0">
        {onEdit ? (
          <Pressable
            accessibilityLabel="Edit record"
            onPress={handleEdit}
            className="w-[60px] h-full bg-kalya-primary items-center justify-center"
          >
            <Edit3 size={18} color="#ffffff" />
          </Pressable>
        ) : null}

        {onDelete ? (
          <Pressable
            accessibilityLabel="Delete record"
            onPress={handleDelete}
            className="w-[60px] h-full bg-kalya-outflow items-center justify-center"
          >
            <Trash2 size={18} color="#ffffff" />
          </Pressable>
        ) : null}
      </View>

      {/* Swipeable Content Surface */}
      <Animated.View style={contentAnimatedStyle} className="bg-kalya-surface z-10">
        <Pressable onLongPress={toggleOpen}>{children}</Pressable>
      </Animated.View>
    </View>
  );
};
