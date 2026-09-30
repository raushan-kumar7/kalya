import type { Metadata, Viewport } from 'next';

export const siteConfig = {
  name: 'Kalya',
  shortName: 'Kalya',
  tagline: 'Ready For Tomorrow.',
  title: 'Kalya — Complete Financial Wellness & Wealth Growth',
  description:
    'Kalya is a comprehensive financial wellness and personal wealth management platform. Track net worth, manage assets and liabilities, and cultivate enduring wealth.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://kalya.app',
  ogImage: '/kalya_brand.png',
  keywords: [
    'Kalya',
    'Financial Wellness',
    'Wealth Growth',
    'Net Worth Tracker',
    'Asset Management',
    'Personal Finance',
    'Financial Health',
    'Portfolio Management',
    'Ready For Tomorrow',
  ],
  authors: [
    {
      name: 'Raushan Kumar',
      url: 'https://kalya.app',
    },
  ],
  creator: 'Raushan Kumar',
  themeColors: {
    light: '#f9f8f6',
    dark: '#0b1410',
    primary: '#0d3e26',
    accent: '#b8912e',
  },
} as const;

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.themeColors.light },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.themeColors.dark },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [...siteConfig.authors],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1254,
        height: 1254,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@kalyaapp',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/kalya_icon1.png', type: 'image/png' },
    ],
    apple: [{ url: '/kalya_app_icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.webmanifest',
};
