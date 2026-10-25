import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/libs/utils';

export interface DividerProps extends ViewProps {
  /**
   * Orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Visual thickness tier.
   * @default 'hairline'
   */
  thickness?: 'hairline' | 'thin' | 'thick';

  /**
   * Subtle or strong border tone.
   * @default 'subtle'
   */
  tone?: 'subtle' | 'default' | 'strong' | 'gold';

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

const thicknessStyles = {
  horizontal: {
    hairline: 'h-[0.5px]',
    thin: 'h-[1px]',
    thick: 'h-[2px]',
  },
  vertical: {
    hairline: 'w-[0.5px]',
    thin: 'w-[1px]',
    thick: 'w-[2px]',
  },
};

const toneStyles = {
  subtle: 'bg-kalya-border-subtle',
  default: 'bg-kalya-border',
  strong: 'bg-kalya-border-strong',
  gold: 'bg-kalya-gold-warm',
};

/**
 * Divider renders a horizontal or vertical rule separating visual sections.
 *
 * @param props - DividerProps
 * @returns React.JSX.Element
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 'hairline',
  tone = 'subtle',
  className,
  style,
  ...rest
}) => {
  return (
    <View
      style={style}
      className={cn(
        orientation === 'horizontal' ? 'w-full' : 'h-full',
        thicknessStyles[orientation][thickness],
        toneStyles[tone],
        className
      )}
      {...rest}
    />
  );
};
