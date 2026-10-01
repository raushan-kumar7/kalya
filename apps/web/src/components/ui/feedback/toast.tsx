'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Toaster as HotToaster,
  toast as hotToast,
  resolveValue,
  type Toast,
} from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';
import { cn } from '@/libs/utils';

/* ------------------------------------------------------------------ */
/* Variant configuration                                               */
/* ------------------------------------------------------------------ */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: React.ElementType; color: string; subtle: string }
> = {
  success: {
    icon: CheckCircle2,
    color: 'var(--color-success, #16a34a)',
    subtle: 'var(--color-success-subtle, rgba(22, 163, 74, 0.15))',
  },
  error: {
    icon: XCircle,
    color: 'var(--color-danger, #dc2626)',
    subtle: 'var(--color-danger-subtle, rgba(220, 38, 38, 0.15))',
  },
  warning: {
    icon: AlertTriangle,
    color: 'var(--color-warning, #d97706)',
    subtle: 'var(--color-warning-subtle, rgba(217, 119, 6, 0.15))',
  },
  info: {
    icon: Info,
    color: 'var(--color-info, #2563eb)',
    subtle: 'var(--color-info-subtle, rgba(37, 99, 235, 0.15))',
  },
  loading: {
    icon: Loader2,
    color: 'var(--color-text-secondary, #8fa397)',
    subtle: 'var(--color-surface-raised, rgba(255, 255, 255, 0.08))',
  },
};

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

export interface TogglePayload {
  variant: ToastVariant;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

/* ------------------------------------------------------------------ */
/* Motion variants                                                     */
/* ------------------------------------------------------------------ */

const cardVariants = {
  initial: { opacity: 0, y: -8, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

/* ------------------------------------------------------------------ */
/* KalyaToast — the card rendered inside every toast slot              */
/* ------------------------------------------------------------------ */

function KalyaToast({ t, variant, title, description, action }: { t: Toast } & TogglePayload) {
  const { icon: Icon, color, subtle } = VARIANT_CONFIG[variant];
  const duration = t.duration ?? DEFAULT_DURATION;
  const showProgress = variant !== 'loading' && Number.isFinite(duration);

  return (
    <motion.div
      role="status"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'font-body pointer-events-auto relative flex w-90 max-w-[calc(100vw-2rem)]',
        'items-start gap-3 overflow-hidden rounded-xl border p-3.5 pr-9 shadow-raised',
        'bg-surface/90 backdrop-blur-md text-text-primary border-border'
      )}
      style={{
        background: 'color-mix(in srgb, var(--color-surface, var(--surface)) 90%, transparent)',
        borderColor: 'var(--color-border, var(--border))',
        color: 'var(--color-text-primary, var(--text-primary))',
      }}
      variants={cardVariants}
      initial="initial"
      animate={t.visible ? 'animate' : 'exit'}
    >
      {/* Variant accent bar */}
      <span
        aria-hidden
        className="absolute top-0 left-0 h-full w-0.75"
        style={{ background: color }}
      />

      {/* Icon badge */}
      <span
        aria-hidden
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: subtle, color }}
      >
        <Icon
          size={16}
          strokeWidth={2.25}
          className={variant === 'loading' ? 'animate-spin' : undefined}
        />
      </span>

      {/* Copy */}
      <div className="flex-1 pt-0.5">
        <p className="text-body-sm leading-snug font-semibold text-text-primary">{title}</p>
        {description ? (
          <p className="text-caption mt-0.5 leading-snug text-text-secondary">{description}</p>
        ) : null}
        {action ? (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              hotToast.dismiss(t.id);
            }}
            className="text-caption mt-1.5 rounded-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none cursor-pointer"
            style={{ color }}
          >
            {action.label}
          </button>
        ) : null}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => hotToast.dismiss(t.id)}
        aria-label="Dismiss notification"
        className="text-text-muted hover:text-text-primary absolute top-2.5 right-2.5 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      {/* Auto-dismiss progress bar */}
      {showProgress ? (
        <motion.span
          key={t.id}
          aria-hidden
          className="absolute bottom-0 left-0 h-0.5 w-full"
          style={{ background: color, opacity: 0.6, transformOrigin: 'left' }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: t.visible ? 0 : 1 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      ) : null}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Type guard for the structured toast payload                         */
/* ------------------------------------------------------------------ */

function isTogglePayload(data: unknown): data is TogglePayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    !React.isValidElement(data) &&
    'variant' in data &&
    'title' in data
  );
}

