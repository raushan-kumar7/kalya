'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronDown,
  Wallet,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Check,
  Star,
  Users,
  Menu,
  X,
  Receipt,
  PiggyBank,
  Coins,
  Target,
  FileText,
  FileSpreadsheet,
  QrCode,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { ThemeToggle } from '@/components/ui/utilities/theme-toggle';

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
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // ------------------------------------------------------------
  // Interactive Hero Mockup State
  // ------------------------------------------------------------
  const [heroSplitSettled, setHeroSplitSettled] = React.useState(false);
  const [heroFriendsOwe, setHeroFriendsOwe] = React.useState(8400);

  const handleSimulateSettle = () => {
    if (heroSplitSettled) {
      setHeroSplitSettled(false);
      setHeroFriendsOwe(8400);
    } else {
      setHeroSplitSettled(true);
      setHeroFriendsOwe(5200); // reduced by 3200
    }
  };

  // ------------------------------------------------------------
  // Split Simulator State
  // ------------------------------------------------------------
  const [splitAmount, setSplitAmount] = React.useState<number>(4800);
  const [splitMode, setSplitMode] = React.useState<'equal' | 'percentage' | 'shares'>('equal');
  const [splitSettledDemo, setSplitSettledDemo] = React.useState<Record<string, boolean>>({});

  // Participants in Split Demo
  const splitParticipants = React.useMemo(() => {
    if (splitMode === 'equal') {
      const share = Math.round((splitAmount / 3) * 100) / 100;
      return [
        { name: 'You (Organizer)', share, tag: 'Paid ₹4,800', isYou: true },
        { name: 'Rahul Sharma', share, tag: 'Owes ₹1,600', isYou: false },
        { name: 'Priya Patel', share, tag: 'Owes ₹1,600', isYou: false },
      ];
    } else if (splitMode === 'percentage') {
      return [
        { name: 'You (50%)', share: (splitAmount * 50) / 100, tag: 'Your share', isYou: true },
        { name: 'Rahul (30%)', share: (splitAmount * 30) / 100, tag: 'Owes 30%', isYou: false },
        { name: 'Priya (20%)', share: (splitAmount * 20) / 100, tag: 'Owes 20%', isYou: false },
      ];
    } else {
      // Shares: 2 shares, 1 share, 1 share (total 4 shares)
      const unit = splitAmount / 4;
      return [
        { name: 'You (2 Shares)', share: unit * 2, tag: '2x consumption', isYou: true },
        { name: 'Rahul (1 Share)', share: unit * 1, tag: '1x consumption', isYou: false },
        { name: 'Priya (1 Share)', share: unit * 1, tag: '1x consumption', isYou: false },
      ];
    }
  }, [splitAmount, splitMode]);

  // ------------------------------------------------------------
  // SIP Compounding Calculator State
  // ------------------------------------------------------------
  const [monthlyInvest, setMonthlyInvest] = React.useState<number>(25000);
  const [expectedReturn, setExpectedReturn] = React.useState<number>(12);
  const [horizonYears, setHorizonYears] = React.useState<number>(15);

  const sipCalculation = React.useMemo(() => {
    const P = monthlyInvest;
    const i = expectedReturn / 12 / 100;
    const n = horizonYears * 12;
    const totalInvested = P * n;
    const futureValue = i > 0 ? P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i)) : totalInvested;
    const wealthCreated = Math.max(0, futureValue - totalInvested);

    return {
      totalInvested: Math.round(totalInvested),
      wealthCreated: Math.round(wealthCreated),
      futureValue: Math.round(futureValue),
    };
  }, [monthlyInvest, expectedReturn, horizonYears]);

  // ------------------------------------------------------------
  // FAQ State
  // ------------------------------------------------------------
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  // Email CTA State
  const [emailInput, setEmailInput] = React.useState('');
  const [emailSubmitted, setEmailSubmitted] = React.useState(false);

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
            <span className="font-semibold text-text-primary">Kalya Financial OS</span>
            <span className="hidden sm:inline text-text-muted">·</span>
            <span className="hidden sm:inline text-text-muted">
              Unified 50/30/20 Budgeting, P2P UPI Bill Splits & Multi-Asset Ledger
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#split-demo"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline transition-colors"
            >
              <span>Test Bill Splitter</span>
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
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group">
              <div className="relative h-9 w-36 sm:w-40 transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/kalya_logo1.png"
                  alt="Kalya - Ready For Tomorrow"
                  fill
                  sizes="160px"
                  className="object-contain object-left dark:hidden"
                  priority
                />
                <Image
                  src="/kalya_logo_white1.png"
                  alt="Kalya - Ready For Tomorrow"
                  fill
                  sizes="160px"
                  className="object-contain object-left hidden dark:block"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-body-sm font-medium text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">
              How It Works
            </a>
            <a href="#split-demo" className="hover:text-text-primary transition-colors">
              Bill Splitting
            </a>
            <a href="#calculator" className="hover:text-text-primary transition-colors">
              Wealth Simulator
            </a>
            <a href="#testimonials" className="hover:text-text-primary transition-colors">
              Reviews
            </a>
            <a href="#faq" className="hover:text-text-primary transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="text-body-sm font-semibold text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4.5 py-2 text-body-sm font-bold text-on-primary shadow-sm shadow-primary/20 hover:bg-primary-hover hover:shadow-md transition-all active:scale-97 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
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
                  Features & Pillars
                </a>
                <a
                  href="#split-demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Interactive Bill Splitter
                </a>
                <a
                  href="#calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  SIP Compounding Calculator
                </a>
                <a
                  href="#statements"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Statements & PDF Export
                </a>
                <Link
                  href="/privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </a>
              </div>
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-border py-2.5 text-body-sm font-semibold text-text-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-primary py-3 text-body-sm font-bold text-on-primary shadow-sm"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================ */}
      {/* 3. HERO SECTION (Atmospheric Glow + High Impact Architecture) */}
      {/* Specified in setup.md:L214                                   */}
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
            {/* Trust Eyebrow Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-4 py-1.5 text-caption font-semibold text-primary mb-6 shadow-2xs"
            >
              <div className="flex items-center text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-accent" />
                ))}
              </div>
              <span className="font-bold text-accent-strong">4.9/5 Rating</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-secondary">Trusted by 10,000+ Indian Earners</span>
              <span className="text-text-muted">·</span>
              <span className="text-primary font-bold">100% Private</span>
            </motion.div>

            {/* Hero Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]"
            >
              Stop Wondering Where Your Money Went.{' '}
              <span className="bg-linear-to-r from-primary via-emerald-600 to-accent bg-clip-text text-transparent">
                Watch Your Savings Grow.
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-body-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed"
            >
              Kalya sorts your salary into needs, wants and savings, splits bills with friends over
              UPI, and tracks your gold and stocks. Save ₹5,000 more every month with complete
              privacy.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
            >
              <Link
                href="/auth/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-primary/90 px-7 py-3.5 text-body-md font-bold text-on-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-95 transition-all active:scale-97 cursor-pointer"
              >
                <span>Claim Your Free Workspace</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>

              <a
                href="#hero-dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-body-md font-semibold text-text-primary shadow-xs hover:bg-surface-raised transition-all active:scale-97"
              >
                <Sliders className="h-4.5 w-4.5 text-accent" />
                <span>Explore Live Demo</span>
              </a>
            </motion.div>

            {/* Trust Micro-Badges */}
            <motion.div
              variants={fadeInUp}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-caption font-medium text-text-muted"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Completely free for now
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-accent" />
                Zero ads · Your data stays yours
              </span>
            </motion.div>
          </motion.div>

          {/* ============================================================ */}
          {/* INTERACTIVE HERO DASHBOARD MOCKUP                            */}
          {/* Real-time simulated Kalya Command Center                     */}
          {/* ============================================================ */}
          <motion.div
            id="hero-dashboard"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="mt-14 sm:mt-18 max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl border border-border/80 bg-surface p-4 sm:p-7 shadow-2xl shadow-black/10 backdrop-blur-xl">
              {/* Mockup Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-caption font-numeric text-text-muted uppercase tracking-wider block font-semibold">
                      Consolidated Financial Command Center
                    </span>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                        ₹18,42,800
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-caption font-bold text-success font-numeric bg-success-subtle px-2 py-0.5 rounded-full">
                        <TrendingUp className="h-3 w-3" />
                        Net Worth Live
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted italic block mt-0.5">
                      Sample data. Your numbers will look like this.
                    </span>
                  </div>
                </div>

                {/* Live System Diagnostics & Month Switcher */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-caption font-semibold text-text-secondary">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span>October 2026 Cycle</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-caption font-semibold text-text-secondary">
                    <Clock className="h-3.5 w-3.5 text-accent" />
                    <span>Spend Pace: Safe</span>
                  </span>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 pb-5 border-b border-border/60">
                <div className="p-3.5 rounded-xl bg-surface-raised/60 border border-border/60">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                    Monthly Inflow
                  </span>
                  <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-text-primary">
                    ₹1,45,000
                  </div>
                  <span className="text-caption text-success font-medium flex items-center gap-1 mt-0.5">
                    <ArrowUpRight className="h-3 w-3" /> Credited
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-raised/60 border border-border/60">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                    Total Spent
                  </span>
                  <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-text-primary">
                    ₹68,450
                  </div>
                  <span className="text-caption text-text-muted font-medium mt-0.5 block">
                    47.2% of Income
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-primary-subtle/50 border border-primary/20">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                    Net Savings & Alpha
                  </span>
                  <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-primary">
                    ₹76,550
                  </div>
                  <span className="text-caption font-bold text-success font-numeric mt-0.5 block">
                    52.8% Savings Rate
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-accent-subtle/40 border border-accent/20">
                  <span className="text-[11px] font-semibold text-accent-strong uppercase tracking-wider block">
                    Friends Owe You
                  </span>
                  <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-accent transition-all">
                    {formatINR(heroFriendsOwe)}
                  </div>
                  <span className="text-caption text-text-secondary font-medium mt-0.5 block">
                    {heroSplitSettled ? '1 pending split' : '2 pending splits'}
                  </span>
                </div>
              </div>

              {/* 50/30/20 Allocation & Bucket Progress Bar */}
              <div className="pt-5 space-y-4">
                <div className="flex items-center justify-between text-caption font-semibold text-text-secondary">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-primary" />
                    <span>Algorithmic 50 / 30 / 20 Budget Health</span>
                  </div>
                  <span className="text-success font-numeric font-bold">Within Target Limits</span>
                </div>

                {/* Proportional Progress Bar */}
                <div className="h-4 w-full rounded-full bg-surface-raised overflow-hidden flex p-0.5 gap-1 border border-border/60">
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
                    title="Savings & Investments: 26% (Target: 20%)"
                  />
                </div>

                {/* Legend Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <span className="text-caption font-semibold text-text-primary">
                          Needs (Essential)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-success font-numeric">
                        Safe (48%)
                      </span>
                    </div>
                    <div className="mt-1.5 font-numeric font-bold text-text-primary text-body-sm">
                      ₹42,800{' '}
                      <span className="text-caption text-text-muted font-normal">
                        / ₹50,000 cap
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                        <span className="text-caption font-semibold text-text-primary">
                          Wants (Lifestyle)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-accent font-numeric">
                        Amber 80% Alert
                      </span>
                    </div>
                    <div className="mt-1.5 font-numeric font-bold text-text-primary text-body-sm">
                      ₹25,650{' '}
                      <span className="text-caption text-text-muted font-normal">
                        / ₹30,000 cap
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-raised/70 border border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                        <span className="text-caption font-semibold text-text-primary">
                          Savings & Goals
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 font-numeric">
                        +130% of Target
                      </span>
                    </div>
                    <div className="mt-1.5 font-numeric font-bold text-text-primary text-body-sm">
                      ₹76,550{' '}
                      <span className="text-caption text-text-muted font-normal">
                        SIP & Emergency
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Split Settlement Callout Pill */}
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
                          ? '✓ Settled via UPI · Transaction recorded in ledger'
                          : 'Owes you ₹3,200 · Linked P2P split share'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
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
                          <span>Reset Demo Settle</span>
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
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SOCIAL PROOF & TRUSTED METRICS TICKER                     */}
      {/* ============================================================ */}
      <section className="border-y border-border/80 bg-surface-raised/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
                ₹0
              </div>
              <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Ads or Data Selling Ever
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                100%
              </div>
              <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Penny-Precise Split Math
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-accent tracking-tight">
                50/30/20
              </div>
              <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Auto-Budget Generation
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                4.95 / 5
              </div>
              <div className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Disciplined Earner Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THE PROBLEM: SALARY IN, MYSTERY OUT                          */}
      {/* ============================================================ */}
      <section className="py-20 bg-surface-raised/30 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger-subtle px-3 py-1 text-caption font-bold text-danger mb-3">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>The Month-End Reality</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
              Salary Arrives on the 1st. By the 20th, Where Did It Go?
            </h2>
            <p className="mt-4 text-body-md sm:text-body-lg text-text-secondary leading-relaxed">
              Most hardworking earners in India don&apos;t have an income problem. They have a
              fragmentation problem. Money leaks through unmonitored UPI scans, awkward group
              expenses, and apps that sell your data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
              <div className="h-10 w-10 rounded-xl bg-danger-subtle text-danger flex items-center justify-center font-bold font-numeric">
                01
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                The Month-End Mystery
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                Daily UPI scans for chai, Swiggy, and quick errands blur together. You check your
                bank balance on the 22nd and wonder where ₹15,000 vanished without a trace.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent-subtle text-accent-strong flex items-center justify-center font-bold font-numeric">
                02
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                Awkward P2P Bill Splits
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                Who paid for the weekend trip cab? Who owes for the shared flat WiFi? Chasing
                friends over WhatsApp and matching UPI screenshots is frustrating and awkward.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center font-bold font-numeric">
                03
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                The 4-App Headache
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                You juggle an expense logger, Splitwise, Zerodha or Groww for stocks, and physical
                gold receipts in a drawer. Nothing talks to each other, so your net worth stays
                invisible.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
              <div className="h-10 w-10 rounded-xl bg-surface-raised border border-border text-text-primary flex items-center justify-center font-bold font-numeric">
                04
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                Invasive Financial Apps
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                Traditional finance apps demand permission to read all your SMS messages, spam you
                with predatory credit cards, and sell your private transactions to third-party
                brokers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS: FINANCIAL CLARITY IN THREE SIMPLE STEPS        */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 sm:py-28 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-caption font-bold text-primary mb-3">
              <span>Simple 60-Second Setup</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
              Financial Clarity in Three Simple Steps
            </h2>
            <p className="mt-4 text-body-md sm:text-body-lg text-text-secondary">
              No bank passwords. No SMS permissions. Just a disciplined, private workspace designed
              for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-8 rounded-3xl border border-border bg-surface shadow-card relative flex flex-col justify-between">
              <div>
                <span className="font-numeric text-5xl font-extrabold text-primary/20 block mb-4">
                  01
                </span>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Sign Up in 30 Seconds
                </h3>
                <p className="mt-2.5 text-body-sm text-text-secondary leading-relaxed">
                  No credit card required. No KYC documents. Create your private account instantly
                  with just your email and start with a clean, sovereign slate.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-caption font-semibold text-primary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Instant private workspace</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-surface shadow-card relative flex flex-col justify-between">
              <div>
                <span className="font-numeric text-5xl font-extrabold text-accent/30 block mb-4">
                  02
                </span>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Log Salary & Everyday UPI
                </h3>
                <p className="mt-2.5 text-body-sm text-text-secondary leading-relaxed">
                  Enter your monthly income. Kalya instantly allocates your 50/30/20 budget. Split
                  dinners or rent with friends in 2 taps with UPI settlement.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-caption font-semibold text-accent-strong flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Automated 50/30/20 allocation</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-surface shadow-card relative flex flex-col justify-between">
              <div>
                <span className="font-numeric text-5xl font-extrabold text-emerald-500/25 block mb-4">
                  03
                </span>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Watch Your Savings Grow
                </h3>
                <p className="mt-2.5 text-body-sm text-text-secondary leading-relaxed">
                  Receive proactive amber alerts at 80% spending pace. Track physical gold with 3%
                  GST, stocks, and SIP compounding in one sovereign dashboard.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-caption font-semibold text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Save ₹5,000+ more every month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. BENTO GRID: THE FOUR CORE PILLARS OF KALYA                */}
      {/* ============================================================ */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-caption font-bold text-primary mb-3">
              <span>Engineered for Enduring Clarity</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
              One Unified Workspace. Zero Financial Blindspots.
            </h2>
            <p className="mt-4 text-body-md sm:text-body-lg text-text-secondary">
              Legacy finance apps show fragmented history. Kalya unifies your day-to-day UPI burns,
              shared roommate debts, and long-term asset accumulation into an intuitive mandate.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: 50/30/20 & Spend Pace Budgeting (Span 2) */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-surface p-7 shadow-card hover:shadow-raised transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center mb-5">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Algorithmic 50/30/20 & Spend Pace Budgeting
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed max-w-xl">
                  Automatically translates your incoming monthly salary into mathematically sound
                  allocations: 50% Needs, 30% Wants, and 20% Savings. Proactive amber alerts sound
                  at 80% burn, preventing overspending before it occurs.
                </p>
              </div>

              {/* Graphic Element */}
              <div className="mt-7 p-4 rounded-xl bg-surface-raised border border-border/70 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Needs Allocation
                  </span>
                  <span className="font-numeric font-bold text-text-primary text-body-md">
                    50% Auto-Generated
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Amber Threshold
                  </span>
                  <span className="font-numeric font-bold text-accent text-body-md">
                    80% Alert Trigger
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Unspent Rollover
                  </span>
                  <span className="font-numeric font-bold text-primary text-body-md">
                    Auto Next-Cycle
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Peer-to-Peer Bill Splitting with UPI */}
            <div className="rounded-2xl border border-border bg-surface p-7 shadow-card hover:shadow-raised transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-accent-subtle text-accent-strong flex items-center justify-center mb-5">
                  <Receipt className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  P2P Bill Splitting & UPI Settle
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  Split dinner, group trips, and household bills across 4 modes (Equal, %, Shares,
                  Exact). Seamless FIFO settlement cascades and direct UPI payment tracking.
                </p>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-accent-subtle/50 border border-accent/20">
                <span className="text-caption font-bold text-accent-strong block">
                  Built-in Splitwise Replacement:
                </span>
                <span className="font-display text-xl font-extrabold text-accent-strong">
                  Zero ads • Linked to your bank ledger
                </span>
              </div>
            </div>

            {/* Bento Card 3: Milestone Savings Goals */}
            <div className="rounded-2xl border border-border bg-surface p-7 shadow-card hover:shadow-raised transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center mb-5">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Milestone Goals & Sinking Funds
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  Lock in targets for emergency funds, vacations, or wedding jewellery. Dynamic
                  pacing math tells you exactly how much to set aside each month to hit your
                  deadline.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-caption font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Dynamic monthly pace recalculation</span>
              </div>
            </div>

            {/* Bento Card 4: Multi-Asset Portfolio (Span 2) */}
            <div
              id="assets"
              className="md:col-span-2 rounded-2xl border border-border bg-surface p-7 shadow-card hover:shadow-raised transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-surface-raised border border-border text-text-primary flex items-center justify-center mb-5">
                  <Coins className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-2xl font-bold text-text-primary">
                  Multi-Asset Bullion & Equity Ledger
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed max-w-xl">
                  Unified balance sheet for 24K physical & digital gold (with automated 3% GST
                  deduction calculation), 999 fine silver, BSE/NSE listed stocks, and mutual funds.
                  Track real-time weight, cost basis, and current valuations.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border font-numeric text-caption font-semibold text-text-primary">
                  24K Gold & 999 Silver
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border font-numeric text-caption font-semibold text-text-primary">
                  3% GST Deduction Math
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border font-numeric text-caption font-semibold text-text-primary">
                  BSE / NSE Stocks & MFs
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border font-numeric text-caption font-semibold text-text-primary">
                  Real-time Net Worth Aggregate
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. INTERACTIVE FEATURE DEEP-DIVE: BILL SPLITTING SIMULATOR   */}
      {/* ============================================================ */}
      <section id="split-demo" className="py-20 bg-surface-raised/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Explanatory Copy & Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-caption font-bold text-primary mb-3">
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Try It Live</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                  Split Bills Seamlessly. Zero Debt Awkwardness.
                </h2>
                <p className="mt-3 text-body-md text-text-secondary leading-relaxed">
                  No more messy WhatsApp messages or third-party ad-ridden apps. Split group
                  dinners, road trips, or apartment rent directly into your personal balance sheet.
                </p>
              </div>

              {/* Bill Input Slider */}
              <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-body-sm font-semibold text-text-primary">
                    Simulated Bill Amount
                  </label>
                  <span className="font-display text-xl font-extrabold text-primary">
                    {formatINR(splitAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1200}
                  max={24000}
                  step={300}
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-surface-raised rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-numeric text-text-muted">
                  <span>₹1,200 (Brunch)</span>
                  <span>₹12,000 (Weekend Trip)</span>
                  <span>₹24,000 (Flat Rent)</span>
                </div>
              </div>

              {/* Split Mode Selector */}
              <div className="space-y-2">
                <label className="text-caption font-semibold text-text-muted uppercase tracking-wider block">
                  Select Split Algorithm
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['equal', 'percentage', 'shares'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSplitMode(mode)}
                      className={cn(
                        'py-2 px-3 rounded-xl text-caption font-bold border transition-all cursor-pointer capitalize text-center',
                        splitMode === mode
                          ? 'border-primary bg-primary text-on-primary shadow-xs'
                          : 'border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                      )}
                    >
                      {mode} Split
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Output Card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                    <span className="font-display font-bold text-body-lg text-text-primary">
                      Calculated Participant Breakdown
                    </span>
                  </div>
                  <span className="text-caption font-numeric font-bold text-accent">
                    Penny-Perfect Remainder Allocation
                  </span>
                </div>

                {/* Participant Rows */}
                <div className="mt-5 space-y-3">
                  {splitParticipants.map((p, idx) => {
                    const isSettled = splitSettledDemo[p.name];
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-4 rounded-xl border transition-all flex items-center justify-between gap-3',
                          p.isYou
                            ? 'bg-primary-subtle/40 border-primary/20'
                            : isSettled
                              ? 'bg-success-subtle/30 border-success/30'
                              : 'bg-surface-raised/70 border-border/70'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-9 w-9 rounded-xl flex items-center justify-center font-bold text-caption',
                              p.isYou
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface border border-border text-text-secondary'
                            )}
                          >
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-body-sm text-text-primary">
                                {p.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-surface border border-border font-medium text-text-muted">
                                {p.tag}
                              </span>
                            </div>
                            <span className="text-caption text-text-muted font-numeric">
                              {p.isYou
                                ? 'Organizer · Net receive +₹' +
                                  (splitAmount - p.share).toLocaleString('en-IN')
                                : isSettled
                                  ? '✓ Settled via PhonePe / GPay'
                                  : 'Pending UPI transfer'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-body-lg font-bold font-numeric text-text-primary">
                            {formatINR(p.share)}
                          </span>

                          {!p.isYou && (
                            <button
                              type="button"
                              onClick={() =>
                                setSplitSettledDemo((prev) => ({
                                  ...prev,
                                  [p.name]: !prev[p.name],
                                }))
                              }
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-caption font-bold transition-all cursor-pointer whitespace-nowrap',
                                isSettled
                                  ? 'bg-surface border border-border text-text-muted'
                                  : 'bg-accent text-on-accent hover:opacity-90'
                              )}
                            >
                              {isSettled ? 'Undo' : 'Mark Settled'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Strip */}
                <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-caption text-text-muted">
                  <span>Linked to personal cashflow ledger with auto-sync invitations.</span>
                  <Link
                    href="/auth/sign-up"
                    className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>Use Split Engine in Kalya</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. INTERACTIVE WEALTH GROWTH & SIP COMPOUND CALCULATOR       */}
      {/* ============================================================ */}
      <section id="calculator" className="py-20 sm:py-28">
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
                  <span>12% (Index Equities)</span>
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
                  {formatINR(sipCalculation.futureValue)}
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
                      {formatINR(sipCalculation.totalInvested)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-text-secondary flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-accent" />
                      Pure Wealth Compounded:
                    </span>
                    <span className="font-numeric font-bold text-accent text-body-md">
                      +{formatINR(sipCalculation.wealthCreated)}
                    </span>
                  </div>

                  {/* Growth Progress Bar */}
                  <div className="h-4 w-full rounded-full bg-surface-raised overflow-hidden flex p-0.5 gap-1 mt-3">
                    <div
                      style={{
                        width: `${Math.max(
                          10,
                          (sipCalculation.totalInvested / sipCalculation.futureValue) * 100
                        )}%`,
                      }}
                      className="h-full rounded-full bg-border transition-all"
                    />
                    <div
                      style={{
                        width: `${Math.min(
                          90,
                          (sipCalculation.wealthCreated / sipCalculation.futureValue) * 100
                        )}%`,
                      }}
                      className="h-full rounded-full bg-accent transition-all"
                    />
                  </div>
                </div>

                {/* Callout action button */}
                <div className="mt-8">
                  <Link
                    href="/auth/sign-up"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-body-sm font-bold text-on-primary shadow-md hover:bg-primary-hover transition-all cursor-pointer"
                  >
                    <span>Lock In Your Wealth Plan</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. AUDIT STATEMENTS & EXPORT SHOWCASE                        */}
      {/* ============================================================ */}
      <section id="statements" className="py-20 bg-surface-raised/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-caption font-bold text-primary">
                <FileText className="h-3.5 w-3.5" />
                <span>Executive Reports</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                Audit-Grade Financial Statements on Demand.
              </h2>
              <p className="text-body-md text-text-secondary leading-relaxed">
                Generate high-fidelity, formal monthly financial statements. Perfect for tax
                preparations, personal accounting records, or shared household audits.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-body-sm text-text-primary block">
                      Formal PDF & Print-Ready Formatting
                    </span>
                    <span className="text-caption text-text-secondary">
                      Clean header, company details, monthly cashflow summary, and signed audit
                      lines.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-body-sm text-text-primary block">
                      Full Ledger Excel / CSV Spreadsheet Export
                    </span>
                    <span className="text-caption text-text-secondary">
                      Multi-sheet export with category pivot summaries, split settlements, and net
                      worth balance sheets.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-body-sm text-text-primary block">
                      Comparative Historical Period Analytics
                    </span>
                    <span className="text-caption text-text-secondary">
                      Toggle comparison mode to inspect month-over-month percentage deltas and
                      sparklines.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Statement Card Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 relative">
                      <Image
                        src="/kalya_icon1.png"
                        alt="Kalya"
                        fill
                        sizes="24px"
                        className="object-contain"
                      />
                    </div>
                    <span className="font-display font-bold text-body-md text-text-primary">
                      Kalya Statement · October 2026
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-caption font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border">
                      PDF
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border">
                      XLSX
                    </span>
                  </div>
                </div>

                {/* Statement Body Rows */}
                <div className="p-4 rounded-xl bg-surface-raised/50 border border-border/70 space-y-3 font-numeric text-caption">
                  <div className="flex justify-between text-text-secondary">
                    <span>Total Inflow (Salary & Other):</span>
                    <span className="font-bold text-text-primary">₹1,45,000.00</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Needs Expenditure (50% Target):</span>
                    <span className="font-bold text-text-primary">₹42,800.00</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Wants Expenditure (30% Target):</span>
                    <span className="font-bold text-text-primary">₹25,650.00</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 text-primary font-bold">
                    <span>Net Monthly Wealth Accumulated:</span>
                    <span>+₹76,550.00 (52.8%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted pt-2">
                  <span>Cryptographically generated timestamp</span>
                  <span className="text-success font-semibold">● Verified Sovereign Ledger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. SOVEREIGN PRIVACY & SECURITY VAULT                        */}
      {/* ============================================================ */}
      <section id="security" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-caption font-bold text-primary mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Sovereign Privacy Mandate</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
              Your Wealth Is Your Business. Period.
            </h2>
            <p className="mt-3 text-body-md text-text-secondary">
              Free financial apps make their money by selling your transactional profiles to
              lenders, credit bureaus, and predatory card companies. Kalya is built on sovereign
              principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary">
                Zero Third-Party Ads
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                We will never run advertising banners or affiliate kickbacks that distort your
                financial decisions. Our revenue comes purely from transparent software
                subscriptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent-subtle text-accent-strong flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary">
                Non-Custodial Architecture
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                Kalya is an intelligence workspace, not a bank. We never hold your deposits or
                execute unauthorized banking movements. You maintain absolute custody of your
                accounts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3">
              <div className="h-10 w-10 rounded-xl bg-surface-raised border border-border text-text-primary flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary">
                100% Data Export Portability
              </h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                No vendor lock-in. You can download your complete transaction ledger, split
                contacts, and net worth balance sheets in standard JSON and CSV format at any
                second.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. COMPETITIVE COMPARISON MATRIX                            */}
      {/* ============================================================ */}
      <section className="py-20 bg-surface-raised/40 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Why Disciplined Wealth Builders Choose Kalya
            </h2>
            <p className="mt-2 text-body-md text-text-secondary">
              See how Kalya replaces fragmented single-purpose tools with a unified sovereign OS.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-md">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b border-border bg-surface-raised text-caption uppercase text-text-muted font-bold">
                <tr>
                  <th className="py-4 px-6">Capability</th>
                  <th className="py-4 px-6 text-primary font-extrabold">Kalya</th>
                  <th className="py-4 px-6">Generic Trackers</th>
                  <th className="py-4 px-6">Splitwise</th>
                  <th className="py-4 px-6">Excel / Spreadsheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-4 px-6 font-semibold text-text-primary">
                    50/30/20 Auto-Budgeting
                  </td>
                  <td className="py-4 px-6 font-bold text-success font-numeric">✓ Native Engine</td>
                  <td className="py-4 px-6 text-text-muted">Manual / Rigid</td>
                  <td className="py-4 px-6 text-text-muted">✕ None</td>
                  <td className="py-4 px-6 text-text-muted">Complex formulas</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-text-primary">P2P Bill Splitting</td>
                  <td className="py-4 px-6 font-bold text-success font-numeric">
                    ✓ 4 Split Modes + UPI
                  </td>
                  <td className="py-4 px-6 text-text-muted">✕ None</td>
                  <td className="py-4 px-6 text-text-secondary">✓ Ad-supported</td>
                  <td className="py-4 px-6 text-text-muted">✕ None</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-text-primary">
                    Splits Synced to Personal Ledger
                  </td>
                  <td className="py-4 px-6 font-bold text-success font-numeric">✓ Instant Sync</td>
                  <td className="py-4 px-6 text-text-muted">✕ Disconnected</td>
                  <td className="py-4 px-6 text-text-muted">✕ Disconnected</td>
                  <td className="py-4 px-6 text-text-muted">Manual duplicate entry</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-text-primary">
                    Bullion (Gold/Silver) + 3% GST
                  </td>
                  <td className="py-4 px-6 font-bold text-success font-numeric">
                    ✓ Built-in Grams Math
                  </td>
                  <td className="py-4 px-6 text-text-muted">✕ None</td>
                  <td className="py-4 px-6 text-text-muted">✕ None</td>
                  <td className="py-4 px-6 text-text-muted">Manual formulas</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-text-primary">
                    Audit PDF / Excel Statements
                  </td>
                  <td className="py-4 px-6 font-bold text-success font-numeric">
                    ✓ 1-Click Formal Export
                  </td>
                  <td className="py-4 px-6 text-text-muted">Basic CSV</td>
                  <td className="py-4 px-6 text-text-muted">Paid CSV only</td>
                  <td className="py-4 px-6 text-text-muted">Self-built</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-text-primary">
                    Zero Ads & Sovereign Privacy
                  </td>
                  <td className="py-4 px-6 font-bold text-success font-numeric">
                    ✓ 100% Guaranteed
                  </td>
                  <td className="py-4 px-6 text-text-muted">Heavy Ads & Tracking</td>
                  <td className="py-4 px-6 text-text-muted">Aggressive Paywalls</td>
                  <td className="py-4 px-6 text-text-secondary">✓ Offline private</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* REAL USER STORIES & SOCIAL PROOF                             */}
      {/* ============================================================ */}
      <section
        id="testimonials"
        className="py-20 sm:py-28 bg-surface-raised/20 border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-caption font-semibold text-primary mb-3">
              <Users className="h-3.5 w-3.5 text-accent" />
              <span>Real People. Real Discipline.</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
              Loved by 10,000+ Disciplined Earners Across India
            </h2>
            <p className="mt-4 text-body-md sm:text-body-lg text-text-secondary">
              See how everyday engineers, designers, flatmates, and professionals use Kalya to take
              back control of their money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Story 1 */}
            <div className="p-7 rounded-3xl border border-border bg-surface shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent" />
                  ))}
                </div>
                <p className="text-body-sm text-text-secondary leading-relaxed italic">
                  &ldquo;I used to panic around the 22nd of every month wondering where my salary
                  evaporated. Kalya&apos;s 80% amber spend alert completely cured my weekend Swiggy
                  and impulse splurges. Saved ₹42,000 in my first 5 months.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-subtle text-primary font-bold font-display flex items-center justify-center text-body-sm">
                  RS
                </div>
                <div>
                  <span className="font-display text-body-sm font-bold text-text-primary block leading-none">
                    Rahul Sharma
                  </span>
                  <span className="text-caption text-text-muted mt-1 block">
                    Software Engineer · Bengaluru
                  </span>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="p-7 rounded-3xl border border-border bg-surface shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent" />
                  ))}
                </div>
                <p className="text-body-sm text-text-secondary leading-relaxed italic">
                  &ldquo;Splitting rent, cook wages, and WiFi between 3 flatmates without awkward
                  follow-up texts is pure magic. We settle directly through UPI, and Kalya
                  automatically adjusts our individual budget ledgers without any ads.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent-subtle text-accent-strong font-bold font-display flex items-center justify-center text-body-sm">
                  AD
                </div>
                <div>
                  <span className="font-display text-body-sm font-bold text-text-primary block leading-none">
                    Ananya Deshmukh
                  </span>
                  <span className="text-caption text-text-muted mt-1 block">
                    Product Designer & Flatmate · Mumbai
                  </span>
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="p-7 rounded-3xl border border-border bg-surface shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent" />
                  ))}
                </div>
                <p className="text-body-sm text-text-secondary leading-relaxed italic">
                  &ldquo;As a CA, I appreciate precision. Kalya is the only platform that accurately
                  calculates the 3% GST on 24K bullion purchases and combines it with SIP
                  compounding. Zero SMS scraping, zero loan ads. Just pure financial math.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-subtle text-primary font-bold font-display flex items-center justify-center text-body-sm">
                  KI
                </div>
                <div>
                  <span className="font-display text-body-sm font-bold text-text-primary block leading-none">
                    Karthik Iyer
                  </span>
                  <span className="text-caption text-text-muted mt-1 block">
                    Chartered Accountant · Chennai
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* COMPLETELY FREE FOR NOW (HONEST OFFER, REPLACES PRICING)     */}
      {/* ============================================================ */}
      <section id="free-for-now" className="py-20 border-t border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-subtle px-3.5 py-1 text-caption font-bold text-success mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Honest, Transparent Promise</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Completely Free, For Now.
          </h2>

          <p className="mt-4 text-body-md sm:text-body-lg text-text-secondary max-w-2xl mx-auto">
            Every feature is open to everyone. No credit card required. No trial countdown timer.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl border border-border bg-surface-raised/50 space-y-2">
              <span className="font-display text-lg font-bold text-text-primary block">
                Everything Included
              </span>
              <p className="text-body-sm text-text-secondary">
                Auto 50/30/20 budgets, 4-mode bill splits, bullion 3% GST tracker, and PDF statement
                exports.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface-raised/50 space-y-2">
              <span className="font-display text-lg font-bold text-text-primary block">
                Zero Card Details
              </span>
              <p className="text-body-sm text-text-secondary">
                Sign up with your email. We will never ask for payment details, debit cards, or bank
                permissions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface-raised/50 space-y-2">
              <span className="font-display text-lg font-bold text-text-primary block">
                Transparent Updates
              </span>
              <p className="text-body-sm text-text-secondary">
                We want Kalya to be genuinely useful first. If anything ever changes, we will tell
                you openly first.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-body-md font-bold text-on-primary shadow-md hover:bg-primary-hover transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 12. FREQUENTLY ASKED QUESTIONS (ACCORDION)                    */}
      {/* ============================================================ */}
      <section id="faq" className="py-20 bg-surface-raised/30 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-body-md text-text-secondary">
              Everything you need to know about Kalya’s security, UPI split engine, and privacy.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does Kalya differ from traditional expense tracking apps?',
                a: 'Most apps are simple digital checkbooks that tell you what you spent in the past. Kalya is a forward-looking operating system: it auto-budgets incoming income via 50/30/20 rules, integrates social bill splitting with UPI directly into your bank ledger, and tracks multi-asset wealth (bullion with GST, equities, and sinking funds) all in one place.',
              },
              {
                q: 'How does the bill splitting engine integrate with my personal transactions?',
                a: 'When you record an expense (e.g., a ₹4,800 dinner), you can check "Split this bill". Kalya calculates the exact shares (Equal, Percentage, or Shares) and only books YOUR actual share into your personal budget. The remainder is automatically logged under "Friends Owe You" with FIFO debt settlement tracking.',
              },
              {
                q: 'Do I have to share my bank login credentials or grant account access?',
                a: 'Never. Kalya is strictly non-custodial and private. You never provide net banking passwords or transaction credentials. You log transactions or import statements directly, maintaining complete cryptographic control of your funds.',
              },
              {
                q: 'How does the Gold & Silver bullion tracker calculate GST?',
                a: 'When you log physical or digital bullion purchases, Kalya automatically accounts for the mandatory 3% GST rate in Indian bullion transactions, separating the net commodity value from the tax paid so your asset balance sheet reflects true bullion weight in grams.',
              },
              {
                q: 'Can I export my financial data if I ever want to leave?',
                a: 'At any point, you can download a full cryptographic export of your complete asset history, tax ledger, split contacts, and net worth balance sheet in JSON, CSV, or formatted PDF.',
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
      {/* 13. FINAL HIGH-CONVERTING CTA BANNER                         */}
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
              Join disciplined wealth builders using Kalya to compound their net worth with
              zero-debt clarity, algorithmic budgeting, and sovereign peace of mind.
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
                {emailSubmitted ? '✓ Access Granted' : 'Claim Free Workspace'}
              </button>
            </form>

            <span className="text-[11px] text-white/50 block mt-3">
              Completely free for now • No credit card required • Instant setup
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 14. COMPREHENSIVE BRAND FOOTER                               */}
      {/* ============================================================ */}
      <footer className="border-t border-border bg-surface py-12 sm:py-16 text-body-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-block group">
                <div className="relative h-9 w-36 sm:w-40 transition-transform group-hover:scale-[1.02]">
                  <Image
                    src="/kalya_logo1.png"
                    alt="Kalya - Ready For Tomorrow"
                    fill
                    sizes="160px"
                    className="object-contain object-left dark:hidden"
                  />
                  <Image
                    src="/kalya_logo_white1.png"
                    alt="Kalya - Ready For Tomorrow"
                    fill
                    sizes="160px"
                    className="object-contain object-left hidden dark:block"
                  />
                </div>
              </Link>
              <p className="text-caption text-text-secondary max-w-sm leading-relaxed">
                Complete financial wellness and intelligent personal wealth management platform.
                Cultivate enduring wealth with mathematical discipline and sovereign privacy.
              </p>
            </div>

            {/* Links Column 1: Platform */}
            <div className="space-y-3">
              <span className="font-display font-semibold text-text-primary text-body-sm block">
                Platform
              </span>
              <ul className="space-y-2 text-caption text-text-secondary">
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    50/30/20 Budgeting
                  </a>
                </li>
                <li>
                  <a href="#split-demo" className="hover:text-primary transition-colors">
                    P2P Bill Splitting
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    Bullion & Equity Ledger
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-primary transition-colors">
                    SIP Compounding Engine
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Column 2: Security & Trust */}
            {/* Links Column 2: Legal & Privacy */}
            <div className="space-y-3">
              <span className="font-display font-semibold text-text-primary text-body-sm block">
                Legal & Privacy
              </span>
              <ul className="space-y-2 text-caption text-text-secondary">
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="#security" className="hover:text-primary transition-colors">
                    Sovereign Architecture
                  </a>
                </li>
                <li>
                  <a href="#statements" className="hover:text-primary transition-colors">
                    Audit Statements
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Column 3: Legal & Company */}
            <div className="space-y-3">
              <span className="font-display font-semibold text-text-primary text-body-sm block">
                Company & Support
              </span>
              <ul className="space-y-2 text-caption text-text-secondary">
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/auth/sign-in" className="hover:text-primary transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/sign-up" className="hover:text-primary transition-colors">
                    Create Account
                  </Link>
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
              <span>© {new Date().getFullYear()} Kalya Technologies. All rights reserved.</span>
            </div>

            <div className="font-numeric">Kalya Sovereign UI Engine · Ready For Tomorrow</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
