# SEO & Metadata Blueprint: Kalya (कल्य)

This document defines the SEO strategy, metadata requirements, and technical implementations for **Kalya** to ensure search engine optimization, premium social shareability (Open Graph/Twitter Cards), search engine structured data, and PWA capability in Next.js 16.

---

## 1. Core SEO Keywords & Messaging

### 1.1 Focus Keywords
* **Primary:** `personal finance command center India`, `financial fitness tracker`, `consolidated net worth dashboard India`
* **Secondary:** `EPF PPF NPS tracker`, `income expense split India`, `wealth management dashboard`, `mutual funds tracker India`, `gold and silver asset tracker`, `EMI calculator and amortization`, `retirement planning India`, `family protection insurance tracker`
* **Brand Keywords:** `Kalya`, `Kalya finance`, `kalya.io`, `kalya.finance`, `Kalya personal finance`

### 1.2 Meta Descriptions & Taglines
* **Homepage Meta Description:**
  > "Consolidate your income, expenses, assets, liabilities, budgets, and retirement funds (EPF, PPF, NPS) into one clear, calm command center. Kalya is built for financial fitness in India. Ready for tomorrow."
* **Social Share / OG Title:** `Kalya — Your Personal Finance Command Center`
* **Social Share / OG Description:** `Stop switching between banking apps, broker portals, and spreadsheets. Track your assets, liabilities, and retirement funds under one secure dashboard.`

---

## 2. Next.js 16 Technical Implementation

In Next.js 16, metadata is defined in Server Components (layouts and pages) using either the static `metadata` object or the dynamic `generateMetadata` function.

### 2.1 Global Layout Metadata (`src/app/layout.tsx`)

This configures default values, title templates, Open Graph defaults, and PWA themes.

```tsx
// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "@/styles/globals.css";

// Font configurations
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

// Configure viewport separate from metadata in modern Next.js
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D3E26" }, // Primary Deep Emerald
    { media: "(prefers-color-scheme: dark)", color: "#0B1410" },  // Dark Mode Background
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  // Base URL prefix for all metadata fields requiring absolute URLs (critical for OG images)
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://kalya.finance"
  ),
  title: {
    template: "%s | Kalya",
    default: "Kalya — Your Personal Finance Command Center",
  },
  description:
    "Consolidate your income, expenses, assets, liabilities, budgets, and retirement funds (EPF, PPF, NPS) into one clear, calm dashboard. Built for financial fitness in India.",
  applicationName: "Kalya",
  authors: [{ name: "Kalya Team", url: "https://kalya.finance" }],
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
  
  // Open Graph
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

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Kalya — Ready for tomorrow.",
    description:
      "A personal finance command center for India. Track income, expenses, assets, liabilities, budgets, insurance, and retirement funds in one calm dashboard.",
    creator: "@KalyaHQ",
    images: ["/images/og-image.png"],
  },

  // Icon definitions (static files in app directory take precedence, but listed here as fallback)
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  // Verification codes for Webmaster tools
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
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
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9F8F6] text-[#16241D] dark:bg-[#0B1410] dark:text-[#F4F2EC]">
        {children}
      </body>
    </html>
  );
}
```

---

## 3. Page-Specific SEO Configuration

### 3.1 Public Pages (Indexable)
These pages drive organic traffic and must be optimized for maximum visibility.

| Page | Path | Custom Title | Description | Robots |
|---|---|---|---|---|
| **Landing Page** | `/` | `Kalya — Your Personal Finance Command Center` | (Default description) | `index, follow` |
| **Pricing / Launch** | `/pricing` | `Pricing & Plans | Kalya` | Transparent pricing plans. Start tracking your net worth and optimizing your financial fitness today. | `index, follow` |
| **Privacy Policy** | `/privacy` | `Privacy Policy | Kalya` | Read how Kalya securely stores and encrypts your local database and account files. Zero sold data. | `index, follow` |
| **Terms of Service** | `/terms` | `Terms of Service | Kalya` | Terms and conditions governing the usage of the Kalya platform. | `index, follow` |

