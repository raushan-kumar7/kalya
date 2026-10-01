'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronDown, X, Clock } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/forms/button';
import { useFieldContext } from '@/components/ui/forms/field';
import {
  Calendar,
  type CalendarProps,
  type DateValue,
  toPlainDate,
  toJsDate,
} from '@/components/ui/utilities/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays/popover';
import {
  Temporal,
  formatCalendarDate,
  formatCardDate,
  formatDateTime,
  formatRelativeTime,
  toInstant,
} from '@kalya/utils';

// ============================================================
// TYPES
// ============================================================

export interface DatePickerProps {
  /** The selected date (Date, ISO string "YYYY-MM-DD", or Temporal.PlainDate) */
  date?: DateValue;
  /** Uncontrolled default date value */
  defaultDate?: DateValue;
  /** Callback fired when a date is selected */
  onDateChange?: (date: Date | undefined, plainDate?: Temporal.PlainDate | null) => void;
  /** Placeholder text shown when no date is picked */
  placeholder?: string;
  /** Control size scale matching Kalya design system */
  size?: 'sm' | 'md' | 'lg';
  /** Additional trigger container CSS class names */
  className?: string;
  /** Popover content class names */
  popoverClassName?: string;
  /** Whether the date picker is disabled */
  disabled?: boolean;
  /** Whether the field is in an error state (or error message) */
  error?: boolean | string;
  /** Start year for the year dropdown */
  fromYear?: number;
  /** End year for the year dropdown */
  toYear?: number;
  /** Earliest allowed date */
  minDate?: DateValue;
  /** Latest allowed date */
  maxDate?: DateValue;
  /** Custom function to disable specific calendar days */
  disabledDates?: (date: Temporal.PlainDate) => boolean;
  /** Whether to show clear (×) button on hover when a date is selected */
  clearable?: boolean;
  /** Date format style: 'full' ("October 1, 2026") | 'card' / 'short' ("1 Oct 2026") | custom formatter */
  formatStyle?: 'full' | 'short' | 'card' | ((date: Temporal.PlainDate) => string);
  /** Whether to display a relative time badge ("Today", "in 3 days") beside the date */
  showRelativeBadge?: boolean;
  /** Whether to enable time selection inside the calendar */
  showTime?: boolean;
  /** Whether to show quick preset shortcut chips (+1W, Today, etc.) in the calendar */
  showShortcuts?: boolean;
  /** Whether to show the top-right 3D desk binder badge inside the calendar */
  badgeStyle?: 'binder' | 'minimal' | 'none';
  /** Alignment of the popover menu relative to trigger */
  align?: 'start' | 'center' | 'end';
  /** Popover side: 'top' | 'bottom' | 'left' | 'right' */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to automatically close the popover immediately upon picking a date (defaults to true if showTime is false) */
  closeOnSelect?: boolean;
  /** Additional props forwarded to inner Calendar component */
  calendarProps?: Partial<CalendarProps>;
  /** Custom ID for accessible form association */
  id?: string;
  /** Accessible name / label for the trigger button */
  'aria-label'?: string;
}

// ============================================================
// DATE PICKER COMPONENT
// ============================================================

