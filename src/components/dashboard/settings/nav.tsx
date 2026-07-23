"use client";

import { settings, SettingsSection } from "@/lib/constants";
import { KEYS } from "@/utils/events";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEventListener } from "@/hooks";

interface SettingsNavProps {
  active: SettingsSection;
  onSelect: (key: SettingsSection) => void;
}

const NAV_KEYS: string[] = [KEYS.ARROW_RIGHT, KEYS.ARROW_LEFT, KEYS.HOME, KEYS.END];

export function SettingsNav({ active, onSelect }: SettingsNavProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scrollerRef = useRef<HTMLElement>(null);

  // Edge fades — hint that the tab bar scrolls when it overflows (mobile,
  // narrow sidebars). Only shown on the side that actually has more content.
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollShadows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollShadows();
  }, []);

  useEventListener(typeof window !== "undefined" ? window : null, "resize", updateScrollShadows);

  useEventListener(scrollerRef, "scroll", updateScrollShadows, { passive: true });

  // Keep the active tab in view whenever it changes — including via the
  // "g p" / "g a" jump hotkeys, which can select a tab scrolled off-screen.
  useEffect(() => {
    refs.current[active]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [active]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!NAV_KEYS.includes(e.key)) return;
    e.preventDefault();

    let nextIndex = index;
    if (e.key === KEYS.ARROW_RIGHT) nextIndex = (index + 1) % settings.length;
    if (e.key === KEYS.ARROW_LEFT) nextIndex = (index - 1 + settings.length) % settings.length;
    if (e.key === KEYS.HOME) nextIndex = 0;
    if (e.key === KEYS.END) nextIndex = settings.length - 1;

    const next = settings[nextIndex];
    onSelect(next.key);
    refs.current[next.key]?.focus();
  };

  return (
    <div className="relative">
      {/* Left/right scroll hints — fade from the surface colour so they read
          correctly in both light and dark without a hardcoded gradient stop. */}
      <div
        aria-hidden
        className={cn(
          "from-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r to-transparent transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "from-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l to-transparent transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />

      <nav
        ref={scrollerRef}
        role="tablist"
        aria-label="Settings sections"
        aria-orientation="horizontal"
        className="border-border bg-surface-raised no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border p-1.5"
      >
        {settings.map(({ key, label, icon: Icon }, index) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              ref={(el) => {
                refs.current[key] = el;
              }}
              type="button"
              role="tab"
              id={`settings-tab-${key}`}
              aria-selected={isActive}
              aria-controls={`settings-panel-${key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(key)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "text-body-sm group relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 whitespace-nowrap transition-colors duration-200",
                "focus-visible:ring-primary/30 focus-visible:ring-2 focus-visible:outline-none",
                isActive
                  ? "text-text-primary font-medium"
                  : "text-text-secondary hover:bg-surface/70 hover:text-text-primary"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="settings-active-pill"
                  className="bg-surface border-border/60 absolute inset-0 rounded-xl border shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                >
                  {/* Thin accent edge along the bottom — a small on-brand detail
                      distinct from a plain highlighted pill. */}
                  <span className="bg-accent absolute inset-x-3 bottom-0 h-0.5 rounded-full opacity-70" />
                </motion.span>
              )}
              <span className="relative flex items-center gap-2">
                {Icon && (
                  <motion.span
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex"
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors duration-200",
                        isActive ? "text-primary" : "text-text-muted group-hover:text-accent"
                      )}
                    />
                  </motion.span>
                )}
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
