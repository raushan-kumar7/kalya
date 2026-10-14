'use client';

import * as React from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  CreditCard,
  PiggyBank,
  Receipt,
  Target,
  Coins,
  FileText,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { PersonIllustration } from './person-illustration';

export interface FeatureItem {
  id: 'track' | 'budget' | 'split' | 'goals' | 'wealth' | 'statements';
  label: string;
  headline: string;
  line: string;
  detailChip: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'track',
    label: 'Track',
    headline: 'Log every payment in seconds',
    line: 'UPI, cards and cash, sorted into your own categories.',
    detailChip: 'UPI, PhonePe, Google Pay & cards',
    icon: CreditCard,
  },
  {
    id: 'budget',
    label: 'Budget',
    headline: 'Your salary, sorted the day it lands',
    line: 'Needs, Wants and Savings, with a gentle alert before you overspend.',
    detailChip: 'Spend pace shows if you are on track to overshoot',
    icon: PiggyBank,
  },
  {
    id: 'split',
    label: 'Split',
    headline: 'Split a bill. Get paid back.',
    line: 'Four ways to split, and settle over UPI, bank transfer or cash.',
    detailChip: 'Every split lands in your own ledger automatically',
    icon: Receipt,
  },
  {
    id: 'goals',
    label: 'Goals',
    headline: 'Know exactly what to save each month',
    line: 'Set a target and a date, and Kalya works out the monthly amount.',
    detailChip: 'Status shows On track, Behind or Completed',
    icon: Target,
  },
  {
    id: 'wealth',
    label: 'Wealth',
    headline: 'Gold, stocks and funds, one net worth',
    line: 'Track gold with GST worked out, shares and mutual funds together.',
    detailChip: 'Gold: grams, rate and value, GST included',
    icon: Coins,
  },
  {
    id: 'statements',
    label: 'Statements',
    headline: 'Clean statements, ready when you need them',
    line: 'Download PDF, Excel or CSV, or print.',
    detailChip: 'Download PDF, Excel or CSV, or print',
    icon: FileText,
  },
];

