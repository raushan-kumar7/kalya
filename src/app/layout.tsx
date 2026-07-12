// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";

// Font configurations — mapped to match design tokens in globals.css
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Design tokens call for IBM Plex Mono (or JetBrains Mono) for all
// currency/tabular figures — swapped out Geist Mono to match.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D3E26" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1410" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kalya.finance"),
  title: {
    template: "%s | Kalya",
    default: "Kalya — Your Personal Finance Command Center",
  },
  description:
    "Consolidate your income, expenses, assets, liabilities, budgets, and retirement funds (EPF, PPF, NPS) into one clear, calm dashboard. Built for financial fitness in India.",
  applicationName: "Kalya",
  authors: [
    { name: "Kalya Team", url: "https://kalya.finance" },
    { name: "Raushan Kumar", url: "https://github.com/raushan-kumar7" },
  ],
  generator: "Next.js",
  keywords: [
    "Kalya",
    "Personal Finance India",
    "Net Worth Tracker",
    "EPF Tracker",
    "NPS Portfolio",
    "PPF Account Tracker",
    "Expense Splitter",
    "Budget Planner",
    "Financial Fitness",
    "EMI Amortization",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Kalya",
  publisher: "Kalya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kalya.finance",
    siteName: "Kalya",
    title: "Kalya — Ready for tomorrow.",
    description:
      "A personal finance command center for India. Track income, expenses, assets, liabilities, budgets, insurance, and retirement funds in one calm dashboard.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kalya — Personal Finance Command Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalya — Ready for tomorrow.",
    description:
      "A personal finance command center for India. Track income, expenses, assets, liabilities, budgets, insurance, and retirement funds in one calm dashboard.",
    creator: "@KalyaHQ",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-(--color-bg) text-(--color-text-primary)">
        {children}
      </body>
    </html>
  );
}
