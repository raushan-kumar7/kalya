// "use client";

// import { useState } from "react";
// import { createPortal } from "react-dom";
// import { AnimatePresence, motion } from "framer-motion";
// import { cn } from "@/lib/utils";
// import { Avatar, AvatarFallback, AvatarImage, AnimatedTooltip } from "@/components/ui";
// import { useTooltip } from "@/hooks/use-tooltip";
// import { SIDEBAR_NAVIGATIONS } from "@/lib/constants";
// import type { User } from "@/types/auth";

// const NAV_GROUPS = SIDEBAR_NAVIGATIONS.filter((g) => g.group !== "Account");
// const ACCOUNT_ITEMS =
//   SIDEBAR_NAVIGATIONS.find((g) => g.group === "Account")?.items ?? [];

// /** Flat lookup so the single portaled tooltip can resolve a label from whatever id is hovered. */
// const ALL_ITEM_LABELS = new Map(
//   [...NAV_GROUPS.flatMap((g) => g.items), ...ACCOUNT_ITEMS].map((i) => [i.href, i.label]),
// );

// export interface SidebarNavBodyProps {
//   /** Icon-only rail vs full labeled layout. Mobile drawer always passes false. */
//   isCollapsed: boolean;
//   pathname: string;
//   user: User;
//   onNavigate: (href: string) => void;
//   onSignOut: () => void;
// }

// /**
//  * Shared nav body rendered by both the desktop rail and the mobile drawer.
//  * Takes no state of its own — everything it needs (collapsed mode, current
//  * route, handlers) comes in as props, so the two call sites can never drift
//  * out of sync with each other.
//  */
// export function SidebarNavBody({
//   isCollapsed,
//   pathname,
//   user,
//   onNavigate,
//   onSignOut,
// }: SidebarNavBodyProps) {
//   const initials = user.name
//     ? user.name
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .slice(0, 2)
//         .toUpperCase()
//     : "U";

//   // Single shared tooltip instance — only one can be visible at a time on a rail anyway,
//   // and it lets us portal one node instead of one per item.
//   const { hoveredItem, rotate, translateX, handleHover } = useTooltip();
//   // Starts null on both server and first client render, and can only become non-null
//   // from a mouse/focus event — so it doubles as the "safe to touch document" gate
//   // without a separate mounted-flag effect.
//   const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

//   const showTooltip = (id: string, el: HTMLElement) => {
//     if (!isCollapsed) return;
//     const rect = el.getBoundingClientRect();
//     setAnchor({ top: rect.top + rect.height / 2, left: rect.right + 12 });
//     handleHover(id);
//   };
//   const hideTooltip = () => handleHover(null);

//   const activeLabel = hoveredItem ? ALL_ITEM_LABELS.get(hoveredItem) : undefined;

//   return (
//     <nav
//       className={cn(
//         "flex flex-1 flex-col items-center justify-between gap-1  py-4 transition-[width] duration-200",
//         isCollapsed ? "rounded-full border border-border bg-surface-raised w-14 px-2" : "w-full px-2",
//       )}
//     >
//       <div className={cn("flex w-full flex-col gap-1", isCollapsed && "items-center")}>
//         {NAV_GROUPS.map((group, groupIdx) => (
//           <div
//             key={group.group}
//             role="group"
//             aria-label={group.group}
//             className={cn(
//               "flex w-full flex-col gap-1",
//               isCollapsed ? "items-center" : undefined,
//               groupIdx > 0 &&
//                 (isCollapsed
//                   ? "mt-2 w-8 border-t border-border pt-3 self-center"
//                   : "mt-2 border-t border-border pt-3"),
//             )}
//           >
//             <AnimatePresence initial={false}>
//               {!isCollapsed && (
//                 <motion.span
//                   key="group-label"
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.15 }}
//                   className="overflow-hidden whitespace-nowrap px-3 pb-1 text-caption font-semibold tracking-wider text-text-muted uppercase"
//                 >
//                   {group.group}
//                 </motion.span>
//               )}
//             </AnimatePresence>

//             {group.items.map((item) => {
//               const isActive = pathname === item.href;

