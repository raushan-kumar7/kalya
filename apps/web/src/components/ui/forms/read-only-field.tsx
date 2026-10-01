'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/libs/utils';

export interface ReadOnlyFieldProps {
  label: string;
  value: string | null | undefined;
  /** Leading icon, rendered muted. */
  icon?: LucideIcon;
  /** Caption under the field — e.g. "Managed under Account & Security." */
  hint?: string;
  /**
   * Hides the value behind dots except the trailing `maskVisibleChars`,
   * with an eye toggle to reveal it. Use for account numbers, PAN, phone.
   */
  mask?: boolean;
  /** How many trailing characters stay visible while masked. Default 4. */
  maskVisibleChars?: number;
  /** Shows the copy button. Off by default — enable per field where copying is genuinely useful. */
  copyable?: boolean;
  className?: string;
}

export function ReadOnlyField({
  label,
  value,
  icon: Icon,
  hint,
  mask = false,
  maskVisibleChars = 4,
  copyable = false,
  className,
}: ReadOnlyFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const trimmed = value?.trim() || null;

  const maskedValue = (() => {
    if (!trimmed) return null;
    if (trimmed.length <= maskVisibleChars) return trimmed;
    const hidden = '•'.repeat(trimmed.length - maskVisibleChars);
    return hidden + trimmed.slice(-maskVisibleChars);
  })();

  const displayValue = trimmed ? (mask && !revealed ? maskedValue : trimmed) : '—';

  const handleCopy = async () => {
    if (!trimmed) return;
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied or unavailable — fail silently
    }
  };

  const showCopy = copyable && !!trimmed;
  const showMaskToggle = mask && !!trimmed;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-caption text-text-secondary font-medium tracking-wide uppercase">
        {label}
      </span>

      <div
        className={cn(
          'border-border bg-surface-raised flex items-center gap-2 rounded-md border px-3 py-2 transition-colors',
          'focus-within:ring-accent/30 focus-within:ring-2'
        )}
      >
        {Icon && <Icon size={16} className="text-text-muted shrink-0" />}

        <span
          title={mask && !revealed ? undefined : (trimmed ?? undefined)}
          className={cn(
            'text-body-sm min-w-0 flex-1 truncate select-all',
            trimmed ? 'text-text-primary' : 'text-text-muted',
            mask && 'font-numeric'
          )}
        >
          {displayValue}
        </span>

        {showMaskToggle && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
            className="text-text-muted hover:text-text-primary focus-visible:ring-accent/40 shrink-0 rounded-xs p-1 transition-colors outline-none focus-visible:ring-2 cursor-pointer"
          >
            {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}

        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            className="text-text-muted hover:text-text-primary focus-visible:ring-accent/40 shrink-0 rounded-xs p-1 transition-colors outline-none focus-visible:ring-2 cursor-pointer"
          >
            <AnimatePresence initial={false} mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="text-success flex"
                >
                  <Check size={15} />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <Copy size={15} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>

      {hint && <p className="text-caption text-text-muted">{hint}</p>}
    </div>
  );
}
