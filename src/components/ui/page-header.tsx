"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, breadcrumbs, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2 pb-6 border-b border-border/50 md:flex-row md:items-end md:justify-between",
          className
        )}
        {...props}
      >
        <div className="flex-1 space-y-1.5">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1.5 text-xs text-text-muted" aria-label="Breadcrumb">
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-muted/60" />}
                    {item.href && !isLast ? (
                      <Link href={item.href} className="hover:text-text-secondary transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <span className={cn(isLast && "font-medium text-text-secondary")}>
                        {item.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* Title */}
          <h1 className="text-display-lg font-bold font-display tracking-tight text-text-primary leading-none">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-sm text-text-secondary max-w-[700px]">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center gap-3 mt-4 md:mt-0 md:ml-4 shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
