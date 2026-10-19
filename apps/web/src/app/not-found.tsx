'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Home, Compass, ShieldAlert } from 'lucide-react';
import { Icon } from '@/components/shared/logo';
import { staggerContainer, staggerItem } from '@/libs/animations';

export default function NotFound() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg px-4 py-12 sm:px-6">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-48 -left-48 h-128 w-lg rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-48 h-128 w-lg rounded-full bg-accent/5 blur-3xl dark:bg-accent/10"
        aria-hidden="true"
      />

      {/* Large watermark 404 backdrop */}
      <div
        className="pointer-events-none absolute select-none font-display text-[15rem] sm:text-[22rem] font-black tracking-tighter text-text-primary/3 dark:text-text-primary/4"
        aria-hidden="true"
      >
        404
      </div>

      <motion.div
        variants={staggerContainer}
        initial={reduceMotion ? false : 'hidden'}
        animate="visible"
        className="relative z-10 flex w-full max-w-lg flex-col items-center"
      >
        {/* Main Glass Surface Card */}
        <div className="relative w-full rounded-2xl border border-border/80 bg-surface/90 p-8 shadow-raised backdrop-blur-xl sm:p-10 dark:border-border dark:bg-surface/85">
          {/* Top Brand Lockup / Icon Badge */}
          <motion.div variants={staggerItem} className="flex justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-raised shadow-card">
              <Icon size="md" priority className="h-8 w-8" />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent text-[10px] font-bold shadow-sm">
                ?
              </span>
            </div>
          </motion.div>

          {/* Heading and Copy */}
          <motion.div
            variants={staggerItem}
            className="mt-6 flex flex-col items-center text-center"
          >
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-3 py-1 text-caption font-semibold text-primary">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>404 — UNCHARTED ROUTE</span>
            </span>

            <h1 className="mt-3 font-display text-display-md font-bold tracking-tight text-text-primary sm:text-display-lg">
              Page Not Found
            </h1>

            <p className="mt-2.5 max-w-sm text-body-sm leading-relaxed text-text-secondary sm:text-body-md">
              The page or resource you requested could not be located. It may have been relocated,
              archived, or never existed.
            </p>
          </motion.div>

          {/* Quick Helpful Nav Links */}
          <motion.div
            variants={staggerItem}
            className="mt-6 rounded-xl border border-border/70 bg-surface-raised/60 p-4"
          >
            <p className="text-caption font-medium text-text-muted text-center mb-2.5">
              Looking for something specific?
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/"
                className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 font-medium text-text-primary shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-raised"
              >
                <Home className="h-3.5 w-3.5 text-primary" />
                <span>Home Page</span>
              </Link>
              <Link
                href="/auth"
                className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 font-medium text-text-primary shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-raised"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-accent-strong" />
                <span>Account Access</span>
              </Link>
            </div>
          </motion.div>

          {/* Primary Action Buttons */}
          <motion.div
            variants={staggerItem}
            className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-center"
          >
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-body-sm font-medium text-text-primary shadow-card transition-colors hover:bg-surface-raised cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>

            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-body-sm font-semibold text-on-primary shadow-card transition-colors hover:bg-primary-hover"
            >
              <Home className="h-4 w-4" />
              <span>Return Home</span>
            </Link>
          </motion.div>
        </div>

        {/* Footer Brand Tagline */}
        <motion.p
          variants={staggerItem}
          className="eyebrow mt-6 text-center text-[10px] tracking-brand text-text-muted"
        >
          KALYA • READY FOR TOMORROW.
        </motion.p>
      </motion.div>
    </main>
  );
}
