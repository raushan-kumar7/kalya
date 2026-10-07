'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays/popover';
import { Button } from '@/components/ui/forms/button';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Columns3 } from 'lucide-react';

export interface ColumnVisibilityState {
  category: boolean;
  type: boolean;
  method: boolean;
  total: boolean;
  status: boolean;
}

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibilityState = {
  category: true,
  type: true,
  method: true,
  total: true,
  status: true,
};

export interface ColumnVisibilityMenuProps {
  visibility: ColumnVisibilityState;
  onToggle: (column: keyof ColumnVisibilityState) => void;
  onReset: () => void;
}

export function ColumnVisibilityMenu({ visibility, onToggle, onReset }: ColumnVisibilityMenuProps) {
  const columns: { id: keyof ColumnVisibilityState; label: string }[] = [
    { id: 'category', label: 'Category' },
    { id: 'type', label: 'Type Badge' },
    { id: 'method', label: 'Payment Method' },
    { id: 'total', label: 'Total Amount' },
    { id: 'status', label: 'Split Status' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-caption bg-surface cursor-pointer shadow-xs"
        >
          <Columns3 className="h-4 w-4 text-text-muted" />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-3 shadow-raised">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-display text-caption font-semibold text-text-primary">
              Toggle Columns
            </span>
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] text-text-muted hover:text-text-primary cursor-pointer transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-2">
            {columns.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2.5 text-caption text-text-secondary hover:text-text-primary cursor-pointer select-none py-0.5"
              >
                <Checkbox checked={visibility[col.id]} onCheckedChange={() => onToggle(col.id)} />
                <span>{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
