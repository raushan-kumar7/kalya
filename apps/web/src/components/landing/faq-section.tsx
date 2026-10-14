'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/libs/utils';

import { FAQ_ITEMS } from './faq-data';

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-20 sm:py-28 bg-surface border-t border-border"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-body-md sm:text-body-lg text-text-secondary">
            Answers to the questions people ask before signing up.
          </p>
        </div>

        {/* Single Column of Ten Questions */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.q}
                className="rounded-2xl border border-border bg-surface-raised/40 overflow-hidden shadow-2xs transition-colors hover:border-primary/30"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-display font-bold text-body-md text-text-primary hover:bg-surface-raised transition-colors cursor-pointer min-h-12"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4.5 w-4.5 text-text-secondary transition-transform duration-250 shrink-0',
                      isOpen && 'rotate-180 text-primary'
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-body-md text-text-secondary leading-relaxed border-t border-border/50">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Link under FAQ */}
        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1.5 font-bold text-primary hover:underline text-body-md"
          >
            <span>Still have a question? Contact us</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
