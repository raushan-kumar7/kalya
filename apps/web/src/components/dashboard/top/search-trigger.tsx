'use client';

import { Search } from 'lucide-react';
import { cn } from '@/libs/utils';

export interface SearchTriggerProps {
  onClick: () => void;
  /** true on macOS / iOS → shows ⌘ instead of Ctrl */
  isMac?: boolean;
  className?: string;
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface px-1 font-numeric text-[10px] leading-none font-medium text-text-muted transition-colors group-hover:text-text-secondary">
      {children}
    </kbd>
  );
}

/**
 * Header search entry point.
 * - Desktop: pill with a flex layout (text truncates, keycaps never overlap it).
 * - Mobile: compact icon button.
 */
export function SearchTrigger({ onClick, isMac = false, className }: SearchTriggerProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label="Open search"
        aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
        className={cn(
          'group hidden h-9 w-60 cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-surface-raised pr-2 pl-3 text-left text-body-sm text-text-muted shadow-card transition-colors md:flex lg:w-72',
          'hover:border-primary/40 hover:bg-surface hover:text-text-secondary',
          'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none!',
          className
        )}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate">Search or jump to…</span>
        <span className="flex shrink-0 items-center gap-1" aria-hidden>
          <Keycap>{isMac ? '⌘' : 'Ctrl'}</Keycap>
          <Keycap>K</Keycap>
        </span>
      </button>

      <button
        type="button"
        onClick={onClick}
        aria-label="Open search"
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-surface-raised text-text-secondary shadow-card transition-colors hover:bg-surface hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none! md:hidden"
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>
    </>
  );
}
