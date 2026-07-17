"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

/**
 * Snappier open, gentler close — tooltips should appear almost
 * instantly on hover but not flash away on exit.
 */
const TooltipProvider = ({
  delayDuration = 150,
  skipDelayDuration = 300,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
);

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, collisionPadding = 8, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "bg-primary text-on-primary text-caption font-body",
        "z-50 max-w-xs rounded-lg px-3 py-1.5 leading-snug",
        "shadow-lg ring-1 shadow-black/10 ring-black/5",
        "origin-(--radix-tooltip-content-transform-origin) will-change-[transform,opacity]",
        "animate-in fade-in-0 zoom-in-[0.97] duration-150",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.97] data-[state=closed]:duration-100",
        "data-[side=bottom]:slide-in-from-top-1.5",
        "data-[side=left]:slide-in-from-right-1.5",
        "data-[side=right]:slide-in-from-left-1.5",
        "data-[side=top]:slide-in-from-bottom-1.5",
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="fill-primary" width={10} height={5} />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
