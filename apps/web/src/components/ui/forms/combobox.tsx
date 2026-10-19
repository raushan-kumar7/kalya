'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../overlays/popover';
import { Button } from './button';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/libs/utils';
import { type ControlSize } from '@/components/ui/constants';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  size?: ControlSize;
  clearable?: boolean;
  renderOption?: (option: ComboboxOption, selected: boolean) => React.ReactNode;
  /** Fires on every keystroke in the search box (use for server-side search) */
  onSearchChange?: (search: string) => void;
  /** Set to false when `options` are already filtered by the server */
  filterLocally?: boolean;
}

export function Combobox({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found.',
  className,
  disabled = false,
  error = false,
  size = 'default',
  clearable = true,
  renderOption,
  onSearchChange,
  filterLocally = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!search || !filterLocally) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lower) ||
        option.description?.toLowerCase().includes(lower) ||
        option.group?.toLowerCase().includes(lower)
    );
  }, [options, search, filterLocally]);

  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  // Group filtered options if any options have group
  const groupedOptions = React.useMemo(() => {
    const hasGroups = filteredOptions.some((o) => Boolean(o.group));
    if (!hasGroups) return { '': filteredOptions };

    return filteredOptions.reduce<Record<string, ComboboxOption[]>>((acc, option) => {
      const g = option.group || 'General';
      if (!acc[g]) acc[g] = [];
      acc[g].push(option);
      return acc;
    }, {});
  }, [filteredOptions]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch('');
      onSearchChange?.('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal text-left relative',
            !value && 'text-text-muted',
            error && 'border-danger focus-visible:ring-danger hover:border-danger',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate pr-6">
            {selectedOption?.icon && (
              <span className="shrink-0 text-text-muted">{selectedOption.icon}</span>
            )}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {clearable && value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)
                }
                className="p-0.5 rounded-xs hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Clear selection"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-60 text-text-secondary" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="p-0 w-(--radix-popover-trigger-width) min-w-56 max-h-80 overflow-hidden flex flex-col border border-border bg-surface shadow-raised"
      >
        <div className="flex items-center border-b border-border px-3 py-2 bg-surface">
          <Search className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
          <input
            type="text"
            className="flex h-7 w-full rounded-xs bg-transparent text-body-sm text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              onSearchChange?.(val);
            }}
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 p-1 max-h-60 no-scrollbar">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-body-sm text-text-muted font-numeric">
              {emptyText}
            </div>
          ) : (
            Object.entries(groupedOptions).map(([groupName, groupItems]) => (
              <div key={groupName} className="mb-1 last:mb-0">
                {groupName && (
                  <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    {groupName}
                  </div>
                )}
                {groupItems.map((option) => {
                  const isSelected = option.value === value;
                  const isOptionDisabled = option.disabled;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isOptionDisabled}
                      onClick={() => {
                        onChange?.(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        'relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2.5 py-2 text-body-sm outline-none transition-colors text-left text-text-primary',
                        'hover:bg-surface-raised focus:bg-surface-raised',
                        isSelected && 'bg-primary-subtle text-primary font-medium',
                        isOptionDisabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                      )}
                    >
                      {renderOption ? (
                        renderOption(option, isSelected)
                      ) : (
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {option.icon && (
                            <span className="shrink-0 text-text-muted">{option.icon}</span>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{option.label}</span>
                            {option.description && (
                              <span className="text-[11px] text-text-muted truncate mt-0.5">
                                {option.description}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <Check
                        className={cn(
                          'ml-2 h-4 w-4 shrink-0 text-primary transition-opacity',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * MultiSelect
 * -----------
 * Searchable multi-selection component supporting tags, clearing, and category groups.
 */
export interface MultiSelectProps {
  options: ComboboxOption[];
  values?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  size?: ControlSize;
}

export function MultiSelect({
  options = [],
  values = [],
  onChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search items...',
  emptyText = 'No items found.',
  className,
  disabled = false,
  error = false,
  size: _size = 'default',
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lower) ||
        option.description?.toLowerCase().includes(lower)
    );
  }, [options, search]);

  const selectedOptions = React.useMemo(() => {
    return options.filter((o) => values.includes(o.value));
  }, [options, values]);

  const toggleOption = (optValue: string) => {
    const next = values.includes(optValue)
      ? values.filter((v) => v !== optValue)
      : [...values, optValue];
    onChange?.(next);
  };

  const removeTag = (optValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(values.filter((v) => v !== optValue));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={open}
          className={cn(
            'flex min-h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-1.5 text-body-sm shadow-card cursor-pointer transition-colors',
            'hover:border-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            error && 'border-danger focus-visible:ring-danger',
            disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2">
            {selectedOptions.length === 0 ? (
              <span className="text-text-muted">{placeholder}</span>
            ) : (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded-sm bg-primary-subtle px-2 py-0.5 text-caption font-medium text-primary border border-primary/20"
                >
                  <span className="truncate max-w-32">{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => removeTag(opt.value, e)}
                    className="hover:bg-primary/20 rounded-xs p-0.5 cursor-pointer"
                    aria-label={`Remove ${opt.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-text-secondary">
            {values.length > 0 && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClearAll}
                className="p-1 rounded-xs hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Clear all"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-60" />
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="p-0 w-(--radix-popover-trigger-width) min-w-64 max-h-80 overflow-hidden flex flex-col border border-border bg-surface shadow-raised"
      >
        <div className="flex items-center border-b border-border px-3 py-2 bg-surface">
          <Search className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
          <input
            type="text"
            className="flex h-7 w-full rounded-xs bg-transparent text-body-sm text-text-primary outline-none placeholder:text-text-muted"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 p-1 max-h-60 no-scrollbar">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-body-sm text-text-muted font-numeric">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = values.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2.5 py-2 text-body-sm outline-none transition-colors text-left text-text-primary',
                    'hover:bg-surface-raised focus:bg-surface-raised',
                    isSelected && 'bg-primary-subtle text-primary font-medium',
                    option.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border border-border',
                        isSelected ? 'bg-primary text-on-primary border-primary' : 'bg-surface'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-3" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </div>
                  {option.description && (
                    <span className="text-[11px] text-text-muted truncate ml-2">
                      {option.description}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
