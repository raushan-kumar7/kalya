'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export function ClosingBanner() {
  const bannerRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(bannerRef, { once: true, amount: 0.3 });

  return (
    <section ref={bannerRef} className="py-20 sm:py-28 relative overflow-hidden bg-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl bg-linear-to-b from-[#113524] to-[#0c2419] text-white p-8 sm:p-16 shadow-2xl overflow-hidden border border-white/10 text-center"
        >
          {/* Subtle gold sparkles and glow in background */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/40 rounded-full blur-[90px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-accent/15 rounded-full blur-[80px] -z-10 pointer-events-none" />

          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-caption font-bold text-accent mb-5 border border-white/15">
            <Sparkles className="h-3.5 w-3.5" />
            <span>READY FOR TOMORROW.</span>
          </div>

          {/* Heading */}
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your next salary deserves a plan.
          </h2>

          {/* Subheading */}
          <p className="mt-4 text-body-md sm:text-body-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            Completely free for now. No credit card. Set up in minutes.
          </p>

          {/* Primary Action Button + Reassurance line beside */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-linear-to-b from-[#d4aa3b] via-[#b8912e] to-[#99731a] px-8 py-3.5 text-body-md font-bold text-[#16241d] shadow-[0_4px_16px_rgba(184,145,46,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-amber-300/40 hover:from-[#dfb748] hover:to-[#a67d20] hover:shadow-[0_8px_24px_rgba(184,145,46,0.5),0_0_16px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-linear-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                aria-hidden="true"
              />
              <span className="relative z-10 tracking-tight">Get Started Free</span>
              <span className="relative z-10 flex items-center justify-center h-6 w-6 rounded-lg bg-black/10 group-hover:bg-black/15 transition-colors duration-200">
                <ArrowRight className="h-4 w-4 text-[#16241d] transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
            <span className="text-caption text-white/70 font-medium">
              No ads. Your data stays yours.
            </span>
          </div>

          {/* Small line: Already have an account? Sign In */}
          <div className="mt-6 text-caption text-white/60">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-accent hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