*Example code for `/pricing/page.tsx`:*
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "Transparent pricing plans. Start tracking your net worth and optimizing your financial fitness today.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return <main>...</main>;
}
```

### 3.2 Private/App Pages (Strictly Non-Indexable)
Pages under dashboard authentication contain sensitive user financial records. They must **never** be indexed by search engines, web scraping bots, or AI search agents.

> [!CAUTION]
> Ensure all pages under `/dashboard`, `/accounts`, `/transactions`, `/budgets`, `/goals`, `/assets`, `/liabilities`, `/insurance`, `/retirement`, and authentication routes (`/auth/*`, `/login`, `/signup`) are strictly set to `noindex, nofollow`.

```tsx
// src/app/dashboard/layout.tsx or src/app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your financial health summary.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

## 4. Static File Conventions

Next.js generates dynamic configuration files for search engines using special code-based route handlers.

### 4.1 Dynamic Sitemap Handler (`src/app/sitemap.ts`)
Generates the list of public pages. Do not include user dashboard pages here.

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalya.finance";

  const publicRoutes = ["", "/pricing", "/privacy", "/terms"];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1.0 : 0.6,
  }));
}
```

### 4.2 Dynamic Robots Handler (`src/app/robots.ts`)
Defines crawler behavior, blocking search bots from all private data directories and API endpoints.

```typescript
// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalya.finance";

  return {
    rules: {
      userAgent: "*",
      allow: ["/$", "/pricing$", "/privacy$", "/terms$", "/images/"],
      disallow: [
        "/api/",
        "/dashboard/",
        "/auth/",
        "/login/",
        "/signup/",
        "/accounts/",
        "/transactions/",
        "/budgets/",
        "/goals/",
        "/assets/",
        "/liabilities/",
        "/insurance/",
        "/retirement/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### 4.3 Web Manifest Configuration (`src/app/manifest.ts`)
Required for progressive web app (PWA) installation capability.

```typescript
// src/app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kalya Personal Finance",
    short_name: "Kalya",
    description: "Financial fitness command center for India.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F9F8F6",
    theme_color: "#0D3E26",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
```

---

## 5. Structured Data (JSON-LD)

To help search engines and AI crawlers understand the entity structure of Kalya, we implement JSON-LD schemas in the HTML output.

### 5.1 Schema Script Component
This reusable component outputs sanitised JSON-LD data to prevent XSS injection (cross-site scripting) by replacing occurrences of `<` with unicode representations.

```tsx
// src/components/JsonLd.tsx
import React from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
```

### 5.2 Homepage Structured Data Payload
Inject this into `src/app/page.tsx` (the landing page) to establish the brand context.

```tsx
// src/app/page.tsx
import { JsonLd } from "@/components/JsonLd";

export default function HomePage() {
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kalya",
    "alternateName": "Kalya Finance",
    "url": "https://kalya.finance",
    "logo": "https://kalya.finance/images/logo.png",
    "description": "Consolidate your income, expenses, assets, liabilities, budgets, insurance, and retirement funds (EPF, PPF, NPS) into one secure, calm dashboard for individuals in India.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "INR"
    },
    "featureList": [
      "Income & Expense tracking",
      "Dynamic Budgeting & Alerts",
      "Asset Consolidation (Gold, Silver, Equity)",
      "Liability & Loan Amortization Plans",
      "Retirement Balance Tracking (EPF, PPF, NPS)",
      "Secure Bank Balance Summaries"
    ],
    "author": {
      "@type": "Organization",
      "name": "Kalya Team",
      "url": "https://kalya.finance"
    }
  };

  return (
    <>
      <JsonLd data={brandSchema} />
      {/* Rest of the landing page markup */}
      <main>...</main>
    </>
  );
}
```

---

## 6. Social Share / OG Image Design Strategy

To match Kalya's **sophisticated, premium, and calm** aesthetics, social media preview images (Open Graph / Twitter Cards) must follow strict styling rules:

1. **Resolution:** `1200 x 630` pixels (standard Open Graph format).
2. **Background:** Solid Off-White/Alabaster (`#F9F8F6`) or Dark Mode Deep Emerald (`#0B1410`).
3. **Typography:** Headline text styled in **Outfit (Bold)** and supporting descriptions in **Inter**.
4. **Visual Accent:** The central graphic should show the Kalya logo icon: a stylized minimalist gold leaf transitioning into a top-right ascending graph trend line.
5. **Key Elements to Render:**
   - Left side: Title, primary benefit statement, and URL text `kalya.finance`.
   - Right side: High-fidelity dashboard card mockups (e.g. Net Worth status, asset vs liability split, EPF/PPF milestone ring).

> [!TIP]
> Use dynamic Next.js image generation (`/app/og-image/route.tsx`) via `@vercel/og` (Satori) to automatically render user milestone share-cards dynamically with real data if needed in future features!
