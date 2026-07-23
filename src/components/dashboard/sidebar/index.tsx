// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { AnimatePresence, motion, useMotionValue } from "framer-motion";
// import { Menu, PanelLeftClose, PanelRightClose, X } from "lucide-react";
// import { useRouter, usePathname } from "next/navigation";
// import { useSidebar } from "@/hooks";
// import { useAuth } from "@/hooks/auth";
// import { AnimatedTooltip } from "@/components/ui";
// import { cn } from "@/lib/utils";
// import type { User } from "@/types/auth";
// import { SidebarNavBody } from "./nav";
// import { Icon, Logo } from "@/components/shared";

// const SIDEBAR_WIDTH = { expanded: 220, collapsed: 84, mobile: 260 };
// const SPRING = { type: "spring", stiffness: 400, damping: 32 } as const;

// export interface SidebarProps {
//   user: User;
// }

// export function Sidebar({ user }: SidebarProps) {
//   const { collapsed, toggleSidebar } = useSidebar();
//   const router = useRouter();
//   const pathname = usePathname();
//   const { signOut } = useAuth();

//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const drawerRef = useRef<HTMLElement>(null);
//   const mobileTriggerRef = useRef<HTMLButtonElement>(null);

//   // Header toggle tooltip — only one of the two buttons below is ever mounted at once
//   // (collapsed vs expanded state), so a single boolean + static motion values is enough.
//   // Tilt is unused at placement="right", but AnimatedTooltip's props require real
//   // MotionValues, hence useMotionValue(0) rather than the multi-item useTooltip hook.
//   const [showToggleTooltip, setShowToggleTooltip] = useState(false);
//   const toggleRotate = useMotionValue(0);
//   const toggleTranslateX = useMotionValue(0);
//   const toggleTooltipHandlers = {
//     onMouseEnter: () => setShowToggleTooltip(true),
//     onMouseLeave: () => setShowToggleTooltip(false),
//     onFocus: () => setShowToggleTooltip(true),
//     onBlur: () => setShowToggleTooltip(false),
//   };

//   useEffect(() => {
//     if (!isMobileOpen) return;

//     const prevOverflow = document.body.style.overflow;
//     document.body.style.overflow = "hidden";

//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setIsMobileOpen(false);
//     };
//     document.addEventListener("keydown", onKeyDown);

//     const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
//       "button, a, [tabindex]",
//     );
//     firstFocusable?.focus();

//     return () => {
//       document.body.style.overflow = prevOverflow;
//       document.removeEventListener("keydown", onKeyDown);
//       mobileTriggerRef.current?.focus();
//     };
//   }, [isMobileOpen]);

//   const goTo = (href: string) => {
//     router.push(href);
//     setIsMobileOpen(false);
//   };

//   const handleSignOut = () => {
//     setIsMobileOpen(false);
//     signOut();
//   };

//   const focusRing =
//     "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2";

//   return (
//     <>
//       {/* Mobile trigger */}
//       <button
//         ref={mobileTriggerRef}
//         type="button"
//         onClick={() => setIsMobileOpen(true)}
//         aria-label="Open sidebar"
//         className={cn(
//           "bg-surface fixed top-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-md",
//           "transition-all duration-150 hover:shadow-lg active:scale-90 md:hidden",
//           focusRing,
//           "focus-visible:ring-offset-bg",
//         )}
//       >
//         <Menu size={18} className="text-text-secondary" />
//       </button>

//       {/* Backdrop */}
//       <AnimatePresence>
//         {isMobileOpen && (
//           <motion.div
//             key="sidebar-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.18, ease: "easeOut" }}
//             onClick={() => setIsMobileOpen(false)}
//             className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
//           />
//         )}
//       </AnimatePresence>

