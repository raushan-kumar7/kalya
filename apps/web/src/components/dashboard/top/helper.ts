import { useMemo, useRef, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { SIDEBAR_NAVS_ITEMS, type NavItem } from '../sidebar/constants';

// ------------------------------------------------------------
// GREETING LOGIC
// ------------------------------------------------------------

const GREETING_VARIANTS = {
  morning: ['Good morning', 'Coffee time', 'Rise & thrive'],
  afternoon: ['Good afternoon', "Hope your day's going well", 'Afternoon check-in'],
  evening: ['Good evening', 'Wind down', 'Evening recap'],
  night: ['Hello, night owl', 'Burning the midnight oil?', 'Still up?'],
} as const;

export function getGreeting(timezone?: string): string {
  const hour = timezone
    ? Number(
        new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          hourCycle: 'h23',
          timeZone: timezone,
        }).format(new Date())
      )
    : new Date().getHours();

  const bucket: keyof typeof GREETING_VARIANTS =
    hour >= 5 && hour < 12
      ? 'morning'
      : hour >= 12 && hour < 17
        ? 'afternoon'
        : hour >= 17 && hour < 21
          ? 'evening'
          : 'night'; // 21:00–04:59, wraps past midnight

  const options = GREETING_VARIANTS[bucket];
  return options[Math.floor(Math.random() * options.length)];
}

const noopSubscribe = () => () => {};

/**
 * Hydration-safe dynamic greeting hook powered by useSyncExternalStore.
 * Prevents Next.js SSR hydration mismatches while showing localized greeting post-mount.
 */
export function useGreeting(firstName: string, timezone?: string): string {
  const cacheRef = useRef<{ firstName: string; value: string } | null>(null);

  const getSnapshot = () => {
    if (!cacheRef.current || cacheRef.current.firstName !== firstName) {
      cacheRef.current = { firstName, value: `${getGreeting(timezone)}, ${firstName}` };
    }
    return cacheRef.current.value;
  };

  const getServerSnapshot = () => `Welcome back, ${firstName}`;

  return useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);
}

// ------------------------------------------------------------
// ROUTE METADATA DICTIONARY
// ------------------------------------------------------------

/**
 * Dynamic route metadata dictionary extracted directly from sidebar taxonomy.
 */
function buildRouteMetadata(): Record<string, { label: string; description: string | null }> {
  const meta: Record<string, { label: string; description: string | null }> = {
    '': {
      label: 'Overview',
      description: "Here's where your finances stand today.",
    },
    'settings/account': {
      label: 'Account & Security',
      description: 'Manage profile credentials, sessions, and notification channels.',
    },
    support: {
      label: 'Help & Support',
      description: 'Find answers, guides, and connect with Kalya support.',
    },
  };

  function ingest(item: NavItem) {
    if (item.href) {
      // Convert '/dashboard/assets/equity' to 'assets/equity'
      const key = item.href.replace(/^\/dashboard\/?/, '').replace(/\/$/, '');
      meta[key] = {
        label: item.label,
        description: item.description ?? null,
      };
    }
    if (item.children) {
      for (const child of item.children) {
        ingest(child);
      }
    }
  }

  for (const section of SIDEBAR_NAVS_ITEMS) {
    for (const item of section.items) {
      ingest(item);
    }
  }

  return meta;
}

export const pageMetaByRoute = buildRouteMetadata();

// ------------------------------------------------------------
// PAGE HEADING HOOK
// ------------------------------------------------------------

export interface PageHeadingInfo {
  title: string;
  subtitle: string | null;
  breadcrumbPath: Array<{ label: string; href?: string }>;
  isOverview: boolean;
}

export function usePageHeading(firstName: string, timezone?: string): PageHeadingInfo {
  const pathname = usePathname();
  const greeting = useGreeting(firstName, timezone);

  return useMemo(() => {
    const segments = (pathname || '/dashboard').split('/').filter(Boolean); // e.g. ["dashboard", "assets", "equity"]
    const relativePath = segments.slice(1).join('/'); // "" for /dashboard itself
    const isOverview = segments.length <= 1; // "/dashboard" or "/"

    const fallbackLabel = () => {
      const last = segments.at(-1);
      return last ? last.charAt(0).toUpperCase() + last.slice(1) : 'Dashboard';
    };

    const title = isOverview ? greeting : (pageMetaByRoute[relativePath]?.label ?? fallbackLabel());

    const subtitle = isOverview
      ? (pageMetaByRoute['']?.description ?? "Here's where your finances stand today.")
      : (pageMetaByRoute[relativePath]?.description ?? null);

    const breadcrumbPath = segments.map((segment, index) => {
      const isLast = index === segments.length - 1;
      const key = segments.slice(1, index + 1).join('/'); // "" for /dashboard itself
      const meta = pageMetaByRoute[key];
      const label = meta?.label ?? segment.charAt(0).toUpperCase() + segment.slice(1);

      return {
        label,
        href: isLast ? undefined : '/' + segments.slice(0, index + 1).join('/'),
      };
    });

    return { title, subtitle, breadcrumbPath, isOverview };
  }, [pathname, greeting]);
}
