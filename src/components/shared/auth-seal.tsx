"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthSealProps {
  /** Icon shown before the seal is "stamped" (e.g. Mail, KeyRound, Lock). */
  icon: LucideIcon;
  /** Icon shown once stamped. Defaults to a checkmark. */
  doneIcon?: LucideIcon;
  /** Whether the seal has been stamped (success state). */
  done?: boolean;
  className?: string;
}

/**
 * The passbook-stamp motif used across the auth flow's confirmation moments
 * (verify email, forgot password sent, password reset). A dashed ring holds
 * an idle icon; on `done` it presses solid and swaps to the done icon.
 */
export function AuthSeal({ icon: Icon, doneIcon: DoneIcon = Check, done = false, className }: AuthSealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("relative flex h-20 w-20 items-center justify-center", className)}>
      <span className="absolute inset-0 rounded-full border-2 border-dashed border-border" />
      <motion.div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors duration-300",
          done
            ? "bg-primary border-primary text-on-primary"
            : "bg-primary-subtle border-primary/30 text-primary",
        )}
        animate={
          done && !reduceMotion ? { scale: [1, 0.85, 1.08, 1], rotate: [0, -6, 0] } : undefined
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.span
              key="done"
              initial={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DoneIcon className="h-6 w-6" strokeWidth={3} />
            </motion.span>
          ) : (
            <motion.span
              key="icon"
              initial={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-6 w-6" strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}