//       {/* Desktop rail */}
//       <motion.aside
//         animate={{
//           width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
//         }}
//         transition={SPRING}
//         className="bg-surface border-border sticky top-0 hidden h-screen flex-col border-r shadow-[1px_0_0_0_rgba(0,0,0,0.02)] md:flex"
//       >
//         {/* Logo header — its own row, separated from nav by a divider */}
//         {!collapsed ? (
//           <div className="group flex items-center justify-between gap-2 px-4 py-4">
//             <div className="w-40 transition-opacity duration-150">
//               <Logo width={120} height={40} priority className="w-auto h-auto" />
//             </div>

//             <div className="relative ml-2" {...toggleTooltipHandlers}>
//               <button
//                 type="button"
//                 onClick={toggleSidebar}
//                 aria-label="Collapse sidebar"
//                 aria-expanded={!collapsed}
//                 className={cn(
//                   "bg-primary text-on-primary hover:bg-primary-hover flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
//                   "opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 hover:scale-105 active:scale-95 focus-visible:opacity-100",
//                   focusRing,
//                   "focus-visible:ring-offset-surface",
//                 )}
//               >
//                 <PanelLeftClose size={16} />
//               </button>
//               <AnimatedTooltip
//                 show={showToggleTooltip}
//                 text="Collapse sidebar"
//                 rotate={toggleRotate}
//                 translateX={toggleTranslateX}
//                 isLink={false}
//                 placement="right"
//               />
//             </div>
//           </div>
//         ) : (
//           <div className="flex justify-center px-4 py-4">
//             <div className="relative" {...toggleTooltipHandlers}>
//               <button
//                 type="button"
//                 onClick={toggleSidebar}
//                 aria-label="Expand sidebar"
//                 aria-expanded={!collapsed}
//                 className={cn(
//                   "group hover:bg-primary-subtle relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
//                   "transition-colors duration-150 active:scale-95",
//                   focusRing,
//                   "focus-visible:ring-offset-surface",
//                 )}
//               >
//                 <Icon
//                   width={36}
//                   height={36}
//                   className="transition-opacity duration-150 group-hover:opacity-0"
//                 />
//                 <PanelRightClose
//                   size={16}
//                   className="text-text-secondary absolute h-5 w-5 scale-90 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100"
//                 />
//               </button>
//               <AnimatedTooltip
//                 show={showToggleTooltip}
//                 text="Expand sidebar"
//                 rotate={toggleRotate}
//                 translateX={toggleTranslateX}
//                 isLink={false}
//                 placement="right"
//               />
//             </div>
//           </div>
//         )}

//         <div className="scrollbar-thin flex min-h-0 flex-1 flex-col items-center gap-8 overflow-y-auto overflow-x-hidden px-3 py-6">
//           <SidebarNavBody
//             isCollapsed={collapsed}
//             pathname={pathname}
//             user={user}
//             onNavigate={goTo}
//             onSignOut={handleSignOut}
//           />
//         </div>
//       </motion.aside>

//       {/* Mobile drawer — always expanded, regardless of desktop collapsed pref */}
//       <motion.aside
//         ref={drawerRef}
//         initial={false}
//         animate={{ x: isMobileOpen ? 0 : "-100%" }}
//         transition={{ type: "spring", stiffness: 400, damping: 36 }}
//         style={{ width: SIDEBAR_WIDTH.mobile }}
//         role="dialog"
//         aria-modal="true"
//         aria-label="Sidebar navigation"
//         aria-hidden={!isMobileOpen}
//         inert={!isMobileOpen}
//         className="bg-surface fixed inset-y-0 left-0 z-50 flex h-screen flex-col shadow-2xl"
//       >
//         <div className="border-border flex h-16 w-full shrink-0 items-center justify-between border-b px-4">
//           <Logo width={120} height={40} className="h-auto w-auto" priority />
//           <button
//             type="button"
//             onClick={() => setIsMobileOpen(false)}
//             aria-label="Close sidebar"
//             className={cn(
//               "text-text-secondary hover:bg-primary-subtle flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
//               "transition-all duration-150 active:scale-90",
//               focusRing,
//               "focus-visible:ring-offset-surface",
//             )}
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <div className="flex min-h-0 flex-1 flex-col items-center gap-8 overflow-y-auto px-3 py-6">
//           <SidebarNavBody
//             isCollapsed={false}
//             pathname={pathname}
//             user={user}
//             onNavigate={goTo}
//             onSignOut={handleSignOut}
//           />
//         </div>
//       </motion.aside>
//     </>
//   );
// }

// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { AnimatePresence, motion, useMotionValue } from "framer-motion";
// import { Menu, PanelLeftClose, PanelRightClose, X } from "lucide-react";
// import { useRouter, usePathname } from "next/navigation";
// import { useSidebar } from "@/hooks";
// import { useAuth } from "@/hooks/auth";
// import { AnimatedTooltip } from "@/components/ui";
// import { cn } from "@/lib/utils";
// import type { User } from "@/types/auth";
// import { SidebarNavBody } from "./nav";
// import { Icon, Logo } from "@/components/shared";

// const SIDEBAR_WIDTH = { expanded: 220, collapsed: 84, mobile: 260 };
// const SPRING = { type: "spring", stiffness: 400, damping: 32 } as const;

// /**
//  * Token-aware scrollbar for the nav column. box-shadow-only elevation and
//  * OS-default scrollbar thumbs both go invisible or garish on the dark
//  * surface, so this pulls the thumb/track colours from the same tokens as
//  * everything else instead of leaving them to the browser default.
//  */
// const SCROLL_AREA =
//   "scrollbar-thin [scrollbar-color:var(--color-border)_transparent] " +
//   "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent " +
//   "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border";

// export interface SidebarProps {
//   user: User;
// }

// export function Sidebar({ user }: SidebarProps) {
//   const { collapsed, toggleSidebar } = useSidebar();
//   const router = useRouter();
//   const pathname = usePathname();
//   const { signOut } = useAuth();

//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const drawerRef = useRef<HTMLElement>(null);
//   const mobileTriggerRef = useRef<HTMLButtonElement>(null);

//   // Header toggle tooltip — only one of the two buttons below is ever mounted at once
//   // (collapsed vs expanded state), so a single boolean + static motion values is enough.
//   // Tilt is unused at placement="right", but AnimatedTooltip's props require real
//   // MotionValues, hence useMotionValue(0) rather than the multi-item useTooltip hook.
//   const [showToggleTooltip, setShowToggleTooltip] = useState(false);
//   const toggleRotate = useMotionValue(0);
//   const toggleTranslateX = useMotionValue(0);
//   const toggleTooltipHandlers = {
//     onMouseEnter: () => setShowToggleTooltip(true),
//     onMouseLeave: () => setShowToggleTooltip(false),
//     onFocus: () => setShowToggleTooltip(true),
//     onBlur: () => setShowToggleTooltip(false),
//   };

//   useEffect(() => {
//     if (!isMobileOpen) return;

//     const prevOverflow = document.body.style.overflow;
//     document.body.style.overflow = "hidden";

//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setIsMobileOpen(false);
//     };
//     document.addEventListener("keydown", onKeyDown);

//     const firstFocusable = drawerRef.current?.querySelector<HTMLElement>("button, a, [tabindex]");
//     firstFocusable?.focus();

//     return () => {
//       document.body.style.overflow = prevOverflow;
//       document.removeEventListener("keydown", onKeyDown);
//       mobileTriggerRef.current?.focus();
//     };
//   }, [isMobileOpen]);

//   const goTo = (href: string) => {
//     router.push(href);
//     setIsMobileOpen(false);
//   };

//   const handleSignOut = () => {
//     setIsMobileOpen(false);
//     signOut();
//   };

//   const focusRing =
//     "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2";

