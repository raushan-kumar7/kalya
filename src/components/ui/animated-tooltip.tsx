"use client";

import { motion, AnimatePresence, MotionValue } from "framer-motion";
import Link from "next/link";
import { memo } from "react";
import { cn } from "@/lib/utils";

export type AnimatedTooltipProps = {
  show: boolean;
  text: string;
  rotate: MotionValue<number>;
  translateX: MotionValue<number>;
  /** Optional destination if it differs from the display text. Falls back to `text`. */
  href?: string;
  isLink?: boolean;
  /**
   * "top"   — pops up above the trigger, tilts with cursor. Original avatar-stack behavior.
   * "right" — pops out to the right, no tilt. For narrow rails where "top" would collide
   *           with neighboring items.
   */
  placement?: "top" | "right";
  /**
   * Fixed viewport coordinates. Pass this when rendering through a portal (e.g. via
   * createPortal to document.body) to escape an overflow-hidden ancestor.
   */
  anchor?: { top: number; left: number };
};

const AnimatedTooltip = ({
  show,
  text,
  rotate,
  translateX,
  href,
  isLink = true,
  placement = "top",
  anchor,
}: AnimatedTooltipProps) => {
  const isTop = placement === "top";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: isTop ? 20 : 0, x: isTop ? 0 : -8, scale: 0.6 }}
          animate={{
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 260, damping: 10 },
          }}
          exit={{ opacity: 0, y: isTop ? 20 : 0, x: isTop ? 0 : -8, scale: 0.6 }}
          style={{
            translateX: isTop ? translateX : 0,
            rotate: isTop ? rotate : 0,
            whiteSpace: "nowrap",
            ...(anchor ? { position: "fixed", top: anchor.top, left: anchor.left } : undefined),
          }}
          className={cn(
            "bg-primary text-on-primary z-50 flex flex-col items-center justify-center rounded-lg px-4 py-2 shadow-lg ring-1 shadow-black/20 ring-black/10",
            !anchor &&
              isTop &&
              "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+12px)]",
            !anchor && !isTop && "absolute top-1/2 left-full ml-3 -translate-y-1/2",
            anchor && !isTop && "-translate-y-1/2"
          )}
        >
          {isTop && (
            <div className="via-accent absolute inset-x-8 -bottom-px z-30 h-px bg-linear-to-r from-transparent to-transparent" />
          )}

          <div className="text-body-sm font-display relative z-30 font-semibold">
            {isLink ? (
              <Link href={href ?? text} className="hover:text-accent transition-colors">
                {text}
              </Link>
            ) : (
              text
            )}
          </div>

          {isTop ? (
            <div className="bg-primary absolute -bottom-1 left-1/2 z-20 size-2 -translate-x-1/2 rotate-45" />
          ) : (
            <div className="bg-primary absolute top-1/2 -left-1 z-20 size-2 -translate-y-1/2 rotate-45" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MemoizedAnimatedTooltip = memo(AnimatedTooltip);
export { MemoizedAnimatedTooltip as AnimatedTooltip };
