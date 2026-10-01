'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/libs/utils';
import {
  Temporal,
  WEEKDAYS,
  MONTHS,
  buildMonthGrid,
  isSameDay,
  addDays,
  toISO,
  fromISO,
  formatCalendarDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  toInstant,
} from '@kalya/utils';

// ============================================================
// TYPES & HELPER CONVERTERS
// ============================================================

export type DateValue = Date | string | Temporal.PlainDate | null | undefined;

/**
 * Normalizes any supported date input (Date, ISO string, or Temporal.PlainDate)
 * into a Temporal.PlainDate.
 */
export function toPlainDate(value: DateValue): Temporal.PlainDate | null {
  if (!value) return null;
  if (value instanceof Temporal.PlainDate) return value;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return Temporal.PlainDate.from({
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    });
  }
  if (typeof value === 'string') {
    return fromISO(value);
  }
  return null;
}

/**
 * Converts a Temporal.PlainDate and optional time into a standard JavaScript Date.
 */
export function toJsDate(
  plainDate: Temporal.PlainDate | null | undefined,
  hours: number = 0,
  minutes: number = 0
): Date | null {
  if (!plainDate) return null;
  return new Date(plainDate.year, plainDate.month - 1, plainDate.day, hours, minutes);
}

export interface CalendarProps {
  /** The currently selected date (Date, ISO string, or Temporal.PlainDate) */
  selected?: DateValue;
  /** Default selected date when uncontrolled */
  defaultValue?: DateValue;
  /** Callback fired whenever a date is picked */
  onSelect?: (date: Date | undefined, plainDate: Temporal.PlainDate | null) => void;
  /** Callback fired when the Confirm button is clicked */
  onConfirm?: (date: Date | undefined, plainDate: Temporal.PlainDate | null) => void;
  /** The starting year for the year dropdown (defaults to current - 15) */
  fromYear?: number;
  /** The ending year for the year dropdown (defaults to current + 15) */
  toYear?: number;
  /** Earliest date allowed to be selected */
  minDate?: DateValue;
  /** Latest date allowed to be selected */
  maxDate?: DateValue;
  /** Custom function to disable specific calendar dates */
  disabledDates?: (date: Temporal.PlainDate) => boolean;
  /** Whether to show dates from previous/next months in the grid (defaults to true) */
  showOutsideDays?: boolean;
  /** Whether to show quick preset shortcut chips (Today, Tomorrow, +1W, etc.) */
  showShortcuts?: boolean;
  /** Whether to show time selection controls (hour, minute, AM/PM, timestamp preview) */
  showTime?: boolean;
  /** Whether to show the bottom confirmation button bar (defaults to true) */
  showConfirm?: boolean;
  /** Whether to show a clear button in the footer */
  showClear?: boolean;
  /** Header title text (defaults to 'Select Date') */
  title?: string;
  /** Optional subtitle or helper hint */
  subtitle?: string;
  /** Badge design style at the top right */
  badgeStyle?: 'binder' | 'minimal' | 'none';
  /** Visual display variant */
  variant?: 'card' | 'compact' | 'borderless';
  /** Additional container CSS class names */
  className?: string;
  /** Custom classNames for inner elements */
  classNames?: Partial<{
    root: string;
    header: string;
    grid: string;
    day: string;
    selected: string;
    today: string;
    outside: string;
    disabled: string;
    footer: string;
  }>;
}

// ============================================================
// 1. CALENDAR BADGE (Stylized 3D Binder Desk Calendar)
// ============================================================

export interface CalendarBadgeProps {
  dayText: string;
  monthText?: string;
  style?: 'binder' | 'minimal' | 'none';
  className?: string;
}

