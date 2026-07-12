"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

// Chart configuration types
export type ChartConfig = Record<
  string,
  {
    label: React.ReactNode;
    color?: string;
    icon?: React.ComponentType;
  }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ className, config, children, ...props }, ref) => {
  // Generate CSS variables for each chart item from the config mapping
  const styleVariables = React.useMemo(() => {
    const vars: Record<string, string> = {};
    Object.entries(config).forEach(([key, val]) => {
      if (val.color) {
        vars[`--color-${key}`] = val.color;
      }
    });
    return vars as React.CSSProperties;
  }, [config]);

  return (
    <div
      ref={ref}
      style={styleVariables}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line]:stroke-border/40 [&_.recharts-cartesian-grid-vertical_line]:stroke-border/40 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot]:stroke-surface [&_.recharts-active-dot]:stroke-surface [&_.recharts-legend-item]:text-text-secondary [&_.recharts-axis-tick_text]:fill-text-muted [&_.recharts-label_text]:fill-text-primary",
        className
      )}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = Tooltip;

export interface RechartsPayloadItem {
  name?: string;
  value?: number | string | Array<number | string>;
  color?: string;
  fill?: string;
  payload?: Record<string, unknown>;
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  payload?: RechartsPayloadItem[];
  label?: string;
  hideLabel?: boolean;
  valueFormatter?: (value: unknown) => string;
}

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ className, active, payload, label, hideLabel = false, valueFormatter, ...props }, ref) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs shadow-xl font-body",
        className
      )}
      {...props}
    >
      {!hideLabel && (
        <div className="font-semibold text-text-primary">{label}</div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item: RechartsPayloadItem, idx: number) => {
          const name = item.name;
          const value = valueFormatter ? valueFormatter(item.value) : item.value;
          const color = item.color || item.fill;

          return (
            <div key={idx} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
              <span className="text-text-secondary font-medium">{name}:</span>
              <span className="font-numeric font-semibold ml-auto text-text-primary">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";
