import React from 'react';
import { View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { HapticTouchable } from '../primitives/haptic-touchable';
import { Typo } from '../primitives/typo';
import { cn } from '@/libs/utils';

export interface FABProps {
  /**
   * Action triggered on press.
   */
  onPress: () => void;

  /**
   * Optional custom icon override.
   * @default <Plus size={24} color="#ffffff" />
   */
  icon?: React.ReactNode;

  /**
   * Optional label for extended FAB.
   */
  label?: string;

  /**
   * Visual variant style.
   * @default 'primary'
   */
  variant?: 'primary' | 'gold' | 'glass';

  /**
   * Screen anchor position.
   * @default 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-center' | 'relative';

  /**
   * Accessibility label for screen readers.
   * @default 'Add transaction'
   */
  accessibilityLabel?: string;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

const positionClasses = {
  'bottom-right': 'absolute bottom-6 right-6 z-40',
  'bottom-center': 'absolute bottom-6 self-center z-40',
  relative: '',
};

const variantClasses = {
  primary: 'bg-kalya-primary border border-kalya-border-strong',
  gold: 'bg-kalya-gold border border-kalya-gold-warm',
  glass: 'bg-kalya-glass-emerald border border-kalya-glass-border-emerald',
};

/**
 * FAB (Floating Action Button) provides the primary quick-action trigger.
 *
 * @param props - FABProps
 * @returns React.JSX.Element
 */
export const FAB: React.FC<FABProps> = ({
  onPress,
  icon,
  label,
  variant = 'primary',
  position = 'bottom-right',
  accessibilityLabel = 'Add transaction',
  className,
}) => {
  const isExtended = Boolean(label);

  return (
    <View className={cn(positionClasses[position], className)}>
      <HapticTouchable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hapticTier="medium"
        onPress={onPress}
        className={cn(
          'items-center justify-center flex-row',
          isExtended ? 'px-5 py-3.5 rounded-kalya-pill gap-2' : 'w-14 h-14 rounded-full',
          variantClasses[variant]
        )}
      >
        {icon ? icon : <Plus size={24} color={variant === 'gold' ? '#082919' : '#ffffff'} />}

        {label ? (
          <Typo
            variant="body-md"
            className={cn(
              'font-inter-bold',
              variant === 'gold' ? 'text-kalya-primary-dark' : 'text-kalya-text-inverse'
            )}
          >
            {label}
          </Typo>
        ) : null}
      </HapticTouchable>
    </View>
  );
};