//               const button = (
//                 <motion.button
//                   type="button"
//                   aria-current={isActive ? "page" : undefined}
//                   aria-label={isCollapsed ? item.label : undefined}
//                   disabled={item.disabled}
//                   onClick={() => onNavigate(item.href)}
//                   onMouseEnter={(e) => showTooltip(item.href, e.currentTarget)}
//                   onMouseLeave={hideTooltip}
//                   onFocus={(e) => showTooltip(item.href, e.currentTarget)}
//                   onBlur={hideTooltip}
//                   whileHover={{ scale: item.disabled ? 1 : 1.04 }}
//                   whileTap={{ scale: item.disabled ? 1 : 0.96 }}
//                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                   className={cn(
//                     "relative flex items-center gap-3 rounded-full text-body-sm font-medium",
//                     "transition-colors duration-150",
//                     "outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised",
//                     isCollapsed ? "h-10 w-10 justify-center" : "w-full px-3 py-2.5",
//                     isActive
//                       ? "bg-primary text-on-primary shadow-sm"
//                       : "text-text-secondary hover:bg-primary-subtle hover:text-primary",
//                     item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
//                   )}
//                 >
//                   {isActive && !isCollapsed && (
//                     <motion.span
//                       layoutId="active-pill-glow"
//                       transition={{ type: "spring", stiffness: 500, damping: 35 }}
//                       className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10"
//                     />
//                   )}
//                   <item.icon size={18} className="relative shrink-0" />
//                   <AnimatePresence initial={false} mode="wait">
//                     {!isCollapsed && (
//                       <motion.span
//                         key="label"
//                         initial={{ opacity: 0, width: 0 }}
//                         animate={{ opacity: 1, width: "auto" }}
//                         exit={{ opacity: 0, width: 0 }}
//                         transition={{ duration: 0.15 }}
//                         className="relative overflow-hidden whitespace-nowrap"
//                       >
//                         {item.label}
//                       </motion.span>
//                     )}
//                   </AnimatePresence>
//                   {item.badge != null && !isCollapsed && (
//                     <span className="relative ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-caption leading-none text-on-danger">
//                       {item.badge}
//                     </span>
//                   )}
//                   {item.badge != null && isCollapsed && (
//                     <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-danger ring-2 ring-surface-raised" />
//                   )}
//                 </motion.button>
//               );

//               return (
//                 <div key={item.href} className={isCollapsed ? undefined : "w-full"}>
//                   {button}
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//       </div>

//       {/* Account section */}
//       <div className="flex w-full flex-col items-center gap-1 border-t border-border pt-3">
//         {ACCOUNT_ITEMS.map((item) => {
//           const isSignout = item.href === "/sign-out";
//           const isActive = pathname === item.href;

//           const trigger = (
//             <motion.button
//               type="button"
//               aria-current={isActive ? "page" : undefined}
//               aria-label={isCollapsed ? item.label : undefined}
//               onClick={isSignout ? onSignOut : () => onNavigate(item.href)}
//               onMouseEnter={(e) => showTooltip(item.href, e.currentTarget)}
//               onMouseLeave={hideTooltip}
//               onFocus={(e) => showTooltip(item.href, e.currentTarget)}
//               onBlur={hideTooltip}
//               whileHover={{ scale: 1.04 }}
//               whileTap={{ scale: 0.96 }}
//               transition={{ type: "spring", stiffness: 500, damping: 30 }}
//               className={cn(
//                 "flex items-center gap-3 rounded-full text-body-sm font-medium",
//                 "transition-colors duration-150",
//                 "outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised",
//                 isSignout
//                   ? "text-danger hover:bg-danger-subtle"
//                   : isActive
//                     ? "bg-primary text-on-primary shadow-sm"
//                     : "text-text-secondary hover:bg-primary-subtle hover:text-primary",
//                 isCollapsed ? "h-10 w-10 justify-center" : "w-full px-3 py-2.5",
//               )}
//             >
//               <item.icon size={18} className="shrink-0" />
//               {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
//             </motion.button>
//           );

//           return (
//             <div key={item.href} className={isCollapsed ? undefined : "w-full"}>
//               {trigger}
//             </div>
//           );
//         })}

//         <button
//           type="button"
//           onClick={() => onNavigate("/dashboard/settings")}
//           aria-label={isCollapsed ? `${user.name ?? "Profile"} — view profile` : undefined}
//           onMouseEnter={(e) => showTooltip("profile", e.currentTarget)}
//           onMouseLeave={hideTooltip}
//           onFocus={(e) => showTooltip("profile", e.currentTarget)}
//           onBlur={hideTooltip}
//           className={cn(
//             "mt-2 flex items-center gap-3 rounded-full pb-1 text-left",
//             "transition-colors duration-150 hover:bg-primary-subtle active:scale-[0.98]",
//             "outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised",
//             isCollapsed ? "justify-center" : "w-full px-3",
//           )}
//         >
//           <Avatar size="sm" interactive>
//             {user.image && <AvatarImage src={user.image} alt={user.name ?? "profile"} />}
//             <AvatarFallback>{initials}</AvatarFallback>
//           </Avatar>
//           {!isCollapsed && (
//             <div className="flex flex-col overflow-hidden">
//               <span className="truncate text-body-sm font-medium text-text-primary">
//                 {user.name}
//               </span>
//               <span className="truncate text-caption text-text-muted">View profile</span>
//             </div>
//           )}
//         </button>
//       </div>

