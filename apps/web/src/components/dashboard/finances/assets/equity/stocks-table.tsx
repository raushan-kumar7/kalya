'use client';

import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Eye,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/forms/button';
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
import { EquityHoldingGroup, EquityFilters } from '@/hooks/finances/use-equities';

export interface StocksHoldingsTableProps {
  holdings: EquityHoldingGroup[];
  filters: EquityFilters;
  onFilterChange: (updates: Partial<EquityFilters>) => void;
  onSelectHolding: (holding: EquityHoldingGroup) => void;
  onAddLot: (holding: EquityHoldingGroup) => void;
  onSellHolding: (holding: EquityHoldingGroup) => void;
  onDeleteLot: (lotId: string) => void;
}

export function StocksHoldingsTable({
  holdings,
  filters,
  onFilterChange,
  onSelectHolding,
  onAddLot,
  onSellHolding,
  onDeleteLot,
}: StocksHoldingsTableProps) {
  const [expandedHoldingIds, setExpandedHoldingIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedHoldingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Grand totals of filtered stocks
  const totals = React.useMemo(() => {
    let shares = 0;
    let invested = 0;
    let currentVal = 0;

    for (const h of holdings) {
      shares += h.total_shares;
      invested += h.invested_amount;
      currentVal += h.current_value;
    }

    const gain = currentVal - invested;
    const gainPct = invested > 0 ? (gain / invested) * 100 : 0;

    return { shares, invested, currentVal, gain, gainPct };
  }, [holdings]);

  return (
    <div className="space-y-3 w-full">
      {/* Table Filter Controls: Single Row Layout */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full">
        {/* Left: Exchange Filter Segment */}
        <div className="inline-flex shrink-0 items-center rounded-xl border border-border bg-surface-raised p-1 text-caption">
          <button
            type="button"
            onClick={() => onFilterChange({ exchange: 'ALL' })}
            className={cn(
              'rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
              filters.exchange === 'ALL'
                ? 'bg-surface font-semibold text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            All Exchanges
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ exchange: 'NSE' })}
            className={cn(
              'rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
              filters.exchange === 'NSE'
                ? 'bg-primary text-text-inverse font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            NSE
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ exchange: 'BSE' })}
            className={cn(
              'rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
              filters.exchange === 'BSE'
                ? 'bg-primary text-text-inverse font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            BSE
          </button>
        </div>

        {/* Right: Search & Sort in a Single Row */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative w-44 sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Search stocks…"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="h-8.5 pl-8 text-caption w-full"
            />
          </div>

          <div className="w-40 shrink-0">
            <Select
              value={filters.sortBy}
              onValueChange={(val) => onFilterChange({ sortBy: val as any })}
            >
              <SelectTrigger className="h-8.5 text-caption w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value_desc">Highest Valuation</SelectItem>
                <SelectItem value="gain_desc">Highest Returns</SelectItem>
                <SelectItem value="invested_desc">Most Invested</SelectItem>
                <SelectItem value="name_asc">Company (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Table using UI Components */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-3 pl-3 pr-2 w-8" />
            <TableHead
              className="py-3 px-3 cursor-pointer"
              sortable
              sortDirection={filters.sortBy === 'name_asc' ? 'asc' : false}
              onSort={() => onFilterChange({ sortBy: 'name_asc' })}
            >
              Company / Stock
            </TableHead>
            <TableHead className="py-3 px-2">Exchange</TableHead>
            <TableHead className="py-3 px-3 text-right">Shares</TableHead>
            <TableHead className="py-3 px-3 text-right">Avg Buy (₹)</TableHead>
            <TableHead className="py-3 px-3 text-right">CMP (₹)</TableHead>
            <TableHead
              className="py-3 px-3 text-right cursor-pointer"
              sortable
              sortDirection={filters.sortBy === 'invested_desc' ? 'desc' : false}
              onSort={() => onFilterChange({ sortBy: 'invested_desc' })}
            >
              Invested
            </TableHead>
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
              Gain / Loss
            </TableHead>
            <TableHead className="py-3 px-3 text-center">Trend</TableHead>
            <TableHead className="py-3 pl-3 pr-4 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {holdings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="py-12 text-center text-text-muted">
                No stock holdings match your criteria.
              </TableCell>
            </TableRow>
          ) : (
            holdings.map((holding) => {
              const isExpanded = expandedHoldingIds.has(holding.id);

              return (
                <React.Fragment key={holding.id}>
                  {/* Primary Company Summary Row */}
                  <TableRow className={cn(isExpanded && 'bg-surface-raised/30')}>
                    {/* Expand Lots Toggle */}
                    <TableCell className="py-3 pl-3 pr-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(holding.id)}
                        className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse Lots' : 'Expand Purchase Lots'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>

                    {/* Company Name & Symbol */}
                    <TableCell className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary font-bold text-caption shadow-inner">
                          {holding.symbol.slice(0, 2)}
                        </span>
                        <div>
                          <div className="font-semibold text-text-primary">{holding.company}</div>
                          <div className="text-[11px] font-mono text-text-muted flex items-center gap-1.5">
                            <span>{holding.symbol}</span>
                            <span>•</span>
                            <span>
                              {holding.lots.length} lot{holding.lots.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Exchange */}
                    <TableCell className="py-3 px-2 whitespace-nowrap">
                      <span className="inline-flex rounded-md border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] font-bold text-text-secondary uppercase">
                        {holding.exchange_type}
                      </span>
                    </TableCell>

                    {/* Total Shares */}
                    <TableCell className="py-3 px-3 text-right font-numeric font-bold text-text-primary whitespace-nowrap">
                      {holding.total_shares.toLocaleString('en-IN')}
                    </TableCell>

                    {/* Avg Buy Price */}
                    <TableCell className="py-3 px-3 text-right font-numeric text-text-secondary whitespace-nowrap">
                      ₹{holding.avg_buy_price.toLocaleString('en-IN')}
                    </TableCell>

                    {/* CMP (Current Market Price) */}
                    <TableCell className="py-3 px-3 text-right font-numeric font-semibold text-text-primary whitespace-nowrap">
                      ₹{holding.current_price.toLocaleString('en-IN')}
                    </TableCell>

                    {/* Invested */}
                    <TableCell className="py-3 px-3 text-right font-numeric font-medium text-text-primary whitespace-nowrap">
                      ₹{formatInr(holding.invested_amount)}
                    </TableCell>

                    {/* Current Value */}
                    <TableCell className="py-3 px-3 text-right font-numeric font-bold text-text-primary whitespace-nowrap">
                      ₹{formatInr(holding.current_value)}
                    </TableCell>

                    {/* Gain / Loss */}
                    <TableCell className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            'font-numeric font-bold text-body-xs',
                            holding.is_profit ? 'text-success' : 'text-danger'
                          )}
                        >
                          {holding.is_profit ? '+' : ''}₹{formatInr(holding.gain_loss)}
                        </span>
                        <span
                          className={cn(
                            'font-numeric text-[11px]',
                            holding.is_profit ? 'text-success' : 'text-danger'
                          )}
                        >
                          {holding.is_profit ? '+' : ''}
                          {holding.gain_loss_pct.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Sparkline Visual */}
                    <TableCell className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5 h-4">
                        {holding.sparkline.map((val, idx) => {
                          const min = Math.min(...holding.sparkline);
                          const max = Math.max(...holding.sparkline);
                          const heightPct =
                            max > min
                              ? Math.max(20, Math.round(((val - min) / (max - min)) * 100))
                              : 50;
                          return (
                            <div
                              key={idx}
                              className={cn(
                                'w-1 rounded-xs transition-all',
                                holding.is_profit ? 'bg-success/70' : 'bg-danger/70'
                              )}
                              style={{ height: `${heightPct}%` }}
                            />
                          );
                        })}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 pl-3 pr-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onAddLot(holding)}
                          title="Add Purchase Lot"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-primary hover:bg-primary-subtle transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectHolding(holding)}
                          title="View Holding Details"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSellHolding(holding)}
                          title="Sell Stock"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Purchase Lots Drilldown */}
                  {isExpanded && (
                    <TableRow className="bg-surface-raised/20">
                      <TableCell colSpan={11} className="py-2.5 pl-11 pr-4">
                        <div className="rounded-lg border border-border/70 bg-surface/80 p-3 space-y-2">
                          <div className="flex items-center justify-between text-caption font-semibold text-text-secondary">
                            <span>Individual Purchase Lots ({holding.lots.length})</span>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => onAddLot(holding)}
                              className="h-6 text-[11px] gap-1"
                            >
                              <Plus className="h-3 w-3" /> Add Lot
                            </Button>
                          </div>

                          <div className="divide-y divide-border/40 text-caption">
                            {holding.lots.map((lot, lotIndex) => (
                              <div
                                key={lot.id}
                                className="flex flex-wrap items-center justify-between py-1.5 gap-2 text-text-secondary"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-text-muted">
                                    Lot #{lotIndex + 1}
                                  </span>
                                  <span>•</span>
                                  <span className="font-numeric">{lot.date}</span>
                                  <span className="text-[10px] font-bold uppercase rounded border border-border px-1 py-0.2">
                                    {lot.exchange_type}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 font-numeric">
                                  <span>
                                    {lot.total_shared} shares @ ₹{lot.price_per_share}
                                  </span>
                                  <span>Invested: ₹{formatInr(lot.total_amount)}</span>
                                  <span
                                    className={cn(
                                      'font-semibold',
                                      lot.gain_loss >= 0 ? 'text-success' : 'text-danger'
                                    )}
                                  >
                                    {lot.gain_loss >= 0 ? '+' : ''}₹{formatInr(lot.gain_loss)} (
                                    {lot.gain_loss_pct.toFixed(1)}%)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteLot(lot.id)}
                                    className="p-1 text-text-muted hover:text-danger transition-colors cursor-pointer"
                                    title="Delete Lot"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>

        {/* Table Footer with Portfolio Totals */}
        {holdings.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell className="py-3 pl-3 pr-2" />
              <TableCell className="py-3 px-3 font-semibold">Total Equities</TableCell>
              <TableCell className="py-3 px-2 text-caption text-text-muted">
                {holdings.length} stocks
              </TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric font-bold">
                {totals.shares.toLocaleString('en-IN')}
              </TableCell>
              <TableCell className="py-3 px-3 text-right text-caption text-text-muted">—</TableCell>
              <TableCell className="py-3 px-3 text-right text-caption text-text-muted">—</TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric font-semibold">
                ₹{formatInr(totals.invested)}
              </TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric font-bold text-primary text-body-md">
                ₹{formatInr(totals.currentVal)}
              </TableCell>
              <TableCell className="py-3 px-3 text-right font-numeric font-semibold">
                <span className={totals.gain >= 0 ? 'text-success' : 'text-danger'}>
                  {totals.gain >= 0 ? '+' : ''}₹{formatInr(totals.gain)} (
                  {totals.gainPct.toFixed(1)}%)
                </span>
              </TableCell>
              <TableCell className="py-3 px-3" />
              <TableCell className="py-3 pl-3 pr-4" />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
