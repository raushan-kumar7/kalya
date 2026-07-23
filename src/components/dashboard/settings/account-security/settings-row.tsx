"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const iconBadgeVariants = cva(
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
  {
    variants: {
      tone: {
        default: "bg-primary-subtle text-primary ring-primary/10",
        danger: "bg-danger-subtle text-danger ring-danger/15",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

interface SettingsGroupProps extends VariantProps<typeof iconBadgeVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function SettingsGroup({
  title,
  description,
  tone,
  icon,
  className,
  children,
}: SettingsGroupProps) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2 px-1">
        {/* {tone === "danger" && <AlertTriangle size={15} className="text-danger" />}
         */}
        {icon ? (
          <span className={cn(tone === "danger" ? "text-danger" : "text-text-primary")}>
            {icon}
          </span>
        ) : (
          tone === "danger" && <AlertTriangle size={15} className="text-danger" />
        )}
        <h2
          className={cn(
            "font-display text-body-md font-semibold",
            tone === "danger" ? "text-danger" : "text-text-primary"
          )}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-body-sm text-text-secondary -mt-2 mb-3 px-1">{description}</p>
      )}
      <div
        className={cn(
          "divide-border/70 divide-y rounded-xl border shadow-xs",
          tone === "danger"
            ? "bg-danger-subtle/30 border-danger/25"
            : "bg-surface border-border ring-1 ring-black/2 dark:ring-white/3"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface SettingsRowProps extends VariantProps<typeof iconBadgeVariants> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel: string;
  actionVariant?: "default" | "outline" | "danger" | "ghost";
  onAction: () => void;
}

export function SettingsRow({
  icon,
  title,
  description,
  actionLabel,
  actionVariant = "outline",
  tone,
  onAction,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl sm:flex-nowrap",
        tone === "danger" ? "hover:bg-danger-subtle/50" : "hover:bg-surface-raised"
      )}
    >
      <div className={cn(iconBadgeVariants({ tone }))}>{icon}</div>
      <div className="min-w-0 flex-1 basis-40">
        <p className="text-body-md text-text-primary font-medium">{title}</p>
        {description && (
          <p className="text-body-sm text-text-secondary mt-0.5 truncate">{description}</p>
        )}
      </div>
      <Button
        type="button"
        variant={actionVariant}
        size="sm"
        onClick={onAction}
        className="ml-auto shrink-0 sm:ml-0"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
