import * as React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { LandingHeader, LandingFooter } from '@/components/landing';
import { PrivacyAccordion } from '@/components/legal/privacy-accordion';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kalya',
  description:
    'Last updated: October 2026. Plain language privacy policy written to fit India’s Digital Personal Data Protection Act, 2023. Zero ads, zero selling.',
  openGraph: {
    title: 'Privacy Policy | Kalya',
    description:
      'Last updated: October 2026. Plain language privacy policy written to fit India’s Digital Personal Data Protection Act, 2023. Zero ads, zero selling.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary font-body antialiased flex flex-col selection:bg-primary-subtle selection:text-primary">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-14 sm:pt-16 sm:pb-18 border-b border-border/70 bg-surface-raised/30">
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-180 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-caption font-semibold text-primary mb-5 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              <span>DPDP Act 2023 Compliant</span>
              <span className="text-text-muted">·</span>
              <span className="font-numeric">October 2026</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              Privacy Policy
            </h1>

            <p className="mt-4 text-body-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Last updated:{' '}
              <span className="font-semibold text-text-primary font-numeric">October 2026</span>. We
              have kept this short and plain.
            </p>
          </div>
        </section>

        {/* Content Container with Synchronized Highlight */}
        <PrivacyAccordion />
      </main>

      <LandingFooter />
    </div>
  );
}
