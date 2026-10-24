'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Zap,
  Receipt,
  Coins,
  Target,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { EASINGS } from '@/libs/animations';

export interface KalyaFeatureItem {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  highlightStat: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
  tagColor: string;
  glowRgba: string;
}

const KALYA_FEATURES: KalyaFeatureItem[] = [
  {
    id: 'budget',
    title: '50/30/20 Smart Budget',
    badge: 'Auto-Allocated',
    tagline: 'Your salary, sorted on day one',
    description:
      'Auto-allocates your salary into Needs (50%), Wants (30%), and Savings (20%) with gentle pacing alerts before you overshoot.',
    highlightStat: '50% Needs · 30% Wants · 20% Savings',
    icon: PieChart,
    accentColor: 'text-primary dark:text-primary',
    bgColor: 'bg-primary-subtle',
    borderColor: 'border-primary/20',
    hoverBorder: 'hover:border-primary/50',
    tagColor: 'bg-primary/10 text-primary border-primary/20',
    glowRgba: 'rgba(13, 62, 38, 0.22)',
  },
  {
    id: 'expenses',
    title: 'Instant Expense Log',
    badge: 'Zero Lag',
    tagline: 'Log payments in under 3 seconds',
    description:
      'UPI, debit cards, credit and cash entries sorted into customizable Indian spending categories with quick mode auto-detection.',
    highlightStat: 'UPI, Cards & Cash categorized',
    icon: Zap,
    accentColor: 'text-accent-strong dark:text-accent',
    bgColor: 'bg-accent-subtle',
    borderColor: 'border-accent/30',
    hoverBorder: 'hover:border-accent/60',
    tagColor: 'bg-accent/15 text-accent-strong dark:text-accent border-accent/30',
    glowRgba: 'rgba(184, 145, 46, 0.26)',
  },
  {
    id: 'split',
    title: 'Fair Bill Splitting',
    badge: '4 Split Modes',
    tagline: 'Split a bill. Settle via UPI.',
    description:
      'Four flexible ways to split: equal, exact amounts, percentages, or shares. Automatic UPI links to settle up with zero friction.',
    highlightStat: 'Equal, Exact, % & Shares with UPI',
    icon: Receipt,
    accentColor: 'text-success',
    bgColor: 'bg-success-subtle',
    borderColor: 'border-success/20',
    hoverBorder: 'hover:border-success/50',
    tagColor: 'bg-success/10 text-success border-success/20',
    glowRgba: 'rgba(30, 122, 76, 0.22)',
  },
  {
    id: 'wealth',
    title: 'Gold & Wealth Portfolio',
    badge: 'Live GST & Rates',
    tagline: 'One complete net worth view',
    description:
      'Track 24K and 22K physical and digital gold with real-time 3% GST calculation, combined with mutual funds, stocks, and liquidity.',
    highlightStat: 'Live 24K/22K Gold + GST + Funds',
    icon: Coins,
    accentColor: 'text-accent-strong dark:text-accent',
    bgColor: 'bg-accent-subtle',
    borderColor: 'border-accent/30',
    hoverBorder: 'hover:border-accent/60',
    tagColor: 'bg-accent/15 text-accent-strong dark:text-accent border-accent/30',
    glowRgba: 'rgba(184, 145, 46, 0.26)',
  },
  {
    id: 'goals',
    title: 'Milestone Savings Goals',
    badge: 'Target Pace',
    tagline: 'Know exactly what to save monthly',
    description:
      'Set target amounts and dates for travel, gadgets, or emergency funds. Kalya computes the monthly savings pace and monitors progress.',
    highlightStat: 'Auto-calculated monthly pace',
    icon: Target,
    accentColor: 'text-info',
    bgColor: 'bg-info-subtle',
    borderColor: 'border-info/20',
    hoverBorder: 'hover:border-info/50',
    tagColor: 'bg-info/10 text-info border-info/20',
    glowRgba: 'rgba(62, 107, 138, 0.22)',
  },
  {
    id: 'statements',
    title: 'Audit-Ready Statements',
    badge: 'PDF, Excel & CSV',
    tagline: 'Clean ledgers in one tap',
    description:
      'Export comprehensive monthly financial summaries formatted for tax filing and CA reviews. Zero watermarks, complete data clarity.',
    highlightStat: 'Clean PDF, Excel & CSV export',
    icon: FileSpreadsheet,
    accentColor: 'text-warning',
    bgColor: 'bg-warning-subtle',
    borderColor: 'border-warning/20',
    hoverBorder: 'hover:border-warning/50',
    tagColor: 'bg-warning/10 text-warning border-warning/20',
    glowRgba: 'rgba(201, 134, 43, 0.22)',
  },
  {
    id: 'privacy',
    title: 'Bank-Grade Privacy',
    badge: 'No SMS Scraping',
    tagline: 'Your money data stays yours',
    description:
      'Zero bank login credentials needed, no invasive SMS scraping, no third-party ad pixels, and zero data selling. Built on privacy first.',
    highlightStat: '100% Private · Zero Ads · Zero Trackers',
    icon: ShieldCheck,
    accentColor: 'text-primary dark:text-primary',
    bgColor: 'bg-primary-subtle',
    borderColor: 'border-primary/20',
    hoverBorder: 'hover:border-primary/50',
    tagColor: 'bg-primary/10 text-primary border-primary/20',
    glowRgba: 'rgba(13, 62, 38, 0.22)',
  },
];

