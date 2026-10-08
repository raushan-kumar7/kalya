'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeftToLine, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/libs/utils';
import { EASINGS, TRANSITIONS } from '@/libs/animations';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/ui';

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: 0.06 + i * 0.08,
      ease: EASINGS.editorial,
    },
  }),
};

export interface AuthLayoutClientProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Kalya Luxury Authentication Client Layout
 *
 * Implements a split-screen financial experience:
 * - Left: Editorial brand showcase featuring mathematical equilibrium curves,
 *   subtle graph grid, and Kalya's core value pillars.
 * - Right: Focused, accessible form canvas with ambient warmth, responsive theme toggle,
 *   and instant navigation.
 */
export function AuthLayoutClient({ children, className }: AuthLayoutClientProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main
      className={cn(
        'relative grid min-h-screen w-full grid-cols-1 overflow-x-hidden bg-bg lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.25fr)]',
        className
      )}
    >
      {/* ======================================================== */}
      {/* LEFT — Editorial Brand Panel (Hidden on screens < lg)     */}
      {/* ======================================================== */}
      <section
        aria-label="Kalya Financial Overview"
        className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-on-primary lg:flex xl:p-14 select-none"
      >
        {/* Background Visual Motifs */}
        <GrowGrid reduceMotion={reduceMotion} />
        <EquilibriumLine reduceMotion={reduceMotion} />

        {/* Top Brand Lockup */}
        <header className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Kalya — Return to homepage"
            className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Image
              src="/kalya_logo_white1.png"
              alt="Kalya"
              width={160}
              height={38}
              priority
              style={{ width: 'auto' }}
              className="h-9 w-auto object-contain transition-opacity duration-200 hover:opacity-90"
            />
          </Link>

          <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border border-on-primary/15 bg-on-primary/10 px-3 py-1 text-[11px] font-semibold tracking-brand text-accent">
            FINANCIAL EQUILIBRIUM
          </span>
        </header>

        {/* Center Editorial Hero & Pillars */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-10">
          <motion.div
            className="w-full max-w-lg text-center"
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            variants={fadeUpVariants}
            custom={0}
          >
            <p className="eyebrow mb-3 text-caption font-semibold tracking-brand text-accent">
              कल्य · KALYA
            </p>
            <h1 className="font-display text-display-md xl:text-display-lg font-light leading-[1.14] text-balance text-on-primary">
              Your financial fitness,{' '}
              <span className="font-semibold text-accent">at a glance.</span>
            </h1>
            <p className="mt-4 max-w-md mx-auto font-body text-body-sm xl:text-body-md text-on-primary/75 leading-relaxed text-balance">
              Income, expenses, net worth, investments, and retirement — consolidated into one calm,
              intelligent ledger.
            </p>
          </motion.div>

          {/* Triad of Value Pillars */}
          <ul className="mt-10 w-full max-w-md space-y-4">
            <PillarRow
              index={1}
              label="Daily fitness"
              detail="Automated cash flows, expense categorizations, and real-time ledger sync without manual spreadsheets."
              reduceMotion={reduceMotion}
            />
            <PillarRow
              index={2}
              label="The balance"
              detail="Holistic visibility across assets, debts, and liquid reserves, maintained in perpetual equilibrium."
              reduceMotion={reduceMotion}
            />
            <PillarRow
              index={3}
              label="Ready for tomorrow"
              detail="Retirement models, tax-advantaged accounts, and wealth trajectory forecasts tailored to your milestones."
              reduceMotion={reduceMotion}
            />
          </ul>
        </div>

        {/* Left Footer Info */}
        <footer className="relative z-10 flex items-center justify-between font-body text-caption text-on-primary/60">
          <span>© {new Date().getFullYear()} Kalya Technologies Inc.</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-on-primary/80">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>Bank-grade 256-bit encryption</span>
          </span>
        </footer>
      </section>

      {/* ======================================================== */}
      {/* RIGHT — Focused Form Canvas & Controls                    */}
      {/* ======================================================== */}
      <section
        aria-label="Account Authentication"
        className="relative flex min-h-screen flex-col justify-between overflow-y-auto overflow-x-hidden bg-surface px-6 py-8 sm:px-12 md:px-16 lg:px-14 xl:px-20"
      >
        <AmbientAccent reduceMotion={reduceMotion} />

        {/* Top Utility Bar: Navigation & Theme Toggle */}
        <header className="relative z-20 flex w-full items-center justify-between">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={TRANSITIONS.editorial}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-sm font-body text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeftToLine
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              <span>Back to home</span>
            </Link>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={TRANSITIONS.editorial}
          >
            <ThemeToggle size="sm" />
          </motion.div>
        </header>

        {/* Form Body Container */}
        <div className="relative z-10 mx-auto my-auto w-full max-w-md py-8 sm:max-w-2xl">
          {/* Mobile-Only Wordmark */}
          <motion.div
            className="mb-8 flex justify-center lg:hidden"
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            variants={fadeUpVariants}
            custom={0}
          >
            <Logo size="lg" href="/" priority />
          </motion.div>

          {/* Page View Slot */}
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            variants={fadeUpVariants}
            custom={1}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Right Footer Legal & Trust Signals */}
        <motion.footer
          className="relative z-10 mx-auto mt-6 w-full max-w-md text-center"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASINGS.editorial }}
        >
          <div className="mx-auto mb-4 h-px w-12 border-t border-border" aria-hidden="true" />

          {/* Mobile Trust Signal */}
          <p className="mb-2.5 flex items-center justify-center gap-1.5 font-body text-caption text-text-muted lg:hidden">
            <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Bank-grade 256-bit encryption</span>
          </p>

          <p className="flex items-center justify-center gap-2 font-body text-caption text-text-muted">
            <Link
              href="/terms"
              className="rounded-xs transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              Terms of Service
            </Link>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <Link
              href="/privacy"
              className="rounded-xs transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <Link
              href="/security"
              className="rounded-xs transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              Security
            </Link>
          </p>
        </motion.footer>
      </section>
    </main>
  );
}

