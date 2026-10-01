import type { Transition, Variants } from 'framer-motion';

/**
 * ============================================================
 * KALYA — Reusable Framer Motion Animation Primitives
 * ============================================================
 * Standardized easing curves, spring presets, and motion variants
 * designed for luxury, fluid financial data interactions.
 */

// ------------------------------------------------------------
// 1. EASING CURVES
// ------------------------------------------------------------
export const EASINGS = {
  /** Luxurious, high-end deceleration (matches Kalya brand board) */
  editorial: [0.16, 1, 0.3, 1] as const,
  /** Standard natural ease out */
  easeOutCubic: [0.33, 1, 0.68, 1] as const,
  /** Symmetric smooth ease in-out */
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,
  /** Snappy micro-interaction curve */
  sharp: [0.4, 0, 0.2, 1] as const,
} as const;

// ------------------------------------------------------------
// 2. TRANSITIONS & SPRING PRESETS
// ------------------------------------------------------------
export const TRANSITIONS = {
  /** Ultra-snappy spring for buttons, toggles, badges */
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 28,
  } satisfies Transition,

  /** Gentle organic spring for layout shifts, cards, expanding panels */
  gentle: {
    type: 'spring',
    stiffness: 220,
    damping: 24,
  } satisfies Transition,

  /** Bouncy spring for notifications, alerts, success checks */
  bouncy: {
    type: 'spring',
    stiffness: 420,
    damping: 14,
  } satisfies Transition,

  /** Elegant smooth curve for page transitions, drawers, heroes */
  editorial: {
    duration: 0.45,
    ease: EASINGS.editorial,
  } satisfies Transition,

  /** Quick transition for hover & focus micro-interactions */
  fast: {
    duration: 0.15,
    ease: 'easeOut',
  } satisfies Transition,

  /** Balanced default transition */
  default: {
    duration: 0.25,
    ease: EASINGS.editorial,
  } satisfies Transition,
} as const;

// ------------------------------------------------------------
// 3. FADE & SLIDE VARIANTS
// ------------------------------------------------------------

/** Simple fade in / fade out */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.default,
  },
  exit: {
    opacity: 0,
    transition: TRANSITIONS.fast,
  },
};

/** Fade in with subtle upward motion (default card/hero entrance) */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.editorial,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: TRANSITIONS.fast,
  },
};

/** Fade in with downward slide */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.editorial,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: TRANSITIONS.fast,
  },
};

/** Fade in with left slide */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.editorial,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: TRANSITIONS.fast,
  },
};

/** Fade in with right slide */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.editorial,
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: TRANSITIONS.fast,
  },
};

// ------------------------------------------------------------
// 4. SCALE & MODAL VARIANTS
// ------------------------------------------------------------

/** Subtle scale-in for popovers, tooltips, dropdowns */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: TRANSITIONS.fast,
  },
};

/** Pop-in for success badges, celebration icons, achievements */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: TRANSITIONS.fast,
  },
};

/** Modal & Dialog Backdrop */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/** Modal Content Container */
export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITIONS.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: TRANSITIONS.fast,
  },
};

/** Dropdown menu entrance */
export const dropdownMenu: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: TRANSITIONS.fast,
  },
};

// ------------------------------------------------------------
// 5. LIST & STAGGER CONTAINERS
// ------------------------------------------------------------

/**
 * Creates a parent container variant that staggers children items.
 * @param staggerDelay Delay between consecutive children in seconds (default: 0.05)
 * @param delayChildren Initial delay before staggering begins in seconds (default: 0)
 */
export const createStaggerContainer = (staggerDelay = 0.05, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
});

/** Default stagger container (50ms gap) */
export const staggerContainer = createStaggerContainer(0.05);

/** Child item for stagger lists (cards, transaction rows, metrics) */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.editorial,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: TRANSITIONS.fast,
  },
};

// ------------------------------------------------------------
// 6. ACCORDION & COLLAPSE VARIANTS
// ------------------------------------------------------------

/** Smooth height collapse / expand for accordions and filters */
export const accordionContent: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: TRANSITIONS.default,
  },
  visible: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
    transition: TRANSITIONS.gentle,
  },
  exit: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: TRANSITIONS.default,
  },
};

// ------------------------------------------------------------
// 7. INTERACTIVE MICRO-INTERACTION PRESETS
// ------------------------------------------------------------

/** Financial card hover & click feedback */
export const cardHoverProps = {
  whileHover: {
    y: -3,
    transition: { duration: 0.2, ease: EASINGS.editorial },
  },
  whileTap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
} as const;

/** Interactive button press feedback */
export const buttonHoverProps = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
  whileTap: {
    scale: 0.97,
    transition: { duration: 0.08 },
  },
} as const;

/** Subtle pill/chip tap feedback */
export const pillHoverProps = {
  whileHover: {
    scale: 1.03,
    transition: { duration: 0.15 },
  },
  whileTap: {
    scale: 0.96,
  },
} as const;

// ------------------------------------------------------------
// 8. MOTION CONVENIENCE PROPS
// Spread directly onto <motion.div {...fadeUpMotionProps} />
// ------------------------------------------------------------

export const fadeUpMotionProps = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: fadeInUp,
} as const;

export const fadeInMotionProps = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: fadeIn,
} as const;

export const scaleInMotionProps = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: scaleIn,
} as const;
