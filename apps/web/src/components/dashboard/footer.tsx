'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck } from 'lucide-react';
import { Icon } from '@/components/shared';
import { cn } from '@/libs/utils';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterProps {
  className?: string;
  /**
   * Optional custom links.
   * Defaults to empty to avoid distracting legal/marketing links in the active dashboard.
   */
  links?: FooterLink[];
  /**
   * Optional application version stamp (e.g. "v1.0.0").
   * Omitted by default to keep the interface ultra clean and modern.
   */
  version?: string;
  /** Whether to show the live operational heartbeat indicator. Defaults to true. */
  showStatus?: boolean;
  /** Whether to show the financial security & encryption badge. Defaults to true. */
  showSecurity?: boolean;
  /** Whether to show the quick search shortcut button. Defaults to true. */
  showShortcut?: boolean;
}

/**
 * State-of-the-art Kalya dashboard docked status bar / footer.
 * Features glassmorphic backdrop, responsive sidebar offset, live status pulse,
 * security badge, and instant command palette trigger.
 */
export const Footer = ({
  className,
  links = [],
  version,
  showStatus = true,
  showSecurity = true,
  showShortcut = true,
}: FooterProps) => {
  const year = new Date().getFullYear();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent));
  }, []);

  const handleOpenSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: !isMac,
        metaKey: isMac,
        bubbles: true,
      })
    );
  };

  return (
    <footer
      aria-label="Dashboard footer"
      className={cn(
        'border-border/70 bg-surface/85 text-text-muted fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t px-4 py-2 text-xs backdrop-blur-md select-none',
        'transition-[left] duration-300 ease-in-out md:left-(--sidebar-w,256px) md:px-6',
        className
      )}
    >
      {/* Left: Brand Emblem + Copyright + Security Badge */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          aria-label="Kalya Dashboard"
          className="group flex items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Icon
            width={15}
            height={15}
            className="opacity-80 transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110"
          />
        </Link>

        <div className="text-caption text-text-secondary flex items-center gap-2 font-medium">
          <span>© {year} Kalya</span>
          <span className="text-border/80 hidden sm:inline">•</span>
          <span className="tracking-brand hidden text-[9.5px] font-semibold text-accent-strong uppercase sm:inline">
            Private Financial Intelligence
          </span>
        </div>

        {/* Security / Privacy Trust Badge */}
        {showSecurity && (
          <>
            <span className="text-border/60 hidden lg:inline">•</span>
            <div
              className="text-caption text-text-muted/80 hidden items-center gap-1.5 transition-colors hover:text-text-secondary lg:flex"
              title="End-to-end encrypted financial data & zero-knowledge security"
            >
              <ShieldCheck className="text-accent/80 h-3.5 w-3.5" aria-hidden />
              <span className="text-[11px] font-medium">256-bit Encrypted</span>
            </div>
          </>
        )}
      </div>

      {/* Center: Command Palette Trigger (Desktop) */}
      {showShortcut && (
        <div className="hidden md:flex items-center">
          <button
            type="button"
            onClick={handleOpenSearch}
            aria-label="Open command search"
            className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-surface-raised/70 px-2.5 py-0.5 text-caption text-text-muted shadow-2xs transition-all hover:border-accent/40 hover:bg-surface hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          >
            <Search
              className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-90"
              aria-hidden
            />
            <span className="text-[11px]">Command Menu</span>
            <kbd className="font-numeric text-[9px] text-text-muted/90 rounded border border-border/70 bg-surface px-1 py-0.2 font-medium">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>
        </div>
      )}

      {/* Right: Operational Status, Custom Links (if any) & Optional Version */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Live System Operational Indicator */}
        {showStatus && (
          <div
            className="flex items-center gap-2"
            title="All Kalya financial systems & databases are operational"
          >
            <span className="relative flex h-2 w-2">
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
            </span>
            <span className="text-caption text-text-muted hover:text-text-secondary font-medium transition-colors">
              Systems Normal
            </span>
          </div>
        )}

        {/* Optional Custom Navigation Links (rendered only if explicitly provided) */}
        {links.length > 0 && (
          <nav aria-label="Footer Navigation" className="flex items-center gap-3">
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
        )}

        {/* Optional Version Badge (rendered only if explicitly specified) */}
        {version && (
          <span
            title="Kalya Financial Suite Version"
            className="font-numeric text-text-muted/80 bg-surface-raised border-border/80 text-[10px] rounded-full border px-2 py-0.5 font-medium tracking-tight shadow-xs select-none"
          >
            {version}
          </span>
        )}
      </div>
    </footer>
  );
};

export default Footer;
