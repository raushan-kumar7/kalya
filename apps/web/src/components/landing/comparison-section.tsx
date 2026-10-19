'use client';

import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';

interface ComparisonRow {
  need: string;
  kalya: string;
  others: string;
}

const COMPARISONS: ComparisonRow[] = [
  {
    need: 'Auto 50/30/20 budget from your salary',
    kalya: 'Built in',
    others: 'Manual formulas or a paid add-on',
  },
  {
    need: 'Split bills with friends, settle by UPI',
    kalya: 'Built in',
    others: 'A separate app',
  },
  {
    need: 'Splits show up in your own budget',
    kalya: 'Automatic',
    others: 'Copy and paste',
  },
  {
    need: 'Gold and silver tracking with GST',
    kalya: 'Built in',
    others: 'A manual sheet',
  },
  {
    need: 'Goals with a monthly target',
    kalya: 'Built in',
    others: 'Manual math',
  },
  {
    need: 'Branded PDF and Excel statements',
    kalya: 'Built in',
    others: 'Often paid, or not available',
  },
  {
    need: 'No ads, private by design',
    kalya: 'Yes',
    others: 'Varies by app',
  },
];

export function ComparisonSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-28 bg-surface border-t border-border"
      aria-label="Kalya comparison matrix"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Subheading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            One app instead of four
          </h2>
          <p className="mt-3 text-body-md sm:text-body-lg text-text-secondary leading-relaxed">
            Most people juggle an expense app, a bill-splitting app, a gold or stock tracker and a
            spreadsheet.
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-3xl border border-border bg-surface shadow-md">
          <table className="w-full text-left text-body-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-raised">
                <th className="py-4.5 px-6 font-bold text-text-muted uppercase text-caption tracking-wider">
                  What you need
                </th>
                <th className="py-4.5 px-6 font-extrabold text-primary bg-primary-subtle/50 text-body-sm border-x border-border/80 w-1/3">
                  Kalya
                </th>
                <th className="py-4.5 px-6 font-bold text-text-muted uppercase text-caption tracking-wider w-1/3">
                  Separate apps and spreadsheets
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {COMPARISONS.map((row, index) => (
                <motion.tr
                  key={row.need}
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="hover:bg-surface-raised/40 transition-colors"
                >
                  <td className="py-4.5 px-6 font-medium text-text-primary">{row.need}</td>
                  <td className="py-4.5 px-6 font-bold text-primary bg-primary-subtle/30 border-x border-border/70">
                    <div className="flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0.6 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                          delay: index * 0.06 + 0.1,
                        }}
                        className="h-5 w-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0"
                      >
                        <Check className="h-3 w-3 stroke-3" />
                      </motion.div>
                      <span>{row.kalya}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-text-secondary">{row.others}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="md:hidden space-y-3.5">
          {COMPARISONS.map((row, index) => (
            <motion.div
              key={row.need}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-5 rounded-2xl border border-border bg-surface space-y-3 shadow-xs"
            >
              <h3 className="font-semibold text-body-sm text-text-primary">{row.need}</h3>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-caption">
                <div className="p-2.5 rounded-xl bg-primary-subtle/60 border border-primary/20">
                  <span className="text-[10px] uppercase font-bold text-primary block">Kalya</span>
                  <span className="font-bold text-primary flex items-center gap-1 mt-0.5">
                    <Check className="h-3.5 w-3.5" /> {row.kalya}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-raised border border-border">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">
                    Others
                  </span>
                  <span className="text-text-secondary block mt-0.5 leading-tight">
                    {row.others}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
