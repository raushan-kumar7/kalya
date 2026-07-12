"use client";

import * as React from "react";
import { Card, CardContent } from "./card";
import { NumericValue } from "./numeric-value";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number;
  currency?: string;
  trend?: number; // E.g., +4.5 or -2.3
  trendLabel?: string; // E.g., "vs last month"
  subText?: string; // Optional helper text or breakdowns below the main value
  icon?: React.ReactNode;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, currency = "₹", trend, trendLabel, subText, icon, ...props }, ref) => {
    const isPositiveTrend = trend !== undefined && trend > 0;
    const isNegativeTrend = trend !== undefined && trend < 0;

    return (
      <Card ref={ref} className={cn("overflow-hidden", className)} {...props}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-text-secondary">{title}</span>
            {icon && <div className="text-text-muted">{icon}</div>}
          </div>

          <div className="flex items-baseline space-x-1">
            <NumericValue
              value={value}
              currency={currency}
              colored={false}
              className="text-3xl font-bold tracking-tight font-display text-text-primary"
            />
          </div>

          {(trend !== undefined || subText) && (
            <div className="flex items-center space-x-2 mt-2">
              {trend !== undefined && (
                <div
                  className={cn(
                    "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full font-numeric",
                    isPositiveTrend && "bg-success-subtle text-success",
                    isNegativeTrend && "bg-danger-subtle text-danger",
                    !isPositiveTrend && !isNegativeTrend && "bg-border text-text-secondary"
                  )}
                >
                  {isPositiveTrend && <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />}
                  {isNegativeTrend && <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />}
                  <span>{Math.abs(trend).toFixed(1)}%</span>
                </div>
              )}

              {trendLabel && (
                <span className="text-xs text-text-muted">{trendLabel}</span>
              )}

              {subText && !trendLabel && (
                <span className="text-xs font-numeric text-text-secondary">{subText}</span>
              )}
            </div>
          )}

          {subText && trendLabel && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs font-numeric text-text-secondary">{subText}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";

export { MetricCard };
