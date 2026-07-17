// "use client";

// import * as React from "react";
// import { Search, Bell } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { User } from "@/types/auth";
// import { ThemeToggle } from "../ui";

// interface TopProps {
//   user: User;
//   /** Set true when there are unread alerts (budget thresholds, bills due, goal milestones). */
//   hasNotifications?: boolean;
//   className?: string;
// }

// function getInitials(name?: string | null) {
//   if (!name) return "?";
//   const parts = name.trim().split(/\s+/);
//   const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
//   return initials.join("") || "?";
// }

// function getGreeting() {
//   const hour = new Date().getHours();
//   if (hour < 12) return "Good morning";
//   if (hour < 17) return "Good afternoon";
//   return "Good evening";
// }

// export const Top = ({ user, hasNotifications, className }: TopProps) => {
//   const firstName = user?.first_name ?? "there";

//   return (
//     <header
//       className={cn(
//         "sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-bg/80 px-4 py-4 backdrop-blur-md md:gap-6 md:px-8 md:py-5",
//         className
//       )}
//     >
//       {/* Greeting */}
//       <div className="flex min-w-0 flex-col">
//         <h1 className="truncate font-display text-display-md font-semibold text-text-primary">
//           {getGreeting()}, {firstName}
//         </h1>
//         <p className="hidden text-body-sm text-text-secondary sm:block">
//           Here&apos;s where your finances stand today.
//         </p>
//       </div>

//       {/* Actions */}
//       <div className="flex shrink-0 items-center gap-2 md:gap-3">
//         {/* Search — hidden on small screens, icon-only trigger could replace it there */}
//         <div className="relative hidden md:block">
//           <Search
//             className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
//             aria-hidden="true"
//           />
//           <input
//             type="text"
//             placeholder="Search transactions, goals, accounts…"
//             className={cn(
//               "w-64 rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-body-sm text-text-primary placeholder:text-text-muted",
//               "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle lg:w-80"
//             )}
//           />
//         </div>

//         {/* Notifications */}
//         <button
//           type="button"
//           aria-label="Notifications"
//           className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
//         >
//           <Bell className="h-5 w-5" />
//           {hasNotifications && (
//             <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
//           )}
//         </button>

//         <ThemeToggle/>

//         {/* User */}
//         <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3">
//           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-subtle font-numeric text-caption font-medium text-primary">
//             {getInitials(firstName)}
//           </div>
//           <span className="hidden text-body-sm font-medium text-text-primary sm:block">
//             {firstName}
//           </span>
//         </div>
//       </div>
//     </header>
//   );
// };


"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Bell, ChevronDown, Settings, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { User } from "@/types/auth";
import { ThemeToggle } from "../ui";

interface TopProps {
  user: User;
  /** Set true when there are unread alerts (budget thresholds, bills due, goal milestones). */
  hasNotifications?: boolean;
  className?: string;
}

/** Maps route segments to the title shown when the page isn't the overview. Mirrors sidebar nav labels. */
const PAGE_TITLES: Record<string, string> = {
  wallet: "Wallet",
  analytics: "Analytics",
  schedule: "Schedule",
  clients: "Clients",
  reports: "Reports",
  settings: "Settings",
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function usePageHeading(firstName: string) {
  const pathname = usePathname();
  return React.useMemo(() => {
    const segment = pathname.split("/").filter(Boolean).at(-1);
    const isOverview = !segment || segment === "dashboard";

    if (isOverview) {
      return {
        title: `${getGreeting()}, ${firstName}`,
        subtitle: "Here's where your finances stand today.",
      };
    }

    const title = PAGE_TITLES[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    return { title, subtitle: null as string | null };
  }, [pathname, firstName]);
}

export const Top = ({ user, hasNotifications, className }: TopProps) => {
  const firstName = user?.first_name ?? "there";
  const { title, subtitle } = usePageHeading(firstName);

  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
        "sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-bg/80 px-4 py-4 backdrop-blur-md md:gap-4 md:px-6 md:py-4",
        className
      )}
    >
      {/* Heading — greeting on overview, page title elsewhere */}
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate font-display text-display-md font-semibold text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="hidden text-body-sm text-text-secondary sm:block">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Search — full input on desktop */}
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search transactions, goals, accounts…"
            className={cn(
              "w-64 rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-body-sm text-text-primary placeholder:text-text-muted",
              "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle lg:w-80"
            )}
          />
        </div>

        {/* Search — icon trigger on mobile, opens an inline overlay field */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Search"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary md:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
          )}
        </button>

        <div className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

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
            className="absolute inset-x-0 top-0 z-30 flex h-full items-center gap-2 bg-bg px-4 md:hidden"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input
                autoFocus
                type="text"
                placeholder="Search transactions, goals, accounts…"
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-body-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="shrink-0 rounded-lg px-3 py-2 text-body-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};