"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { useState } from "react";
import type { HTMLAttributes } from "react";

const avatarVariants = cva(
  "relative inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-border",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-14 w-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Enables hover/tap scale — use for clickable avatars (profile menus, etc.) */
  interactive?: boolean;
}

export function Avatar({ className, size, interactive, ...props }: AvatarProps) {
  if (!interactive) {
    return <div className={cn(avatarVariants({ size }), className)} {...props} />;
  }
  return (
    <motion.div
      className={cn(
        avatarVariants({ size }),
        className,
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      )}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...(props as HTMLMotionProps<"div">)}
    />
  );
}

export type AvatarImageProps = HTMLMotionProps<"img">;

export function AvatarImage({ className, onError, onLoad, ...props }: AvatarImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "errored">("loading");

  if (status === "errored") return null;

  return (
    <motion.img
      className={cn("aspect-square h-full w-full object-cover", className)}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{
        opacity: status === "loaded" ? 1 : 0,
        scale: status === "loaded" ? 1 : 1.05,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onLoad={(e) => {
        setStatus("loaded");
        onLoad?.(e);
      }}
      onError={(e) => {
        setStatus("errored");
        onError?.(e);
      }}
      {...props}
    />
  );
}

export type AvatarFallbackProps = HTMLMotionProps<"div">;

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full",
          "bg-primary-subtle font-body text-sm font-semibold text-primary",
          className,
        )}
        {...props}
      />
    </AnimatePresence>
  );
}