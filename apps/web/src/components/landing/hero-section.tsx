'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  Clock,
  PiggyBank,
  QrCode,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { cn } from '@/libs/utils';

export function HeroSection() {
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(dashboardRef, { once: true, amount: 0.2 });

  // Numbers count up animation
  const [animatedInflow, setAnimatedInflow] = React.useState(0);
  const [animatedSpent, setAnimatedSpent] = React.useState(0);
  const [animatedSavings, setAnimatedSavings] = React.useState(0);
  const [animatedNetWorth, setAnimatedNetWorth] = React.useState(0);

  // Interactive Settle Demo State
  const [heroSplitSettled, setHeroSplitSettled] = React.useState(false);
  const [heroFriendsOwe, setHeroFriendsOwe] = React.useState(8400);

  React.useEffect(() => {
    if (!isInView) return;

    const duration = 1200;
    const startTime = performance.now();

    const targetNetWorth = 1842800;
    const targetInflow = 145000;
    const targetSpent = 68450;
    const targetSavings = 76550;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedNetWorth(Math.round(targetNetWorth * ease));
      setAnimatedInflow(Math.round(targetInflow * ease));
      setAnimatedSpent(Math.round(targetSpent * ease));
      setAnimatedSavings(Math.round(targetSavings * ease));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isInView]);

  const handleSimulateSettle = () => {
    if (heroSplitSettled) {
      setHeroSplitSettled(false);
      setHeroFriendsOwe(8400);
    } else {
      setHeroSplitSettled(true);
      setHeroFriendsOwe(5200); // 8400 - 3200
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-200 h-120 bg-primary/8 rounded-full blur-[110px] -z-10" />
      <div className="pointer-events-none absolute top-48 right-12 w-96 h-80 bg-accent/8 rounded-full blur-[90px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-4 py-1.5 text-caption font-semibold text-primary mb-6 shadow-2xs"
          >
            <span>Budgeting · Bill splitting · Wealth tracking, in one app</span>
          </motion.div>

          {/* Hero Headline Option A (Recommended) */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: 'easeOut' }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]"
          >
            Know where every rupee goes.{' '}
            <span className="block mt-1 sm:inline sm:mt-0 bg-linear-to-r from-primary via-emerald-600 to-accent bg-clip-text text-transparent">
              Then make it grow.
            </span>
          </motion.h1>

          {/* Subheadline (two lines) */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
            className="mt-6 text-body-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed"
          >
            Kalya sorts your salary into needs, wants and savings, splits bills with friends over
            UPI, and tracks your gold, stocks and net worth. All in one private place.
          </motion.p>

          {/* Buttons: Primary (filled) + Secondary (plain text link) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24, ease: 'easeOut' }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/auth/sign-up"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-linear-to-b from-[#145334] via-[#0d3e26] to-[#072617] px-7 py-3.5 text-body-md font-bold text-white shadow-[0_4px_16px_rgba(13,62,38,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-emerald-700/50 hover:from-[#175f3c] hover:to-[#0a331f] hover:shadow-[0_8px_24px_rgba(13,62,38,0.45),0_0_16px_rgba(184,145,46,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden dark:from-[#2e7d55] dark:via-[#1e583c] dark:to-[#133d28] dark:border-white/20"
            >
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                aria-hidden="true"
              />
              <span className="relative z-10 tracking-tight">Get Started Free</span>
              <span className="relative z-10 flex items-center justify-center h-6 w-6 rounded-lg bg-white/10 group-hover:bg-accent/25 transition-colors duration-200">
                <ArrowRight className="h-4 w-4 text-accent group-hover:text-white transition-all duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-3.5 px-5 text-body-md font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <span>See how it works</span>
              <span className="text-primary font-bold">↓</span>
            </a>
          </motion.div>

          {/* Trust badges directly under buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-caption font-medium text-text-muted"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Completely free for now
            </span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              No credit card
            </span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-accent" />
              No ads
            </span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="flex items-center gap-1.5 text-text-secondary font-semibold">
              Your data stays yours
            </span>
          </motion.div>
        </div>

        {/* ============================================================ */}
        {/* HERO PRODUCT VISUAL: Real Dashboard with Floating Chips      */}
        {/* ============================================================ */}
        <div ref={dashboardRef} className="mt-12 sm:mt-16 max-w-5xl mx-auto relative">
          {/* Floating Chips (desktop floating outside/top, mobile inside) */}
          <div className="hidden lg:block pointer-events-none">
            {/* Chip 1: Needs 48% (floating 8px on 5s loop) */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 z-20 px-3.5 py-2 rounded-xl bg-surface border border-primary/20 shadow-raised text-caption font-semibold text-text-primary flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Needs 48%</span>
              <span className="text-[11px] text-success font-bold font-numeric">Safe</span>
            </motion.div>

            {/* Chip 2: Rahul paid ₹3,200 (floating 8px on 6s loop) */}
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-7 right-8 z-20 px-3.5 py-2 rounded-xl bg-surface border border-accent/30 shadow-raised text-caption font-semibold text-text-primary flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>Rahul paid ₹3,200</span>
              <span className="text-[11px] text-accent font-bold font-numeric">UPI</span>
            </motion.div>

            {/* Chip 3: Goal on track (floating 8px on 7s loop) */}
            <motion.div
              animate={{ y: [-3, 5, -3] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-5 -right-4 z-20 px-3.5 py-2 rounded-xl bg-surface border border-success/30 shadow-raised text-caption font-semibold text-text-primary flex items-center gap-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span>Goal on track: Emergency Fund</span>
            </motion.div>
          </div>

          {/* Main Dashboard Card */}
          <div
            className="relative rounded-3xl border border-border/80 bg-surface p-4 sm:p-7 shadow-2xl shadow-black/8 backdrop-blur-xl"
            role="region"
            aria-label="Kalya dashboard showing monthly income, spending, savings and money friends owe you."
          >
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary shadow-inner shrink-0">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-numeric text-text-muted uppercase tracking-wider block font-semibold">
                    Consolidated Financial Overview
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="font-numeric text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                      {formatINR(animatedNetWorth)}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-caption font-bold text-success font-numeric bg-success-subtle px-2 py-0.5 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      Net Worth
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted italic block mt-0.5">
                    Sample data. Your numbers will look like this.
                  </span>
                </div>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-caption font-semibold text-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span>October Cycle</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-caption font-semibold text-text-secondary">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  <span>Spend Pace: Safe</span>
                </span>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 pb-5 border-b border-border/60">
              <div className="p-3.5 rounded-xl bg-surface-raised/60 border border-border/60">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Monthly Income
                </span>
                <div className="mt-1 font-numeric text-xl sm:text-2xl font-bold text-text-primary">
                  {formatINR(animatedInflow)}
                </div>
                <span className="text-caption text-success font-medium flex items-center gap-1 mt-0.5">
                  <ArrowUpRight className="h-3 w-3" /> Salary Credited
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-raised/60 border border-border/60">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Total Spending
                </span>
                <div className="mt-1 font-numeric text-xl sm:text-2xl font-bold text-text-primary">
                  {formatINR(animatedSpent)}
                </div>
                <span className="text-caption text-text-muted font-medium mt-0.5 block">
                  47.2% of Income
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-primary-subtle/50 border border-primary/20">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                  Net Savings
                </span>
                <div className="mt-1 font-numeric text-xl sm:text-2xl font-bold text-primary">
                  {formatINR(animatedSavings)}
                </div>
                <span className="text-caption font-bold text-success font-numeric mt-0.5 block">
                  52.8% Savings Rate
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-accent-subtle/40 border border-accent/20">
                <span className="text-[11px] font-semibold text-accent-strong uppercase tracking-wider block">
                  Friends Owe You
                </span>
                <div className="mt-1 font-numeric text-xl sm:text-2xl font-bold text-accent transition-all">
                  {formatINR(heroFriendsOwe)}
                </div>
                <span className="text-caption text-text-secondary font-medium mt-0.5 block">
                  {heroSplitSettled ? '1 pending split' : '2 pending splits'}
                </span>
              </div>
            </div>

            {/* 50/30/20 Budget Bar & Legend */}
            <div className="pt-5 space-y-4">
              <div className="flex items-center justify-between text-caption font-semibold text-text-secondary">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-primary" />
                  <span>50 / 30 / 20 Budget Distribution</span>
                </div>
                <span className="text-success font-numeric font-bold">Within Target Limits</span>
              </div>

              {/* Proportional Segment Bar */}
              <div className="h-3.5 w-full rounded-full bg-surface-raised overflow-hidden flex p-0.5 gap-1 border border-border/60">
                <div
                  style={{ width: '48%' }}
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  title="Needs: 48% (Target: 50%)"
                />
                <div
                  style={{ width: '26%' }}
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  title="Wants: 26% (Target: 30%)"
                />
                <div
                  style={{ width: '26%' }}
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  title="Savings: 26% (Target: 20%)"
                />
              </div>

              {/* 3 Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      <span className="text-caption font-semibold text-text-primary">
                        Needs (50%)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-success font-numeric">
                      Safe 48%
                    </span>
                  </div>
                  <div className="mt-1 font-numeric font-bold text-text-primary text-body-sm">
                    ₹42,800{' '}
                    <span className="text-caption text-text-muted font-normal">/ ₹50,000 cap</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                      <span className="text-caption font-semibold text-text-primary">
                        Wants (30%)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-accent font-numeric">
                      Amber 80%
                    </span>
                  </div>
                  <div className="mt-1 font-numeric font-bold text-text-primary text-body-sm">
                    ₹25,650{' '}
                    <span className="text-caption text-text-muted font-normal">/ ₹30,000 cap</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <span className="text-caption font-semibold text-text-primary">
                        Savings (20%)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 font-numeric">
                      On track
                    </span>
                  </div>
                  <div className="mt-1 font-numeric font-bold text-text-primary text-body-sm">
                    ₹76,550{' '}
                    <span className="text-caption text-text-muted font-normal">
                      SIP & Emergency
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Split Settlement simulation */}
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-raised border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-accent-subtle text-accent-strong flex items-center justify-center font-bold text-body-sm">
                    RS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-body-sm text-text-primary">
                        Rahul Sharma
                      </span>
                      <span className="text-caption px-2 py-0.5 rounded-full bg-primary-subtle text-primary font-bold">
                        Goa Villa Airbnb
                      </span>
                    </div>
                    <span className="text-caption text-text-secondary mt-0.5 block">
                      {heroSplitSettled
                        ? '✓ Settled via UPI · Transaction recorded in your ledger'
                        : 'Owes you ₹3,200 · Linked P2P split share'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateSettle}
                  className={cn(
                    'w-full sm:w-auto px-4 py-2 rounded-lg text-caption font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs',
                    heroSplitSettled
                      ? 'bg-surface border border-border text-text-muted hover:text-text-primary'
                      : 'bg-primary text-on-primary hover:bg-primary-hover'
                  )}
                >
                  {heroSplitSettled ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Reset Demo</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Simulate Settle ₹3,200</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
