// import React from 'react';
// import {
//   Text as RNText,
//   TextProps as RNTextProps,
//   StyleSheet,
//   StyleProp,
//   TextStyle,
// } from 'react-native';
// import { cn } from '@/libs/utils';

// export type TypoScale =
//   | 'display'
//   | 'title-lg'
//   | 'title-md'
//   | 'title-sm'
//   | 'body-lg'
//   | 'body-md'
//   | 'body-sm'
//   | 'caption'
//   | 'numeral-xl'
//   | 'numeral-lg'
//   | 'numeral-md'
//   | 'numeral-sm'
//   | 'code';

// export type TypoColorVariant =
//   | 'primary'
//   | 'secondary'
//   | 'muted'
//   | 'link'
//   | 'inverse'
//   | 'tertiary'
//   | 'accent'
//   | 'inflow'
//   | 'outflow';

// export type TypoVariant = TypoScale | TypoColorVariant;
// export type TypoTone = TypoColorVariant;

// export interface TypoProps extends RNTextProps {
//   /**
//    * Typographic scale ('display', 'title-lg', 'body-md', etc.)
//    * or semantic color variant ('primary', 'secondary', 'muted', 'link', 'inverse', etc.)
//    * @default 'primary'
//    */
//   variant?: TypoVariant;

//   /**
//    * Explicit typographic scale tier.
//    */
//   size?: TypoScale;

//   /**
//    * Semantic color tone from the Kalya palette.
//    * @default 'primary'
//    */
//   tone?: TypoTone;

//   /**
//    * Optional custom NativeWind className.
//    */
//   className?: string;

//   /**
//    * Content children.
//    */
//   children?: React.ReactNode;

//   /**
//    * Optional custom style.
//    */
//   style?: StyleProp<TextStyle>;
// }

// export type TextProps = TypoProps;

// export const scaleStyles: Record<TypoScale, string> = {
//   display: 'font-outfit-bold text-3xl tracking-tight leading-tight',
//   'title-lg': 'font-outfit-bold text-2xl tracking-tight leading-snug',
//   'title-md': 'font-outfit-bold text-xl leading-snug',
//   'title-sm': 'font-outfit-bold text-base leading-normal',
//   'body-lg': 'font-inter text-base leading-relaxed',
//   'body-md': 'font-inter text-sm leading-normal',
//   'body-sm': 'font-inter text-xs leading-normal',
//   caption: 'font-inter text-[11px] leading-tight',
//   'numeral-xl': 'font-ibm-plex-bold text-3xl tracking-tight',
//   'numeral-lg': 'font-ibm-plex-bold text-2xl tracking-tight',
//   'numeral-md': 'font-ibm-plex-bold text-lg',
//   'numeral-sm': 'font-ibm-plex text-sm',
//   code: 'font-ibm-plex text-xs',
// };

// export const toneStyles: Record<TypoColorVariant, string> = {
//   primary: 'text-kalya-text-primary dark:text-white',
//   secondary: 'text-kalya-text-secondary dark:text-kalya-mint',
//   muted: 'text-kalya-text-tertiary',
//   link: 'text-kalya-primary-light dark:text-kalya-mint underline',
//   inverse: 'text-kalya-text-inverse',
//   tertiary: 'text-kalya-text-tertiary',
//   accent: 'text-kalya-text-accent',
//   inflow: 'text-kalya-inflow',
//   outflow: 'text-kalya-outflow',
// };

// export const variantStyles = toneStyles;

// const isScaleVariant = (val?: string): val is TypoScale => {
//   return Boolean(val && val in scaleStyles);
// };

// const isColorVariant = (val?: string): val is TypoColorVariant => {
//   return Boolean(val && val in toneStyles);
// };

// /**
//  * Typo (formerly Text) is the core typography primitive for Kalya Mobile.
//  * Dynamically resolves custom font families from Tailwind classes and supports
//  * both typographic scale variants and semantic color variants.
//  */
// export const Typo = ({
//   children,
//   variant = 'primary',
//   size,
//   tone,
//   className = '',
//   style,
//   ...props
// }: TypoProps) => {
//   let resolvedScale = size;
//   let resolvedTone = tone;

//   if (variant) {
//     if (isScaleVariant(variant)) {
//       resolvedScale = resolvedScale || variant;
//     } else if (isColorVariant(variant)) {
//       resolvedTone = resolvedTone || variant;
//     }
//   }

//   const scaleClass = resolvedScale ? scaleStyles[resolvedScale] : 'text-base';
//   const toneClass = resolvedTone ? toneStyles[resolvedTone] : toneStyles.primary;