//   return (
//     <>
//       {/* Mobile trigger */}
//       <button
//         ref={mobileTriggerRef}
//         type="button"
//         onClick={() => setIsMobileOpen(true)}
//         aria-label="Open sidebar"
//         className={cn(
//           "bg-surface border-border fixed top-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-md",
//           "transition-all duration-150 hover:shadow-lg active:scale-90 md:hidden",
//           focusRing,
//           "focus-visible:ring-offset-bg"
//         )}
//       >
//         <Menu size={18} className="text-text-secondary" />
//       </button>

//       {/* Backdrop */}
//       <AnimatePresence>
//         {isMobileOpen && (
//           <motion.div
//             key="sidebar-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.18, ease: "easeOut" }}
//             onClick={() => setIsMobileOpen(false)}
//             className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
//           />
//         )}
//       </AnimatePresence>

//       {/* Desktop rail */}
//       <motion.aside
//         animate={{
//           width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
//         }}
//         transition={SPRING}
//         className="bg-surface border-border sticky top-0 hidden h-screen flex-col border-r md:flex"
//       >
//         {/* Logo header — its own row, separated from nav by a divider */}
//         {!collapsed ? (
//           <div className="group flex items-center justify-between gap-2 px-4 py-4">
//             <div className="w-40 transition-opacity duration-150">
//               <Logo width={120} height={40} priority className="h-auto w-auto" />
//             </div>

//             <div className="relative ml-2" {...toggleTooltipHandlers}>
//               <button
//                 type="button"
//                 onClick={toggleSidebar}
//                 aria-label="Collapse sidebar"
//                 aria-expanded={!collapsed}
//                 className={cn(
//                   "bg-primary text-on-primary hover:bg-primary-hover flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
//                   "opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 hover:scale-105 focus-visible:opacity-100 active:scale-95",
//                   focusRing,
//                   "focus-visible:ring-offset-surface"
//                 )}
//               >
//                 <PanelLeftClose size={16} />
//               </button>
//               <AnimatedTooltip
//                 show={showToggleTooltip}
//                 text="Collapse sidebar"
//                 rotate={toggleRotate}
//                 translateX={toggleTranslateX}
//                 isLink={false}
//                 placement="right"
//               />
//             </div>
//           </div>
//         ) : (
//           <div className="flex justify-center px-4 py-4">
//             <div className="relative" {...toggleTooltipHandlers}>
//               <button
//                 type="button"
//                 onClick={toggleSidebar}
//                 aria-label="Expand sidebar"
//                 aria-expanded={!collapsed}
//                 className={cn(
//                   "group hover:bg-primary-subtle relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
//                   "transition-colors duration-150 active:scale-95",
//                   focusRing,
//                   "focus-visible:ring-offset-surface"
//                 )}
//               >
//                 <Icon
//                   width={36}
//                   height={36}
//                   className="transition-opacity duration-150 group-hover:opacity-0"
//                 />
//                 <PanelRightClose
//                   size={16}
//                   className="text-text-secondary absolute h-5 w-5 scale-90 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100"
//                 />
//               </button>
//               <AnimatedTooltip
//                 show={showToggleTooltip}
//                 text="Expand sidebar"
//                 rotate={toggleRotate}
//                 translateX={toggleTranslateX}
//                 isLink={false}
//                 placement="right"
//               />
//             </div>
//           </div>
//         )}

//         <div
//           className={cn(
//             "flex min-h-0 flex-1 flex-col items-center gap-8 overflow-x-hidden overflow-y-auto px-3 py-6",
//             SCROLL_AREA
//           )}
//         >
//           <SidebarNavBody
//             isCollapsed={collapsed}
//             pathname={pathname}
//             user={user}
//             onNavigate={goTo}
//             onSignOut={handleSignOut}
//           />
//         </div>
//       </motion.aside>