//       {isCollapsed &&
//         anchor &&
//         createPortal(
//           <AnimatedTooltip
//             show={!!hoveredItem}
//             text={hoveredItem === "profile" ? (user.name ?? "Profile") : (activeLabel ?? "")}
//             rotate={rotate}
//             translateX={translateX}
//             isLink={false}
//             placement="right"
//             anchor={anchor}
//           />,
//           document.body,
//         )}
//     </nav>
//   );
// }


"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage, AnimatedTooltip } from "@/components/ui";
import { useTooltip } from "@/hooks/use-tooltip";
import { SIDEBAR_NAVIGATIONS } from "@/lib/constants";
import type { User } from "@/types/auth";

const NAV_GROUPS = SIDEBAR_NAVIGATIONS.filter((g) => g.group !== "Account");
const ACCOUNT_ITEMS =
  SIDEBAR_NAVIGATIONS.find((g) => g.group === "Account")?.items ?? [];

/** Flat lookup so the single portaled tooltip can resolve a label from whatever id is hovered. */
const ALL_ITEM_LABELS = new Map(
  [...NAV_GROUPS.flatMap((g) => g.items), ...ACCOUNT_ITEMS].map((i) => [i.href, i.label]),
);

/**
 * A nav item is "active" on its own route and any route nested under it
 * (`/dashboard/settings` should stay lit on `/dashboard/settings/profile`),
 * except the dashboard root itself — otherwise every dashboard page would
 * light up "Overview" too.
 */
function isItemActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  return pathname.startsWith(href + "/");
}

export interface SidebarNavBodyProps {
  /** Icon-only rail vs full labeled layout. Mobile drawer always passes false. */
  isCollapsed: boolean;
  pathname: string;
  user: User;
  onNavigate: (href: string) => void;
  onSignOut: () => void;
}

/**
 * Shared nav body rendered by both the desktop rail and the mobile drawer.
 * Takes no state of its own — everything it needs (collapsed mode, current
 * route, handlers) comes in as props, so the two call sites can never drift
 * out of sync with each other.
 */
