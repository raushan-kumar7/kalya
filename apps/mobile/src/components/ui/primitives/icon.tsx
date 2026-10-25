import React from 'react';
import { View, ViewStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { LucideIcon, LucideProps } from 'lucide-react-native';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export type IconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'inverse'
  | 'inflow'
  | 'outflow'
  | 'gold'
  | 'gold-warm'
  | 'mint'
  | (string & {});

export interface IconProps extends Omit<LucideProps, 'size' | 'color'> {
  /**
   * Lucide icon component or string name from lucide-react-native.
   */
  name?: keyof typeof LucideIcons;

  /**
   * Alternatively, pass the icon component directly.
   */
  icon?: LucideIcon;

  /**
   * Size token or raw pixel number.
   * @default 'md' (20px)
   */
  size?: IconSize;

  /**
   * Theme color token or hex string.
   * @default 'primary'
   */
  color?: IconColor;

  /**
   * Optional custom style.
   */
  style?: ViewStyle;
}

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const colorMap: Record<string, string> = {
  primary: '#0d3e26',
  secondary: '#2d5e46',
  tertiary: '#5d8a72',
  accent: '#d4af37',
  inverse: '#ffffff',
  inflow: '#1b8a51',
  outflow: '#c83535',
  gold: '#d4af37',
  'gold-warm': '#b8912e',
  mint: '#a3e6be',
};

/**
 * Icon is a unified wrapper around lucide-react-native that maps
 * design system size and color tokens.
 *
 * @param props - IconProps
 * @returns React.JSX.Element | null
 */
export const Icon: React.FC<IconProps> = ({
  name,
  icon: IconComponentProp,
  size = 'md',
  color = 'primary',
  style,
  ...rest
}) => {
  const pixelSize = typeof size === 'number' ? size : (sizeMap[size] ?? 20);
  const hexColor = colorMap[color] ?? color;

  let ResolvedComponent: LucideIcon | null = IconComponentProp ?? null;

  if (!ResolvedComponent && name && (LucideIcons as Record<string, any>)[name]) {
    ResolvedComponent = (LucideIcons as Record<string, any>)[name] as LucideIcon;
  }

  if (!ResolvedComponent) {
    return <View style={[{ width: pixelSize, height: pixelSize }, style]} />;
  }

  return <ResolvedComponent size={pixelSize} color={hexColor} style={style} {...rest} />;
};
