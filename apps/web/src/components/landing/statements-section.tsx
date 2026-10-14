'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { FileText, Check, Download, FileSpreadsheet, Printer } from 'lucide-react';

export function StatementsSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.25 });

  const proofPoints = [
    'Summary of income and spending',
    'Spending by category',
    'Full transaction list',
  ];

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-28 bg-surface border-t border-border"
      aria-label="Statements and audit exports"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Body, Proof points (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-caption font-bold text-primary">
              <FileText className="h-3.5 w-3.5" />
              <span>Audit-Ready Export</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
              Clean statements, ready when you need them
            </h2>

            <p className="text-body-md sm:text-body-lg text-text-secondary leading-relaxed">
              Download a branded monthly statement as PDF, Excel or CSV, or print it. Useful for tax
              time, loan applications and your own records.
            </p>

            {/* Three Proof Points ticking in 80ms apart */}
            <div className="space-y-3.5 pt-2">
              {proofPoints.map((point, index) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: -12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
                  className="flex items-center gap-3 text-body-md text-text-primary font-medium"
                >
                  <div className="h-6 w-6 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-3" />
                  </div>
                  <span>{point}</span>
                </motion.div>
              ))}
            </div>

            {/* Format tags */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-caption font-semibold text-text-muted">
              <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> PDF Statement
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-success" /> Excel (XLSX) & CSV
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5 text-accent" /> Print Ready
              </span>
            </div>
          </div>

          {/* Right Column: Statement Sheet Mockup (6 cols) */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-6 sm:p-8 rounded-3xl border border-border bg-surface-raised/70 shadow-raised space-y-5"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="relative h-7 w-28">
                    <Image
                      src="/kalya_logo1.png"
                      alt="Kalya"
                      fill
                      sizes="112px"
                      className="object-contain object-left dark:hidden"
                    />
                    <Image
                      src="/kalya_logo_white1.png"
                      alt="Kalya"
                      fill
                      sizes="112px"
                      className="object-contain object-left hidden dark:block"
                    />
                  </div>
                  <span className="text-caption font-numeric text-text-muted">| Statement</span>
                </div>

                {/* Pulsing Format Action Buttons */}
                <div className="flex items-center gap-1.5 text-caption font-bold">
                  <motion.span
                    animate={isInView ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="px-2.5 py-1 rounded-md bg-surface border border-border shadow-2xs text-primary"
                  >
                    PDF
                  </motion.span>
                  <motion.span
                    animate={isInView ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="px-2.5 py-1 rounded-md bg-surface border border-border shadow-2xs text-success"
                  >
                    Excel
                  </motion.span>
                  <motion.span
                    animate={isInView ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="px-2.5 py-1 rounded-md bg-surface border border-border shadow-2xs text-text-secondary"
                  >
                    CSV
                  </motion.span>
                </div>
              </div>

              {/* Sheet Metadata */}
              <div className="flex justify-between text-caption text-text-muted">
                <div>
                  <span className="block font-semibold text-text-primary">Statement Period:</span>
                  <span>01 Oct 2026 – 31 Oct 2026</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-text-primary">Prepared for:</span>
                  <span>Sample Earner</span>
                </div>
              </div>

              {/* Cashflow Summary Block */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-2.5 font-numeric text-caption">
                <div className="flex justify-between text-text-secondary">
                  <span>Total Inflow (Income & Credits):</span>
                  <span className="font-bold text-text-primary">₹1,45,000.00</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Total Outflow (Needs + Wants):</span>
                  <span className="font-bold text-text-primary">₹68,450.00</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-primary font-bold text-body-sm">
                  <span>Net Savings Generated:</span>
                  <span className="text-success">+₹76,550.00 (52.8%)</span>
                </div>
              </div>

              {/* Sample Categories snippet */}
              <div className="space-y-1.5 text-caption font-numeric text-text-secondary">
                <div className="flex justify-between text-[11px] font-semibold text-text-muted uppercase border-b border-border/50 pb-1">
                  <span>Category</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between">
                  <span>Rent & Housing (Needs)</span>
                  <span>₹28,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Groceries & Utilities (Needs)</span>
                  <span>₹14,800.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dining & Social (Wants)</span>
                  <span>₹17,250.00</span>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                <span>Cryptographic Hash: 8f2a...c04e</span>
                <span className="text-success font-semibold flex items-center gap-1">
                  ● Ready for Tax & Audit
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
