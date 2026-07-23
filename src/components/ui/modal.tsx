"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Modal
 * -----
 * `Dialog` (dialog.tsx) is the bare Radix primitive — good for one-off,
 * hand-laid-out content. `Modal` is the opinionated, composed version we
 * reach for by default: fixed size steps, a tone-aware icon slot in the
 * header, and a body/footer split so long content scrolls under a sticky
 * action bar instead of pushing the footer off-screen.
 */

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;

const ModalPortal = ({ children, ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props}>{children}</DialogPrimitive.Portal>
);
ModalPortal.displayName = DialogPrimitive.Portal.displayName;

const ModalOverlay = React.forwardRef<
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
ModalOverlay.displayName = "ModalOverlay";

const modalContentVariants = cva(
  "fixed left-1/2 top-1/2 z-50 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg",
  {
    variants: {
      size: {
        sm: "max-w-sm max-h-[85vh]",
        md: "max-w-lg max-h-[85vh]",
        lg: "max-w-2xl max-h-[85vh]",
        xl: "max-w-4xl max-h-[85vh]",
        full: "max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface ModalContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  /** Hide the built-in top-right close button (e.g. for a forced-choice modal). */
  hideClose?: boolean;
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, size, hideClose = false, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content ref={ref} asChild {...props}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(modalContentVariants({ size }), className)}
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
  </ModalPortal>
));
ModalContent.displayName = "ModalContent";

const toneIconVariants = cva("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", {
  variants: {
    tone: {
      default: "bg-primary-subtle text-primary",
      accent: "bg-accent-subtle text-accent",
      success: "bg-success-subtle text-success",
      warning: "bg-warning-subtle text-warning",
      danger: "bg-danger-subtle text-danger",
    },
  },
  defaultVariants: { tone: "default" },
});

export interface ModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toneIconVariants> {
  icon?: React.ReactNode;
}

/** Header row: optional tone-colored icon badge + title/description stack. */
const ModalHeader = ({ className, tone, icon, children, ...props }: ModalHeaderProps) => (
  <div
    className={cn("border-border flex items-start gap-3 border-b px-6 py-5", className)}
    {...props}
  >
    {icon && <div className={cn(toneIconVariants({ tone }))}>{icon}</div>}
    <div className="flex flex-1 flex-col space-y-1 pt-0.5">{children}</div>
  </div>
);
ModalHeader.displayName = "ModalHeader";

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-display text-text-primary text-lg leading-tight font-semibold", className)}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-body-sm text-text-secondary", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

/** Scrollable content region between the header and the sticky footer. */
const ModalBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)} {...props} />
);
ModalBody.displayName = "ModalBody";

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "border-border bg-surface flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end sm:gap-0 sm:space-x-2",
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
};
