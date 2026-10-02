'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  ArrowRight,
  Sparkles,
  PieChart,
  Zap,
  Lock,
  Layers,
  CheckCircle2,
  ChevronDown,
  BarChart3,
  Wallet,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sliders,
  DollarSign,
  Percent,
  Calendar as CalendarIcon,
  Check,
  Star,
  Users,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { ThemeToggle } from '@/components/ui/utilities/theme-toggle';
import { useTheme } from 'next-themes';

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// ============================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Compound Calculator State
  const [monthlyInvest, setMonthlyInvest] = React.useState<number>(25000);
  const [expectedReturn, setExpectedReturn] = React.useState<number>(12);
  const [horizonYears, setHorizonYears] = React.useState<number>(15);

  // Billing Toggle State (Monthly vs Annual)
  const [annualBilling, setAnnualBilling] = React.useState<boolean>(true);

  // FAQ Open State
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  // Email CTA State
  const [emailInput, setEmailInput] = React.useState('');
  const [emailSubmitted, setEmailSubmitted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // SIP Compound Wealth Calculation
  const calculation = React.useMemo(() => {
    const P = monthlyInvest;
    const i = expectedReturn / 12 / 100;
    const n = horizonYears * 12;
    const totalInvested = P * n;
    // Compound formula for monthly annuity: M = P * [((1 + i)^n - 1) / i] * (1 + i)
    const futureValue = i > 0 ? P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i)) : totalInvested;
    const wealthCreated = Math.max(0, futureValue - totalInvested);

    return {
      totalInvested: Math.round(totalInvested),
      wealthCreated: Math.round(wealthCreated),
      futureValue: Math.round(futureValue),
    };
  }, [monthlyInvest, expectedReturn, horizonYears]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailSubmitted(true);
    setTimeout(() => {
      setEmailSubmitted(false);
      setEmailInput('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-body antialiased selection:bg-primary-subtle selection:text-primary">
      {/* ============================================================ */}
      {/* 1. TOP SYSTEM DIAGNOSTIC / ANNOUNCEMENT BANNER                */}
      {/* ============================================================ */}
      <aside
        aria-label="Announcement banner"
        className="relative z-50 border-b border-border/80 bg-surface-raised/90 backdrop-blur-md px-4 py-2 text-text-secondary text-caption flex items-center justify-between"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="font-semibold text-text-primary">
              Kalya 2.0 Sovereign Wealth Engine
            </span>
            <span className="hidden sm:inline text-text-muted">·</span>
            <span className="hidden sm:inline text-text-muted">
              Live automated SIP rebalancing & tax-loss harvesting
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#calculator"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline transition-colors"
            >
              <span>Simulate Returns</span>
              <ArrowRight className="h-3 w-3" />
            </a>
            <span className="text-text-muted">|</span>
            <ThemeToggle size="sm" variant="ghost" className="h-6 w-6 p-0" />
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN NAVIGATION HEADER                                    */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs ring-1 ring-border group-hover:scale-105 transition-transform">
                <Image
                  src="/kalya_icon1.png"
                  alt="Kalya"
                  fill
                  sizes="32px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold tracking-tight text-text-primary leading-none">
                  kalya
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-accent mt-0.5">
                  READY FOR TOMORROW.
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-body-sm font-medium text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">
              Features
            </a>
            <a href="#wealth-engine" className="hover:text-text-primary transition-colors">
              Wealth Engine
            </a>
            <a href="#calculator" className="hover:text-text-primary transition-colors">
              Calculator
            </a>
            <a href="#security" className="hover:text-text-primary transition-colors">
              Security
            </a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-text-primary transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/auth/sign-in"
              className="text-body-sm font-semibold text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
            >
              Sign In
            </a>
            <a
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4.5 py-2 text-body-sm font-bold text-on-primary shadow-sm shadow-primary/20 hover:bg-primary-hover hover:shadow-md transition-all active:scale-97 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle size="sm" variant="ghost" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:bg-surface-raised"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-b border-border bg-surface px-4 py-5 space-y-4"
            >
              <div className="flex flex-col gap-3 font-medium text-body-md text-text-secondary">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Features
                </a>
                <a
                  href="#wealth-engine"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Wealth Engine
                </a>
                <a
                  href="#calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Compound Calculator
                </a>
                <a
                  href="#security"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Security & Vault
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </a>
              </div>
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <a
                  href="#get-started"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-primary py-3 text-body-sm font-bold text-on-primary shadow-sm"
                >
                  Get Started Free
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================ */}
      {/* 3. HERO SECTION (Atmospheric Glow + High Impact Architecture) */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Soft Background Atmospheric Gradients */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-200 h-125 bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="pointer-events-none absolute top-40 right-10 w-112.5 h-87.5 bg-accent/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            {/* Pill Tag */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1.5 text-caption font-semibold text-primary mb-6 shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Next-Gen Sovereign Wealth Intelligence</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-secondary">Designed for High Compounding</span>
            </motion.div>

            {/* Hero Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]"
            >
              Cultivate Enduring Wealth.{' '}
              <span className="bg-linear-to-r from-primary via-emerald-600 to-accent bg-clip-text text-transparent">
                Master Your Complete Financial Life.
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-body-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed"
            >
              A unified wealth operating system. Track real-time net worth across global equities,
              sovereign gold, debt, and real estate. Automate disciplined SIP rebalancing and
              harvest tax losses.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
            >
              <a
                href="#get-started"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-primary/90 px-7 py-3.5 text-body-md font-bold text-on-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-95 transition-all active:scale-97 cursor-pointer"
              >
                <span>Start Your Wealth Mandate</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </a>

              <a
                href="#wealth-engine"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-body-md font-semibold text-text-primary shadow-xs hover:bg-surface-raised transition-all active:scale-97"
              >
                <Sliders className="h-4.5 w-4.5 text-accent" />
                <span>Explore Architecture</span>
              </a>
            </motion.div>

            {/* Trust Micro-Badges */}
            <motion.div
              variants={fadeInUp}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-caption font-medium text-text-muted"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Bank-grade 256-bit encryption
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-accent" />
                Hardware HSM enclave security
              </span>
            </motion.div>
          </motion.div>

          {/* ============================================================ */}
          {/* INTERACTIVE HERO DASHBOARD MOCKUP                            */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="mt-14 sm:mt-18 max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl border border-border/80 bg-surface p-4 sm:p-7 shadow-2xl shadow-black/10 backdrop-blur-xl">
              {/* Mockup Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-caption font-numeric text-text-muted uppercase tracking-wider block font-semibold">
                      Consolidated Portfolio Ledger
                    </span>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                        ₹48,25,920
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-caption font-bold text-success font-numeric bg-success-subtle px-2 py-0.5 rounded-full">
                        <TrendingUp className="h-3 w-3" />
                        +14.82% YoY
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live System Diagnostics */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-caption font-semibold text-text-secondary">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span>Sync: NSDL / CDSL Depository</span>
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-caption font-semibold text-text-secondary">
                    <Clock className="h-3.5 w-3.5 text-accent" />
                    <span>Next Auto-Rebalance: In 4 Days</span>
                  </span>
                </div>
              </div>

              {/* Asset Allocation Pill Matrix */}
              <div className="pt-5 space-y-4">
                <div className="flex items-center justify-between text-caption font-semibold text-text-secondary">
                  <span>Strategic Allocation Matrix</span>
                  <span className="text-primary font-numeric font-bold">100% Target Met</span>
                </div>

                {/* Proportional Progress Bar */}
                <div className="h-3.5 w-full rounded-full bg-surface-raised overflow-hidden flex p-0.5 gap-1 border border-border/60">
                  <div
                    style={{ width: '52%' }}
                    className="h-full rounded-full bg-primary"
                    title="Equities: 52%"
                  />
                  <div
                    style={{ width: '23%' }}
                    className="h-full rounded-full bg-accent"
                    title="Sovereign Gold: 23%"
                  />
                  <div
                    style={{ width: '15%' }}
                    className="h-full rounded-full bg-emerald-600"
                    title="Corporate Debt: 15%"
                  />
                  <div
                    style={{ width: '10%' }}
                    className="h-full rounded-full bg-text-muted/40"
                    title="Liquid Cash: 10%"
                  />
                </div>

                {/* Legend Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      <span className="text-caption font-medium text-text-secondary">
                        Equities & Alpha
                      </span>
                    </div>
                    <div className="mt-1 font-numeric font-bold text-text-primary text-body-sm">
                      ₹25,09,478{' '}
                      <span className="text-caption text-text-muted font-normal">(52%)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                      <span className="text-caption font-medium text-text-secondary">
                        Sovereign 24K Gold
                      </span>
                    </div>
                    <div className="mt-1 font-numeric font-bold text-text-primary text-body-sm">
                      ₹11,09,961{' '}
                      <span className="text-caption text-text-muted font-normal">(23%)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <span className="text-caption font-medium text-text-secondary">
                        AAA Fixed Income
                      </span>
                    </div>
                    <div className="mt-1 font-numeric font-bold text-text-primary text-body-sm">
                      ₹7,23,888{' '}
                      <span className="text-caption text-text-muted font-normal">(15%)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-text-muted/60" />
                      <span className="text-caption font-medium text-text-secondary">
                        Liquid Buffer
                      </span>
                    </div>
                    <div className="mt-1 font-numeric font-bold text-text-primary text-body-sm">
                      ₹4,82,593{' '}
                      <span className="text-caption text-text-muted font-normal">(10%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Automated Activity Ledger Rows */}
              <div className="mt-5 pt-4 border-t border-border/60 space-y-2.5">
                <span className="text-[11px] font-bold font-numeric uppercase tracking-wider text-text-muted block">
                  Recent Autonomous Mandates Executed
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-caption">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-raised/50 border border-border/40">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-text-primary">
                        Automated SIP Rebalancing
                      </span>
                    </div>
                    <span className="text-success font-numeric font-bold">+₹25,000 Nifty 50</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-raised/50 border border-border/40">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-accent" />
                      <span className="font-semibold text-text-primary">Tax-Loss Harvesting</span>
                    </div>
                    <span className="text-accent font-numeric font-bold">₹34,200 Tax Saved</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SOCIAL PROOF / TRUSTED BY NUMBERS TICKER                  */}
      {/* ============================================================ */}
      <section className="border-y border-border/80 bg-surface-raised/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                ₹850Cr+
              </div>
              <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Assets Monitored
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
                14.2%
              </div>
              <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Average Annual Alpha
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                99.98%
              </div>
              <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Depository Uptime
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-accent tracking-tight">
                4.95 / 5
              </div>
              <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Investor Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. BENTO GRID FEATURES ("Why Kalya")                          */}
      {/* ============================================================ */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-caption font-bold text-primary mb-3">
              <span>Engineered for Enduring Wealth</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
              One Operating System for Every Rupee You Own.
            </h2>
            <p className="mt-4 text-body-md sm:text-body-lg text-text-secondary">
              Legacy apps show past transactions. Kalya orchestrates your future compounding with
              uncompromising mathematical precision.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Multi-Asset Unified Ledger (Span 2) */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-surface p-7 shadow-card hover:shadow-raised transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center mb-5">
                  <PieChart className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Unified Multi-Asset Global Ledger
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed max-w-xl">
                  Connect Indian depository accounts (NSDL, CDSL), mutual fund folios, physical 24K
                  gold vaults, commercial real estate REITs, and foreign brokerages into a single
                  real-time balance sheet.
                </p>
              </div>

              {/* Graphic Element */}
              <div className="mt-7 p-4 rounded-xl bg-surface-raised border border-border/70 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Domestic Equity
                  </span>
                  <span className="font-numeric font-bold text-text-primary text-body-md">
                    NSE / BSE Live
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Sovereign Gold
                  </span>
                  <span className="font-numeric font-bold text-accent text-body-md">
                    24K RBI Tranches
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Fixed Income
                  </span>
                  <span className="font-numeric font-bold text-primary text-body-md">
                    AAA G-Sec Index
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Automated Tax-Loss Harvesting */}
            <div className="rounded-2xl border border-border bg-surface p-7 shadow-card hover:shadow-raised transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-accent-subtle text-accent-strong flex items-center justify-center mb-5">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Algorithmic Tax-Loss Harvesting
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  Automatically scans your capital gains ledger and matches short-term losses to
                  offset tax obligations without violating regulatory rules.
                </p>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-accent-subtle/50 border border-accent/20">
                <span className="text-caption font-bold text-accent-strong block">
                  Average Annual Tax Alpha:
                </span>
                <span className="font-display text-2xl font-extrabold text-accent-strong">
                  ₹42,800 saved/yr
                </span>
              </div>
            </div>

            {/* Bento Card 3: Intelligent SIP Rebalancer */}
            <div className="rounded-2xl border border-border bg-surface p-7 shadow-card hover:shadow-raised transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center mb-5">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Automated SIP Drift Rebalancing
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  Bull runs distort portfolio allocations. Kalya channels next month’s SIP capital
                  directly into lagging asset classes to restore equilibrium without selling.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-caption font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Zero capital gains incurred</span>
              </div>
            </div>

            {/* Bento Card 4: Hardware Enclave Security (Span 2) */}
            <div
              id="security"
              className="md:col-span-2 rounded-2xl border border-border bg-surface p-7 shadow-card hover:shadow-raised transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-surface-raised border border-border text-text-primary flex items-center justify-center mb-5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Sovereign Enclave Cryptography
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed max-w-xl">
                  Client-side AES-256 GCM encryption. Your portfolio balances, net worth values, and
                  financial goals are sealed with your private master passphrase. We can never sell
                  your data or view your private wealth ledger.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border font-numeric text-caption font-semibold text-text-primary">
                  AES-256 GCM
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border font-numeric text-caption font-semibold text-text-primary">
                  Zero-Knowledge Proofs
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border font-numeric text-caption font-semibold text-text-primary">
                  SOC-2 Type II Verified
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border font-numeric text-caption font-semibold text-text-primary">
                  Read-Only Depository APIs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. INTERACTIVE WEALTH GROWTH & COMPOUND CALCULATOR           */}
      {/* ============================================================ */}
      <section
        id="calculator"
        className="py-20 sm:py-28 bg-surface-raised/40 border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Sliders & Controls */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-caption font-bold text-primary mb-3">
                  <span>Interactive Compounding Engine</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                  Simulate Your Financial Independence Corpus.
                </h2>
                <p className="mt-3 text-body-md text-text-secondary">
                  Adjust your monthly SIP allocation, horizon, and expected CAGR to visualize the
                  power of systematic wealth creation.
                </p>
              </div>

              {/* Slider 1: Monthly Investment */}
              <div className="space-y-3 p-5 rounded-2xl bg-surface border border-border shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-body-sm font-semibold text-text-primary">
                    Monthly SIP Investment
                  </label>
                  <span className="font-display text-xl font-extrabold text-primary">
                    {formatINR(monthlyInvest)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={5000}
                  value={monthlyInvest}
                  onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-surface-raised rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-numeric text-text-muted">
                  <span>₹5,000/mo</span>
                  <span>₹1,00,000/mo</span>
                  <span>₹2,00,000/mo</span>
                </div>
              </div>

              {/* Slider 2: Expected CAGR Return */}
              <div className="space-y-3 p-5 rounded-2xl bg-surface border border-border shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-body-sm font-semibold text-text-primary">
                    Expected Annual Return (CAGR)
                  </label>
                  <span className="font-display text-xl font-extrabold text-accent">
                    {expectedReturn}%
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={18}
                  step={0.5}
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer h-2 bg-surface-raised rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-numeric text-text-muted">
                  <span>6% (Conservative)</span>
                  <span>12% (Balanced Index)</span>
                  <span>18% (Alpha Growth)</span>
                </div>
              </div>

              {/* Slider 3: Time Horizon */}
              <div className="space-y-3 p-5 rounded-2xl bg-surface border border-border shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-body-sm font-semibold text-text-primary">
                    Time Horizon
                  </label>
                  <span className="font-display text-xl font-extrabold text-text-primary">
                    {horizonYears} Years
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={30}
                  step={1}
                  value={horizonYears}
                  onChange={(e) => setHorizonYears(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-surface-raised rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-numeric text-text-muted">
                  <span>3 Years</span>
                  <span>15 Years</span>
                  <span>30 Years</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Live Results Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-primary/30 bg-surface p-7 sm:p-9 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

                <span className="text-caption font-numeric text-text-muted uppercase tracking-wider block font-bold mb-2">
                  Projected Enduring Wealth
                </span>

                <div className="font-display text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
                  {formatINR(calculation.futureValue)}
                </div>

                <p className="mt-2 text-caption text-text-secondary">
                  Based on disciplined monthly compounding over {horizonYears} years.
                </p>

                {/* Breakdown Card */}
                <div className="mt-8 space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-text-secondary flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-border" />
                      Total Principal Invested:
                    </span>
                    <span className="font-numeric font-bold text-text-primary text-body-md">
                      {formatINR(calculation.totalInvested)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-text-secondary flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-accent" />
                      Pure Wealth Compounded:
                    </span>
                    <span className="font-numeric font-bold text-accent text-body-md">
                      +{formatINR(calculation.wealthCreated)}
                    </span>
                  </div>

                  {/* Growth Progress Bar */}
                  <div className="h-4 w-full rounded-full bg-surface-raised overflow-hidden flex p-0.5 gap-1 mt-3">
                    <div
                      style={{
                        width: `${Math.max(
                          10,
                          (calculation.totalInvested / calculation.futureValue) * 100
                        )}%`,
                      }}
                      className="h-full rounded-full bg-border"
                    />
                    <div
                      style={{
                        width: `${Math.min(
                          90,
                          (calculation.wealthCreated / calculation.futureValue) * 100
                        )}%`,
                      }}
                      className="h-full rounded-full bg-accent"
                    />
                  </div>
                </div>

                {/* Callout action button */}
                <div className="mt-8">
                  <a
                    href="#get-started"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-body-sm font-bold text-on-primary shadow-md hover:bg-primary-hover transition-all cursor-pointer"
                  >
                    <span>Lock In Your Wealth Plan</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. TRANSPARENT PRICING TIERS                                 */}
      {/* ============================================================ */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-caption font-bold text-primary mb-3">
              <span>Predictable & Transparent</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
              Invest in Financial Clarity.
            </h2>
            <p className="mt-3 text-body-md text-text-secondary">
              No hidden fees, no asset-under-management cut. Keep 100% of your returns.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-surface-raised border border-border">
              <button
                type="button"
                onClick={() => setAnnualBilling(false)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-caption font-bold transition-all cursor-pointer',
                  !annualBilling
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnualBilling(true)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-caption font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  annualBilling
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <span>Annual</span>
                <span className="text-[10px] bg-accent text-on-accent px-1.5 py-0.2 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Seed (Free) */}
            <div className="rounded-2xl border border-border bg-surface p-7 shadow-card flex flex-col justify-between">
              <div>
                <span className="font-display text-xl font-bold text-text-primary block">
                  Seed (Free)
                </span>
                <p className="text-caption text-text-muted mt-1">
                  Ideal for beginners tracking net worth and simple investments.
                </p>

                <div className="mt-6 mb-6">
                  <span className="font-display text-4xl font-extrabold text-text-primary">₹0</span>
                  <span className="text-caption text-text-muted ml-1.5">forever</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/70 text-body-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Up to 15 manual or synced assets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Real-time net worth balance sheet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Emergency runway calculation</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <X className="h-4 w-4 shrink-0" />
                    <span>Automated drift rebalancing</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="#get-started"
                  className="w-full inline-flex items-center justify-center rounded-xl border border-border bg-surface-raised py-3 text-body-sm font-bold text-text-primary hover:bg-border/40 transition-colors"
                >
                  Start Free
                </a>
              </div>
            </div>

            {/* Plan 2: Growth (Recommended) */}
            <div className="relative rounded-2xl border-2 border-primary bg-surface p-7 shadow-xl shadow-primary/10 flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-primary shadow-xs">
                Most Popular
              </div>

              <div>
                <span className="font-display text-xl font-bold text-text-primary block">
                  Growth Alpha
                </span>
                <p className="text-caption text-text-muted mt-1">
                  Comprehensive automation for disciplined high-earning wealth builders.
                </p>

                <div className="mt-6 mb-6">
                  <span className="font-display text-4xl font-extrabold text-primary">
                    {annualBilling ? '₹399' : '₹499'}
                  </span>
                  <span className="text-caption text-text-muted ml-1.5">/ month</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/70 text-body-sm text-text-secondary">
                  <div className="flex items-center gap-2 font-medium text-text-primary">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Unlimited multi-broker assets</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-text-primary">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Automated SIP drift rebalancer</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-text-primary">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Algorithmic tax-loss harvester</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-text-primary">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Hardware Enclave backup & export</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="#get-started"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-primary py-3 text-body-sm font-bold text-on-primary shadow-md hover:bg-primary-hover transition-colors"
                >
                  Activate Growth Plan
                </a>
              </div>
            </div>

            {/* Plan 3: Dynasty Family Office */}
            <div className="rounded-2xl border border-border bg-surface p-7 shadow-card flex flex-col justify-between">
              <div>
                <span className="font-display text-xl font-bold text-text-primary block">
                  Dynasty
                </span>
                <p className="text-caption text-text-muted mt-1">
                  For high-net-worth families, multiple trusts, and holding entities.
                </p>

                <div className="mt-6 mb-6">
                  <span className="font-display text-4xl font-extrabold text-accent">
                    {annualBilling ? '₹1,199' : '₹1,499'}
                  </span>
                  <span className="text-caption text-text-muted ml-1.5">/ month</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/70 text-body-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span>Multi-entity family trusts support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span>Estate distribution & inheritance ledger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span>Dedicated wealth architecture concierge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span>Custom Webhook & API integrations</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="#get-started"
                  className="w-full inline-flex items-center justify-center rounded-xl border border-border bg-surface-raised py-3 text-body-sm font-bold text-text-primary hover:bg-border/40 transition-colors"
                >
                  Contact Dynasty Concierge
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FREQUENTLY ASKED QUESTIONS                                */}
      {/* ============================================================ */}
      <section id="faq" className="py-20 bg-surface-raised/30 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-body-md text-text-secondary">
              Everything you need to know about Kalya’s security, automation, and privacy.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does Kalya connect to my depository and bank accounts?',
                a: 'Kalya uses government-approved, read-only Account Aggregator (RBI-regulated) and depository protocols. We never store banking login passwords or transact on your behalf without your hardware 2FA confirmation.',
              },
              {
                q: 'Can Kalya execute trades or withdraw my funds?',
                a: 'Never. Kalya is strictly non-custodial and read-only for balances. When rebalancing or tax-loss harvesting mandates are suggested, you execute the trade with your own authenticated broker app.',
              },
              {
                q: 'Is my net worth data private from third-party advertisers?',
                a: 'Yes, 100%. Our business model is subscription revenue, not monetizing your personal financial information. All portfolio balances are encrypted end-to-end using AES-256 GCM.',
              },
              {
                q: 'Can I export my financial data if I choose to leave?',
                a: 'At any point, you can download a full cryptographic export of your complete asset history, tax ledger, and net worth balance sheet in JSON, CSV, or plaintext format.',
              },
              {
                q: 'How does the automated drift rebalancer work without triggering capital gains?',
                a: 'Instead of selling overweight stocks (which would trigger short-term capital gains tax), Kalya directs your fresh incoming monthly SIP capital into lagging asset classes to gently bring your portfolio back into balance.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-text-primary hover:bg-surface-raised/60 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-text-secondary transition-transform duration-200 shrink-0 ml-3',
                        isOpen && 'rotate-180 text-primary'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-body-sm text-text-secondary leading-relaxed border-t border-border/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FINAL HIGH-CONVERTING CTA BANNER                          */}
      {/* ============================================================ */}
      <section id="get-started" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-linear-to-b from-[#113524] to-[#0c2419] text-white p-8 sm:p-14 shadow-2xl overflow-hidden border border-white/10 text-center">
            {/* Background Light Ring */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/40 rounded-full blur-[90px] -z-10" />

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-caption font-bold text-accent mb-4 border border-white/15">
              <Sparkles className="h-3.5 w-3.5" />
              <span>READY FOR TOMORROW.</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
              Take Absolute Ownership of Your Financial Future.
            </h2>

            <p className="mt-4 text-body-md sm:text-body-lg text-white/80 max-w-2xl mx-auto">
              Join over 15,000 disciplined wealth builders using Kalya to compound their net worth.
              Start in under 3 minutes with zero commitment.
            </p>

            {/* Email Form */}
            <form
              onSubmit={handleEmailSubmit}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full sm:flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-body-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl bg-accent text-on-accent font-bold px-6 py-3 text-body-sm shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
              >
                {emailSubmitted ? '✓ Access Granted' : 'Claim Free Access'}
              </button>
            </form>

            <span className="text-[11px] text-white/50 block mt-3">
              Free forever tier • No credit card required • Instant setup
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. COMPREHENSIVE BRAND FOOTER                               */}
      {/* ============================================================ */}
      <footer className="border-t border-border bg-surface py-12 sm:py-16 text-body-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="relative w-7 h-7 rounded-lg overflow-hidden">
                  <Image
                    src="/kalya_icon1.png"
                    alt="Kalya Leaf"
                    fill
                    sizes="28px"
                    className="object-contain"
                  />
                </div>
                <span className="font-display font-bold text-xl text-text-primary">kalya</span>
              </div>
              <p className="text-caption text-text-secondary max-w-sm leading-relaxed">
                Complete financial wellness and intelligent personal wealth management platform.
                Cultivate enduring wealth with mathematical discipline.
              </p>
              <div className="text-caption font-bold text-accent tracking-widest uppercase">
                READY FOR TOMORROW.
              </div>
            </div>

            {/* Links Column 1: Platform */}
            <div className="space-y-3">
              <span className="font-display font-semibold text-text-primary text-body-sm block">
                Platform
              </span>
              <ul className="space-y-2 text-caption text-text-secondary">
                <li>
                  <a href="#wealth-engine" className="hover:text-primary transition-colors">
                    Wealth Ledger
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    SIP Drift Rebalancing
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    Tax-Loss Harvester
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-primary transition-colors">
                    Compounding Simulator
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Column 2: Security & Trust */}
            <div className="space-y-3">
              <span className="font-display font-semibold text-text-primary text-body-sm block">
                Security
              </span>
              <ul className="space-y-2 text-caption text-text-secondary">
                <li>
                  <a href="#security" className="hover:text-primary transition-colors">
                    Hardware Enclaves
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-primary transition-colors">
                    Zero-Knowledge Ledger
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-primary transition-colors">
                    SOC-2 Type II
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-primary transition-colors">
                    RBI Account Aggregator
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Column 3: Legal & Company */}
            <div className="space-y-3">
              <span className="font-display font-semibold text-text-primary text-body-sm block">
                Company
              </span>
              <ul className="space-y-2 text-caption text-text-secondary">
                <li>
                  <a href="#pricing" className="hover:text-primary transition-colors">
                    Pricing Tiers
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Diagnostics Strip */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-text-muted">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span>All Systems Operational</span>
              <span>·</span>
              <span>© {new Date().getFullYear()} Kalya Technologies Inc. All rights reserved.</span>
            </div>

            <div className="font-numeric">Designed with Kalya UI Engine · High-Performance SSR</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