//   // Dynamic font mapping based on tailwind classes and fonts configuration:
//   // inter: 'Inter-Regular', 'inter-bold': 'Inter-Bold'
//   // outfit: 'Outfit-Regular', 'outfit-bold': 'Outfit-Bold'
//   // ibm-plex: 'IBMPlexMono-Regular', 'ibm-plex-bold': 'IBMPlexMono-Bold'
//   const getFontFamily = () => {
//     // 1. Explicit user class name overrides
//     if (className.includes('font-ibm-plex-bold') || className.includes('font-mono-bold')) {
//       return 'IBMPlexMono-Bold';
//     }
//     if (className.includes('font-ibm-plex') || className.includes('font-mono')) {
//       return 'IBMPlexMono-Regular';
//     }
//     if (
//       className.includes('font-outfit-bold') ||
//       className.includes('font-serif-bold') ||
//       className.includes('font-display-bold')
//     ) {
//       return 'Outfit-Bold';
//     }
//     if (
//       className.includes('font-outfit') ||
//       className.includes('font-serif') ||
//       className.includes('font-display')
//     ) {
//       return 'Outfit-Regular';
//     }
//     if (
//       className.includes('font-inter-bold') ||
//       className.includes('font-sans-bold') ||
//       className.includes('font-bold')
//     ) {
//       return 'Inter-Bold';
//     }
//     if (className.includes('font-inter') || className.includes('font-sans')) {
//       return 'Inter-Regular';
//     }

//     // 2. Scale variant classes
//     if (scaleClass.includes('font-ibm-plex-bold')) return 'IBMPlexMono-Bold';
//     if (scaleClass.includes('font-ibm-plex')) return 'IBMPlexMono-Regular';
//     if (scaleClass.includes('font-outfit-bold')) return 'Outfit-Bold';
//     if (scaleClass.includes('font-outfit')) return 'Outfit-Regular';
//     if (scaleClass.includes('font-inter-bold')) return 'Inter-Bold';
//     if (scaleClass.includes('font-inter')) return 'Inter-Regular';

//     return 'Inter-Regular';
//   };

//   const flatStyle = StyleSheet.flatten(style);
//   const resolvedFontFamily = flatStyle?.fontFamily || getFontFamily();

//   return (
//     <RNText
//       style={[{ fontFamily: resolvedFontFamily }, style]}
//       className={cn(scaleClass, toneClass, className)}
//       {...props}
//     >
//       {children}
//     </RNText>
//   );
// };

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { cn } from '@/libs/utils';

export type TypoScale =
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

export type TypoColorVariant =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'link'
  | 'inverse'
  | 'tertiary'
  | 'accent'
  | 'inflow'
  | 'outflow';

export type TypoVariant = TypoScale | TypoColorVariant;
export type TypoTone = TypoColorVariant;

export interface TypoProps extends RNTextProps {
  /**
   * Typographic scale ('display', 'title-lg', 'body-md', etc.)
   * or semantic color variant ('primary', 'secondary', 'muted', 'link', 'inverse', etc.)
   * @default 'primary'
   */
  variant?: TypoVariant;

  /** Explicit typographic scale tier. */
  size?: TypoScale;

  /**
   * Semantic color tone from the Kalya palette.
   * @default 'primary'
   */
  tone?: TypoTone;

  /** Optional custom NativeWind className. */
  className?: string;

  /** Content children. */
  children?: React.ReactNode;

  /** Optional custom style. */
  style?: StyleProp<TextStyle>;
}

export type TextProps = TypoProps;

/* -------------------------------------------------------------------------- */
/* Fonts                                                                       */
/* -------------------------------------------------------------------------- */

type FontKey = 'inter' | 'outfit' | 'mono';

const FONTS: Record<FontKey, { regular: string; bold: string }> = {
  inter: { regular: 'Inter-Regular', bold: 'Inter-Bold' },
  outfit: { regular: 'Outfit-Regular', bold: 'Outfit-Bold' },
  mono: { regular: 'IBMPlexMono-Regular', bold: 'IBMPlexMono-Bold' },
};

/** className tokens that switch the font family (exact token match only). */
const FAMILY_TOKENS: Record<string, FontKey> = {
  'font-inter': 'inter',
  'font-inter-bold': 'inter',
  'font-sans': 'inter',
  'font-sans-bold': 'inter',
  'font-outfit': 'outfit',
  'font-outfit-bold': 'outfit',
  'font-serif': 'outfit',
  'font-serif-bold': 'outfit',
  'font-display': 'outfit',
  'font-display-bold': 'outfit',
  'font-ibm-plex': 'mono',
  'font-ibm-plex-bold': 'mono',
  'font-mono': 'mono',
  'font-mono-bold': 'mono',
};

const BOLD_TOKENS = new Set([
  'font-bold',
  'font-semibold',
  'font-extrabold',
  'font-black',
  'font-inter-bold',
  'font-sans-bold',
  'font-outfit-bold',
  'font-serif-bold',
  'font-display-bold',
  'font-ibm-plex-bold',
  'font-mono-bold',
]);

