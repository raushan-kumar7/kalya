import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Eye, Download, Heart } from 'lucide-react';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata: Metadata = {
  title: 'About Kalya: clear, private money tracking',
  description:
    'Kalya brings budgeting, bill splitting with UPI, and multi-asset wealth tracking into one calm, private place. No ads, no data selling.',
  openGraph: {
    title: 'About Kalya: clear, private money tracking',
    description:
      'Kalya brings budgeting, bill splitting with UPI, and multi-asset wealth tracking into one calm, private place. No ads, no data selling.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary font-body antialiased flex flex-col selection:bg-primary-subtle selection:text-primary">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-border/70 bg-surface-raised/30">
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-180 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-caption font-semibold text-primary mb-5 shadow-2xs">
              <Heart className="h-3.5 w-3.5 text-accent" />
              <span>Our Mission & Principles</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
              Money should feel clear, not stressful.
            </h1>

            <p className="mt-6 text-body-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Your salary arrives, and by month-end it is hard to say where it went. Most of us
              juggle an expense app, a bill-splitting app, a gold or stock tracker and a
              spreadsheet. Kalya brings them into one calm, private place.
            </p>
          </div>
        </section>

        {/* What We Are Building */}
        <section className="py-16 sm:py-24 border-b border-border/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
                What we are building
              </h2>
              <p className="mt-4 text-body-lg text-text-secondary leading-relaxed">
                A simple app that sorts your income into needs, wants and savings, helps you split
                bills with friends over UPI, and shows your whole net worth, including gold, shares
                and funds.
              </p>
            </div>

            {/* Three Core Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">Clear</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  Plain numbers, no jargon. Understand your true financial picture in seconds.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-accent-subtle text-accent-strong flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">Private</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  No ads, and your data is never sold. Non-custodial architecture with zero bank
                  passwords.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-surface-raised border border-border text-text-primary flex items-center justify-center">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">Yours</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  Export everything whenever you want. Your records remain your property forever.
                </p>
              </div>
            </div>

            {/* Founder Line */}
            <div className="p-7 sm:p-9 rounded-3xl bg-surface border border-border/80 shadow-xs space-y-4">
              <span className="text-caption font-bold text-accent uppercase tracking-wider block">
                From the Founder
              </span>
              <p className="text-body-md text-text-secondary leading-relaxed italic">
                &ldquo;I built Kalya after getting tired of opening Splitwise for flat expenses, an
                SMS expense logger for daily chai, and a manual Excel spreadsheet for tracking gold
                and SIPs. Kalya puts mathematical order back into personal finances, without selling
                your data to advertisers.&rdquo;
              </p>
              <div className="pt-2 font-display font-bold text-text-primary text-body-sm">
                Raushan Kumar · Founder, Kalya
              </div>
            </div>

            {/* Free For Now Commitment */}
            <div className="p-8 rounded-3xl bg-primary-subtle/40 border border-primary/20 space-y-4 text-center sm:text-left">
              <h3 className="font-display text-2xl font-bold text-primary">
                Completely free for now
              </h3>
              <p className="text-body-md text-text-secondary leading-relaxed">
                We want Kalya to be genuinely useful first, so it is completely free for now. If
                that changes, we will tell you before anything happens.
              </p>
              <div className="pt-2">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-body-sm font-bold text-on-primary shadow-sm hover:bg-primary-hover transition-all cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
