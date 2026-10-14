'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck, Bell } from 'lucide-react';

export function FreeForNowSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const points = [
    {
      title: 'Everything included',
      description:
        'Auto 50/30/20 budgets, 4-way bill splitting, gold with GST, and clean statements.',
      icon: CheckCircle2,
    },
    {
      title: 'No card details at sign-up',
      description: 'Create your account with just an email. We will never ask for payment info.',
      icon: ShieldCheck,
    },
    {
      title: 'If that ever changes, we will tell you first',
      description: 'We want Kalya to be genuinely useful first. No surprise paywalls.',
      icon: Bell,
    },
  ];

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-28 bg-surface-raised/40 border-t border-border"
      aria-label="Free for now transparency"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Large ₹0 with soft gold glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mb-3"
        >
          <span className="font-numeric text-6xl sm:text-7xl font-extrabold text-accent drop-shadow-[0_4px_24px_rgba(184,145,46,0.35)]">
            ₹0
          </span>
        </motion.div>

        {/* Heading & Subheading */}
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
          Completely free, for now
        </h2>
        <p className="mt-3 text-body-md sm:text-body-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Every feature is open to everyone. No credit card. No trial timer.
        </p>

        {/* Three short points */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <motion.div
                key={pt.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="h-9 w-9 rounded-xl bg-primary-subtle text-primary flex items-center justify-center mb-3">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-text-primary">{pt.title}</h3>
                  <p className="mt-1 text-body-sm text-text-secondary leading-relaxed">
                    {pt.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Primary CTA button with gentle pulse */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10"
        >
          <Link
            href="/auth/sign-up"
            className="group relative inline-flex items-center gap-2.5 rounded-xl bg-linear-to-b from-[#145334] via-[#0d3e26] to-[#072617] px-8 py-3.5 text-body-md font-bold text-white shadow-[0_4px_16px_rgba(13,62,38,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-emerald-700/50 hover:from-[#175f3c] hover:to-[#0a331f] hover:shadow-[0_8px_24px_rgba(13,62,38,0.45),0_0_16px_rgba(184,145,46,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden dark:from-[#2e7d55] dark:via-[#1e583c] dark:to-[#133d28] dark:border-white/20"
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
        </motion.div>
      </div>
    </section>
  );
}
