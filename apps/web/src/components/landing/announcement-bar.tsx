'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function AnnouncementBar() {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="Announcement"
          initial={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="relative z-50 border-b border-border/70 bg-surface-raised/95 backdrop-blur-md px-4 py-2 text-text-secondary text-caption overflow-hidden"
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="font-semibold text-text-primary">
                Kalya is completely free for now. No credit card, no ads.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setVisible(false)}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer shrink-0"
              aria-label="Close announcement"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