export function CalendarBadge({
  dayText,
  monthText,
  style = 'binder',
  className,
}: CalendarBadgeProps) {
  if (style === 'none') return null;

  if (style === 'minimal') {
    return (
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary-subtle shadow-xs',
          className
        )}
      >
        {monthText && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            {monthText.slice(0, 3)}
          </span>
        )}
        <span className="font-display text-lg font-extrabold text-primary leading-none">
          {dayText}
        </span>
      </div>
    );
  }

  // Authentic stylized 3D desk-calendar binder badge
  return (
    <div
      className={cn(
        'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-b from-primary to-primary/80 shadow-sm shadow-primary/30 select-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Top metallic binder rings */}
      <div className="absolute -top-1.75 left-3.25 h-4 w-2 rounded-full border-2 border-surface bg-primary" />
      <div className="absolute -top-1.75 right-3.25 h-4 w-2 rounded-full border-2 border-surface bg-primary" />
      {/* Binder header bar */}
      <div className="absolute left-0 top-0 h-3 w-full rounded-t-2xl bg-black/10" />

      {/* Animated Day Number */}
      <AnimatePresence mode="wait">
        <motion.span
          key={dayText}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-on-primary"
        >
          {dayText}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// 2. DROPDOWN SELECTOR (Month & Year)
// ============================================================

interface CalendarDropdownProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  items: { label: string; value: number }[];
  activeValue: number;
  onSelect: (value: number) => void;
  minWidth?: string;
}

function CalendarDropdown({
  label,
  isOpen,
  onToggle,
  onClose,
  items,
  activeValue,
  onSelect,
  minWidth = 'min-w-[136px]',
}: CalendarDropdownProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Wheel scrolling inside the open dropdown list
  React.useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const el = listRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen]);

  // Click outside & Escape key listeners
  React.useEffect(() => {
    if (!isOpen) return;

    // Auto-scroll active item into center view
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'center' });

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <motion.button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        whileTap={{ scale: 0.96 }}
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-[0.85rem] font-semibold text-text-primary transition-colors cursor-pointer select-none',
          isOpen
            ? 'border-primary/60 bg-primary-subtle text-primary'
            : 'border-border bg-surface-raised hover:bg-border/40 hover:text-text-primary'
        )}
      >
        <span>{label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex text-text-secondary"
        >
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute left-0 top-[calc(100%+6px)] z-30 max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-1.5 shadow-lg origin-top',
              minWidth
            )}
          >
            {items.map((item) => {
              const isActive = item.value === activeValue;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  data-active={isActive}
                  onClick={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[0.85rem] font-medium transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary-subtle text-primary font-bold'
                      : 'text-text-primary hover:bg-surface-raised'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// 3. MAIN CALENDAR COMPONENT
// ============================================================

export function Calendar({
  selected: selectedProp,
  defaultValue,
  onSelect,
  onConfirm,
  fromYear,
  toYear,
  minDate: minDateProp,
  maxDate: maxDateProp,
  disabledDates,
  showOutsideDays = true,
  showShortcuts = false,
  showTime = false,
  showConfirm = true,
  showClear = true,
  title = 'Select Date',
  subtitle,
  badgeStyle = 'binder',
  variant = 'card',
  className,
  classNames,
}: CalendarProps) {
  // Today's date reference via Temporal.Now
  const today = React.useMemo(() => Temporal.Now.plainDateISO(), []);

  // Selected date state (Temporal.PlainDate)
  const [selected, setSelected] = React.useState<Temporal.PlainDate | null>(() => {
    return toPlainDate(selectedProp ?? defaultValue);
  });

  // Time state (hours: 0-23, minutes: 0-59)
  const [time, setTime] = React.useState<{ hours: number; minutes: number }>(() => {
    if (selectedProp instanceof Date && !isNaN(selectedProp.getTime())) {
      return { hours: selectedProp.getHours(), minutes: selectedProp.getMinutes() };
    }
    const now = new Date();
    return { hours: now.getHours(), minutes: Math.floor(now.getMinutes() / 5) * 5 };
  });

  // Synchronize controlled selected prop
  React.useEffect(() => {
    if (selectedProp !== undefined) {
      setSelected(toPlainDate(selectedProp));
      if (selectedProp instanceof Date && !isNaN(selectedProp.getTime())) {
        setTime({ hours: selectedProp.getHours(), minutes: selectedProp.getMinutes() });
      }
    }
  }, [selectedProp]);

  // Calendar View month & year (0-indexed month: 0-11)
  const [viewYear, setViewYear] = React.useState<number>(() => {
    return selected ? selected.year : today.year;
  });
  const [viewMonth, setViewMonth] = React.useState<number>(() => {
    return selected ? selected.month - 1 : today.month - 1;
  });

  // Slide animation direction (1 for forward/next, -1 for backward/prev)
  const [direction, setDirection] = React.useState<number>(0);

  // Active open dropdown menu ('month' | 'year' | null)
  const [openMenu, setOpenMenu] = React.useState<'month' | 'year' | null>(null);

  // Normalized min & max dates
  const minDate = React.useMemo(() => toPlainDate(minDateProp), [minDateProp]);
  const maxDate = React.useMemo(() => toPlainDate(maxDateProp), [maxDateProp]);

  // Year range calculation
  const startYear = fromYear ?? today.year - 12;
  const endYear = toYear ?? today.year + 12;
  const yearsList = React.useMemo(() => {
    const len = Math.max(endYear - startYear + 1, 0);
    return Array.from({ length: len }, (_, i) => ({
      label: String(startYear + i),
      value: startYear + i,
    }));
  }, [startYear, endYear]);

  // Month list calculation
  const monthsList = React.useMemo(() => {
    return MONTHS.map((m, i) => ({ label: m, value: i }));
  }, []);

  // 42-day calendar grid generated via @kalya/utils
  const monthGridDays = React.useMemo(() => {
    return buildMonthGrid(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Badge day number (2 digits)
  const badgeDay = selected
    ? String(selected.day).padStart(2, '0')
    : String(today.day).padStart(2, '0');
  const badgeMonth = selected ? MONTHS[selected.month - 1] : MONTHS[today.month - 1];

  // Navigation handlers
  const goToMonth = (year: number, monthIndex: number) => {
    let targetYear = year;
    let targetMonth = monthIndex;
    if (targetMonth < 0) {
      targetYear -= 1;
      targetMonth = 11;
    } else if (targetMonth > 11) {
      targetYear += 1;
      targetMonth = 0;
    }

    const isForward = targetYear > viewYear || (targetYear === viewYear && targetMonth > viewMonth);
    setDirection(isForward ? 1 : -1);
    setViewYear(targetYear);
    setViewMonth(targetMonth);
  };

  const handlePrevMonth = () => goToMonth(viewYear, viewMonth - 1);
  const handleNextMonth = () => goToMonth(viewYear, viewMonth + 1);

  // Day selection handler
  const handleSelectDay = (cellDate: Temporal.PlainDate) => {
    // If outside month, smoothly navigate to target month
    if (cellDate.month - 1 !== viewMonth || cellDate.year !== viewYear) {
      goToMonth(cellDate.year, cellDate.month - 1);
    }

    setSelected(cellDate);
    const jsDate = toJsDate(cellDate, time.hours, time.minutes);
    onSelect?.(jsDate ?? undefined, cellDate);
  };

  // Confirm button handler
  const handleConfirm = () => {
    if (!selected) return;
    const jsDate = toJsDate(selected, time.hours, time.minutes);
    onConfirm?.(jsDate ?? undefined, selected);
  };

  // Clear button handler
  const handleClear = () => {
    setSelected(null);
    onSelect?.(undefined, null);
  };

  // Presets handler
  const handleShortcut = (daysOffset: number | 'end_of_month') => {
    let target: Temporal.PlainDate;
    if (daysOffset === 'end_of_month') {
      const daysCount = new Date(viewYear, viewMonth + 1, 0).getDate();
      target = Temporal.PlainDate.from({
        year: viewYear,
        month: viewMonth + 1,
        day: daysCount,
      });
    } else {
      target = addDays(today, daysOffset);
    }
    goToMonth(target.year, target.month - 1);
    handleSelectDay(target);
  };

  // Check if a day is disabled
  const isCellDisabled = (date: Temporal.PlainDate): boolean => {
    if (minDate && Temporal.PlainDate.compare(date, minDate) < 0) return true;
    if (maxDate && Temporal.PlainDate.compare(date, maxDate) > 0) return true;
    if (disabledDates?.(date)) return true;
    return false;
  };

  // Formatted date string for footer/summary
  const formattedSummary = React.useMemo(() => {
    if (!selected) return null;
    const fullDate = formatCalendarDate(selected);
    const jsDate = toJsDate(selected, time.hours, time.minutes);
    const rel = jsDate ? formatRelativeTime(toInstant(jsDate)) : '';
    return { fullDate, rel };
  }, [selected, time]);

  // Current timestamp instant for preview
  const currentInstant = React.useMemo(() => {
    if (!selected) return null;
    const jsDate = toJsDate(selected, time.hours, time.minutes);
    return jsDate ? toInstant(jsDate) : null;
  }, [selected, time]);

  // Container style variants
  const containerClasses = {
    card: 'w-full max-w-[500px] rounded-xl border border-border/70 bg-surface p-6 shadow-xl shadow-black/5 font-body',
    compact:
      'w-full max-w-[420px] rounded-xl border border-border/60 bg-surface p-4 shadow-md font-body',
    borderless: 'w-full max-w-[500px] bg-transparent p-2 font-body',
  }[variant];

  return (
    <div className={cn(containerClasses, className, classNames?.root)}>
      {/* ---------------------------------------------------- */}
      {/* HEADER SECTION                                       */}
      {/* ---------------------------------------------------- */}
      <div className={cn('flex items-start justify-between w-full mb-5 px-1', classNames?.header)}>
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="font-display text-[1.6rem] font-bold leading-none tracking-tight text-text-primary">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-caption text-text-secondary">{subtitle}</p>}
          </div>

          {/* Month & Year Selectors with Quick Prev/Next buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Dropdown */}
            <CalendarDropdown
              label={MONTHS[viewMonth]}
              isOpen={openMenu === 'month'}
              onToggle={() => setOpenMenu(openMenu === 'month' ? null : 'month')}
              onClose={() => setOpenMenu(null)}
              items={monthsList}
              activeValue={viewMonth}
              onSelect={(m) => goToMonth(viewYear, m)}
              minWidth="min-w-[136px]"
            />

            {/* Year Dropdown */}
            <CalendarDropdown
              label={String(viewYear)}
              isOpen={openMenu === 'year'}
              onToggle={() => setOpenMenu(openMenu === 'year' ? null : 'year')}
              onClose={() => setOpenMenu(null)}
              items={yearsList}
              activeValue={viewYear}
              onSelect={(y) => goToMonth(y, viewMonth)}
              minWidth="min-w-[104px]"
            />

            {/* Month Navigator Chevrons */}
            <div className="flex items-center gap-1 ml-0.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handlePrevMonth}
                aria-label="Previous month"
                title="Previous month"
                className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] border border-border bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-border/40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handleNextMonth}
                aria-label="Next month"
                title="Next month"
                className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] border border-border bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-border/40 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Top-Right Stylized Desk Calendar Badge */}
        <CalendarBadge dayText={badgeDay} monthText={badgeMonth} style={badgeStyle} />
      </div>

      {/* ---------------------------------------------------- */}
      {/* QUICK SHORTCUTS BAR (Optional)                       */}
      {/* ---------------------------------------------------- */}
      {showShortcuts && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
          <button
            type="button"
            onClick={() => handleShortcut(0)}
            className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-caption font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleShortcut(1)}
            className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-caption font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => handleShortcut(7)}
            className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-caption font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
          >
            +1 Week
          </button>
          <button
            type="button"
            onClick={() => handleShortcut(30)}
            className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-caption font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
          >
            +30 Days
          </button>
          <button
            type="button"
            onClick={() => handleShortcut('end_of_month')}
            className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-caption font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
          >
            End of Month
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* WEEKDAY HEADERS (from @kalya/utils WEEKDAYS)         */}
      {/* ---------------------------------------------------- */}
      <div
        className="grid grid-cols-7 mb-1 text-center select-none"
        role="row"
        aria-label="Weekdays"
      >
        {WEEKDAYS.map((dayName, idx) => (
          <div
            key={dayName}
            role="columnheader"
            aria-label={dayName}
            className={cn(
              'w-full py-1 text-center text-[0.68rem] font-bold uppercase tracking-wide text-text-primary',
              idx === 0 && 'text-primary' // Sunday highlight
            )}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 42-DAY CALENDAR GRID WITH MOTION TRANSITIONS         */}
      {/* ---------------------------------------------------- */}
      <div className="relative overflow-hidden min-h-62.5">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${viewYear}-${viewMonth}`}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -20 : 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('grid grid-cols-7 gap-y-1 justify-items-center w-full', classNames?.grid)}
            role="grid"
            aria-label={`${MONTHS[viewMonth]} ${viewYear}`}
          >
            {monthGridDays.map((cellDate) => {
              const dateStr = toISO(cellDate);
              const isCurrentMonth = cellDate.month === viewMonth + 1;
              const isSelected = selected ? isSameDay(cellDate, selected) : false;
              const isToday = isSameDay(cellDate, today);
              const isDisabled = isCellDisabled(cellDate);

              // Skip outside days if not enabled
              if (!showOutsideDays && !isCurrentMonth) {
                return <div key={dateStr} className="h-9.5 w-9" aria-hidden="true" />;
              }

              return (
                <div
                  key={dateStr}
                  role="gridcell"
                  className={cn(
                    'h-9.5 w-9 p-0 text-center relative flex items-center justify-center',
                    cellDate.dayOfWeek === 7 && 'text-primary' // Sunday ISO dayOfWeek 7
                  )}
                >
                  <motion.button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDay(cellDate)}
                    whileHover={!isDisabled ? { scale: 1.05 } : undefined}
                    whileTap={!isDisabled ? { scale: 0.94 } : undefined}
                    aria-selected={isSelected}
                    aria-label={`${formatCalendarDate(cellDate)}${isToday ? ', Today' : ''}`}
                    className={cn(
                      'h-8 w-8 rounded-full p-0 font-semibold text-[0.85rem] text-text-primary bg-transparent border-none',
                      'flex items-center justify-center cursor-pointer transition-colors hover:bg-surface-raised',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      // Today state
                      isToday && !isSelected && 'ring-1 ring-primary/50 font-bold',
                      // Selected state (signature Kalya pill with bottom accent bar)
                      isSelected && [
                        'text-primary! font-bold bg-primary-subtle! relative',
                        "after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2",
                        'after:w-4.5 after:h-[2.5px] after:rounded-full after:bg-primary',
                      ],
                      // Outside days
                      !isCurrentMonth && 'text-text-muted opacity-50 hover:bg-transparent',
                      // Disabled state
                      isDisabled &&
                        'text-text-muted opacity-40 cursor-not-allowed hover:bg-transparent',
                      classNames?.day,
                      isSelected && classNames?.selected,
                      isToday && classNames?.today,
                      !isCurrentMonth && classNames?.outside,
                      isDisabled && classNames?.disabled
                    )}
                  >
                    <span>{cellDate.day}</span>
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------------------------------------------------- */}
      {/* OPTIONAL TIME & TIMESTAMP PICKER SECTION             */}
      {/* ---------------------------------------------------- */}
      {showTime && (
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span className="text-body-sm font-semibold text-text-primary">Time</span>
            </div>

            {/* Hour & Minute Pickers */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-border bg-surface-raised px-2 py-1">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={String(time.hours).padStart(2, '0')}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(23, Number(e.target.value) || 0));
                    setTime((prev) => ({ ...prev, hours: val }));
                  }}
                  className="w-8 text-center text-body-sm font-numeric font-semibold text-text-primary bg-transparent focus:outline-none"
                  aria-label="Hour (24h)"
                />
                <span className="text-text-muted px-0.5">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={5}
                  value={String(time.minutes).padStart(2, '0')}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                    setTime((prev) => ({ ...prev, minutes: val }));
                  }}
                  className="w-8 text-center text-body-sm font-numeric font-semibold text-text-primary bg-transparent focus:outline-none"
                  aria-label="Minute"
                />
              </div>

              {/* Timestamp formatted time preview */}
              {currentInstant && (
                <span className="text-caption font-mono text-text-muted">
                  {formatTime(currentInstant)}
                </span>
              )}
            </div>
          </div>

          {/* Timestamp details banner using @kalya/utils */}
          {currentInstant && (
            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-surface-raised/80 border border-border/60 px-3 py-2 text-caption text-text-secondary">
              <span className="truncate">{formatDateTime(currentInstant)}</span>
              <span className="ml-2 font-semibold text-primary capitalize shrink-0">
                {formatRelativeTime(currentInstant)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* FOOTER ACTIONS (Summary & Confirmation)              */}
      {/* ---------------------------------------------------- */}
      {showConfirm && (
        <div className={cn('mt-6 flex flex-col items-center gap-3', classNames?.footer)}>
          {/* Selected Date Summary & Clear Shortcut */}
          <div className="flex items-center justify-between w-full px-1 min-h-6">
            {formattedSummary ? (
              <div className="flex items-center gap-1.5 text-caption font-medium text-text-secondary">
                <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-semibold text-text-primary truncate">
                  {formattedSummary.fullDate}
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-primary font-semibold shrink-0">{formattedSummary.rel}</span>
              </div>
            ) : (
              <span className="text-caption text-text-muted italic">No date selected</span>
            )}

            {showClear && selected && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-danger transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Confirm Button */}
          <motion.button
            type="button"
            disabled={!selected}
            whileTap={selected ? { scale: 0.97 } : undefined}
            whileHover={selected ? { scale: 1.01 } : undefined}
            onClick={handleConfirm}
            className={cn(
              'w-full max-w-55 rounded-2xl py-3 text-base font-bold shadow-sm transition-colors text-center',
              selected
                ? 'cursor-pointer bg-linear-to-b from-primary to-primary/80 text-on-primary shadow-primary/30 hover:opacity-90 hover:shadow-md'
                : 'cursor-not-allowed bg-border text-text-muted'
            )}
          >
            Confirm
          </motion.button>
        </div>
      )}
    </div>
  );
}

Calendar.displayName = 'Calendar';