/**
 * Pillar card row highlighting a key value proposition.
 */
function PillarRow({
  label,
  detail,
  index,
  reduceMotion,
}: {
  label: string;
  detail: string;
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.li
      className="group relative flex items-start gap-3.5 rounded-xl border border-on-primary/10 bg-on-primary/4 p-3.5 transition-colors duration-200 hover:border-on-primary/20 hover:bg-on-primary/[0.07]"
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      variants={fadeUpVariants}
      custom={index}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/20 text-accent">
        <LeafEmblem className="h-3.5 w-3.5" />
      </span>
      <div className="flex flex-col">
        <p className="font-body text-body-sm font-semibold tracking-tight text-on-primary">
          {label}
        </p>
        <p className="mt-0.5 font-body text-[13px] leading-relaxed text-on-primary/70">{detail}</p>
      </div>
    </motion.li>
  );
}

/**
 * Subtle mathematical grid texture evoking a financial ledger canvas.
 */
function GrowGrid({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      initial={reduceMotion ? { opacity: 0.05 } : { opacity: 0, scale: 1.05 }}
      animate={{ opacity: 0.06, scale: 1 }}
      transition={{ duration: 1.5, ease: EASINGS.editorial }}
    >
      <defs>
        <pattern id="kalya-auth-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--on-primary)" strokeWidth="1" />
        </pattern>
        <radialGradient id="kalya-auth-fade" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0.2" />
        </radialGradient>
        <mask id="kalya-auth-grid-mask">
          <rect width="100%" height="100%" fill="url(#kalya-auth-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#kalya-auth-grid)"
        mask="url(#kalya-auth-grid-mask)"
      />
    </motion.svg>
  );
}

/**
 * Signature financial trajectory and balance curve drawing itself into equilibrium on mount.
 */
function EquilibriumLine({ reduceMotion }: { reduceMotion: boolean | null }) {
  const points: Array<[number, number]> = [
    [200, 560],
    [420, 420],
    [660, 180],
  ];

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.11]"
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <motion.path
        d="M -40 620 C 60 560, 120 660, 200 560 S 340 380, 420 420 S 560 260, 660 180"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
        initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, delay: 0.15, ease: EASINGS.editorial }}
      />
      <path
        d="M -40 620 C 60 560, 120 660, 200 560 S 340 380, 420 420 S 560 260, 660 180"
        stroke="var(--on-primary)"
        strokeWidth="1"
        strokeOpacity="0.35"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
      {points.map(([cx, cy], i) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="3.5"
          fill="var(--accent)"
          initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.45,
            delay: 0.5 + i * 0.35,
            ease: EASINGS.editorial,
          }}
        />
      ))}
    </svg>
  );
}

/**
 * Ambient warmth backdrop lights on the form canvas.
 */
function AmbientAccent({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: EASINGS.editorial }}
    >
      <div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-[0.06] blur-3xl dark:opacity-[0.08]"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="absolute -bottom-36 -left-36 h-96 w-96 rounded-full opacity-[0.05] blur-3xl dark:opacity-[0.08]"
        style={{ background: 'var(--primary)' }}
      />
    </motion.div>
  );
}

/**
 * Geometric Kalya leaf emblem.
 */
function LeafEmblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 16c0-6.5 4.5-11 12-11 0 7.5-4.5 11-12 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4 16 13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
