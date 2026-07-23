"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, type Variants } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drawer
 * ------
 * A panel that slides in from an edge of the viewport instead of appearing
 * centered like `Modal`/`Dialog`. Reach for it for anything that benefits
 * from staying anchored to context while the user works — session details,
 * filters, a multi-step panel — versus a `Modal`, which interrupts.
 *
 * Built on the same Radix Dialog primitive as `Modal`/`Dialog` so focus
 * trapping, scroll locking, and Esc-to-close all come for free.
 */

type DrawerSide = "right" | "left" | "top" | "bottom";
type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerClose = DialogPrimitive.Close;

const DrawerPortal = ({ children, ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props}>{children}</DialogPrimitive.Portal>
);
DrawerPortal.displayName = DialogPrimitive.Portal.displayName;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} asChild {...props}>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm", className)}
    />
  </DialogPrimitive.Overlay>
));
DrawerOverlay.displayName = "DrawerOverlay";

/** Position + cross-axis sizing per side, kept as a lookup instead of cva
 *  combinatorics since width applies on left/right but height on top/bottom. */
const sidePositionClass: Record<DrawerSide, string> = {
  right: "inset-y-0 right-0 h-full border-l",
  left: "inset-y-0 left-0 h-full border-r",
  top: "inset-x-0 top-0 w-full border-b",
  bottom: "inset-x-0 bottom-0 w-full border-t",
};

const sideSizeClass: Record<DrawerSide, Record<DrawerSize, string>> = {
  right: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-full",
  },
  left: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-full",
  },
  top: {
    sm: "max-h-[30vh]",
    md: "max-h-[45vh]",
    lg: "max-h-[60vh]",
    xl: "max-h-[80vh]",
    full: "max-h-full",
  },
  bottom: {
    sm: "max-h-[30vh]",
    md: "max-h-[45vh]",
    lg: "max-h-[60vh]",
    xl: "max-h-[80vh]",
    full: "max-h-full",
  },
};

const slideVariants: Record<DrawerSide, Variants> = {
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  left: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  },
  top: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
  },
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
};

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  side?: DrawerSide;
  size?: DrawerSize;
  hideClose?: boolean;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, side = "right", size = "md", hideClose = false, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content ref={ref} asChild {...props}>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={slideVariants[side]}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "border-border bg-surface fixed z-50 flex w-full flex-col shadow-lg",
          sidePositionClass[side],
          sideSizeClass[side][size],
          className
        )}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="text-text-muted ring-offset-bg hover:bg-surface-raised focus-visible:ring-primary absolute top-4 right-4 cursor-pointer rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        )}
      </motion.div>
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("border-border flex flex-col space-y-1 border-b px-6 py-5 pr-12", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-display text-text-primary text-lg leading-tight font-semibold", className)}
    {...props}
  />
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-body-sm text-text-secondary", className)}
    {...props}
  />
));
DrawerDescription.displayName = DialogPrimitive.Description.displayName;

const DrawerBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)} {...props} />
);
DrawerBody.displayName = "DrawerBody";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "border-border bg-surface flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end sm:gap-0 sm:space-x-2",
      className
    )}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
};
