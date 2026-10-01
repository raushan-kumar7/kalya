'use client';

/**
 * ============================================================
 * KALYA — Centralized UI Constants & Shared Component Tokens
 * ============================================================
 * Single source of truth for:
 * - Control size scales (heights, paddings, typography)
 * - Icon sizing matrix
 * - Accessible focus rings & disabled states
 * - CSS transition presets
 * - Framer Motion animation presets (re-exported & mapped from @/libs/animations)
 */

import {
  EASINGS,
  TRANSITIONS,
  buttonHoverProps,
  cardHoverProps,
  pillHoverProps,
  fadeInUp,
  scaleIn,
  popIn,
  dropdownMenu,
  modalContent,
  fadeIn,
} from '@/libs/animations';

// ------------------------------------------------------------
// 1. CONTROL SIZES (Buttons, Inputs, Selects, Comboboxes, Addons)
// ------------------------------------------------------------
export const CONTROL_SIZES = {
  xs: {
    height: 'h-7',
    text: 'text-[11px]',
    px: 'px-2.5',
    py: 'py-1',
    rounded: 'rounded-xs',
    icon: 'h-3 w-3',
  },
  sm: {
    height: 'h-8.5',
    text: 'text-caption',
    px: 'px-3',
    py: 'py-1.5',
    rounded: 'rounded-sm',
    icon: 'h-3.5 w-3.5',
  },
  md: {
    height: 'h-10',
    text: 'text-body-sm',
    px: 'px-3.5',
    py: 'py-2',
    rounded: 'rounded-md',
    icon: 'h-4 w-4',
  },
  lg: {
    height: 'h-12',
    text: 'text-body-md',
    px: 'px-5',
    py: 'py-3',
    rounded: 'rounded-md',
    icon: 'h-5 w-5',
  },
  xl: {
    height: 'h-14',
    text: 'text-body-lg',
    px: 'px-6',
    py: 'py-3.5',
    rounded: 'rounded-lg',
    icon: 'h-6 w-6',
  },
  icon: {
    xs: 'h-7 w-7 p-0 rounded-xs',
    sm: 'h-8.5 w-8.5 p-0 rounded-sm',
    md: 'h-10 w-10 p-0 rounded-md',
    lg: 'h-12 w-12 p-0 rounded-md',
    xl: 'h-14 w-14 p-0 rounded-lg',
  },
} as const;

export type ControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'default';

// ------------------------------------------------------------
// 2. ICON SIZES (Lucide icons, status indicators, badges)
// ------------------------------------------------------------
export const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// ------------------------------------------------------------
// 3. FOCUS RINGS & ACCESSIBILITY TOKENS
// ------------------------------------------------------------
export const FOCUS_RING = {
  /** Standard Kalya primary ring (evergreen in light, emerald in dark) */
  primary:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-bg',
  /** Accent gold ring for hero or high-yield interactive elements */
  accent:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ring-offset-bg',
  /** Danger red ring for invalid fields */
  danger:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 ring-offset-bg',
  /** Subtle inside ring */
  inset: 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
} as const;

export const FOCUS_WITHIN_RING = {
  /** Standard Kalya container focus ring (applied to compound groups via focus-within) */
  primary:
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ring-offset-bg focus-within:border-primary',
  /** Accent gold container ring */
  accent:
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ring-offset-bg focus-within:border-accent',
  /** Danger red container ring for invalid compound groups */
  danger:
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-danger focus-within:ring-offset-2 ring-offset-bg focus-within:border-danger',
} as const;

// ------------------------------------------------------------
// 4. DISABLED & INTERACTION STATES
// ------------------------------------------------------------
export const INTERACTION_STATES = {
  disabled:
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-raised',
  activeTap: 'active:scale-[0.98] select-none',
  activeTapSm: 'active:scale-95 select-none',
  cursorPointer: 'cursor-pointer select-none',
} as const;

// ------------------------------------------------------------
// 5. CSS TRANSITION PRESETS
// ------------------------------------------------------------
export const TRANSITIONS_CSS = {
  all: 'transition-all duration-150 ease-out',
  colors: 'transition-colors duration-150 ease-out',
  transform: 'transition-transform duration-150 ease-out',
  shadow: 'transition-shadow duration-150 ease-out',
  slow: 'transition-all duration-200 ease-out',
} as const;

// ------------------------------------------------------------
// 6. SURFACE & BORDER PRESETS
// ------------------------------------------------------------
export const SURFACES = {
  default: 'bg-surface text-text-primary border border-border shadow-card',
  raised: 'bg-surface-raised text-text-primary border border-border shadow-raised',
  glass: 'bg-surface/90 backdrop-blur-md text-text-primary border border-border/80 shadow-raised',
  subtle: 'bg-primary-subtle text-primary border border-primary/20',
  dark: 'bg-[#0d1f16] text-white border border-white/10 shadow-2xl',
} as const;

// ------------------------------------------------------------
// 7. MOTION INTEGRATION (from @/libs/animations)
// ------------------------------------------------------------
export const MOTION_PRESETS = {
  buttonTap: { scale: 0.98 },
  buttonHover: { scale: 1.01 },
  pillTap: { scale: 0.96 },
  pillHover: { scale: 1.03 },
  cardHover: { y: -3 },
} as const;

export {
  EASINGS,
  TRANSITIONS,
  buttonHoverProps,
  cardHoverProps,
  pillHoverProps,
  fadeInUp,
  scaleIn,
  popIn,
  dropdownMenu,
  modalContent,
  fadeIn,
};