export function SidebarNavBody({
  isCollapsed,
  pathname,
  user,
  onNavigate,
  onSignOut,
}: SidebarNavBodyProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Single shared tooltip instance — only one can be visible at a time on a rail anyway,
  // and it lets us portal one node instead of one per item.
  const { hoveredItem, rotate, translateX, handleHover } = useTooltip();
  // Starts null on both server and first client render, and can only become non-null
  // from a mouse/focus event — so it doubles as the "safe to touch document" gate
  // without a separate mounted-flag effect.
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

  const showTooltip = (id: string, el: HTMLElement) => {
    if (!isCollapsed) return;
    const rect = el.getBoundingClientRect();
    setAnchor({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    handleHover(id);
  };
  const hideTooltip = () => handleHover(null);

  const activeLabel = hoveredItem ? ALL_ITEM_LABELS.get(hoveredItem) : undefined;

  return (
    <nav
      className={cn(
        "flex flex-1 flex-col items-center justify-between gap-1  py-4 transition-[width] duration-200",
        isCollapsed ? "rounded-full border border-border bg-surface-raised w-14 px-2" : "w-full px-2",
      )}
    >
      <div className={cn("flex w-full flex-col gap-1", isCollapsed && "items-center")}>
        {NAV_GROUPS.map((group, groupIdx) => (
          <div
            key={group.group}
            role="group"
            aria-label={group.group}
            className={cn(
              "flex w-full flex-col gap-1",
              isCollapsed ? "items-center" : undefined,
              groupIdx > 0 &&
                (isCollapsed
                  ? "mt-2 w-8 border-t border-border pt-3 self-center"
                  : "mt-2 border-t border-border pt-3"),
            )}
          >
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span
                  key="group-label"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap px-3 pb-1 text-caption font-semibold tracking-wider text-text-muted uppercase"
                >
                  {group.group}
                </motion.span>
              )}
            </AnimatePresence>

            {group.items.map((item) => {
              const isActive = isItemActive(pathname, item.href);

              const button = (
                <motion.button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  disabled={item.disabled}
                  onClick={() => onNavigate(item.href)}
                  onMouseEnter={(e) => showTooltip(item.href, e.currentTarget)}
                  onMouseLeave={hideTooltip}
                  onFocus={(e) => showTooltip(item.href, e.currentTarget)}
                  onBlur={hideTooltip}
                  whileHover={{ scale: item.disabled ? 1 : 1.04 }}
                  whileTap={{ scale: item.disabled ? 1 : 0.96 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-full text-body-sm font-medium",
                    "transition-colors duration-150",
                    "outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised",
                    isCollapsed ? "h-10 w-10 justify-center" : "w-full px-3 py-2.5",
                    isActive
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-text-secondary hover:bg-primary-subtle hover:text-primary",
                    item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                  )}
                >
                  {isActive && !isCollapsed && (
                    <motion.span
                      layoutId="active-pill-glow"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10"
                    />
                  )}
                  {isActive && isCollapsed && (
                    <motion.span
                      layoutId="active-pill-glow-collapsed"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="pointer-events-none absolute -inset-1 rounded-full ring-1 ring-accent/50"
                    />
                  )}
                  <item.icon size={18} className="relative shrink-0" />
                  <AnimatePresence initial={false} mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="relative overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge != null && !isCollapsed && (
                    <span className="relative ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-caption leading-none text-on-danger">
                      {item.badge}
                    </span>
                  )}
                  {item.badge != null && isCollapsed && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-danger ring-2 ring-surface-raised" />
                  )}
                </motion.button>
              );

              return (
                <div key={item.href} className={isCollapsed ? undefined : "w-full"}>
                  {button}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Account section */}
      <div className="flex w-full flex-col items-center gap-1 border-t border-border pt-3">
        {ACCOUNT_ITEMS.map((item) => {
          const isSignout = item.href === "/sign-out";
          const isActive = isItemActive(pathname, item.href);

          const trigger = (
            <motion.button
              type="button"
              aria-current={isActive ? "page" : undefined}
              aria-label={isCollapsed ? item.label : undefined}
              onClick={isSignout ? onSignOut : () => onNavigate(item.href)}
              onMouseEnter={(e) => showTooltip(item.href, e.currentTarget)}
              onMouseLeave={hideTooltip}
              onFocus={(e) => showTooltip(item.href, e.currentTarget)}
              onBlur={hideTooltip}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "flex items-center gap-3 rounded-full text-body-sm font-medium",
                "transition-colors duration-150",
                "outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised",
                isSignout
                  ? "text-danger hover:bg-danger-subtle"
                  : isActive
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-text-secondary hover:bg-primary-subtle hover:text-primary",
                isCollapsed ? "h-10 w-10 justify-center" : "w-full px-3 py-2.5",
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </motion.button>
          );

          return (
            <div key={item.href} className={isCollapsed ? undefined : "w-full"}>
              {trigger}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onNavigate("/dashboard/settings")}
          aria-label={isCollapsed ? `${user.name ?? "Profile"} — view profile` : undefined}
          onMouseEnter={(e) => showTooltip("profile", e.currentTarget)}
          onMouseLeave={hideTooltip}
          onFocus={(e) => showTooltip("profile", e.currentTarget)}
          onBlur={hideTooltip}
          className={cn(
            "mt-2 flex items-center gap-3 rounded-full pb-1 text-left",
            "transition-colors duration-150 hover:bg-primary-subtle active:scale-[0.98]",
            "outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised",
            isCollapsed ? "justify-center" : "w-full px-3",
          )}
        >
          <Avatar size="sm" interactive>
            {user.image && <AvatarImage src={user.image} alt={user.name ?? "profile"} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-body-sm font-medium text-text-primary">
                {user.name}
              </span>
              <span className="truncate text-caption text-text-muted">View profile</span>
            </div>
          )}
        </button>
      </div>

      {isCollapsed &&
        anchor &&
        createPortal(
          <AnimatedTooltip
            show={!!hoveredItem}
            text={hoveredItem === "profile" ? (user.name ?? "Profile") : (activeLabel ?? "")}
            rotate={rotate}
            translateX={translateX}
            isLink={false}
            placement="right"
            anchor={anchor}
          />,
          document.body,
        )}
    </nav>
  );
}