const REGULAR_TOKENS = new Set(['font-normal', 'font-light', 'font-medium']);

/* -------------------------------------------------------------------------- */
/* Scale                                                                       */
/* -------------------------------------------------------------------------- */

interface ScaleSpec {
  font: FontKey;
  bold: boolean;
  /** Size, leading and tracking only. The font family is applied inline. */
  className: string;
  heading?: boolean;
}

const SCALE: Record<TypoScale, ScaleSpec> = {
  display: {
    font: 'outfit',
    bold: true,
    heading: true,
    className: 'text-3xl tracking-tight leading-tight',
  },
  'title-lg': {
    font: 'outfit',
    bold: true,
    heading: true,
    className: 'text-2xl tracking-tight leading-snug',
  },
  'title-md': { font: 'outfit', bold: true, heading: true, className: 'text-xl leading-snug' },
  'title-sm': { font: 'outfit', bold: true, heading: true, className: 'text-base leading-normal' },
  'body-lg': { font: 'inter', bold: false, className: 'text-base leading-relaxed' },
  'body-md': { font: 'inter', bold: false, className: 'text-[15px] leading-normal' },
  'body-sm': { font: 'inter', bold: false, className: 'text-[13px] leading-normal' },
  caption: { font: 'inter', bold: false, className: 'text-xs leading-snug' },
  'numeral-xl': { font: 'mono', bold: true, className: 'text-3xl tracking-tight' },
  'numeral-lg': { font: 'mono', bold: true, className: 'text-2xl tracking-tight' },
  'numeral-md': { font: 'mono', bold: true, className: 'text-lg' },
  'numeral-sm': { font: 'mono', bold: false, className: 'text-sm' },
  code: { font: 'mono', bold: false, className: 'text-xs' },
};

const DEFAULT_SPEC: ScaleSpec = {
  font: 'inter',
  bold: false,
  className: 'text-base leading-normal',
};

/** Size/leading classes per scale, without font family. */
export const scaleStyles: Record<TypoScale, string> = Object.fromEntries(
  Object.entries(SCALE).map(([key, spec]) => [key, spec.className])
) as Record<TypoScale, string>;

/* -------------------------------------------------------------------------- */
/* Tones (light theme only; the app canvas is always light mint)               */
/* -------------------------------------------------------------------------- */

export const toneStyles: Record<TypoColorVariant, string> = {
  primary: 'text-kalya-text-primary',
  secondary: 'text-kalya-text-secondary',
  muted: 'text-kalya-text-tertiary',
  tertiary: 'text-kalya-text-tertiary',
  link: 'text-kalya-primary-light underline',
  inverse: 'text-kalya-text-inverse',
  accent: 'text-kalya-text-accent',
  inflow: 'text-[#167a46]',
  outflow: 'text-kalya-outflow',
};

export const variantStyles = toneStyles;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const isScaleVariant = (val?: string): val is TypoScale => Boolean(val && val in SCALE);

const isColorVariant = (val?: string): val is TypoColorVariant => Boolean(val && val in toneStyles);

/**
 * Picks the exact font file to use. The scale sets the default, and a
 * className such as `font-bold` or `font-mono` can override it.
 */
const resolveFontFamily = (spec: ScaleSpec, className: string): string => {
  let font = spec.font;
  let bold = spec.bold;

  for (const token of className.split(/\s+/)) {
    if (!token || token.includes(':')) continue; // ignore variants like dark:font-bold
    if (token in FAMILY_TOKENS) font = FAMILY_TOKENS[token];
    if (BOLD_TOKENS.has(token)) bold = true;
    else if (REGULAR_TOKENS.has(token)) bold = false;
  }

  return FONTS[font][bold ? 'bold' : 'regular'];
};

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Typo (also exported as Text) is the core typography primitive for Kalya Mobile.
 * It supports typographic scale variants and semantic color variants.
 */
export const Typo = ({
  children,
  variant = 'primary',
  size,
  tone,
  className = '',
  style,
  maxFontSizeMultiplier = 1.3,
  ...props
}: TypoProps) => {
  const scale = size ?? (isScaleVariant(variant) ? variant : undefined);
  const resolvedTone: TypoColorVariant = tone ?? (isColorVariant(variant) ? variant : 'primary');

  const spec = scale ? SCALE[scale] : DEFAULT_SPEC;
  const fontFamily = resolveFontFamily(spec, className);

  return (
    <RNText
      accessibilityRole={spec.heading ? 'header' : undefined}
      // Respect the user's font size setting, but cap it so layouts don't break.
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      // fontWeight is reset because each weight is its own font file. Without this,
      // Android can apply faux-bold on top of the bold file.
      style={[{ fontFamily, fontWeight: 'normal' }, style]}
      className={cn(spec.className, toneStyles[resolvedTone], className)}
      {...props}
    >
      {children}
    </RNText>
  );
};
