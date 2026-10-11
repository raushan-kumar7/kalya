'use client';

import React, { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { DataTable, DataTableColumn } from '@/components/ui/data-display/table';
import type { EquityRow } from '@/hooks/finances/use-equities';

type ExchangeFilter = 'ALL' | 'NSE' | 'BSE';

const EXCHANGE_FILTERS: { value: ExchangeFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'NSE', label: 'NSE' },
  { value: 'BSE', label: 'BSE' },
];

// Sortable headers render their label in a flex div, so right-align it explicitly
const NUMERIC_COLUMN = 'text-right whitespace-nowrap [&>div]:justify-end';

const formatPrice = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export interface EquityTableProps {
  rows: EquityRow[];
  isLoading?: boolean;
  onEdit: (row: EquityRow) => void;
  onDelete: (row: EquityRow) => void;
}

export function EquityTable({ rows, isLoading = false, onEdit, onDelete }: EquityTableProps) {
  const [exchange, setExchange] = useState<ExchangeFilter>('ALL');

  const filteredRows = useMemo(
    () => (exchange === 'ALL' ? rows : rows.filter((r) => r.exchange_type === exchange)),
    [rows, exchange]
  );

  const columns: DataTableColumn<EquityRow>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      sortValue: (r) => new Date(r.date).getTime(),
      className: 'whitespace-nowrap',
      cell: (r) => <span className="font-numeric text-text-secondary">{formatDate(r.date)}</span>,
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      sortValue: (r) => r.company.toLowerCase(),
      cell: (r) => <span className="font-semibold text-text-primary">{r.company}</span>,
    },
    {
      key: 'exchange_type',
      header: 'Exchange',
      sortable: true,
      sortValue: (r) => r.exchange_type,
      cell: (r) => (
        <span className="inline-flex rounded-md border border-border bg-surface-raised px-2 py-0.5 text-caption font-medium text-text-primary">
          {r.exchange_type}
        </span>
      ),
    },
    {
      key: 'total_shared',
      header: 'Shares',
      sortable: true,
      sortValue: (r) => r.total_shared,
      className: NUMERIC_COLUMN,
      cell: (r) => (
        <span className="font-numeric font-medium text-text-primary">
          {r.total_shared.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'price_per_share',
      header: 'Buy Price',
      sortable: true,
      sortValue: (r) => r.price_per_share,
      className: NUMERIC_COLUMN,
      cell: (r) => (
        <span className="font-numeric text-text-secondary">{formatPrice(r.price_per_share)}</span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Invested',
      sortable: true,
      sortValue: (r) => r.total_amount,
      className: NUMERIC_COLUMN,
      cell: (r) => (
        <span className="font-numeric font-bold text-text-primary">
          {formatInr(r.total_amount)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24 text-right pr-4 [&>div]:justify-end',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(r)}
            title="Edit purchase"
            aria-label={`Edit ${r.company} purchase`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(r)}
            title="Delete purchase"
            aria-label={`Delete ${r.company} purchase`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-danger-subtle hover:text-danger cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Stock Purchases"
      data={filteredRows}
      columns={columns}
      keyExtractor={(r) => r.id}
      isLoading={isLoading}
      pageSize={8}
      searchPlaceholder="Search stocks…"
      searchFilter={(r, q) => {
        const query = q.toLowerCase();
        return (
          r.company.toLowerCase().includes(query) ||
          r.exchange_type.toLowerCase().includes(query) ||
          r.date.includes(query)
        );
      }}
      emptyTitle="No stock purchases found"
      emptyDescription="Try another search or exchange filter."
      actions={
        <div
          role="group"
          aria-label="Filter by exchange"
          className="inline-flex shrink-0 items-center rounded-xl border border-border bg-surface-raised p-1 text-caption"
        >
          {EXCHANGE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={exchange === f.value}
              onClick={() => setExchange(f.value)}
              className={cn(
                'rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
                exchange === f.value
                  ? 'bg-surface font-semibold text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    />
  );
}
