'use client';

import React from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  IndianRupee,
  Layers,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { formatCompactInr, formatInr, roundMoney } from '@kalya/utils';
import { cn } from '@/libs/utils';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/overlays/drawer';
import { Button } from '@/components/ui/forms/button';
import { EquityHoldingGroup } from '@/hooks/finances/use-equities';

export interface EquityDetailsSheetProps {
  holding: EquityHoldingGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLot?: (holding: EquityHoldingGroup) => void;
  onSell?: (holding: EquityHoldingGroup) => void;
  onDeleteLot?: (lotId: string) => void;
}

export function EquityDetailsSheet({
  holding,
  open,
  onOpenChange,
  onAddLot,
  onSell,
  onDeleteLot,
}: EquityDetailsSheetProps) {
  if (!holding) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="md">
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary font-bold text-caption shadow-inner">
              {holding.symbol.slice(0, 2)}
            </span>
            <div>
              <DrawerTitle>{holding.company}</DrawerTitle>
              <DrawerDescription>
                {holding.symbol} • Listed on {holding.exchange_type}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-5">
          {/* Main Hero Card */}
          <div className="rounded-2xl border border-border bg-linear-to-br from-surface to-surface-raised p-4 shadow-card">
            <div className="flex items-center justify-between text-caption text-text-muted">
              <span>Current Market Valuation</span>
              <span className="font-semibold text-text-primary">
                CMP: ₹{holding.current_price.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-numeric text-3xl font-extrabold text-text-primary">
                ₹{formatInr(holding.current_value)}
              </span>
              <span
                className={cn(
                  'flex items-center gap-1 font-numeric text-body-sm font-bold',
                  holding.is_profit ? 'text-success' : 'text-danger'
                )}
              >
                {holding.is_profit ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {holding.is_profit ? '+' : ''}
                {formatInr(holding.gain_loss)} ({holding.gain_loss_pct.toFixed(1)}%)
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-caption">
              <div>
                <span className="text-text-muted">Total Quantity</span>
                <div className="font-numeric text-body-sm font-semibold text-text-primary">
                  {holding.total_shares.toLocaleString('en-IN')} shares
                </div>
              </div>
              <div>
                <span className="text-text-muted">Weighted Avg Buy Price</span>
                <div className="font-numeric text-body-sm font-semibold text-text-primary">
                  ₹{holding.avg_buy_price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Purchase Lots */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-caption font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Purchase Lots ({holding.lots.length})
              </h4>
              {onAddLot && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onAddLot(holding);
                  }}
                  className="gap-1 h-6.5 text-[11px]"
                >
                  <Plus className="h-3 w-3" /> Add Lot
                </Button>
              )}
            </div>

            <div className="divide-y divide-border/60 text-caption">
              {holding.lots.map((lot, idx) => (
                <div key={lot.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-text-primary">
                      {lot.total_shared} shares @ ₹{lot.price_per_share.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                      <span>Date: {lot.date}</span>
                      <span>•</span>
                      <span>{lot.exchange_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-numeric font-semibold text-text-primary">
                        ₹{formatInr(lot.total_amount)}
                      </div>
                      <div
                        className={cn(
                          'font-numeric text-[11px] font-medium',
                          lot.gain_loss >= 0 ? 'text-success' : 'text-danger'
                        )}
                      >
                        {lot.gain_loss >= 0 ? '+' : ''}₹{formatInr(lot.gain_loss)} (
                        {lot.gain_loss_pct.toFixed(1)}%)
                      </div>
                    </div>

                    {onDeleteLot && (
                      <button
                        type="button"
                        onClick={() => onDeleteLot(lot.id)}
                        className="p-1 text-text-muted hover:text-danger transition-colors cursor-pointer"
                        title="Delete this purchase lot"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter className="flex-row items-center justify-between">
          <DrawerClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DrawerClose>

          <div className="flex items-center gap-2">
            {onSell && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onSell(holding);
                }}
              >
                <DollarSign className="h-3.5 w-3.5" />
                Sell Shares
              </Button>
            )}

            {onAddLot && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onAddLot(holding);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Purchase Lot
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