export const Features: React.FC = () => {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number>(0);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through features every 4.5 seconds unless user recently interacted
  useEffect(() => {
    if (!isAutoCycling) return;

    const timer = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % KALYA_FEATURES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoCycling]);

  const handleSelectFeature = (index: number) => {
    setActiveFeatureIndex(index);
    setIsAutoCycling(false);

    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
    }
    // Resume auto-cycle after 12 seconds of inactivity
    userInteractionTimeoutRef.current = setTimeout(() => {
      setIsAutoCycling(true);
    }, 12000);
  };

  const activeFeature = KALYA_FEATURES[activeFeatureIndex];

  // Pure percentage-based circular layout (SSR-safe, responsive)
  const getFeatureCoords = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const rx = 39; // 39% container radius horizontal
    const ry = 38; // 38% container radius vertical
    return {
      x: 50 + rx * Math.cos(angle),
      y: 50 + ry * Math.sin(angle),
    };
  };

  return (
    <section
      id="features"
      className="py-16 sm:py-24 lg:py-28 bg-bg relative overflow-hidden"
      aria-label="Kalya Core Platform Features"
    >
      {/* Ambient background glows matching globals.css brand palette */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-180 h-90 bg-primary/6 rounded-full blur-[130px] -z-10" />
      <div className="pointer-events-none absolute bottom-12 right-1/4 w-125 h-75 bg-accent/8 rounded-full blur-[110px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASINGS.editorial }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-caption font-semibold text-primary mb-3.5 shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span className="eyebrow tracking-brand">THE KALYA SYSTEM</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08, ease: EASINGS.editorial }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight"
          >
            Everything your money needs. Nothing it doesn't.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.16, ease: EASINGS.editorial }}
            className="mt-3 text-body-sm sm:text-body-md lg:text-body-lg text-text-secondary max-w-2xl mx-auto"
          >
            Smart 50/30/20 budgets, instant UPI bill splits, gold with real GST, and audit-ready
            statements, all in one private app. Zero ads, zero bank passwords.
          </motion.p>
        </div>

        {/* ========================================================
            1. Desktop Circular Layout (Shown on lg and above)
            ======================================================== */}
        <div className="hidden lg:block relative h-170 xl:h-190 max-w-6xl mx-auto my-4 select-none">
          {/* Subtle Ambient Orbit Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Inner Ring */}
            <div className="w-105 h-105 xl:w-120 xl:h-120 rounded-full border border-dashed border-border/80" />
            {/* Outer Accent Ring */}
            <div className="absolute w-147.5 h-147.5 xl:w-167.5 xl:h-167.5 rounded-full border border-dashed border-accent/25" />
            {/* Soft Ambient Core Light */}
            <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-[70px]" />
            <div className="absolute w-56 h-56 rounded-full bg-accent/15 blur-[50px]" />
          </div>

          {/* Center Showcase Card with Real Kalya Mobile App Preview */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: EASINGS.editorial }}

              className="relative w-52 h-52 xl:w-64 xl:h-64"
            >
              <div
                aria-hidden
                className="absolute -inset-12 rounded-full border border-primary/25"
              />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-surface shadow-raised ring-2 ring-accent/30 bg-primary-subtle">
                <img
                  src="/person3.png"
                  alt="A Kalya user showing the app's home screen on his phone"
                  draggable={false}
                  className="w-full h-full object-cover object-[24%_50%]"
                />
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-transparent to-white/15 pointer-events-none" />
              </div>

              {/* Floating Active Feature Pill */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="-mt-px px-4 py-1.5 rounded-full bg-surface/95 backdrop-blur-md border border-border shadow-card flex items-center gap-2 max-w-xs text-center"
                >
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                  <span className="font-numeric text-caption font-semibold text-text-primary truncate">
                    {activeFeature.highlightStat}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Orbiting Feature Cards (7 Items) */}
          <div className="relative w-full h-full z-5">
            {KALYA_FEATURES.map((feature, index) => {
              const coords = getFeatureCoords(index, KALYA_FEATURES.length);
              const isActive = index === activeFeatureIndex;
              const Icon = feature.icon;

              return (
                <div
                  key={feature.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    zIndex: isActive ? 30 : 20,
                  }}
                >
                  <motion.button
                    type="button"
                    onClick={() => handleSelectFeature(index)}
                    onMouseEnter={() => handleSelectFeature(index)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'text-left w-56 xl:w-64 p-4 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-md',
                      'shadow-card hover:shadow-raised focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'bg-surface border-accent ring-2 ring-accent/40 shadow-raised -translate-y-1'
                        : 'bg-surface/90 border-border/80 hover:bg-surface hover:border-primary/40'
                    )}
                    style={{
                      boxShadow: isActive
                        ? `0 12px 30px -4px ${feature.glowRgba}, 0 4px 12px 0 rgba(22, 36, 29, 0.08)`
                        : undefined,
                    }}
                    aria-label={`${feature.title}: ${feature.tagline}`}
                  >
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div
                        className={cn(
                          'w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center border transition-transform duration-300',
                          feature.bgColor,
                          feature.borderColor,
                          isActive ? 'scale-110' : 'group-hover:scale-105'
                        )}
                      >
                        <Icon className={cn('w-5 h-5', feature.accentColor)} />
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0',
                          feature.tagColor
                        )}
                      >
                        {feature.badge}
                      </span>
                    </div>

                    {/* Feature Title */}
                    <h3
                      className={cn(
                        'font-display font-bold text-sm xl:text-base leading-tight transition-colors duration-200',
                        isActive ? 'text-text-primary' : 'text-text-primary'
                      )}
                    >
                      {feature.title}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed line-clamp-2">
                      {feature.description}
                    </p>

                    {/* Subtle active indicator bar */}
                    <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-text-muted">
                        {feature.tagline}
                      </span>
                      <ArrowRight
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          isActive ? 'text-accent translate-x-0.5' : 'text-text-muted/60 opacity-0'
                        )}
                      />
                    </div>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            2. Tablet Layout (Shown on md & hidden on lg)
            ======================================================== */}
        <div className="hidden md:block lg:hidden mt-6">
          {/* Tablet Center Feature Banner */}
          <div className="p-6 rounded-2xl border border-border bg-surface-raised mb-8 shadow-card flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-3 border-surface shadow-raised overflow-hidden bg-surface shrink-0 ring-2 ring-accent/30">
              <img
                src="/person2.png"
                alt="Kalya Mobile App"
                className="w-full h-full object-cover object-[24%_22%]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-subtle text-primary text-caption font-semibold mb-1.5 border border-primary/20">
                <span>All-in-one financial cockpit</span>
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary">
                Smart, private, and fully automated
              </h3>
              <p className="text-body-sm text-text-secondary mt-1">
                Tap on any pillar below to explore how Kalya streamlines budgeting, UPI splits, and
                wealth tracking.
              </p>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-2 gap-5">
            {KALYA_FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="bg-surface rounded-2xl p-5 border border-border hover:border-primary/40 shadow-card hover:shadow-raised transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center border',
                        feature.bgColor,
                        feature.borderColor
                      )}
                    >
                      <Icon className={cn('w-5 h-5', feature.accentColor)} />
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                        feature.tagColor
                      )}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-text-primary mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-3">
                    {feature.description}
                  </p>

                  <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 text-caption font-medium text-text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>{feature.highlightStat}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            3. Mobile Layout (Shown on sm and below)
            ======================================================== */}
        <div className="md:hidden space-y-3.5 mt-6">
          {/* Mobile Preview Badge Banner */}
          <div className="p-4 rounded-xl border border-border bg-surface-raised mb-4 shadow-card flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-surface shadow-md overflow-hidden bg-surface shrink-0 ring-1 ring-accent/30">
              <img
                src="/person2.png"
                alt="Kalya Mobile App"
                className="w-full h-full object-cover object-[24%_22%]"
              />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-text-primary">
                Your Financial Command Center
              </p>
              <p className="text-caption text-text-secondary mt-0.5">
                Explore the 7 core pillars built for modern personal finance in India.
              </p>
            </div>
          </div>

          {/* Vertical Stack of Feature Cards */}
          {KALYA_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="bg-surface rounded-xl p-4 border border-border shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={cn(
                      'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border mt-0.5',
                      feature.bgColor,
                      feature.borderColor
                    )}
                  >
                    <Icon className={cn('w-5 h-5', feature.accentColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="font-display font-bold text-text-primary text-sm truncate">
                        {feature.title}
                      </h3>
                      <span
                        className={cn(
                          'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border shrink-0',
                          feature.tagColor
                        )}
                      >
                        {feature.badge}
                      </span>
                    </div>

                    <p className="text-text-secondary text-xs leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="mt-2 text-[11px] font-medium text-text-muted flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <span className="truncate">{feature.highlightStat}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