export function DatePicker({
  date: controlledDate,
  defaultDate,
  onDateChange,
  placeholder = 'Pick a date',
  size = 'md',
  className,
  popoverClassName,
  disabled: disabledProp = false,
  error: errorProp = false,
  fromYear,
  toYear,
  minDate,
  maxDate,
  disabledDates,
  clearable = true,
  formatStyle = 'full',
  showRelativeBadge = false,
  showTime = false,
  showShortcuts = false,
  badgeStyle = 'binder',
  align = 'start',
  side = 'bottom',
  closeOnSelect,
  calendarProps,
  id: idProp,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  // Field context integration for form layouts
  const fieldContext = useFieldContext();
  const disabled = disabledProp || fieldContext?.disabled || false;
  const hasError = Boolean(errorProp || fieldContext?.hasError);
  const controlId = idProp || fieldContext?.controlId;

  // Popover open state
  const [open, setOpen] = React.useState(false);

  // Internal date state (normalized to Temporal.PlainDate)
  const [internalDate, setInternalDate] = React.useState<Temporal.PlainDate | null>(() => {
    return toPlainDate(controlledDate ?? defaultDate);
  });

  // Synchronize controlled date prop
  React.useEffect(() => {
    if (controlledDate !== undefined) {
      setInternalDate(toPlainDate(controlledDate));
    }
  }, [controlledDate]);

  // Current selected plain date
  const selectedPlainDate =
    controlledDate !== undefined ? toPlainDate(controlledDate) : internalDate;

  // Date formatted via @kalya/utils
  const formattedDate = React.useMemo(() => {
    if (!selectedPlainDate) return null;
    if (typeof formatStyle === 'function') {
      return formatStyle(selectedPlainDate);
    }
    if (showTime && controlledDate instanceof Date && !isNaN(controlledDate.getTime())) {
      return formatDateTime(toInstant(controlledDate));
    }
    switch (formatStyle) {
      case 'card':
      case 'short':
        return formatCardDate(selectedPlainDate);
      case 'full':
      default:
        return formatCalendarDate(selectedPlainDate);
    }
  }, [selectedPlainDate, formatStyle, showTime, controlledDate]);

  // Relative time badge formatted via @kalya/utils
  const relativeBadge = React.useMemo(() => {
    if (!selectedPlainDate || !showRelativeBadge) return null;
    const jsDate = toJsDate(selectedPlainDate);
    if (!jsDate) return null;
    return formatRelativeTime(toInstant(jsDate));
  }, [selectedPlainDate, showRelativeBadge]);

  // Handle date selection from Calendar
  const handleSelect = (jsDate: Date | undefined, plainDate: Temporal.PlainDate | null) => {
    if (controlledDate === undefined) {
      setInternalDate(plainDate);
    }
    onDateChange?.(jsDate, plainDate);

    // Auto-close popover if closeOnSelect is true (or undefined and showTime is false)
    const shouldClose = closeOnSelect !== undefined ? closeOnSelect : !showTime;
    if (shouldClose) {
      setOpen(false);
    }
  };

  // Handle Clear click
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (controlledDate === undefined) {
      setInternalDate(null);
    }
    onDateChange?.(undefined, null);
  };

  // Size styling tokens matching Kalya CONTROL_SIZES
  const sizeStyles = {
    sm: 'h-8.5 px-2.5 text-caption rounded-sm gap-2',
    md: 'h-10 px-3.5 text-body-sm rounded-md gap-2.5',
    lg: 'h-12 px-4 text-body-md rounded-md gap-3',
  }[size];

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={controlId}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={hasError}
          aria-label={
            ariaLabel || (selectedPlainDate ? `Selected date: ${formattedDate}` : placeholder)
          }
          className={cn(
            'w-full justify-between font-normal transition-all text-left bg-surface shadow-xs',
            sizeStyles,
            // Error states
            hasError
              ? 'border-danger text-danger focus-visible:ring-danger/40 focus-visible:border-danger hover:border-danger'
              : 'border-border text-text-primary hover:border-text-secondary/50 hover:bg-surface-raised',
            // Active open state
            open && !hasError && 'border-primary ring-2 ring-primary/20',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none bg-surface-raised/70',
            className
          )}
        >
          {/* Left: Calendar Icon + Date Display */}
          <div className="flex items-center gap-2 truncate min-w-0">
            {showTime ? (
              <Clock
                className={cn(
                  iconSizes,
                  'shrink-0 transition-colors',
                  open ? 'text-primary' : 'text-text-secondary opacity-70',
                  hasError && 'text-danger'
                )}
              />
            ) : (
              <CalendarIcon
                className={cn(
                  iconSizes,
                  'shrink-0 transition-colors',
                  open ? 'text-primary' : 'text-text-secondary opacity-70',
                  hasError && 'text-danger'
                )}
              />
            )}

            {formattedDate ? (
              <span className="truncate font-medium text-text-primary">{formattedDate}</span>
            ) : (
              <span className="truncate text-text-muted font-normal">{placeholder}</span>
            )}
          </div>

          {/* Right: Relative Badge + Clear (×) / Chevron */}
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {relativeBadge && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-subtle text-primary border border-primary/20 capitalize">
                {relativeBadge}
              </span>
            )}

            {clearable && selectedPlainDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date"
                title="Clear date"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClear(e as unknown as React.MouseEvent);
                  }
                }}
                className="p-0.5 rounded-full text-text-muted hover:text-text-primary hover:bg-border/60 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}

            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 text-text-muted transition-transform duration-200',
                open && 'rotate-180 text-primary'
              )}
            />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        side={side}
        sideOffset={6}
        padding="none"
        size="auto"
        className={cn(
          'w-auto border border-border/80 bg-surface shadow-2xl rounded-2xl overflow-hidden p-0',
          popoverClassName
        )}
      >
        <Calendar
          selected={controlledDate ?? internalDate}
          onSelect={handleSelect}
          onConfirm={(d, pd) => {
            handleSelect(d, pd);
            setOpen(false);
          }}
          fromYear={fromYear}
          toYear={toYear}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          showShortcuts={showShortcuts}
          showTime={showTime}
          badgeStyle={badgeStyle}
          showConfirm={showTime}
          variant="card"
          className="border-none shadow-none max-w-[440px]"
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = 'DatePicker';
