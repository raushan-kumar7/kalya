"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
  actionButton?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      title,
      description,
      icon,
      actionLabel,
      onActionClick,
      actionButton,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-raised/40 p-8 text-center animate-in fade-in-50 duration-200",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary mb-4">
            {icon}
          </div>
        )}
        <h3 className="font-display text-body-lg font-bold text-text-primary mb-1">
          {title}
        </h3>
        {description && (
          <p className="font-body text-body-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
            {description}
          </p>
        )}
        {actionButton ? (
          actionButton
        ) : (
          actionLabel && (
            <Button variant="outline" size="sm" onClick={onActionClick}>
              {actionLabel}
            </Button>
          )
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };
