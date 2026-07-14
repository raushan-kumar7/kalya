"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PASSWORD_RULES } from "@/validations/auth";

const LEVELS = [
  { label: "Too weak", barColor: "bg-error-500", textColor: "text-error-500" },
  { label: "Weak", barColor: "bg-error-400", textColor: "text-error-500" },
  { label: "Fair", barColor: "bg-warning-500", textColor: "text-warning-600" },
  {
    label: "Good",
    barColor: "bg-secondary-500",
    textColor: "text-secondary-600",
  },
  {
    label: "Strong",
    barColor: "bg-success-500",
    textColor: "text-success-600",
  },
];

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const reduceMotion = useReducedMotion();

  const { passedCount, totalCount, checklist } = useMemo(() => {
    const [upper, lower, number, special_character, length] = PASSWORD_RULES;
    const allRules = [upper, lower, number, special_character, length];

    const results = allRules.map((rule) => ({
      message: rule.message,
      met: rule.test(password),
    }));
    return {
      passedCount: results.filter((r) => r.met).length,
      totalCount: allRules.length,
      checklist: results,
    };
  }, [password]);

  if (!password) return null;

  const level = LEVELS[Math.min(passedCount, LEVELS.length - 1)];
  const percent = (passedCount / totalCount) * 100;

  return (
    <div className={cn("flex flex-col gap-3 mt-1.5", className)}>
      {/* Strength bar */}
      <div className="flex flex-col gap-2">
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", level.barColor)}
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <motion.span
          key={level.label}
          initial={reduceMotion ? undefined : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("text-xs font-medium", level.textColor)}
        >
          {level.label}
        </motion.span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {checklist.map((rule) => (
          <li
            key={rule.message}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-200",
              rule.met ? "text-text-secondary" : "text-text-muted",
            )}
          >
            <motion.span
              animate={
                rule.met && !reduceMotion ? { scale: [1, 1.25, 1] } : undefined
              }
              transition={{ duration: 0.25 }}
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                rule.met
                  ? "bg-elevated border-border text-text-secondary"
                  : "bg-transparent border-border text-transparent",
              )}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </motion.span>
            {rule.message}
          </li>
        ))}
      </ul>
    </div>
  );
}