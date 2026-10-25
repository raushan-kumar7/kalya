import React from 'react';
import { View } from 'react-native';

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface SpacerProps {
  /**
   * Sizing scale tier or pixel value.
   * - xs: 4px
   * - sm: 8px
   * - md: 16px
   * - lg: 24px
   * - xl: 32px
   * - 2xl: 48px
   * @default 'md'
   */
  size?: SpacerSize;

  /**
   * Axis of spacing.
   * @default 'vertical'
   */
  axis?: 'vertical' | 'horizontal';
}

const spacingScale: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

/**
 * Spacer provides standardized spatial gaps across layouts without ad-hoc margins.
 *
 * @param props - SpacerProps
 * @returns React.JSX.Element
 */
export const Spacer: React.FC<SpacerProps> = ({ size = 'md', axis = 'vertical' }) => {
  const pixel = typeof size === 'number' ? size : (spacingScale[size] ?? 16);

  return (
    <View
      style={
        axis === 'vertical' ? { height: pixel, width: '100%' } : { width: pixel, height: '100%' }
      }
    />
  );
};
