import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  Fingerprint,
  Download,
  Trash2,
  KeyRound,
  FileCheck2,
  Mail,
  ArrowRight,
  Server,
  Layers,
} from 'lucide-react';
import { LandingHeader, LandingFooter } from '@/components/landing';
import { Card, CardContent, Badge, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Security & Sovereign Privacy Architecture | Kalya Personal Finance App',
  description:
    'Discover Kalya’s sovereign security architecture: bank-grade AES-256 encryption, zero third-party ads or data sales, non-custodial design, and full DPDP Act 2023 compliance.',
  openGraph: {
    title: 'Security & Sovereign Privacy Architecture | Kalya Personal Finance App',
    description:
      'Discover Kalya’s sovereign security architecture: bank-grade AES-256 encryption, zero third-party ads or data sales, non-custodial design, and full DPDP Act 2023 compliance.',
  },
};

const PILLARS = [
  {
    icon: Lock,
    title: 'AES-256 & TLS 1.3 Encryption',
    description:
      'All stored financial records, encrypted account ledgers, and transaction snapshots are protected using industry-standard AES-256 encryption at rest. All data in motion travels through modern TLS 1.3 channels.',
    tag: 'Cryptographic Standard',
  },
  {
    icon: Server,
    title: 'Non-Custodial Architecture',
    description:
      'Kalya is a financial intelligence workspace and personal ledger, not a custodian bank. We never store your banking passwords, never hold cash balances, and cannot move funds on your behalf.',
    tag: 'Zero-Custody',
  },
  {
    icon: EyeOff,
    title: 'Zero Ads & No Data Brokering',
    description:
      'We never monetize your spending habits or profile you for credit card offers and predatory loans. Our revenue comes solely from transparent software subscriptions, never from selling user data.',
    tag: 'Pure Privacy',
  },
  {
    icon: Fingerprint,
    title: 'Biometric & FIDO2 Protection',
    description:
      'Lock down your web and mobile vaults with hardware-backed WebAuthn, Touch ID, Face ID, and biometric device keys. Multi-factor authentication shields sensitive financial records.',
    tag: 'Hardware-Bound',
  },
  {
    icon: Download,
    title: '100% Data Portability',
    description:
      'Your ledger is yours. Export all transactions, group splits, categories, and portfolio records at any time in structured JSON and CSV formats without friction or artificial gates.',
    tag: 'Zero Lock-In',
  },
  {
    icon: Trash2,
    title: 'Permanent Data Erasure',
    description:
      'Full compliance with India’s Digital Personal Data Protection (DPDP) Act, 2023. Deleting your Kalya account immediately and permanently purges all ledger entries and active sessions.',
    tag: 'DPDP Act 2023',
  },
];

const CONTROLS = [
  {
    icon: KeyRound,
    title: 'Identity & Session Hardening',
    points: [
      'Argon2id password hashing with high work factor and unique per-user salts.',
      'Cryptographically signed, ephemeral JWT tokens delivered exclusively in HTTP-only, Secure, SameSite cookies.',
      'Automatic session timeout, activity tracking, and privacy veil shielding against screen snooping.',
    ],
  },
  {
    icon: Layers,
    title: 'Perimeter Defense & Rate Limiting',
    points: [
      'Cloudflare DDoS mitigation with real-time anomaly detection and edge caching.',
      'Strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and CORS restrictions.',
      'Granular IP and account rate limiting preventing automated brute-force attacks and credential stuffing.',
    ],
  },
  {
    icon: FileCheck2,
    title: 'Auditable Ledger Integrity',
    points: [
      'Tamper-evident append-only journal entries for all expense entries and debt settlements.',
      'Comprehensive audit logging across administrative, authentication, and security mutations.',
      'Isolated staging environments with synthetic mock data ensuring production databases are never touched during testing.',
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary font-body antialiased flex flex-col selection:bg-primary-subtle selection:text-primary">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-border/70 bg-surface-raised/30">
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-180 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-caption font-semibold text-primary mb-5 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              <span>Sovereign Security Vault</span>
              <span className="text-text-muted">·</span>
              <span className="font-numeric">Bank-Grade Protection</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
              Your wealth is your business. Period.
            </h1>

            <p className="mt-6 text-body-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Most free financial apps monetize by selling your transaction history to lenders,
              credit bureaus, and advertisers. Kalya is built on sovereign principles: zero ads,
              non-custodial architecture, and absolute data privacy.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/auth/signup">
                  Open Sovereign Vault
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link href="/contact">Contact Security Team</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pillars Grid */}
        <section className="py-16 sm:py-24 border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-caption uppercase tracking-wider font-bold text-accent">
                Core Foundations
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mt-2">
                Built from the ground up for total financial safety
              </h2>
              <p className="mt-3 text-body-md text-text-secondary">
                Explore the engineering principles and strict boundaries that safeguard your wealth
                data every second.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PILLARS.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <Card
                    key={pillar.title}
                    className="border border-border/80 bg-surface shadow-card hover:border-primary/40 transition-all duration-200"
                  >
                    <CardContent className="p-6 sm:p-7 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-11 w-11 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {pillar.tag}
                        </Badge>
                      </div>

                      <h3 className="font-display text-xl font-bold text-text-primary tracking-tight">
                        {pillar.title}
                      </h3>

                      <p className="text-body-sm text-text-secondary leading-relaxed">
                        {pillar.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Deep Dive Security Controls */}
        <section className="py-16 sm:py-24 border-b border-border/80 bg-surface-raised/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-caption uppercase tracking-wider font-bold text-accent">
                System Safeguards
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mt-2">
                Defense in depth at every layer
              </h2>
              <p className="mt-3 text-body-md text-text-secondary">
                How Kalya ensures resilient access control, perimeter defense, and data veracity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CONTROLS.map((ctrl) => {
                const CtrlIcon = ctrl.icon;
                return (
                  <div
                    key={ctrl.title}
                    className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4"
                  >
                    <div className="h-10 w-10 rounded-xl bg-accent-subtle text-accent-strong flex items-center justify-center">
                      <CtrlIcon className="h-5 w-5" />
                    </div>

                    <h3 className="font-display text-lg font-bold text-text-primary">
                      {ctrl.title}
                    </h3>

                    <ul className="space-y-2.5 text-body-sm text-text-secondary">
                      {ctrl.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold leading-5">·</span>
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Vulnerability Disclosure & Bug Bounty */}
        <section className="py-16 sm:py-20 border-b border-border/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border bg-surface p-8 sm:p-12 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-3 py-0.5 text-caption font-semibold text-accent-strong">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Responsible Disclosure</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  Security Researcher or Bug Bounty?
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  We welcome responsible security research. If you discover a potential
                  vulnerability in Kalya’s apps, APIs, or infrastructure, please submit your
                  advisory directly to our security response team.
                </p>
              </div>

              <div className="shrink-0">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link href="/contact">
                    Report Vulnerability
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
