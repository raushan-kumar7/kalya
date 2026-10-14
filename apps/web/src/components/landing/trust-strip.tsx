'use client';

import * as React from 'react';
import { motion, useInView } from 'framer-motion';

export function TrustStrip() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.25 });

  // Count up for card 2 (4 ways to split)
  const [splitCount, setSplitCount] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setSplitCount(current);
      if (current >= 4) {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section
      ref={containerRef}
      className="border-y border-border/80 bg-surface-raised/40 py-10 sm:py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: ₹0 with soft gold glow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="p-5 sm:p-6 rounded-2xl border border-border/70 bg-surface shadow-xs flex flex-col justify-between"
          >
            <div className="relative inline-block">
              <span className="font-numeric text-3xl sm:text-4xl font-extrabold text-accent tracking-tight drop-shadow-[0_2px_12px_rgba(184,145,46,0.35)]">
                ₹0
              </span>
            </div>
            <p className="mt-2 text-caption sm:text-body-sm font-medium text-text-secondary leading-snug">
              Ads, data selling or hidden fees on Kalya
            </p>
          </motion.div>

          {/* Card 2: 4 Ways to split (counts up) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="p-5 sm:p-6 rounded-2xl border border-border/70 bg-surface shadow-xs flex flex-col justify-between"
          >
            <div>
              <span className="font-numeric text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
                {splitCount}
              </span>
            </div>
            <p className="mt-2 text-caption sm:text-body-sm font-medium text-text-secondary leading-snug">
              Ways to split a bill: equal, percentage, shares, exact
            </p>
          </motion.div>

          {/* Card 3: 0 Bank passwords needed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="p-5 sm:p-6 rounded-2xl border border-border/70 bg-surface shadow-xs flex flex-col justify-between"
          >
            <div>
              <span className="font-numeric text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                0
              </span>
            </div>
            <p className="mt-2 text-caption sm:text-body-sm font-medium text-text-secondary leading-snug">
              Bank passwords needed. You add your own entries
            </p>
          </motion.div>

          {/* Card 4: 50/30/20 with animated colored segments */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="p-5 sm:p-6 rounded-2xl border border-border/70 bg-surface shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="font-numeric text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                50/30/20
              </span>
              {/* Drawing three colored segments from left to right over 600ms */}
              <div className="h-2 w-full rounded-full bg-surface-raised overflow-hidden flex gap-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '50%' } : {}}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="h-full bg-primary rounded-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '30%' } : {}}
                  transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
                  className="h-full bg-accent rounded-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '20%' } : {}}
                  transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </div>
            </div>
            <p className="mt-2 text-caption sm:text-body-sm font-medium text-text-secondary leading-snug">
              Budget set up automatically when you log your salary
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
