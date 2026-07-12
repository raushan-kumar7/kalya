"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full items-center relative rounded-md shadow-sm",
      className
    )}
    {...props}
  />
));
InputGroup.displayName = "InputGroup";

const InputGroupPrefix = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center px-3 border border-r-0 border-border bg-surface-raised text-text-secondary text-sm font-medium rounded-l-md select-none h-10 min-w-[2.5rem]",
      className
    )}
    {...props}
  />
));
InputGroupPrefix.displayName = "InputGroupPrefix";

const InputGroupSuffix = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center px-3 border border-l-0 border-border bg-surface-raised text-text-secondary text-sm font-medium rounded-r-md select-none h-10 min-w-[2.5rem]",
      className
    )}
    {...props}
  />
));
InputGroupSuffix.displayName = "InputGroupSuffix";

// A utility layout wrapper specifically for inputs placed within the group to strip border radius
const InputGroupChildClassName = "rounded-none first:rounded-l-md last:rounded-r-md focus-visible:z-10";

export { InputGroup, InputGroupPrefix, InputGroupSuffix, InputGroupChildClassName };
