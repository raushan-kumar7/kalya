import * as React from 'react';
import type { Metadata } from 'next';
import {
  AnnouncementBar,
  LandingHeader,
  HeroSection,
  TrustStrip,
  ProductPreview,
  StatementsSection,
  PrivacySection,
  ComparisonSection,
  FreeForNowSection,
  FaqSection,
  FAQ_ITEMS,
  ClosingBanner,
  LandingFooter,
  Features,
} from '@/components/landing';

export const metadata: Metadata = {
  title: 'Kalya: Budget, split bills and track wealth in one free app',
  description:
    'Free budgeting app for India. Auto 50/30/20 budgets, bill splitting with UPI, gold and stock tracking, and clean statements. No ads.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Kalya: Budget, split bills and track wealth in one free app',
    description:
      'Free budgeting app for India. Auto 50/30/20 budgets, bill splitting with UPI, gold and stock tracking, and clean statements. No ads.',
    url: 'https://kalya.app',
    siteName: 'Kalya',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalya: Budget, split bills and track wealth in one free app',
    description:
      'Free budgeting app for India. Auto 50/30/20 budgets, bill splitting with UPI, gold and stock tracking, and clean statements. No ads.',
  },
};

export default function HomePage() {
  // JSON-LD Structured Data: Organization, SoftwareApplication, FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://kalya.app/#organization',
        name: 'Kalya',
        url: 'https://kalya.app',
        logo: 'https://kalya.app/kalya_logo1.png',
        sameAs: ['https://x.com/kalyaapp'],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://kalya.app/#software',
        name: 'Kalya',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web, Android, iOS',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
        description:
          'Free budgeting app for India. Auto 50/30/20 budgets, bill splitting with UPI, gold and stock tracking, and clean statements. No ads.',
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://kalya.app/#faq',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-body antialiased flex flex-col selection:bg-primary-subtle selection:text-primary">
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Header and Announcement Bar */}
      <AnnouncementBar />
      <LandingHeader />

      {/* Main Page Flow (Sections 2 through 10 as specified in setup.md) */}
      <main className="flex-1">
        {/* 2. Hero */}
        <HeroSection />

        {/* 3. Trust Strip */}
        <TrustStrip />

        {/* 4. Features Circle (Center Person Illustration + Stepped 60° Rotation) */}
        {/* <FeaturesCircle /> */}
        <Features />

        {/* 5. Product Preview (Dashboard, Budget, Split, Wealth) */}
        <ProductPreview />

        {/* 6. Statements */}
        <StatementsSection />

        {/* 7. Privacy */}
        <PrivacySection />

        {/* 8. Comparison */}
        <ComparisonSection />

        {/* 9. Free-for-now */}
        <FreeForNowSection />

        {/* 10. FAQ (10 Exact Questions) */}
        <FaqSection />

        {/* 11. Closing Banner */}
        <ClosingBanner />
      </main>

      {/* 12. Footer */}
      <LandingFooter />
    </div>
  );
}
