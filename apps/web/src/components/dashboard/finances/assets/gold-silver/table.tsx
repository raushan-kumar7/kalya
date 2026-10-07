'use client';

import React from 'react';
import { Coins, DollarSign, Eye, Pencil, Search, Sparkles, Trash2 } from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { Input } from '@/components/ui/forms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/data-display/table';
import { DigitalAssetItem, GoldSilverFilters } from '@/hooks/finances/use-gold-silver';

export interface GoldSilverTableProps {
  purchases: DigitalAssetItem[];
  filters: GoldSilverFilters;
  onFilterChange: (updates: Partial<GoldSilverFilters>) => void;
  platforms: string[];
  onSelectPurchase: (item: DigitalAssetItem) => void;
  onEditPurchase: (item: DigitalAssetItem) => void;
  onSellPurchase: (item: DigitalAssetItem) => void;
  onDeletePurchase: (item: DigitalAssetItem) => void;
  onAddNew: () => void;
}

export function GoldSilverTable({
  purchases,
  filters,
  onFilterChange,
  platforms,
  onSelectPurchase,
  onEditPurchase,
  onSellPurchase,
  onDeletePurchase,
  onAddNew,
}: GoldSilverTableProps) {
  // Grand totals of filtered rows
  const totals = React.useMemo(() => {
    let goldGrams = 0;
    let silverGrams = 0;
    let totalInvested = 0;
    let totalCurrentVal = 0;
    let totalGst = 0;

    for (const p of purchases) {
      const w = Number(p.weight_in_gram) || 0;
      const inv = Number(p.amount_paid) || 0;
      const cur = p.current_value || 0;
      const gst = Number(p.gst_3_percent) || 0;

      if (p.type === 'gold') goldGrams += w;
      else silverGrams += w;

      totalInvested += inv;
      totalCurrentVal += cur;
      totalGst += gst;
    }

    const netGain = totalCurrentVal - totalInvested;
    const netGainPct = totalInvested > 0 ? (netGain / totalInvested) * 100 : 0;

    return {
      goldGrams,
      silverGrams,
      totalInvested,
      totalCurrentVal,
      totalGst,
      netGain,
      netGainPct,
    };
  }, [purchases]);

  return (
    <div className="space-y-3 w-full">
      {/* Table Controls: Single Row Layout */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full">
        {/* Left: Metal Segmented Filter */}
        <div className="inline-flex shrink-0 items-center rounded-xl border border-border bg-surface-raised p-1 text-caption">
          <button
            type="button"
            onClick={() => onFilterChange({ metal: 'all' })}
            className={cn(
              'rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
              filters.metal === 'all'
                ? 'bg-surface font-semibold text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            All Metals
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ metal: 'gold' })}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
              filters.metal === 'gold'
                ? 'bg-amber-500/20 text-amber-500 font-semibold shadow-xs'
                : 'text-text-secondary hover:text-amber-500'
            )}
          >
            <Coins className="h-3 w-3" /> Gold
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ metal: 'silver' })}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
              filters.metal === 'silver'
                ? 'bg-slate-400/20 text-slate-300 font-semibold shadow-xs'
                : 'text-text-secondary hover:text-slate-300'
            )}
          >
            <Sparkles className="h-3 w-3" /> Silver
          </button>
        </div>

        {/* Right: Search, Vault Dropdown, and Sort Dropdown in a Single Row */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          {/* Search Box */}
          <div className="relative w-44 sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Search purchases…"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="h-8.5 pl-8 text-caption w-full"
            />
          </div>

          {/* Platform / Vault Filter */}
          <div className="w-32 shrink-0">
            <Select
              value={filters.platform}
              onValueChange={(val) => onFilterChange({ platform: val })}
            >
              <SelectTrigger className="h-8.5 text-caption w-full">
                <SelectValue placeholder="All Vaults" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vaults</SelectItem>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Filter */}
          <div className="w-36 shrink-0">
            <Select
              value={filters.sortBy}
              onValueChange={(val) => onFilterChange({ sortBy: val as any })}
            >
              <SelectTrigger className="h-8.5 text-caption w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Latest Date</SelectItem>
                <SelectItem value="date_asc">Oldest Date</SelectItem>
                <SelectItem value="value_desc">Highest Value</SelectItem>
                <SelectItem value="gain_desc">Highest Gain</SelectItem>
                <SelectItem value="weight_desc">Heaviest Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Table using UI Components */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-3 pl-4 pr-3">Metal</TableHead>
            <TableHead
              className="py-3 px-3 cursor-pointer"
              sortable
              sortDirection={
                filters.sortBy === 'date_desc'
                  ? 'desc'
                  : filters.sortBy === 'date_asc'
                    ? 'asc'
                    : false
              }
              onSort={() =>
                onFilterChange({
                  sortBy: filters.sortBy === 'date_desc' ? 'date_asc' : 'date_desc',
                })
              }
            >
              Date
            </TableHead>
            <TableHead className="py-3 px-3">Vault / Platform</TableHead>
            <TableHead
              className="py-3 px-3 text-right cursor-pointer"
              sortable
              sortDirection={filters.sortBy === 'weight_desc' ? 'desc' : false}
              onSort={() => onFilterChange({ sortBy: 'weight_desc' })}
            >
              Weight
            </TableHead>
            <TableHead className="py-3 px-3 text-right">Buy Rate (₹/g)</TableHead>
            <TableHead className="py-3 px-3 text-right">GST (3%)</TableHead>
            <TableHead className="py-3 px-3 text-right">Amount Paid</TableHead>
            <TableHead
              className="py-3 px-3 text-right cursor-pointer"
              sortable
              sortDirection={filters.sortBy === 'value_desc' ? 'desc' : false}
              onSort={() => onFilterChange({ sortBy: 'value_desc' })}
            >
              Current Value
            </TableHead>
            <TableHead
              className="py-3 px-3 text-right cursor-pointer"
              sortable
              sortDirection={filters.sortBy === 'gain_desc' ? 'desc' : false}
              onSort={() => onFilterChange({ sortBy: 'gain_desc' })}
            >
              P&L (₹ / %)
            </TableHead>
            <TableHead className="py-3 pl-3 pr-4 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {purchases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center text-text-muted">
                No bullion purchases found matching your active filters.
              </TableCell>
            </TableRow>
          ) : (
            purchases.map((item) => {
              const isGold = item.type === 'gold';
              const formattedDate = new Date(item.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <TableRow key={item.id}>
                  {/* Metal Badge */}
                  <TableCell className="py-3.5 pl-4 pr-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-inner',
                          isGold
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-slate-400/20 text-slate-300'
                        )}
                      >
                        {isGold ? <Coins className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                      </span>
                      <div>
                        <div className="font-semibold text-text-primary">
                          {isGold ? 'Gold 24K' : 'Silver 999'}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {isGold ? '99.9% Pure' : 'Fine Bullion'}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-3.5 px-3 whitespace-nowrap font-numeric text-text-secondary">
                    {formattedDate}
                  </TableCell>

                  {/* Vault / Platform */}
                  <TableCell className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex rounded-md border border-border bg-surface-raised px-2 py-0.5 text-caption font-medium text-text-primary">
                      {item.platform}
                    </span>
                  </TableCell>

                  {/* Weight */}
                  <TableCell className="py-3.5 px-3 text-right font-numeric font-bold text-text-primary whitespace-nowrap">
                    {item.weight_in_gram} g
                  </TableCell>

                  {/* Buy Rate */}
                  <TableCell className="py-3.5 px-3 text-right font-numeric text-text-secondary whitespace-nowrap">
                    ₹{Number(item.rate_per_gram).toLocaleString('en-IN')}
                  </TableCell>

                  {/* GST 3% */}
                  <TableCell className="py-3.5 px-3 text-right font-numeric text-text-muted whitespace-nowrap">
                    ₹{formatInr(Number(item.gst_3_percent))}
                  </TableCell>

                  {/* Amount Paid */}
                  <TableCell className="py-3.5 px-3 text-right font-numeric font-medium text-text-primary whitespace-nowrap">
                    ₹{formatInr(Number(item.amount_paid))}
                  </TableCell>

                  {/* Current Value */}
                  <TableCell className="py-3.5 px-3 text-right font-numeric font-bold text-text-primary whitespace-nowrap">
                    ₹{formatInr(item.current_value)}
                  </TableCell>

                  {/* Gain / Loss */}
                  <TableCell className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          'font-numeric font-bold text-body-xs',
                          item.is_profit ? 'text-success' : 'text-danger'
                        )}
                      >
                        {item.is_profit ? '+' : ''}₹{formatInr(item.gain_loss)}
                      </span>
                      <span
                        className={cn(
                          'font-numeric text-[11px]',
                          item.is_profit ? 'text-success' : 'text-danger'
                        )}
                      >
                        {item.is_profit ? '+' : ''}
                        {item.gain_loss_pct.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>

                  {/* Row Actions */}
                  <TableCell className="py-3.5 pl-3 pr-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectPurchase(item)}
                        title="View Details"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditPurchase(item)}
                        title="Edit Purchase"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSellPurchase(item)}
                        title="Sell Bullion"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeletePurchase(item)}
                        title="Delete Entry"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-danger-subtle hover:text-danger transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>

        {/* Table Footer with Grand Totals */}
        {purchases.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell className="py-3 pl-4 pr-3 font-semibold">Portfolio Totals</TableCell>
              <TableCell className="py-3 px-3 text-caption text-text-muted">
                {purchases.length} holding{purchases.length === 1 ? '' : 's'}
              </TableCell>
              <TableCell className="py-3 px-3 text-caption text-text-muted">—</TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric font-bold">
                {totals.goldGrams > 0 && `${totals.goldGrams}g Au `}
                {totals.silverGrams > 0 && `${totals.silverGrams}g Ag`}
              </TableCell>
              <TableCell className="py-3 px-3 text-right text-caption text-text-muted">—</TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric text-text-muted">
                ₹{formatInr(totals.totalGst)}
              </TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric font-semibold">
                ₹{formatInr(totals.totalInvested)}
              </TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric font-bold text-primary text-body-md">
                ₹{formatInr(totals.totalCurrentVal)}
              </TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric font-semibold">
                <span className={totals.netGain >= 0 ? 'text-success' : 'text-danger'}>
                  {totals.netGain >= 0 ? '+' : ''}₹{formatInr(totals.netGain)} (
                  {totals.netGainPct.toFixed(1)}%)
                </span>
              </TableCell>
              <TableCell className="py-3 pl-3 pr-4" />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
