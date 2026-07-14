"use client";

import { ArrowLeftToLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Metadata } from "next";
import { ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, delay: 0.08 + i * 0.09, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const metadata: Metadata = {
  title: "Authentication", // fallback if a page below forgets to set one
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export function AuthLayoutClient({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="grid min-h-screen grid-cols-1 font-mono lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Left — brand panel */}
      <div className="bg-primary relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <GrowGrid reduceMotion={reduceMotion} />
        <EquilibriumLine reduceMotion={reduceMotion} />

        {/* Logo */}
        <div className="relative z-10 -mt-18 mb-8 ml-40 w-full max-w-lg">
          <Image
            src="/kalya_logo.png"
            alt="Kalya"
            width={500}
            height={300}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        {/* Headline + pillars */}
        <div className="relative z-10 -mt-48 flex flex-1 flex-col items-center justify-center gap-10 py-12">
          <motion.div
            className="max-w-md text-center"
            initial={reduceMotion ? undefined : "hidden"}
            animate={reduceMotion ? undefined : "show"}
            variants={fadeUp}
            custom={0}
          >
            <p className="font-body text-body-sm text-accent mb-3 tracking-wide">कल्य · kalya</p>
            <h1 className="font-display text-display-lg text-on-primary leading-[1.15] font-light text-balance">
              Your financial fitness, at a glance.
            </h1>
            <p className="font-body text-body-md text-on-primary/70 mx-auto mt-4 max-w-sm text-balance">
              Income, assets, liabilities, insurance, and retirement — one calm dashboard, always in
              sync.
            </p>
          </motion.div>

          <ul className="w-full max-w-md space-y-5">
            <PillarRow
              index={1}
              label="Daily fitness"
              detail="Track income, expenses, and budgets without the spreadsheet grind."
              reduceMotion={reduceMotion}
            />
            <PillarRow
              index={2}
              label="The balance"
              detail="See assets and liabilities side by side, always in equilibrium."
              reduceMotion={reduceMotion}
            />
            <PillarRow
              index={3}
              label="Ready for tomorrow"
              detail="EPF, PPF, NPS, and insurance — consolidated and current."
              reduceMotion={reduceMotion}
            />
          </ul>
        </div>

        {/* Footer */}
        <div className="font-body text-caption text-on-primary/50 relative z-10 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Kalya. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Bank-grade encryption
          </span>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="bg-surface relative flex flex-col justify-center overflow-hidden px-6 sm:px-16 lg:px-24 xl:px-32">
        <AmbientAccent reduceMotion={reduceMotion} />

        {/* Back to home */}
        <motion.div
          className="absolute top-6 left-6 z-10 sm:top-8 sm:left-8 lg:left-24 xl:left-32"
          initial={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/"
            className="font-body text-body-sm text-text-secondary hover:text-text-primary focus-visible:ring-accent group inline-flex items-center gap-1.5 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeftToLine
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Back to home
          </Link>
        </motion.div>

        <div className="relative z-10 mx-auto w-full max-w-xl">
          {/* Mobile-only wordmark, since the brand panel is hidden below lg */}
          <motion.div
            className="mb-10 flex justify-center lg:hidden"
            initial={reduceMotion ? undefined : "hidden"}
            animate={reduceMotion ? undefined : "show"}
            variants={fadeUp}
            custom={0}
          >
            <Image
              src="/kalya_logo.png"
              alt="Kalya"
              width={180}
              height={60}
              priority
              className="h-auto w-40 object-contain"
            />
          </motion.div>

          <motion.div
            initial={reduceMotion ? undefined : "hidden"}
            animate={reduceMotion ? undefined : "show"}
            variants={fadeUp}
            custom={1}
          >
            {children}
          </motion.div>
        </div>

        {/* Footer — pinned to the bottom, centered */}
        <motion.footer
          className="relative z-10 mx-auto mt-12 w-full max-w-md text-center"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="border-border mx-auto mb-5 h-px w-12 border-t" aria-hidden="true" />

          {/* Mobile-only trust signal — mirrors the left panel's encryption note, */}
          {/* which is hidden below lg and would otherwise never be seen. */}
          <p className="font-body text-caption text-text-muted mb-3 flex items-center justify-center gap-1.5 lg:hidden">
            <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Bank-grade encryption
          </p>

          <p className="font-body text-caption text-text-muted flex items-center justify-center gap-2">
            <Link
              href="/terms"
              className="hover:text-text-secondary focus-visible:ring-accent rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Terms of Service
            </Link>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <Link
              href="/privacy"
              className="hover:text-text-secondary focus-visible:ring-accent rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Privacy Policy
            </Link>
          </p>
        </motion.footer>
      </div>
    </main>
  );
}

/** One line of the fitness / balance / readiness triad — a small accent mark, a label, a detail. */
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
      className="flex gap-3.5"
      initial={reduceMotion ? undefined : "hidden"}
      animate={reduceMotion ? undefined : "show"}
      variants={fadeUp}
      custom={index}
    >
      <span className="mt-0.5 shrink-0">
        <LeafIcon className="text-accent h-4 w-4" />
      </span>
      <span>
        <p className="font-body text-body-sm text-on-primary font-medium">{label}</p>
        <p className="font-body text-body-sm text-on-primary/60 mt-0.5">{detail}</p>
      </span>
    </motion.li>
  );
}

/**
 * Graph-paper grid, ambient behind the equilibrium line. Ties the panel to the "dashboard"
 * language in the copy — a light structural texture, not decoration. Fades and eases down
 * from a slight scale on mount so it settles into place rather than popping in.
 */
function GrowGrid({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      initial={reduceMotion ? { opacity: 0.05 } : { opacity: 0, scale: 1.08 }}
      animate={{ opacity: 0.05, scale: 1 }}
      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <defs>
        <pattern id="kalya-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--on-primary)" strokeWidth="1" />
        </pattern>
        <radialGradient id="kalya-grid-fade" cx="30%" cy="20%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0.25" />
        </radialGradient>
        <mask id="kalya-grid-mask">
          <rect width="100%" height="100%" fill="url(#kalya-grid-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#kalya-grid)" mask="url(#kalya-grid-mask)" />
    </motion.svg>
  );
}

/**
 * Signature background motif — a single equity/fitness curve drawing itself in on load.
 * Ties directly to the panel's thesis ("financial fitness, at a glance" / "always in
 * equilibrium") instead of decorative, unrelated linework. Kept faint (9% opacity) so it
 * never competes with the copy in front of it.
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
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]"
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <motion.path
        d="M -40 620 C 60 560, 120 660, 200 560 S 340 380, 420 420 S 560 260, 660 180"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <path
        d="M -40 620 C 60 560, 120 660, 200 560 S 340 380, 420 420 S 560 260, 660 180"
        stroke="var(--on-primary)"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
      {points.map(([cx, cy], i) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="3"
          fill="var(--accent)"
          initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.55 + i * 0.42, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </svg>
  );
}

/**
 * Right-panel counterpart to the left brand motif — two soft, blurred accent blobs
 * anchored to opposite corners. Kept extremely faint so it reads as ambient warmth
 * behind the form rather than as its own element, and gives the panel the same
 * quiet "designed" quality as the brand side without borrowing its grid or curve.
 */
function AmbientAccent({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="bg-accent absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--primary)" }}
      />
    </motion.div>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 16c0-6.5 4.5-11 12-11 0 7.5-4.5 11-12 11Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M4 16 13 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