//       {/* Mobile drawer — always expanded, regardless of desktop collapsed pref */}
//       <motion.aside
//         ref={drawerRef}
//         initial={false}
//         animate={{ x: isMobileOpen ? 0 : "-100%" }}
//         transition={{ type: "spring", stiffness: 400, damping: 36 }}
//         style={{ width: SIDEBAR_WIDTH.mobile }}
//         role="dialog"
//         aria-modal="true"
//         aria-label="Sidebar navigation"
//         aria-hidden={!isMobileOpen}
//         inert={!isMobileOpen}
//         className="bg-surface fixed inset-y-0 left-0 z-50 flex h-screen flex-col shadow-2xl"
//       >
//         <div className="border-border flex h-16 w-full shrink-0 items-center justify-between border-b px-4">
//           <Logo width={120} height={40} className="h-auto w-auto" priority />
//           <button
//             type="button"
//             onClick={() => setIsMobileOpen(false)}
//             aria-label="Close sidebar"
//             className={cn(
//               "text-text-secondary hover:bg-primary-subtle flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
//               "transition-all duration-150 active:scale-90",
//               focusRing,
//               "focus-visible:ring-offset-surface"
//             )}
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <div
//           className={cn(
//             "flex min-h-0 flex-1 flex-col items-center gap-8 overflow-y-auto px-3 py-6",
//             SCROLL_AREA
//           )}
//         >
//           <SidebarNavBody
//             isCollapsed={false}
//             pathname={pathname}
//             user={user}
//             onNavigate={goTo}
//             onSignOut={handleSignOut}
//           />
//         </div>
//       </motion.aside>
//     </>
//   );
// }

