'use client';

import React from 'react';
import { DollarSign, Eye, Pencil, PieChart, Repeat, Trash2 } from 'lucide-react';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/data-display/table';
import { MutualFundHolding } from '@/hooks/finances/use-equities';

export interface MutualFundsTableProps {
  mutualFunds: MutualFundHolding[];
  onSelectFund: (fund: MutualFundHolding) => void;
  onEditFund: (fund: MutualFundHolding) => void;
  onDeleteFund: (fund: MutualFundHolding) => void;
}

export function MutualFundsTable({
  mutualFunds,
  onSelectFund,
  onEditFund,
  onDeleteFund,
}: MutualFundsTableProps) {
  const totals = React.useMemo(() => {
    let invested = 0;
    let currentVal = 0;

    for (const m of mutualFunds) {
      invested += m.invested_amount;
      currentVal += m.current_value;
    }

    const gain = currentVal - invested;
    const gainPct = invested > 0 ? (gain / invested) * 100 : 0;

    return { invested, currentVal, gain, gainPct };
  }, [mutualFunds]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-3 pl-4 pr-3">Mutual Fund Scheme</TableHead>
          <TableHead className="py-3 px-3">Category</TableHead>
          <TableHead className="py-3 px-3 text-right">Units</TableHead>
          <TableHead className="py-3 px-3 text-right">Avg NAV (₹)</TableHead>
          <TableHead className="py-3 px-3 text-right">Current NAV (₹)</TableHead>
          <TableHead className="py-3 px-3 text-right">Invested</TableHead>
          <TableHead className="py-3 px-3 text-right">Current Value</TableHead>
          <TableHead className="py-3 px-3 text-right">P&L / Return</TableHead>
          <TableHead className="py-3 px-3 text-center">SIP</TableHead>
          <TableHead className="py-3 pl-3 pr-4 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {mutualFunds.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="py-12 text-center text-text-muted">
              No mutual fund folios found in your portfolio.
            </TableCell>
          </TableRow>
        ) : (
          mutualFunds.map((fund) => {
            return (
              <TableRow key={fund.id}>
                {/* Scheme Name & Folio */}
                <TableCell className="py-3.5 pl-4 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary shadow-inner">
                      <PieChart className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-semibold text-text-primary">{fund.scheme_name}</div>
                      {fund.folio_number && (
                        <div className="text-[11px] font-mono text-text-muted">
                          Folio: {fund.folio_number}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell className="py-3.5 px-3 whitespace-nowrap">
                  <span className="inline-flex rounded-md border border-border bg-surface-raised px-2 py-0.5 text-caption font-medium text-text-primary">
                    {fund.category}
                  </span>
                </TableCell>

                {/* Units */}
                <TableCell className="py-3.5 px-3 text-right font-numeric font-medium text-text-primary whitespace-nowrap">
                  {fund.units.toFixed(2)}
                </TableCell>

                {/* Avg NAV */}
                <TableCell className="py-3.5 px-3 text-right font-numeric text-text-secondary whitespace-nowrap">
                  ₹{fund.avg_nav.toFixed(2)}
                </TableCell>

                {/* Current NAV */}
                <TableCell className="py-3.5 px-3 text-right font-numeric font-semibold text-text-primary whitespace-nowrap">
                  ₹{fund.current_nav.toFixed(2)}
                </TableCell>

                {/* Invested */}
                <TableCell className="py-3.5 px-3 text-right font-numeric font-medium text-text-primary whitespace-nowrap">
                  ₹{formatInr(fund.invested_amount)}
                </TableCell>

                {/* Current Value */}
                <TableCell className="py-3.5 px-3 text-right font-numeric font-bold text-text-primary whitespace-nowrap">
                  ₹{formatInr(fund.current_value)}
                </TableCell>

                {/* Gain / Loss */}
                <TableCell className="py-3.5 px-3 text-right whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <span
                      className={cn(
                        'font-numeric font-bold text-body-xs',
                        fund.is_profit ? 'text-success' : 'text-danger'
                      )}
                    >
                      {fund.is_profit ? '+' : ''}₹{formatInr(fund.gain_loss)}
                    </span>
                    <span
                      className={cn(
                        'font-numeric text-[11px]',
                        fund.is_profit ? 'text-success' : 'text-danger'
                      )}
                    >
                      {fund.is_profit ? '+' : ''}
                      {fund.gain_loss_pct.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>

                {/* SIP Badge */}
                <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                  {fund.is_sip ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-semibold text-success">
                      <Repeat className="h-3 w-3" />
                      {fund.sip_amount ? `₹${formatCompactInr(fund.sip_amount)}/mo` : 'Active'}
                    </span>
                  ) : (
                    <span className="text-caption text-text-muted">Lumpsum</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3.5 pl-3 pr-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectFund(fund)}
                      title="View Details"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditFund(fund)}
                      title="Edit Scheme"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteFund(fund)}
                      title="Delete Scheme"
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

      {mutualFunds.length > 0 && (
        <TableFooter>
          <TableRow>
            <TableCell className="py-3 pl-4 pr-3 font-semibold">Total Mutual Funds</TableCell>
            <TableCell className="py-3 px-3 text-caption text-text-muted">
              {mutualFunds.length} schemes
            </TableCell>
            <TableCell className="py-3 px-3 text-right text-caption text-text-muted">—</TableCell>
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
                {totals.gain >= 0 ? '+' : ''}₹{formatInr(totals.gain)} ({totals.gainPct.toFixed(1)}
                %)
              </span>
            </TableCell>
            <TableCell className="py-3 px-3" />
            <TableCell className="py-3 pl-3 pr-4" />
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
