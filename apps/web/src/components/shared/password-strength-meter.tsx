'use client';

import * as React from 'react';
import { useMemo, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/libs/utils';
import { PASSWORD_RULES } from '@kalya/validations';
import type {
  PasswordStrengthLevel,
  PasswordRuleResult,
  PasswordStrengthReport,
} from '@kalya/types';
import {
  TRANSITIONS,
  EASINGS,
  createStaggerContainer,
  staggerItem,
  popIn,
} from '@/libs/animations';

interface LevelDefinition {
  level: PasswordStrengthLevel;
  label: string;
  barColor: string;
  textColor: string;
  badgeBg: string;
}

const STRENGTH_LEVELS: LevelDefinition[] = [
  {
    level: 'too-weak',
    label: 'Too weak',
    barColor: 'bg-danger',
    textColor: 'text-danger',
    badgeBg: 'bg-danger-subtle border-danger/30 text-danger',
  },
  {
    level: 'weak',
    label: 'Weak',
    barColor: 'bg-danger/85',
    textColor: 'text-danger',
    badgeBg: 'bg-danger-subtle border-danger/30 text-danger',
  },
  {
    level: 'fair',
    label: 'Fair',
    barColor: 'bg-warning',
    textColor: 'text-warning',
    badgeBg: 'bg-warning-subtle border-warning/30 text-warning',
  },
  {
    level: 'good',
    label: 'Good',
    barColor: 'bg-accent',
    textColor: 'text-accent-strong dark:text-accent',
    badgeBg: 'bg-accent-subtle border-accent/40 text-accent-strong dark:text-accent',
  },
  {
    level: 'strong',
    label: 'Strong',
    barColor: 'bg-success',
    textColor: 'text-success',
    badgeBg: 'bg-success-subtle border-success/30 text-success',
  },
];

export interface PasswordStrengthMeterProps {
  /** The password string being evaluated. */
  password: string;
  /** Display style: segmented financial meter or continuous smooth progress bar. Defaults to 'segmented'. */
  variant?: 'segmented' | 'continuous';
  /** Whether to render the criteria checklist items. Defaults to true. */
  showChecklist?: boolean;
  /** Whether to render the descriptive tier label. Defaults to true. */
  showLabel?: boolean;
  /** Whether to show a numeric ratio of passed rules (e.g., "4 / 5"). Defaults to false. */
  showScore?: boolean;
  /** Optional callback fired whenever the computed password strength evaluation updates. */
  onStrengthChange?: (report: PasswordStrengthReport) => void;
  className?: string;
}

/**
 * Kalya Password Strength Meter
 *
 * Real-time password complexity evaluation engineered against Kalya's authentication rules.
 * Offers segmented or continuous progress tracks, tactile check animations, and full WCAG 2.2 AA accessibility.
 */
export function PasswordStrengthMeter({
  password,
  variant = 'segmented',
  showChecklist = true,
  showLabel = true,
  showScore = false,
  onStrengthChange,
  className,
}: PasswordStrengthMeterProps) {
  const reduceMotion = useReducedMotion();

  // Evaluate password rules from @kalya/validations
  const report = useMemo<PasswordStrengthReport>(() => {
    const checklist: PasswordRuleResult[] = PASSWORD_RULES.map((rule) => ({
      message: rule.message,
      met: rule.test(password),
    }));

    const passedCount = checklist.filter((r) => r.met).length;
    const totalCount = checklist.length;
    const percent = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;
    const isValid = passedCount === totalCount;

    // Map passed rules to level (0..4 indices into STRENGTH_LEVELS)
    const levelIndex = Math.max(0, Math.min(passedCount - 1, STRENGTH_LEVELS.length - 1));
    const activeLevel = password.length > 0 ? STRENGTH_LEVELS[levelIndex] : STRENGTH_LEVELS[0];

    return {
      score: passedCount,
      level: activeLevel.level,
      label: activeLevel.label,
      percent,
      isValid,
      checklist,
    };
  }, [password]);

  // Notify parent form/controller of changes
  useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(report);
    }
  }, [report, onStrengthChange]);

  if (!password) {
    return null;
  }

  const levelDef = STRENGTH_LEVELS.find((l) => l.level === report.level) ?? STRENGTH_LEVELS[0];

  const checklistContainer = createStaggerContainer(0.04);

  return (
    <div
      role="region"
      aria-label="Password strength assessment"
      className={cn('flex flex-col gap-2.5 mt-2', className)}
    >
      {/* Progress Track & Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          {showLabel && (
            <AnimatePresence mode="wait">
              <motion.span
                key={levelDef.label}
                initial={reduceMotion ? false : { opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={TRANSITIONS.fast}
                className={cn('font-medium inline-flex items-center gap-1.5', levelDef.textColor)}
              >
                {levelDef.label}
              </motion.span>
            </AnimatePresence>
          )}

          {showScore && (
            <span className="numeric text-[11px] font-medium text-text-muted">
              {report.score} / {report.checklist.length}
            </span>
          )}
        </div>

        {/* Meter Bar */}
        {variant === 'segmented' ? (
          <div
            role="progressbar"
            aria-valuenow={report.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={levelDef.label}
            className="grid grid-cols-5 gap-1.5 w-full"
          >
            {report.checklist.map((rule, idx) => {
              const isFilled = idx < report.score;
              return (
                <div
                  key={`segment-${rule.message}`}
                  className="h-1.5 w-full rounded-full bg-border/80 overflow-hidden relative"
                >
                  <motion.div
                    className={cn(
                      'h-full rounded-full transition-colors duration-200',
                      levelDef.barColor
                    )}
                    initial={false}
                    animate={{
                      width: isFilled ? '100%' : '0%',
                      opacity: isFilled ? 1 : 0,
                    }}
                    transition={reduceMotion ? { duration: 0.1 } : TRANSITIONS.spring}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div
            role="progressbar"
            aria-valuenow={report.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={levelDef.label}
            className="h-1.5 w-full rounded-full bg-border overflow-hidden"
          >
            <motion.div
              className={cn(
                'h-full rounded-full transition-colors duration-250',
                levelDef.barColor
              )}
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${report.percent}%` }}
              transition={
                reduceMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 320, damping: 28 }
              }
            />
          </div>
        )}
      </div>

      {/* Interactive Criteria Checklist */}
      {showChecklist && (
        <motion.ul
          variants={checklistContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-1.5 mt-1"
        >
          {report.checklist.map((rule) => (
            <motion.li
              key={rule.message}
              variants={staggerItem}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors duration-200',
                rule.met ? 'text-text-primary' : 'text-text-muted'
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
                  rule.met
                    ? 'bg-success-subtle border-success/40 text-success dark:bg-success/20'
                    : 'bg-surface-raised border-border text-transparent'
                )}
                aria-hidden="true"
              >
                {rule.met ? (
                  <motion.span
                    variants={popIn}
                    initial={reduceMotion ? false : 'hidden'}
                    animate="visible"
                    transition={TRANSITIONS.bouncy}
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <span className="h-1 w-1 rounded-full bg-border" />
                )}
              </span>
              <span className={rule.met ? 'font-normal' : 'font-light'}>{rule.message}</span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

export type { PasswordStrengthLevel, PasswordRuleResult, PasswordStrengthReport };
