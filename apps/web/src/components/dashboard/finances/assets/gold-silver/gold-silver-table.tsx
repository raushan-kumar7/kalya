'use client';

import React, { useMemo, useState } from 'react';
import { Coins, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { DataTable, DataTableColumn } from '@/components/ui/data-display/table';
import type { DigitalAssetItem } from '@/hooks/finances/use-gold-silver';

type MetalFilter = 'ALL' | 'gold' | 'silver';

const METAL_FILTERS: { value: MetalFilter; label: string }[] = [
  { value: 'ALL', label: 'All Metals' },
  { value: 'gold', label: 'Gold (Au)' },
  { value: 'silver', label: 'Silver (Ag)' },
];

const NUMERIC_COLUMN = 'text-right whitespace-nowrap [&>div]:justify-end';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatRate = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface GoldSilverTableProps {
  purchases: DigitalAssetItem[];
  isLoading?: boolean;
  onEdit: (item: DigitalAssetItem) => void;
  onDelete: (item: DigitalAssetItem) => void;
}

export function GoldSilverTable({
  purchases,
  isLoading = false,
  onEdit,
  onDelete,
}: GoldSilverTableProps) {
  const [metalFilter, setMetalFilter] = useState<MetalFilter>('ALL');

  const filteredPurchases = useMemo(
    () => (metalFilter === 'ALL' ? purchases : purchases.filter((p) => p.type === metalFilter)),
    [purchases, metalFilter]
  );

  const columns: DataTableColumn<DigitalAssetItem>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      sortValue: (p) => new Date(p.date).getTime(),
      className: 'whitespace-nowrap',
      cell: (p) => <span className="font-numeric text-text-secondary">{formatDate(p.date)}</span>,
    },
    {
      key: 'type',
      header: 'Metal',
      sortable: true,
      sortValue: (p) => p.type,
      cell: (p) =>
        p.type === 'gold' ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-caption font-semibold text-amber-500">
            <Coins className="h-3 w-3" />
            Gold 24K
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-400/30 bg-slate-400/10 px-2 py-0.5 text-caption font-semibold text-slate-300">
            <Sparkles className="h-3 w-3" />
            Silver 999
          </span>
        ),
    },
    {
      key: 'platform',
      header: 'Vault / Platform',
      sortable: true,
      sortValue: (p) => p.platform.toLowerCase(),
      cell: (p) => <span className="font-semibold text-text-primary">{p.platform}</span>,
    },
    {
      key: 'weight_in_gram',
      header: 'Weight',
      sortable: true,
      sortValue: (p) => Number(p.weight_in_gram),
      className: NUMERIC_COLUMN,
      cell: (p) => (
        <span className="font-numeric font-medium text-text-primary">
          {Number(p.weight_in_gram).toFixed(2)} g
        </span>
      ),
    },
    {
      key: 'rate_per_gram',
      header: 'Buy Rate',
      sortable: true,
      sortValue: (p) => Number(p.rate_per_gram),
      className: NUMERIC_COLUMN,
      cell: (p) => (
        <span className="font-numeric text-text-secondary">
          {formatRate(Number(p.rate_per_gram))}/g
        </span>
      ),
    },
    {
      key: 'gst_3_percent',
      header: 'GST (3%)',
      sortable: true,
      sortValue: (p) =>
        Number(p.gst_3_percent ?? (p as any).gst3_percent ?? (p as any).gst3Percent ?? 0),
      className: NUMERIC_COLUMN,
      cell: (p) => {
        const gst = Number(
          p.gst_3_percent ?? (p as any).gst3_percent ?? (p as any).gst3Percent ?? 0
        );
        const weight = Number(p.weight_in_gram ?? (p as any).weightInGram ?? 0);
        const rate = Number(p.rate_per_gram ?? (p as any).ratePerGram ?? 0);
        const displayGst =
          gst > 0 ? gst : weight > 0 && rate > 0 ? +(weight * rate * 0.03).toFixed(2) : 0;
        return (
          <span className="font-numeric text-text-muted">
            ₹
            {displayGst.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      key: 'amount_paid',
      header: 'Amount Paid',
      sortable: true,
      sortValue: (p) => Number(p.amount_paid),
      className: NUMERIC_COLUMN,
      cell: (p) => (
        <span className="font-numeric font-bold text-text-primary">
          {formatInr(Number(p.amount_paid))}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24 text-right pr-4 [&>div]:justify-end',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(p)}
            title="Edit purchase"
            aria-label={`Edit ${p.weight_in_gram}g ${p.type} purchase`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(p)}
            title="Delete purchase"
            aria-label={`Delete ${p.weight_in_gram}g ${p.type} purchase`}
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
      title="Bullion Purchases"
      data={filteredPurchases}
      columns={columns}
      keyExtractor={(p) => p.id}
      isLoading={isLoading}
      pageSize={8}
      searchPlaceholder="Search vault, metal, date…"
      searchFilter={(p, q) => {
        const query = q.toLowerCase();
        return (
          p.platform.toLowerCase().includes(query) ||
          p.type.toLowerCase().includes(query) ||
          p.date.includes(query)
        );
      }}
      emptyTitle="No bullion purchases found"
      emptyDescription="Try another search or filter."
      actions={
        <div
          role="group"
          aria-label="Filter by metal"
          className="inline-flex shrink-0 items-center rounded-xl border border-border bg-surface-raised p-1 text-caption"
        >
          {METAL_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={metalFilter === f.value}
              onClick={() => setMetalFilter(f.value)}
              className={cn(
                'rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
                metalFilter === f.value
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
