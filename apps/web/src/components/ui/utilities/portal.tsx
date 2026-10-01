'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { fadeIn, TRANSITIONS } from '@/libs/animations';

export interface PortalProps {
  /** The children to render into the target DOM container */
  children: React.ReactNode;
  /** Optional container element. Defaults to document.body */
  container?: Element | DocumentFragment | null;
  /** Optional key for identity */
  key?: string | null;
  /** Whether to animate mounting with Framer Motion */
  animated?: boolean;
}

/**
 * SSR-safe Portal utility for mounting floating menus, dialogs, and popovers.
 */
export function Portal({ children, container, animated = false }: PortalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) {
    return null;
  }

  const content = animated ? (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        transition={TRANSITIONS.fast}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  ) : (
    children
  );

  return createPortal(content, target);
}

Portal.displayName = 'Portal';
