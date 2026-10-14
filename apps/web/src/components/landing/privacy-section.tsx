'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Lock, Shield, Layers, Download, ArrowRight } from 'lucide-react';

export function PrivacySection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.25 });

  const promises = [
    {
      title: 'No ads, no data selling',
      copy: 'We never sell your spending to lenders, card companies or advertisers.',
      icon: Lock,
    },
    {
      title: 'Your money stays put',
      copy: 'Kalya tracks money. It never holds or moves your funds.',
      icon: Shield,
    },
    {
      title: 'Kept separate',
      copy: "Each account's data is isolated from every other user's.",
      icon: Layers,
    },
    {
      title: 'Take it with you',
      copy: 'Export everything as CSV, JSON or PDF whenever you want.',
      icon: Download,
    },
  ];

  return (
    <section
      id="privacy"
      ref={containerRef}
      className="py-20 sm:py-28 bg-surface-raised/40 border-t border-border"
      aria-label="Privacy and security promises"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Subheading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Your money data is yours
          </h2>
          <p className="mt-3 text-body-lg sm:text-xl text-text-secondary font-medium">
            No ads. No selling. No bank passwords.
          </p>
        </div>

        {/* Four Promise Cards (staggered entrance, lift 4px on hover) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promises.map((promise, index) => {
            const Icon = promise.icon;
            return (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4 }}
                className="p-6 sm:p-7 rounded-2xl border border-border/80 bg-surface shadow-xs transition-shadow hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="h-11 w-11 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-primary">
                    {promise.title}
                  </h3>
                  <p className="text-body-sm text-text-secondary leading-relaxed">{promise.copy}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Link under cards & Trust Line */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-body-sm">
          <Link
            href="/privacy"
            className="group inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
          >
            <span>Read our Privacy Policy</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <span className="hidden sm:inline text-text-muted">·</span>
          <span className="text-text-secondary font-medium">No ads. Your data stays yours.</span>
        </div>
      </div>
    </section>
  );
}
