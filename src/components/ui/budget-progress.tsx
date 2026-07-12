"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatIndianNumber } from "./numeric-value";

export interface BudgetProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // Current spent amount
  limit: number; // Total budget limit
  showLabels?: boolean;
}

const BudgetProgress = React.forwardRef<HTMLDivElement, BudgetProgressProps>(
  ({ className, value, limit, showLabels = true, ...props }, ref) => {
    const percentage = limit > 0 ? (value / limit) * 100 : 0;
    const cappedPercentage = Math.min(percentage, 100);

    // Determine color state based on budget thresholds
    const isOverspent = percentage >= 100;
    const isNearingLimit = percentage >= 80 && percentage < 100;

    const progressColorClass = isOverspent
      ? "bg-danger"
      : isNearingLimit
      ? "bg-warning"
      : "bg-success";

    const progressBgColorClass = isOverspent
      ? "bg-danger-subtle"
      : isNearingLimit
      ? "bg-warning-subtle"
      : "bg-success-subtle";

    return (
      <div ref={ref} className={cn("flex flex-col w-full space-y-2", className)} {...props}>
        {showLabels && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">
              Spent: <span className="font-numeric font-medium">{formatIndianNumber(value)}</span>
            </span>
            <span className="text-text-secondary">
              Limit: <span className="font-numeric font-medium">{formatIndianNumber(limit)}</span>
            </span>
          </div>
        )}

        <div className={cn("h-2.5 w-full rounded-full overflow-hidden bg-border", progressBgColorClass)}>
          <div
            className={cn("h-full rounded-full transition-all duration-300 ease-out-back", progressColorClass)}
            style={{ width: `${cappedPercentage}%` }}
          />
        </div>

        {showLabels && (
          <div className="flex justify-between items-center text-[10px] mt-0.5">
            <span className={cn(
              "font-semibold",
              isOverspent ? "text-danger" : isNearingLimit ? "text-warning" : "text-success"
            )}>
              {isOverspent
                ? "Overspent"
                : isNearingLimit
                ? "Nearing Limit (≥80%)"
                : "Within Budget"}
            </span>
            <span className="font-numeric text-text-muted">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);
BudgetProgress.displayName = "BudgetProgress";

export { BudgetProgress };
