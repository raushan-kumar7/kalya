"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface NumericValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  currency?: string;
  showSign?: boolean;
  colored?: boolean;
  decimals?: number;
}

export function formatIndianNumber(
  value: number,
  options?: { showSign?: boolean; currency?: string; decimals?: number }
) {
  const { showSign = false, currency = "₹", decimals = 2 } = options || {};
  const absoluteValue = Math.abs(value);

  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const formattedNumber = formatter.format(absoluteValue);
  const sign = value > 0 && showSign ? "+" : value < 0 ? "-" : "";

  return `${sign}${currency}${formattedNumber}`;
}

const NumericValue = React.forwardRef<HTMLSpanElement, NumericValueProps>(
  (
    {
      className,
      value,
      currency = "₹",
      showSign = false,
      colored = true,
      decimals = 2,
      ...props
    },
    ref
  ) => {
    const isPositive = value > 0;
    const isNegative = value < 0;

    const colorClass = colored
      ? isPositive
        ? "text-success"
        : isNegative
        ? "text-danger"
        : "text-text-primary"
      : "text-current";

    const formattedValue = formatIndianNumber(value, {
      showSign,
      currency,
      decimals,
    });

    return (
      <span
        ref={ref}
        className={cn("font-numeric tabular-nums", colorClass, className)}
        {...props}
      >
        {formattedValue}
      </span>
    );
  }
);
NumericValue.displayName = "NumericValue";

export { NumericValue };