/* ------------------------------------------------------------------ */
/* Toaster — mount once in the app shell                               */
/* ------------------------------------------------------------------ */

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      gutter={10}
      containerClassName="!inset-4 sm:!inset-6"
      containerStyle={{ zIndex: 100 }}
    >
      {(t) => {
        const data: unknown = resolveValue(t.message, t);

        // Structured payload from the `toast.*` helpers below.
        if (isTogglePayload(data)) {
          return (
            <KalyaToast
              t={t}
              variant={data.variant}
              title={data.title}
              description={data.description}
              action={data.action}
            />
          );
        }

        // Fallback for plain strings/nodes passed directly to react-hot-toast.
        return <KalyaToast t={t} variant="info" title={data as React.ReactNode} />;
      }}
    </HotToaster>
  );
}

/* ------------------------------------------------------------------ */
/* toast() helpers — typed, dual call signature                       */
/*                                                                      */
/* Supports both styles so every corner of the codebase can use        */
/* whichever reads best at the call site:                              */
/*                                                                      */
/*   toast.error("Update Failed", { description: message })            */
/*   toast.error({ title: "Update Failed", description: message })     */
/* ------------------------------------------------------------------ */

export interface ToastOptions {
  description?: React.ReactNode;
  duration?: number;
  action?: { label: string; onClick: () => void };
  id?: string;
}

type ToastPayloadArg = { title: React.ReactNode } & ToastOptions;
type ToastArgs = [title: React.ReactNode, options?: ToastOptions] | [payload: ToastPayloadArg];

function isPayloadArg(value: unknown): value is ToastPayloadArg {
  return (
    typeof value === 'object' && value !== null && !React.isValidElement(value) && 'title' in value
  );
}

function resolveArgs(args: ToastArgs): {
  title: React.ReactNode;
  options?: ToastOptions;
} {
  const [first, second] = args;
  if (isPayloadArg(first)) {
    const { title, ...options } = first;
    return { title, options: { ...options, ...second } };
  }
  return { title: first, options: second };
}

function build(variant: ToastVariant, title: React.ReactNode, options?: ToastOptions) {
  const payload: TogglePayload = {
    variant,
    title,
    description: options?.description,
    action: options?.action,
  };
  return hotToast(payload as unknown as string, {
    duration: options?.duration ?? (variant === 'error' ? ERROR_DURATION : DEFAULT_DURATION),
    id: options?.id,
  });
}

function make(variant: ToastVariant) {
  return (...args: ToastArgs) => {
    const { title, options } = resolveArgs(args);
    return build(variant, title, options);
  };
}

export interface ToastFunction {
  (...args: ToastArgs): string;
  success: (...args: ToastArgs) => string;
  error: (...args: ToastArgs) => string;
  warning: (...args: ToastArgs) => string;
  info: (...args: ToastArgs) => string;
  loading: (...args: ToastArgs) => string;
  dismiss: typeof hotToast.dismiss;
  promise: typeof hotToast.promise;
}

const defaultToast = (...args: ToastArgs): string => {
  const { title, options } = resolveArgs(args);
  return build('info', title, options);
};

export const toast: ToastFunction = Object.assign(defaultToast, {
  success: make('success'),
  error: make('error'),
  warning: make('warning'),
  info: make('info'),
  loading: (...args: ToastArgs) => {
    const { title, options } = resolveArgs(args);
    return build('loading', title, {
      ...options,
      duration: options?.duration ?? Infinity,
    });
  },
  dismiss: hotToast.dismiss,
  promise: hotToast.promise,
});
