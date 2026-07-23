"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types/auth";
import { ThemeToggle } from "../../ui";
import { Breadcrumb } from "../../shared";
import { getGreeting } from "./helper";
import { useEffect, useMemo, useRef, useState } from "react";
import { SIDEBAR_NAVIGATIONS } from "@/lib/constants";

interface TopProps {
  user: User;
  /** Set true when there are unread alerts (budget thresholds, bills due, goal milestones). */
  hasNotifications?: boolean;
  className?: string;
}

/** Route segment → { label, description }, sourced from SIDEBAR_NAVIGATIONS
 *  so nav changes stay in sync with the heading automatically. */
const PAGE_META: Record<string, { label: string; description?: string }> = Object.fromEntries(
  SIDEBAR_NAVIGATIONS.flatMap((group) =>
    group.items
      .filter((item) => item.href.startsWith("/dashboard"))
      .map((item) => [
        item.href.replace(/^\/dashboard\/?/, ""),
        { label: item.label, description: item.description },
      ])
  )
);

function usePageHeading(firstName: string) {
  const pathname = usePathname();

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean); // e.g. ["dashboard", "settings"]
    const lastSegment = segments.at(-1);
    const isOverview = !lastSegment || lastSegment === "dashboard";

    const title = isOverview
      ? `${getGreeting()}, ${firstName}`
      : (PAGE_META[lastSegment]?.label ??
         lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1));

    const subtitle = isOverview
      ? (PAGE_META[""]?.description ?? "Here's where your finances stand today.")
      : (PAGE_META[lastSegment]?.description ?? null);

    // Home icon (default) > Dashboard > ... > current segment
    const breadcrumbPath = segments.map((segment, index) => {
      const isLast = index === segments.length - 1;
      const key = segments.slice(1, index + 1).join("/"); // "" for /dashboard itself
      const meta = PAGE_META[key];
      const label = meta?.label ?? segment.charAt(0).toUpperCase() + segment.slice(1);

      return {
        label,
        href: isLast ? undefined : "/" + segments.slice(0, index + 1).join("/"),
      };
    });

    return { title, subtitle, breadcrumbPath, isOverview };
  }, [pathname, firstName]);
}

export const Top = ({ user, hasNotifications, className }: TopProps) => {
  const firstName = user?.first_name ?? "there";
  const { title, subtitle, breadcrumbPath, isOverview } = usePageHeading(firstName);

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "border-border bg-bg/80 sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-4 backdrop-blur-md md:gap-4 md:px-6 md:py-4",
        className
      )}
    >
      {/* Heading — greeting + subtitle on overview, breadcrumb only on nested pages */}
      <div className="flex min-w-0 flex-col">
        {isOverview ? (
          <>
            <h1 className="font-display text-display-md text-text-primary truncate font-semibold">
              {title}
            </h1>
            {subtitle && (
              <p className="text-body-sm text-text-secondary hidden sm:block">{subtitle}</p>
            )}
          </>
        ) : (
          <Breadcrumb path={breadcrumbPath} description={subtitle ?? undefined} />
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Search — full input on desktop */}
        <div className="relative hidden md:block">
          <Search
            className="text-text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search transactions, goals, accounts…"
            className={cn(
              "border-border bg-surface text-body-sm text-text-primary placeholder:text-text-muted w-64 rounded-lg border py-2 pr-3 pl-9",
              "focus:border-primary focus:ring-primary-subtle transition-colors focus:ring-2 focus:outline-none lg:w-80"
            )}
          />
        </div>

        {/* Search — icon trigger on mobile, opens an inline overlay field */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Search"
          className="border-border bg-surface text-text-secondary hover:bg-surface-raised hover:text-text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors md:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="border-border bg-surface text-text-secondary hover:bg-surface-raised hover:text-text-primary relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="bg-accent ring-surface absolute top-2 right-2 h-2 w-2 rounded-full ring-2" />
          )}
        </button>

        <div className="bg-border hidden h-6 w-px sm:block" aria-hidden="true" />

        <ThemeToggle />
      </div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-bg absolute inset-x-0 top-0 z-30 flex h-full items-center gap-2 px-4 md:hidden"
          >
            <div className="relative flex-1">
              <Search className="text-text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input
                autoFocus
                type="text"
                placeholder="Search transactions, goals, accounts…"
                className="border-border bg-surface text-body-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-primary-subtle w-full rounded-lg border py-2 pr-3 pl-9 focus:ring-2 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="text-body-sm text-text-secondary hover:text-text-primary shrink-0 rounded-lg px-3 py-2 font-medium"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};