'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/libs/utils';
import { FOCUS_RING } from '@/components/ui/constants';

interface AccordionContextValue {
  expandedItems: string[];
  toggleItem: (id: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export function useAccordion() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) {
    throw new Error('useAccordion must be used within an Accordion');
  }
  return ctx;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

export function Accordion({
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}: AccordionProps) {
  const isControlled = value !== undefined;
  const initialValue = defaultValue
    ? Array.isArray(defaultValue)
      ? defaultValue
      : [defaultValue]
    : [];

  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(initialValue);

  const activeExpanded = isControlled
    ? Array.isArray(value)
      ? value
      : value
        ? [value]
        : []
    : internalExpanded;

  const toggleItem = React.useCallback(
    (id: string) => {
      let next: string[];
      if (type === 'single') {
        next = activeExpanded.includes(id) ? [] : [id];
      } else {
        next = activeExpanded.includes(id)
          ? activeExpanded.filter((item) => item !== id)
          : [...activeExpanded, id];
      }

      if (!isControlled) {
        setInternalExpanded(next);
      }
      onValueChange?.(type === 'single' ? next[0] || '' : next);
    },
    [type, activeExpanded, isControlled, onValueChange]
  );

  return (
    <AccordionContext.Provider value={{ expandedItems: activeExpanded, toggleItem }}>
      <div
        className={cn(
          'divide-y divide-border rounded-xl border border-border bg-surface shadow-card overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  value: string;
  isExpanded: boolean;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({ value, children, className, ...props }: AccordionItemProps) {
  const { expandedItems } = useAccordion();
  const isExpanded = expandedItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isExpanded }}>
      <div className={cn('overflow-hidden', className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, icon, ...props }, ref) => {
    const { toggleItem } = useAccordion();
    const itemCtx = React.useContext(AccordionItemContext);
    if (!itemCtx) {
      throw new Error('AccordionTrigger must be used inside an AccordionItem');
    }

    const { value, isExpanded } = itemCtx;

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => toggleItem(value)}
        aria-expanded={isExpanded}
        className={cn(
          'flex w-full items-center justify-between p-4.5 text-left font-body text-body-sm font-medium text-text-primary transition-colors hover:bg-surface-raised/60 cursor-pointer select-none',
          FOCUS_RING.primary,
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-text-muted shrink-0">{icon}</span>}
          <span>{children}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted shrink-0 ml-2"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const itemCtx = React.useContext(AccordionItemContext);
    if (!itemCtx) {
      throw new Error('AccordionContent must be used inside an AccordionItem');
    }

    const { isExpanded } = itemCtx;

    return (
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              ref={ref}
              className={cn(
                'px-4.5 pb-4 pt-1 font-body text-body-sm text-text-secondary leading-relaxed border-t border-border/40',
                className
              )}
              {...props}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';