/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { Menu, PanelLeftClose, PanelRightClose, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/hooks";
import { useAuth } from "@/hooks/auth";
import { AnimatedTooltip } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { User } from "@/types/auth";
import { SidebarNavBody } from "./nav";
import { Icon, Logo } from "@/components/shared";

const SIDEBAR_WIDTH = { expanded: 220, collapsed: 84, mobile: 260 };
const SPRING = { type: "spring", stiffness: 400, damping: 32 } as const;

/**
 * Token-aware scrollbar for the nav column. box-shadow-only elevation and
 * OS-default scrollbar thumbs both go invisible or garish on the dark
 * surface, so this pulls the thumb/track colours from the same tokens as
 * everything else instead of leaving them to the browser default.
 */
const SCROLL_AREA =
  "scrollbar-thin [scrollbar-color:var(--color-border)_transparent] " +
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent " +
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border";

export interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const { collapsed, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  // Header toggle tooltip — only one of the two buttons below is ever mounted at once
  // (collapsed vs expanded state), so a single anchor + boolean is enough. Portaled to
  // document.body with a computed anchor (same pattern as the nav item tooltips) —
  // rendering it inline here caused it to lay out/clip within the header row instead
  // of floating freely, colliding with the logo and the page header above it.
  const [showToggleTooltip, setShowToggleTooltip] = useState(false);
  const [toggleAnchor, setToggleAnchor] = useState<{ top: number; left: number } | null>(null);
  const toggleRotate = useMotionValue(0);
  const toggleTranslateX = useMotionValue(0);

  const showToggleTip = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setToggleAnchor({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    setShowToggleTooltip(true);
  };
  const hideToggleTip = () => setShowToggleTooltip(false);

  const toggleTooltipHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => showToggleTip(e.currentTarget),
    onMouseLeave: hideToggleTip,
    onFocus: (e: React.FocusEvent<HTMLDivElement>) => showToggleTip(e.currentTarget),
    onBlur: hideToggleTip,
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-w",
      `${collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded}px`
    );
  }, [collapsed]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>("button, a, [tabindex]");
    firstFocusable?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      mobileTriggerRef.current?.focus();
    };
  }, [isMobileOpen]);

  const goTo = (href: string) => {
    router.push(href);
    setIsMobileOpen(false);
  };

  const handleSignOut = () => {
    setIsMobileOpen(false);
    signOut();
  };

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2";

  return (
    <>
      {/* Mobile trigger */}
      <button
        ref={mobileTriggerRef}
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open sidebar"
        className={cn(
          "bg-surface border-border fixed top-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-md",
          "transition-all duration-150 hover:shadow-lg active:scale-90 md:hidden",
          focusRing,
          "focus-visible:ring-offset-bg"
        )}
      >
        <Menu size={18} className="text-text-secondary" />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop rail */}
      <motion.aside
        // animate={{
        //   width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
        // }}
        // transition={SPRING}
        // className="bg-surface border-border fixed top-0 hidden h-screen flex-col border-r md:flex"
        animate={{
          width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
        }}
        transition={SPRING}
        className="bg-surface border-border fixed top-0 left-0 z-30 hidden h-screen flex-col border-r md:flex"
      >
        {/* Logo header — its own row, separated from nav by a divider */}
        {!collapsed ? (
          <div className="group flex items-center justify-between gap-2 px-4 py-4">
            <div className="w-40 transition-opacity duration-150">
              <Logo width={120} height={40} priority className="h-auto w-auto" />
            </div>

            <div className="relative ml-2" {...toggleTooltipHandlers}>
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                aria-expanded={!collapsed}
                className={cn(
                  "bg-primary text-on-primary hover:bg-primary-hover flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  "opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 hover:scale-105 focus-visible:opacity-100 active:scale-95",
                  focusRing,
                  "focus-visible:ring-offset-surface"
                )}
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-4 py-4">
            <div className="relative" {...toggleTooltipHandlers}>
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                aria-expanded={!collapsed}
                className={cn(
                  "group hover:bg-primary-subtle relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  "transition-colors duration-150 active:scale-95",
                  focusRing,
                  "focus-visible:ring-offset-surface"
                )}
              >
                <Icon
                  width={36}
                  height={36}
                  className="transition-opacity duration-150 group-hover:opacity-0"
                />
                <PanelRightClose
                  size={16}
                  className="text-text-secondary absolute h-5 w-5 scale-90 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100"
                />
              </button>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col items-center gap-8 overflow-x-hidden overflow-y-auto px-3 py-6",
            SCROLL_AREA
          )}
        >
          <SidebarNavBody
            isCollapsed={collapsed}
            pathname={pathname}
            user={user}
            onNavigate={goTo}
            onSignOut={handleSignOut}
          />
        </div>
      </motion.aside>

      {/* Mobile drawer — always expanded, regardless of desktop collapsed pref */}
      <motion.aside
        ref={drawerRef}
        initial={false}
        animate={{ x: isMobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 36 }}
        style={{ width: SIDEBAR_WIDTH.mobile }}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
        aria-hidden={!isMobileOpen}
        inert={!isMobileOpen}
        className="bg-surface fixed inset-y-0 left-0 z-50 flex h-screen flex-col shadow-2xl"
      >
        <div className="border-border flex h-16 w-full shrink-0 items-center justify-between border-b px-4">
          <Logo width={120} height={40} className="h-auto w-auto" priority />
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
            className={cn(
              "text-text-secondary hover:bg-primary-subtle flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              "transition-all duration-150 active:scale-90",
              focusRing,
              "focus-visible:ring-offset-surface"
            )}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col items-center gap-8 overflow-y-auto px-3 py-6",
            SCROLL_AREA
          )}
        >
          <SidebarNavBody
            isCollapsed={false}
            pathname={pathname}
            user={user}
            onNavigate={goTo}
            onSignOut={handleSignOut}
          />
        </div>
      </motion.aside>

      {showToggleTooltip &&
        toggleAnchor &&
        createPortal(
          <AnimatedTooltip
            show={showToggleTooltip}
            text={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            rotate={toggleRotate}
            translateX={toggleTranslateX}
            isLink={false}
            placement="right"
            anchor={toggleAnchor}
          />,
          document.body
        )}
    </>
  );
}
