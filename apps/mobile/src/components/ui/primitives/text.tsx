import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { cn } from '@/libs/utils';

export type TextVariant =
  | 'display'
  | 'title-lg'
  | 'title-md'
  | 'title-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'caption'
  | 'numeral-xl'
  | 'numeral-lg'
  | 'numeral-md'
  | 'numeral-sm'
  | 'code';

export type TextTone =
  'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse' | 'inflow' | 'outflow' | 'muted';

export interface TextProps extends RNTextProps {
  /**
   * Typographic scale and font family tier.
   * @default 'body-md'
   */
  variant?: TextVariant;

  /**
   * Semantic color tone from the Kalya palette.
   * @default 'primary'
   */
  tone?: TextTone;

  /**
   * Optional custom NativeWind className.
   */
  className?: string;

  /**
   * Content children.
   */
  children?: React.ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  display: 'font-outfit-bold text-3xl tracking-tight leading-tight',
  'title-lg': 'font-outfit-bold text-2xl tracking-tight leading-snug',
  'title-md': 'font-outfit-bold text-xl leading-snug',
  'title-sm': 'font-outfit-bold text-base leading-normal',
  'body-lg': 'font-inter text-base leading-relaxed',
  'body-md': 'font-inter text-sm leading-normal',
  'body-sm': 'font-inter text-xs leading-normal',
  caption: 'font-inter text-[11px] leading-tight',
  'numeral-xl': 'font-ibm-plex-bold text-3xl tracking-tight',
  'numeral-lg': 'font-ibm-plex-bold text-2xl tracking-tight',
  'numeral-md': 'font-ibm-plex-bold text-lg',
  'numeral-sm': 'font-ibm-plex text-sm',
  code: 'font-ibm-plex text-xs',
};

const toneStyles: Record<TextTone, string> = {
  primary: 'text-kalya-text-primary',
  secondary: 'text-kalya-text-secondary',
  tertiary: 'text-kalya-text-tertiary',
  accent: 'text-kalya-text-accent',
  inverse: 'text-kalya-text-inverse',
  inflow: 'text-kalya-inflow',
  outflow: 'text-kalya-outflow',
  muted: 'text-kalya-text-tertiary',
};

/**
 * Text is the core typography primitive for Kalya Mobile.
 *
 * @param props - TextProps
 * @returns React.JSX.Element
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body-md',
  tone = 'primary',
  className,
  children,
  ...rest
}) => {
  return (
    <RNText className={cn(variantStyles[variant], toneStyles[tone], className)} {...rest}>
      {children}
    </RNText>
  );
};