export function FeaturesCircle() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.25 });

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isSmiling, setIsSmiling] = React.useState(false);
  const [userPauseUntil, setUserPauseUntil] = React.useState<number>(0);

  // Stepped rotation: every 4 seconds advance by 1 clockwise
  React.useEffect(() => {
    if (!isInView || isPaused) return;

    const timer = setInterval(() => {
      const now = Date.now();
      if (now < userPauseUntil) {
        return; // user clicked an icon, pause for 10s
      }

      setActiveIndex((prev) => (prev + 1) % FEATURES.length);
      // Brief smile for 800ms
      setIsSmiling(true);
      setTimeout(() => setIsSmiling(false), 800);
    }, 4000);

    return () => clearInterval(timer);
  }, [isInView, isPaused, userPauseUntil]);

  // Click on a specific icon: turns ring until that icon is at top, pauses 10s
  const handleSelectFeature = (index: number) => {
    setActiveIndex(index);
    setUserPauseUntil(Date.now() + 10000);
    setIsSmiling(true);
    setTimeout(() => setIsSmiling(false), 1200);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
    setUserPauseUntil(Date.now() + 10000);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % FEATURES.length);
    setUserPauseUntil(Date.now() + 10000);
  };

  const activeFeature = FEATURES[activeIndex];

  // Ring rotation angle: active index sits at top (-90 deg)
  // Step 0 -> 0 deg, Step 1 -> -60 deg, etc.
  const ringRotation = -activeIndex * 60;

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-20 sm:py-28 overflow-hidden bg-bg relative"
      aria-label="Features carousel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Subheading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-caption font-bold text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>The Six Pillars of Kalya</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Everything your money needs, in one app
          </h2>
          <p className="mt-3 text-body-lg text-text-secondary">
            Replace three apps and a spreadsheet.
          </p>
        </div>

        {/* Desktop & Tablet Features Circle Layout */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Left/Center: Rotating Ring & Center Illustration (7 cols) */}
          <div
            className="sm:col-span-7 flex flex-col items-center justify-center relative min-h-120"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Ambient circular aura glow */}
            <div className="absolute w-88 h-88 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />

            {/* Circular Ring Container */}
            <div className="relative w-100 h-100 flex items-center justify-center">
              {/* Outer Dashed Gold Ring */}
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-accent/40 pointer-events-none" />

              {/* Travelling indicator dot on ring */}
              <motion.div
                animate={{ rotate: ringRotation }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-4 rounded-full pointer-events-none"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent shadow-[0_0_12px_rgba(184,145,46,0.9)]" />
              </motion.div>

              {/* Center Person Illustration */}
              <div className="absolute z-10 w-52 h-64 pointer-events-none">
                <PersonIllustration
                  isSmiling={isSmiling}
                  activeFeature={activeFeature.id}
                  className="w-full h-full"
                />
              </div>

              {/* Rotating Ring with 6 Icons */}
              <motion.div
                animate={{ rotate: ringRotation }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                {FEATURES.map((item, index) => {
                  const angleDeg = index * 60 - 90; // 0 is top (-90 deg)
                  const angleRad = (angleDeg * Math.PI) / 180;
                  const radius = 175; // pixels
                  const x = Math.round(radius * Math.cos(angleRad));
                  const y = Math.round(radius * Math.sin(angleRad));

                  const isActive = index === activeIndex;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'absolute',
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="pointer-events-auto"
                    >
                      {/* Counter-rotate each icon so it always stays upright */}
                      <motion.button
                        type="button"
                        onClick={() => handleSelectFeature(index)}
                        animate={{
                          rotate: -ringRotation,
                          scale: isActive ? 1.15 : 1,
                        }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          'group relative min-w-11 min-h-11 p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-md select-none',
                          isActive
                            ? 'bg-primary text-on-primary ring-3 ring-accent shadow-[0_0_20px_rgba(184,145,46,0.5)]'
                            : 'bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text-primary hover:bg-surface-raised'
                        )}
                        aria-label={`${item.label}: ${item.headline}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span
                          className={cn(
                            'text-[10px] font-bold mt-1 uppercase tracking-wider',
                            isActive
                              ? 'text-on-primary'
                              : 'text-text-muted group-hover:text-text-primary'
                          )}
                        >
                          {item.label}
                        </span>
                      </motion.button>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Rotation Controls Under the Circle (WCAG 2.2 Level A pause control) */}
            <div className="mt-8 flex items-center gap-3 bg-surface border border-border rounded-full px-4 py-1.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-full hover:bg-surface-raised text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Previous feature"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-full hover:bg-surface-raised text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1.5 text-caption font-semibold px-2"
                aria-label={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
              >
                {isPaused ? (
                  <Play className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Pause className="h-3.5 w-3.5 text-accent" />
                )}
                <span>{isPaused ? 'Play' : 'Pause'}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-full hover:bg-surface-raised text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Next feature"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right: Active Feature Center Card (5 cols) */}
          <div className="sm:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-3xl border border-primary/20 bg-surface shadow-raised space-y-5"
              >
                <div className="inline-flex items-center gap-2 rounded-xl bg-primary-subtle text-primary px-3 py-1 text-caption font-bold font-numeric uppercase tracking-wider">
                  <activeFeature.icon className="h-4 w-4" />
                  <span>Feature 0{activeIndex + 1} of 06</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary leading-tight">
                    {activeFeature.headline}
                  </h3>
                  <p className="text-body-md text-text-secondary leading-relaxed">
                    {activeFeature.line}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/70">
                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border/60 text-caption font-semibold text-text-primary flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                    <span>{activeFeature.detailChip}</span>
                  </div>
                </div>

                {/* Direct quick action */}
                <div className="pt-2">
                  <a
                    href="#product-preview"
                    className="inline-flex items-center gap-1.5 text-caption font-bold text-primary hover:underline"
                  >
                    <span>Inspect screen mockup below</span>
                    <span>↓</span>
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Mobile View: Compact circle or vertical list below 340px     */}
        {/* ============================================================ */}
        <div className="sm:hidden space-y-6">
          {/* Mobile Carousel Circle */}
          <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-accent/40 pointer-events-none" />

            {/* Center Person Illustration */}
            <div className="absolute z-10 w-36 h-48 pointer-events-none">
              <PersonIllustration
                isSmiling={isSmiling}
                activeFeature={activeFeature.id}
                className="w-full h-full"
              />
            </div>

            {/* Rotating Ring on mobile */}
            <motion.div
              animate={{ rotate: ringRotation }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {FEATURES.map((item, index) => {
                const angleDeg = index * 60 - 90;
                const angleRad = (angleDeg * Math.PI) / 180;
                const radius = 120; // smaller mobile radius
                const x = Math.round(radius * Math.cos(angleRad));
                const y = Math.round(radius * Math.sin(angleRad));
                const isActive = index === activeIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="pointer-events-auto"
                  >
                    <motion.button
                      type="button"
                      onClick={() => handleSelectFeature(index)}
                      animate={{
                        rotate: -ringRotation,
                        scale: isActive ? 1.15 : 1,
                      }}
                      className={cn(
                        'min-w-11 min-h-11 p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm',
                        isActive
                          ? 'bg-primary text-on-primary ring-2 ring-accent'
                          : 'bg-surface text-text-secondary border border-border'
                      )}
                      aria-label={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.button>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Mobile active feature card below circle */}
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption font-bold text-primary uppercase tracking-wider">
                {activeFeature.label}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-raised min-h-11 min-w-11 flex items-center justify-center"
                  aria-label="Previous feature"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-raised min-h-11 min-w-11 flex items-center justify-center"
                  aria-label="Next feature"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <h3 className="font-display text-xl font-bold text-text-primary">
              {activeFeature.headline}
            </h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">{activeFeature.line}</p>
            <div className="p-2.5 rounded-lg bg-surface-raised border border-border text-caption text-text-muted">
              {activeFeature.detailChip}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
