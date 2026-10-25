import React from 'react';
import {
  HapticTouchable,
  HapticTouchableProps,
  HapticTier,
  triggerHaptic,
} from './haptic-touchable';

export type { HapticTier };
export { triggerHaptic };

export interface PressableProps extends HapticTouchableProps {
  /**
   * Accessible role for screen readers.
   * @default 'button'
   */
  accessibilityRole?: HapticTouchableProps['accessibilityRole'];
}

/**
 * Pressable is a tactile interactive base component with spring physics and haptics.
 *
 * @param props - PressableProps
 * @returns React.JSX.Element
 */
export const Pressable: React.FC<PressableProps> = ({ accessibilityRole = 'button', ...props }) => {
  return <HapticTouchable accessibilityRole={accessibilityRole} {...props} />;
};
