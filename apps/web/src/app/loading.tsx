'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon } from '@/components/shared/logo';
import { EASINGS } from '@/libs/animations';

export default function Loading() {
  const reduceMotion = useReducedMotion();

  return (
    <main
      role="status"
      aria-label="Loading Kalya financial application"
      aria-live="polite"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg px-6 select-none"
    >
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl dark:bg-accent/10"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Brand Emblem & Concentric Wave Rings */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Outer gentle breathing pulse ring */}
          {!reduceMotion && (
            <motion.span
              className="absolute inset-0 rounded-full border border-primary/25 bg-primary-subtle/40 dark:border-primary/30 dark:bg-primary-subtle/20"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 0.25, 0.6],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: EASINGS.easeInOutCubic,
              }}
              aria-hidden="true"
            />
          )}

          {/* Inner core badge */}
          <motion.div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border/80 bg-surface/90 shadow-card backdrop-blur-md dark:border-border"
            animate={
              !reduceMotion
                ? {
                    scale: [1, 1.04, 1],
                  }
                : undefined
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: EASINGS.easeInOutCubic,
            }}
          >
            <Icon size="md" priority className="h-8 w-8" />
          </motion.div>
        </div>

        {/* Brand Lockup */}
        <div className="mt-5 flex flex-col items-center gap-1.5 text-center">
          <span className="eyebrow text-[10px] font-bold tracking-brand text-accent-strong dark:text-accent">
            KALYA
          </span>
          <p className="text-body-sm font-medium text-text-secondary">
            Preparing your financial space…
          </p>
        </div>

        {/* Luxury Linear Shimmer Bar */}
        <div className="mt-5 h-1 w-36 overflow-hidden rounded-full bg-border/70">
          {!reduceMotion ? (
            <motion.div
              className="h-full w-1/2 rounded-full bg-linear-to-r from-primary/30 via-accent to-primary/30"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ) : (
            <div className="h-full w-full bg-primary" />
          )}
        </div>
      </div>
    </main>
  );
}
