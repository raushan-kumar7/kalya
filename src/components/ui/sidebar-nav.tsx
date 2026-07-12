"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Button } from "./button";

export interface SidebarNavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SidebarNavItem[];
  activeHref?: string;
  onActiveHrefChange?: (href: string) => void;
  brandName?: string;
  brandLogo?: React.ReactNode;
}

export function SidebarNav({
  className,
  items,
  activeHref,
  onActiveHrefChange,
  brandName = "Kalya",
  brandLogo,
  ...props
}: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-surface text-text-primary transition-all duration-300 h-screen sticky top-0",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/50">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
          {brandLogo || <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-subtle font-display font-bold">क</div>}
          {!isCollapsed && (
            <span className="font-display font-bold text-lg text-text-primary leading-none">
              {brandName}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8 text-text-secondary hover:text-text-primary hidden md:inline-flex"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8 text-text-secondary hover:text-text-primary hidden md:inline-flex absolute left-12 top-3 bg-surface border border-border shadow-sm rounded-full z-10 p-0"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeHref === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onActiveHrefChange?.(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-primary-subtle text-primary font-semibold"
                  : "text-text-secondary hover:bg-surface-raised hover:text-text-primary",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-text-secondary"
                  )}
                />
              )}
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle for Mobile */}
      <div className="p-4 border-t border-border/50 flex items-center justify-between md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-text-secondary"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
