'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Home, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Icon } from '@/components/shared/logo';
import { staggerContainer, staggerItem } from '@/libs/animations';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log exception to monitoring telemetry
    console.error('[Kalya Error Boundary Catch]:', error);
  }, [error]);

  const handleCopyDigest = async () => {
    if (!error.digest) return;
    try {
      await navigator.clipboard.writeText(error.digest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error digest:', err);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg px-4 py-12 sm:px-6">
      {/* Ambient danger/alert ambient backdrop glows */}
      <div
        className="pointer-events-none absolute -top-48 -left-48 h-128 w-lg rounded-full bg-danger/5 blur-3xl dark:bg-danger/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-48 h-128 w-lg rounded-full bg-warning/5 blur-3xl dark:bg-warning/10"
        aria-hidden="true"
      />

      <motion.div
        variants={staggerContainer}
        initial={reduceMotion ? false : 'hidden'}
        animate="visible"
        className="relative z-10 flex w-full max-w-lg flex-col items-center"
      >
        {/* Main Glass Surface Card */}
        <div className="relative w-full rounded-2xl border border-border/80 bg-surface/90 p-8 shadow-raised backdrop-blur-xl sm:p-10 dark:border-border dark:bg-surface/85">
          {/* Top Error Icon Badge */}
          <motion.div variants={staggerItem} className="flex justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-danger/30 bg-danger-subtle shadow-card text-danger">
              <AlertTriangle className="h-8 w-8 stroke-[2.2]" aria-hidden="true" />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-border shadow-xs">
                <Icon size="xs" priority className="h-3.5 w-3.5" />
              </div>
            </div>
          </motion.div>

          {/* Heading and Description */}
          <motion.div
            variants={staggerItem}
            className="mt-6 flex flex-col items-center text-center"
          >
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-danger-subtle px-3 py-1 text-caption font-semibold text-danger border border-danger/25">
              <span>UNEXPECTED INTERRUPTION</span>
            </span>

            <h1 className="mt-3 font-display text-display-md font-bold tracking-tight text-text-primary sm:text-display-lg">
              We hit a snag
            </h1>

            <p className="mt-2.5 max-w-sm text-body-sm leading-relaxed text-text-secondary sm:text-body-md">
              An unexpected system exception occurred. Your account and ledger transactions remain
              safe and intact.
            </p>
          </motion.div>

          {/* Error Digest & Diagnostics Panel */}
          {error.digest && (
            <motion.div
              variants={staggerItem}
              className="mt-6 flex items-center justify-between rounded-lg border border-border/80 bg-surface-raised/70 px-3.5 py-2"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Incident Reference
                </span>
                <span className="font-numeric text-caption font-medium text-text-primary select-all">
                  {error.digest}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyDigest}
                aria-label="Copy incident reference to clipboard"
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface px-2.5 py-1 text-caption font-medium text-text-secondary shadow-xs transition-colors hover:bg-surface-raised cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span className="text-success font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-text-muted" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Developer / Support Technical Diagnostics Accordion */}
          {process.env.NODE_ENV !== 'production' && error.message && (
            <motion.div variants={staggerItem} className="mt-3">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="flex w-full items-center justify-between text-[11px] font-medium text-text-muted hover:text-text-secondary transition-colors py-1 cursor-pointer"
              >
                <span>Technical Diagnostics (Dev Mode)</span>
                {showDetails ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              {showDetails && (
                <div className="mt-1.5 max-h-36 overflow-auto rounded-md bg-surface-raised border border-border p-3 font-numeric text-[11px] text-danger leading-relaxed select-all">
                  {error.message}
                </div>
              )}
            </motion.div>
          )}

          {/* Primary Action Buttons */}
          <motion.div
            variants={staggerItem}
            className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-center"
          >
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-body-sm font-medium text-text-primary shadow-card transition-colors hover:bg-surface-raised"
            >
              <Home className="h-4 w-4" />
              <span>Go to Home</span>
            </Link>

            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-body-sm font-semibold text-on-primary shadow-card transition-colors hover:bg-primary-hover cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </motion.div>
        </div>

        {/* Footer Brand Tagline */}
        <motion.p
          variants={staggerItem}
          className="eyebrow mt-6 text-center text-[10px] tracking-brand text-text-muted"
        >
          KALYA • FINANCIAL SECURITY & INTEGRITY
        </motion.p>
      </motion.div>
    </main>
  );
}
