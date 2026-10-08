'use client';

import * as React from 'react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CornerDownLeft, Search, X } from 'lucide-react';
import { cn } from '@/libs/utils';
import { useSearchData, type SearchCategory, type SearchItem } from './use-search-data';

export interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ============================================================
   Static config
   ============================================================ */

const CATEGORY_TABS: Array<{ id: SearchCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'actions', label: 'Actions' },
  { id: 'pages', label: 'Pages' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'goals', label: 'Goals' },
  { id: 'categories', label: 'Categories' },
];

/** Uses real design tokens (success / danger), not positive / negative which don't exist. */
const ICON_TONE: Record<NonNullable<SearchItem['iconTone']>, string> = {
  default: 'bg-surface-raised text-text-secondary border-border',
  positive: 'bg-success-subtle text-success border-success/20',
  negative: 'bg-danger-subtle text-danger border-danger/20',
  warning: 'bg-warning-subtle text-warning border-warning/25',
  info: 'bg-info-subtle text-info border-info/20',
  accent: 'bg-accent-subtle text-accent-strong border-accent/25',
};

const AMOUNT_TONE: Record<NonNullable<SearchItem['amountTone']>, string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral: 'text-text-primary',
};

/* ============================================================
   Small pieces
   ============================================================ */

function Key({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface px-1 font-numeric text-[10px] leading-none font-medium text-text-muted',
        className
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * Highlights query matches. Uses split() with a single capture group, so matches
 * always land on odd indices (no stateful regex.test() bug with the /g flag).
 */
function HighlightedText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-accent/25 px-0.5 font-semibold text-inherit">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

/* ============================================================
   Palette
   ============================================================ */

export function SearchPalette({ open, onOpenChange }: SearchPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [activeIndex, setActiveIndex] = useState(0);

  const {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    groups,
    flatItems,
    categoryCounts,
    totalCount,
  } = useSearchData(() => onOpenChange(false));

  const safeIndex = Math.min(activeIndex, Math.max(flatItems.length - 1, 0));
  const activeId = flatItems.length ? `${listId}-opt-${safeIndex}` : undefined;

  /** Tabs with results (plus the selected one, so it never vanishes under the user). */
  const visibleTabs = useMemo(
    () =>
      CATEGORY_TABS.filter(
        (t) => t.id === 'all' || categoryCounts[t.id] > 0 || t.id === selectedCategory
      ),
    [categoryCounts, selectedCategory]
  );

  /** Pre-compute each group's starting index once instead of re-looping per group. */
  const indexedGroups = useMemo(() => {
    let offset = 0;
    return groups.map((g) => {
      const start = offset;
      offset += g.items.length;
      return { ...g, start };
    });
  }, [groups]);

  // New query or tab → back to the first result
  useEffect(() => {
    setActiveIndex(0);
  }, [query, selectedCategory]);

  // Reset state after the close animation finishes (avoids a visible flash while fading out)
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      setQuery('');
      setSelectedCategory('all');
    }, 200);
    return () => window.clearTimeout(t);
  }, [open, setQuery, setSelectedCategory]);

  // Keep the active row visible (and reveal the first group header at index 0)
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (safeIndex === 0) {
      list.scrollTo({ top: 0 });
      return;
    }
    list
      .querySelector<HTMLElement>(`[data-search-index="${safeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [safeIndex]);

  const handleSelectItem = useCallback(
    (item: SearchItem) => {
      onOpenChange(false);
      if (item.onSelect) item.onSelect();
      else if (item.href) router.push(item.href);
    },
    [onOpenChange, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.nativeEvent.isComposing) return; // don't hijack IME input

      // Tab / Shift+Tab cycles filters, even when there are no results
      if (e.key === 'Tab') {
        e.preventDefault();
        if (visibleTabs.length < 2) return;
        const idx = Math.max(
          visibleTabs.findIndex((t) => t.id === selectedCategory),
          0
        );
        const next = (idx + (e.shiftKey ? -1 : 1) + visibleTabs.length) % visibleTabs.length;
        setSelectedCategory(visibleTabs[next].id);
        return;
      }

      if (flatItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((safeIndex + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((safeIndex - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = flatItems[safeIndex];
        if (item) handleSelectItem(item);
      }
    },
    [visibleTabs, selectedCategory, setSelectedCategory, flatItems, safeIndex, handleSelectItem]
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
          // Keep focus on the input (no timers)
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          // First Esc clears the query, second Esc closes
          onEscapeKeyDown={(e) => {
            if (query) {
              e.preventDefault();
              setQuery('');
            }
          }}
          className={cn(
            'fixed top-3 left-1/2 z-50 -translate-x-1/2 sm:top-[12%]',
            'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-3xl',
            'flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl',
            'outline-none! select-none',
            'data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <DialogPrimitive.Title className="sr-only">Search Kalya</DialogPrimitive.Title>

          {/* 1. Input row */}
          <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-text-muted" aria-hidden />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={flatItems.length > 0}
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              aria-label="Search transactions, budgets, goals and actions"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions, budgets, goals, actions…"
              className="min-w-0 flex-1 border-none bg-transparent font-body text-body-md text-text-primary outline-none! placeholder:text-text-muted focus:outline-none! focus-visible:outline-none!"
            />

            {query && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <Key className="hidden sm:inline-flex">Esc</Key>
            <DialogPrimitive.Close className="cursor-pointer text-body-sm font-medium text-primary sm:hidden">
              Close
            </DialogPrimitive.Close>
          </div>

          {/* 2. Filter chips (focus stays in the input; Tab cycles them) */}
          <div
            role="tablist"
            aria-label="Filter results"
            className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-border/50 bg-surface-raised/40 px-3 py-2"
          >
            {visibleTabs.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              const count = categoryCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-caption font-medium transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-border/70 bg-surface text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 font-numeric text-[10px] leading-4',
                      isSelected ? 'bg-on-primary/20' : 'bg-surface-raised text-text-muted'
                    )}
                  >
                    {tab.id === 'all' ? totalCount : count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Results. Fixed height so the dialog doesn't jump on every keystroke. */}
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Search results"
            onMouseDown={(e) => e.preventDefault()} // clicking a row must not steal focus from input
            className="h-[min(26rem,calc(100dvh-13rem))] sm:h-[min(28rem,60dvh)] overflow-y-auto overscroll-contain pb-2"
          >
            {flatItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-raised text-text-muted">
                  <Search className="h-5 w-5" />
                </div>
                <p className="font-display text-body-md font-medium text-text-primary">
                  {query ? `No results for “${query.trim()}”` : 'Nothing here yet'}
                </p>
                <p className="mt-1 max-w-sm text-caption text-text-muted">
                  {query
                    ? 'Check the spelling, or try a broader word like “rent”, “salary” or “budget”.'
                    : 'Start typing to search your transactions, budgets, goals and pages.'}
                </p>
                {query && selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="mt-4 cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-caption font-medium text-primary transition-colors hover:bg-surface-raised"
                  >
                    Search in all categories
                  </button>
                )}
              </div>
            ) : (
              indexedGroups.map((group) => (
                <div
                  key={group.category}
                  role="group"
                  aria-labelledby={`${listId}-g-${group.category}`}
                >
                  <div
                    id={`${listId}-g-${group.category}`}
                    className="sticky top-0 z-10 flex items-center justify-between bg-surface/95 px-5 py-1.5 text-caption font-semibold text-text-muted backdrop-blur"
                  >
                    <span>{group.label}</span>
                    <span className="font-numeric text-[10px] font-medium">
                      {group.items.length}
                    </span>
                  </div>

                  <div className="space-y-0.5 px-2">
                    {group.items.map((item, i) => {
                      const index = group.start + i;
                      const isActive = index === safeIndex;
                      const Icon = item.icon;
                      // "Action" badge is redundant inside the Quick actions group
                      const showBadge =
                        item.badge && !(group.category === 'actions' && item.badge === 'Action');

                      return (
                        <div
                          key={item.id}
                          id={`${listId}-opt-${index}`}
                          role="option"
                          aria-selected={isActive}
                          data-search-index={index}
                          onClick={() => handleSelectItem(item)}
                          // mousemove (not mouseenter) so a resting cursor can't steal keyboard selection
                          onMouseMove={() => !isActive && setActiveIndex(index)}
                          className={cn(
                            'relative flex scroll-mt-9 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                            isActive ? 'bg-primary-subtle' : 'hover:bg-surface-raised'
                          )}
                        >
                          {isActive && (
                            <span
                              aria-hidden
                              className="absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-primary"
                            />
                          )}

                          <span
                            aria-hidden
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                              ICON_TONE[item.iconTone ?? 'default']
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-body-sm font-medium text-text-primary">
                                <HighlightedText text={item.title} query={query} />
                              </span>
                              {showBadge && (
                                <span className="shrink-0 rounded-full border border-border/70 bg-surface px-1.5 text-[10px] leading-4 font-semibold text-text-secondary">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="truncate text-caption text-text-muted">
                                <HighlightedText text={item.subtitle} query={query} />
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {item.amount && (
                              <span
                                className={cn(
                                  'font-numeric text-body-sm font-semibold tabular-nums',
                                  AMOUNT_TONE[item.amountTone ?? 'neutral']
                                )}
                              >
                                {item.amount}
                              </span>
                            )}
                            {/* Reserve the slot so rows never shift when it appears */}
                            <Key
                              className={cn(
                                'hidden sm:inline-flex',
                                isActive ? 'opacity-100' : 'opacity-0'
                              )}
                            >
                              <CornerDownLeft className="h-3 w-3" aria-label="Enter" />
                            </Key>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Announce result count to screen readers */}
          <p className="sr-only" aria-live="polite">
            {flatItems.length} {flatItems.length === 1 ? 'result' : 'results'}
          </p>

          {/* 4. Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border/70 bg-surface-raised/60 px-4 py-2 text-caption text-text-muted">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <Key>↑</Key>
                <Key>↓</Key>
                <span>navigate</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Key>
                  <CornerDownLeft className="h-3 w-3" aria-label="Enter" />
                </Key>
                <span>open</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Key className="px-1.5">Tab</Key>
                <span>filter</span>
              </span>
            </div>
            <span className="ml-auto font-numeric text-[11px]">
              {flatItems.length} {flatItems.length === 1 ? 'result' : 'results'}
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
