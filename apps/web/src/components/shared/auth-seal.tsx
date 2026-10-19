'use client';

import * as React from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/libs/utils';
import { EASINGS, popIn, scaleIn } from '@/libs/animations';

export type AuthSealVariant = 'primary' | 'accent' | 'success' | 'danger';
export type AuthSealSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AuthSealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon shown before the seal is stamped (e.g. Mail, KeyRound, Lock, Shield). */
  icon: LucideIcon;
  /** Icon shown once stamped. Defaults to Checkmark. */
  doneIcon?: LucideIcon;
  /** Whether the seal has been stamped into the passbook (success / completed state). */
  done?: boolean;
  /** Visual brand palette variant. Defaults to 'primary'. */
  variant?: AuthSealVariant;
  /** Proportional control size. Defaults to 'md'. */
  size?: AuthSealSize;
  /** Whether to trigger an expanding ripple ring upon stamping. Defaults to true. */
  showRipple?: boolean;
  /** Accessible label describing the seal state. */
  ariaLabel?: string;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    container: 'h-16 w-16',
    stamp: 'h-11 w-11 border-[1.5px]',
    iconSize: 20,
    iconClass: 'h-5 w-5',
    strokeWidth: 2,
    doneStrokeWidth: 2.5,
  },
  md: {
    container: 'h-20 w-20',
    stamp: 'h-14 w-14 border-2',
    iconSize: 24,
    iconClass: 'h-6 w-6',
    strokeWidth: 2,
    doneStrokeWidth: 3,
  },
  lg: {
    container: 'h-24 w-24',
    stamp: 'h-17 w-17 border-2',
    iconSize: 28,
    iconClass: 'h-7 w-7',
    strokeWidth: 2,
    doneStrokeWidth: 3,
  },
  xl: {
    container: 'h-28 w-28',
    stamp: 'h-20 w-20 border-2',
    iconSize: 32,
    iconClass: 'h-8 w-8',
    strokeWidth: 2.2,
    doneStrokeWidth: 3.2,
  },
} as const;

const VARIANT_CONFIG: Record<
  AuthSealVariant,
  {
    pending: string;
    done: string;
    ripple: string;
    dashedBorderDone: string;
  }
> = {
  primary: {
    pending: 'bg-primary-subtle border-primary/30 text-primary',
    done: 'bg-primary border-primary text-on-primary shadow-[0_4px_20px_rgba(13,62,38,0.28)] dark:shadow-[0_4px_24px_rgba(63,168,115,0.32)]',
    ripple: 'border-primary/60 bg-primary/10',
    dashedBorderDone: 'border-primary/40',
  },
  accent: {
    pending: 'bg-accent-subtle border-accent/40 text-accent-strong',
    done: 'bg-accent border-accent text-on-accent shadow-[0_4px_20px_rgba(184,145,46,0.3)]',
    ripple: 'border-accent/60 bg-accent/15',
    dashedBorderDone: 'border-accent/50',
  },
  success: {
    pending: 'bg-success-subtle border-success/35 text-success',
    done: 'bg-success border-success text-on-success shadow-[0_4px_20px_rgba(30,122,76,0.3)] dark:shadow-[0_4px_24px_rgba(79,189,132,0.35)]',
    ripple: 'border-success/60 bg-success/15',
    dashedBorderDone: 'border-success/50',
  },
  danger: {
    pending: 'bg-danger-subtle border-danger/35 text-danger',
    done: 'bg-danger border-danger text-on-danger shadow-[0_4px_20px_rgba(176,0,32,0.3)] dark:shadow-[0_4px_24px_rgba(226,105,79,0.35)]',
    ripple: 'border-danger/60 bg-danger/15',
    dashedBorderDone: 'border-danger/50',
  },
};

/**
 * Kalya Passbook Auth Seal
 *
 * The signature stamp motif used across authentication confirmation moments
 * (email verification sent, password reset dispatched, account verified).
 * A dashed outer perimeter anchors an idle icon; upon `done` it compresses firmly
 * into a solid ink stamp with spring feedback and swaps to the confirmation check.
 */
export function AuthSeal({
  icon: Icon,
  doneIcon: DoneIcon = Check,
  done = false,
  variant = 'primary',
  size = 'md',
  showRipple = true,
  ariaLabel,
  className,
  ...props
}: AuthSealProps) {
  const reduceMotion = useReducedMotion();
  const sizeStyles = SIZE_CONFIG[size];
  const variantStyles = VARIANT_CONFIG[variant];

  return (
    <div
      role="status"
      aria-label={
        ariaLabel ?? (done ? 'Operation completed successfully' : 'Awaiting confirmation')
      }
      className={cn(
        'relative flex items-center justify-center select-none',
        sizeStyles.container,
        className
      )}
      {...props}
    >
      {/* Dashed outer passbook boundary */}
      <span
        className={cn(
          'absolute inset-0 rounded-full border-2 border-dashed transition-colors duration-500',
          done ? variantStyles.dashedBorderDone : 'border-border'
        )}
      />

      {/* Dynamic tactile ripple on completion */}
      {showRipple && done && !reduceMotion && (
        <motion.span
          key={`ripple-${variant}`}
          className={cn(
            'absolute inset-0 rounded-full border pointer-events-none',
            variantStyles.ripple
          )}
          initial={{ scale: 0.85, opacity: 0.8 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.7, ease: EASINGS.editorial }}
        />
      )}

      {/* Main interactive ink stamp core */}
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full transition-colors duration-300',
          sizeStyles.stamp,
          done ? variantStyles.done : variantStyles.pending
        )}
        animate={
          done && !reduceMotion
            ? {
                scale: [1, 0.82, 1.08, 0.98, 1],
                rotate: [0, -5, 2, 0],
              }
            : undefined
        }
        transition={{
          duration: 0.55,
          ease: EASINGS.editorial,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.span
              key="done"
              variants={popIn}
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              exit="exit"
              className="flex items-center justify-center"
            >
              <DoneIcon
                className={sizeStyles.iconClass}
                strokeWidth={sizeStyles.doneStrokeWidth}
                aria-hidden="true"
              />
            </motion.span>
          ) : (
            <motion.span
              key="pending-icon"
              variants={scaleIn}
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              exit="exit"
              className="flex items-center justify-center"
            >
              <Icon
                className={sizeStyles.iconClass}
                strokeWidth={sizeStyles.strokeWidth}
                aria-hidden="true"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
