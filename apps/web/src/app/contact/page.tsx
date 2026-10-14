import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { LandingHeader, LandingFooter } from '@/components/landing';
import { ContactForm } from '@/components/forms/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Talk to Us | Contact Kalya',
  description:
    'Questions, feedback or a feature idea? We read every message and reply within 2 working days.',
  openGraph: {
    title: 'Talk to Us | Kalya',
    description:
      'Questions, feedback or a feature idea? We read every message and reply within 2 working days.',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary font-body antialiased flex flex-col selection:bg-primary-subtle selection:text-primary">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section (setup.md Section 16) */}
        <section className="relative overflow-hidden pt-12 pb-14 sm:pt-16 sm:pb-18 border-b border-border/70 bg-surface-raised/30">
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-180 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-caption font-semibold text-primary mb-5 shadow-2xs">
              <MessageSquare className="h-3.5 w-3.5 text-accent" />
              <span>Direct Support</span>
              <span className="text-text-muted">·</span>
              <span className="font-numeric">2-Day Response SLA</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              Talk to us
            </h1>

            <p className="mt-4 text-body-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Questions, feedback or a feature idea? We read every message.
            </p>
          </div>
        </section>

        {/* Contact Body: Form on Left, 3 Cards on Right (setup.md Section 16) */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Contact Form */}
              <div className="lg:col-span-7">
                <ContactForm />
              </div>

              {/* Right Column: Three Small Cards (+ Company details card) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Card 1: Email us */}
                <Card className="border-border bg-surface shadow-card hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-display text-body-md font-bold text-text-primary">
                            Email us
                          </h2>
                          <Badge variant="subtle" size="sm" className="font-numeric text-[11px]">
                            2 working days
                          </Badge>
                        </div>
                        <a
                          href="mailto:support@kalya.app"
                          className="font-medium text-primary hover:underline block text-body-sm"
                        >
                          support@kalya.app
                        </a>
                        <p className="text-caption text-text-secondary leading-relaxed pt-0.5">
                          We reply within{' '}
                          <span className="font-semibold text-text-primary font-numeric">
                            2 working days
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Privacy and data requests */}
                <Card className="border-border bg-surface shadow-card hover:border-accent/40 transition-colors">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-accent-subtle text-accent-strong flex items-center justify-center shrink-0 border border-accent/20">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-display text-body-md font-bold text-text-primary">
                            Privacy and data requests
                          </h2>
                          <Badge variant="subtle" size="sm" className="text-[11px]">
                            DPDP 2023
                          </Badge>
                        </div>
                        <p className="text-caption text-text-secondary leading-relaxed">
                          Choose &ldquo;Privacy request&rdquo; in the form, or write to{' '}
                          <a
                            href="mailto:privacy@kalya.app"
                            className="font-semibold text-primary hover:underline"
                          >
                            privacy@kalya.app
                          </a>
                          . We review and resolve data requests promptly.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 3: Quick answers */}
                <Card className="border-primary/25 bg-primary-subtle/30 shadow-card hover:bg-primary-subtle/50 transition-colors">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-surface text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h2 className="font-display text-body-md font-bold text-text-primary">
                          Quick answers
                        </h2>
                        <p className="text-caption text-text-secondary leading-relaxed">
                          Many questions are already answered in our FAQ.
                        </p>
                        <Link
                          href="/#faq"
                          className="inline-flex items-center gap-1.5 font-bold text-body-sm text-primary hover:underline pt-1"
                        >
                          <span>Read the FAQ</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
