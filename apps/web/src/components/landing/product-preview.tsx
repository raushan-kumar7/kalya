'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  PiggyBank,
  Receipt,
  Coins,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import { cn } from '@/libs/utils';

export type ProductTab = 'dashboard' | 'budget' | 'split' | 'wealth';

interface TabInfo {
  id: ProductTab;
  label: string;
  caption: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabInfo[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    caption: 'Your month at a glance: income, spending, savings and what friends owe you.',
    icon: TrendingUp,
  },
  {
    id: 'budget',
    label: 'Budget',
    caption: 'Needs, Wants and Savings, with a gentle alert before you overspend.',
    icon: PiggyBank,
  },
  {
    id: 'split',
    label: 'Split',
    caption: 'Who paid, who owes, and how to settle up.',
    icon: Receipt,
  },
  {
    id: 'wealth',
    label: 'Wealth',
    caption: 'Gold, shares and funds in one net worth.',
    icon: Coins,
  },
];

export function ProductPreview() {
  const containerRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { amount: 0.2 });

  const [activeTab, setActiveTab] = React.useState<ProductTab>('dashboard');
  const [isPaused, setIsPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  // 6 second timer with progress bar
  React.useEffect(() => {
    if (!isInView || isPaused) return;

    const interval = 50; // update progress every 50ms
    const step = 100 / (6000 / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next tab
          setActiveTab((curr) => {
            const idx = TABS.findIndex((t) => t.id === curr);
            return TABS[(idx + 1) % TABS.length].id;
          });
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isInView, isPaused]);

  const handleTabClick = (tabId: ProductTab) => {
    setActiveTab(tabId);
    setProgress(0);
  };

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <section
      id="product-preview"
      ref={containerRef}
      className="py-20 sm:py-28 bg-surface-raised/30 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            See Kalya in action
          </h2>
          <p className="mt-3 text-body-md sm:text-body-lg text-text-secondary">
            A quick look at the screens you will use every day.
          </p>
        </div>

        {/* Tab Controls Bar with Thin Gold Progress Line */}
        <div
          className="max-w-3xl mx-auto flex flex-col items-center gap-4 mb-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full p-1.5 rounded-2xl bg-surface border border-border shadow-xs">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    'relative py-3 px-4 rounded-xl text-body-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-11',
                    isActive
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                  )}
                  aria-selected={isActive}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>

                  {/* Thin gold progress line under active tab */}
                  {isActive && !isPaused && (
                    <motion.div
                      style={{ width: `${progress}%` }}
                      className="absolute bottom-0 left-0 h-0.5 bg-accent rounded-full transition-all duration-75"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Caption & Pause Toggle */}
          <div className="flex items-center justify-between w-full px-2 text-caption text-text-secondary">
            <p className="font-medium">{currentTab.caption}</p>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors flex items-center gap-1 shrink-0 ml-4 cursor-pointer"
              aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5 text-success" />
              ) : (
                <Pause className="h-3.5 w-3.5 text-accent" />
              )}
              <span className="text-[11px] font-semibold">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>

        {/* Framed Screen Mockup Container with Subtle 3D Depth */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-border/80 bg-surface shadow-2xl overflow-hidden">
            {/* Screen Mockup Top Chrome Bar */}
            <div className="px-5 py-3 border-b border-border bg-surface-raised flex items-center justify-between text-caption text-text-muted">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block" />
                <span className="ml-3 font-numeric font-medium text-[11px] text-text-secondary hidden sm:inline">
                  https://app.kalya.app/{activeTab}
                </span>
              </div>
              <span className="text-[11px] italic">
                Sample data · Your numbers will look like this
              </span>
            </div>

            {/* Tab Mockup Display with Crossfade and 12px Slide */}
            <div className="p-6 sm:p-9 min-h-100 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="tab-dashboard"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                      <div>
                        <span className="text-caption font-semibold text-text-muted uppercase tracking-wider block">
                          October 2026 Inflow & Burn
                        </span>
                        <div className="font-numeric text-2xl sm:text-3xl font-extrabold text-text-primary mt-1">
                          ₹1,45,000 In · ₹68,450 Out
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-subtle text-success text-caption font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Savings Rate: 52.8%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-surface-raised border border-border">
                        <span className="text-[11px] font-bold text-primary block uppercase">
                          Needs (Essential)
                        </span>
                        <span className="font-numeric font-extrabold text-xl text-text-primary block mt-1">
                          ₹42,800
                        </span>
                        <span className="text-caption text-text-muted">Rent, Groceries, WiFi</span>
                      </div>
                      <div className="p-4 rounded-xl bg-surface-raised border border-border">
                        <span className="text-[11px] font-bold text-accent block uppercase">
                          Wants (Lifestyle)
                        </span>
                        <span className="font-numeric font-extrabold text-xl text-text-primary block mt-1">
                          ₹25,650
                        </span>
                        <span className="text-caption text-text-muted">
                          Dining out, Weekend trip
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-surface-raised border border-border">
                        <span className="text-[11px] font-bold text-emerald-600 block uppercase">
                          Savings (Future)
                        </span>
                        <span className="font-numeric font-extrabold text-xl text-emerald-600 block mt-1">
                          ₹76,550
                        </span>
                        <span className="text-caption text-text-muted">SIP & Emergency Fund</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'budget' && (
                  <motion.div
                    key="tab-budget"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                      <div>
                        <span className="text-caption font-semibold text-text-muted uppercase tracking-wider block">
                          50/30/20 Budgeting Pacing Engine
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mt-1">
                          Automated Salary Allocation
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent-strong text-caption font-bold">
                        <AlertTriangle className="h-3.5 w-3.5 text-accent" />
                        <span>Amber Alert at 80%</span>
                      </div>
                    </div>

                    <div className="space-y-3 p-5 rounded-2xl bg-surface-raised border border-border">
                      <div className="flex justify-between text-body-sm font-semibold">
                        <span>Wants Budget Pace (Day 14 of 31)</span>
                        <span className="text-accent font-numeric">₹25,650 / ₹30,000 (85.5%)</span>
                      </div>
                      <div className="h-3 rounded-full bg-surface overflow-hidden border border-border">
                        <div style={{ width: '85.5%' }} className="h-full bg-accent rounded-full" />
                      </div>
                      <span className="text-caption text-text-secondary block">
                        Amber threshold reached: gentle alert prevents accidental overspending
                        before month-end.
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'split' && (
                  <motion.div
                    key="tab-split"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                      <div>
                        <span className="text-caption font-semibold text-text-muted uppercase tracking-wider block">
                          Four-Mode P2P Bill Splitting
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mt-1">
                          Goa Villa Airbnb · <span className="font-numeric">₹12,800</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-caption font-bold font-numeric text-primary px-3 py-1 rounded-full bg-primary-subtle">
                        <QrCode className="h-3.5 w-3.5" /> Direct UPI Settle
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3.5 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                        <span className="font-semibold text-body-sm text-text-primary">
                          You (Organizer)
                        </span>
                        <span className="text-caption font-bold text-success font-numeric">
                          Your share: ₹3,200 (Paid ₹12,800)
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                        <span className="font-semibold text-body-sm text-text-primary">
                          Rahul Sharma
                        </span>
                        <span className="text-caption font-bold text-accent font-numeric">
                          Owes ₹3,200 · UPI Requested
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                        <span className="font-semibold text-body-sm text-text-primary">
                          Priya Patel
                        </span>
                        <span className="text-caption font-bold text-success font-numeric">
                          ✓ Settled ₹3,200 via GPay
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'wealth' && (
                  <motion.div
                    key="tab-wealth"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                      <div>
                        <span className="text-caption font-semibold text-text-muted uppercase tracking-wider block">
                          Consolidated Net Worth Balance Sheet
                        </span>
                        <div className="font-numeric text-2xl sm:text-3xl font-extrabold text-text-primary mt-1">
                          ₹18,42,800{' '}
                          <span className="font-display font-bold text-xl sm:text-2xl text-text-secondary">
                            Net Worth
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-caption font-bold text-accent px-3 py-1 rounded-full bg-accent-subtle">
                        Bullion with 3% GST deduction
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-numeric">
                      <div className="p-4 rounded-xl bg-surface-raised border border-border">
                        <span className="text-[11px] font-bold text-accent block">
                          24K Gold (32.5g)
                        </span>
                        <span className="font-extrabold text-xl text-text-primary block mt-1">
                          ₹2,42,500
                        </span>
                        <span className="text-caption text-text-muted font-normal">
                          3% GST calculated
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-surface-raised border border-border">
                        <span className="text-[11px] font-bold text-primary block">
                          Equities (NSE/BSE)
                        </span>
                        <span className="font-extrabold text-xl text-text-primary block mt-1">
                          ₹11,50,000
                        </span>
                        <span className="text-caption text-success font-normal">+18.4% Return</span>
                      </div>
                      <div className="p-4 rounded-xl bg-surface-raised border border-border">
                        <span className="text-[11px] font-bold text-emerald-600 block">
                          Mutual Funds & Cash
                        </span>
                        <span className="font-extrabold text-xl text-text-primary block mt-1">
                          ₹4,50,300
                        </span>
                        <span className="text-caption text-text-muted font-normal">
                          SIP on Auto-pilot
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Primary CTA Button after preview as specified */}
          <div className="mt-10 text-center">
            <Link
              href="/auth/sign-up"
              className="group relative inline-flex items-center gap-2.5 rounded-xl bg-linear-to-b from-[#145334] via-[#0d3e26] to-[#072617] px-7 py-3.5 text-body-md font-bold text-white shadow-[0_4px_16px_rgba(13,62,38,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-emerald-700/50 hover:from-[#175f3c] hover:to-[#0a331f] hover:shadow-[0_8px_24px_rgba(13,62,38,0.45),0_0_16px_rgba(184,145,46,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden dark:from-[#2e7d55] dark:via-[#1e583c] dark:to-[#133d28] dark:border-white/20"
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
          </div>
        </div>
      </div>
    </section>
  );
}
