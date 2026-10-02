'use client';

import Link from 'next/link';
import { Icon } from '@/components/shared';
import { cn } from '@/libs/utils';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterProps {
  className?: string;
  links?: FooterLink[];
  version?: string;
  showStatus?: boolean;
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: 'Help & Docs', href: '/dashboard/support' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

/**
 * State-of-the-art Kalya dashboard docked footer.
 * Features glassmorphic backdrop, responsive sidebar offset, live status pulse, and version stamp.
 */
export const Footer = ({
  className,
  links = DEFAULT_LINKS,
  version = 'v1.0.0',
  showStatus = true,
}: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Dashboard footer"
      className={cn(
        'border-border/70 bg-surface/85 text-text-muted fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t px-4 py-2.5 text-xs backdrop-blur-md select-none',
        'transition-[left] duration-300 ease-in-out md:left-(--sidebar-w,256px) md:px-6',
        className
      )}
    >
      {/* Left: Brand Emblem + Copyright + Tagline */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard"
          aria-label="Kalya Dashboard"
          className="group flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
        >
          <Icon
            width={16}
            height={16}
            className="opacity-80 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
          />
        </Link>

        <span className="text-caption text-text-secondary flex items-center gap-1.5 font-medium">
          <span>© {year} Kalya.</span>
          <span className="hidden tracking-brand text-[9.5px] font-semibold text-accent-strong uppercase sm:inline">
            Ready for tomorrow.
          </span>
        </span>
      </div>

      {/* Right: Operational Status, Links & Version */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Systems status live indicator */}
        {showStatus && (
          <div
            className="hidden items-center gap-2 sm:flex"
            title="All Kalya financial systems & services are running normally"
          >
            <span className="relative flex h-2 w-2">
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
            </span>
            <span className="text-caption text-text-muted hover:text-text-secondary hidden font-medium transition-colors md:inline">
              Operational
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav aria-label="Footer Navigation" className="flex items-center gap-3.5 sm:gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="text-caption text-text-muted hover:text-text-primary rounded-xs font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Version Badge */}
        {version && (
          <span className="font-numeric text-text-muted/80 bg-surface-raised border-border/80 text-caption rounded-full border px-2 py-0.5 font-medium tracking-tight shadow-xs select-none">
            {version}
          </span>
        )}
      </div>
    </footer>
  );
};

export default Footer;
