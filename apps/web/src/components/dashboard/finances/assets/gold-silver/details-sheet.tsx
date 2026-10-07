'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  IndianRupee,
  Pencil,
  Scale,
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
import { DigitalAssetItem } from '@/hooks/finances/use-gold-silver';

export interface GoldSilverDetailsSheetProps {
  purchase: DigitalAssetItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (purchase: DigitalAssetItem) => void;
  onSell?: (purchase: DigitalAssetItem) => void;
  onDelete?: (purchase: DigitalAssetItem) => void;
}

export function GoldSilverDetailsSheet({
  purchase,
  open,
  onOpenChange,
  onEdit,
  onSell,
  onDelete,
}: GoldSilverDetailsSheetProps) {
  if (!purchase) return null;

  const isGold = purchase.type === 'gold';
  const weight = Number(purchase.weight_in_gram) || 0;
  const buyRate = Number(purchase.rate_per_gram) || 0;
  const amountPaid = Number(purchase.amount_paid) || 0;
  const gst = Number(purchase.gst_3_percent) || 0;
  const currentRate = purchase.current_rate_per_gram;
  const currentVal = purchase.current_value;
  const gain = purchase.gain_loss;
  const gainPct = purchase.gain_loss_pct;

  // Rate delta vs today
  const rateDelta = currentRate - buyRate;
  const rateDeltaPct = buyRate > 0 ? (rateDelta / buyRate) * 100 : 0;

  // Breakeven price per gram needed to recover purchase price including GST
  const breakevenRate = weight > 0 ? roundMoney(amountPaid / weight) : 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="md">
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg shadow-inner',
                isGold ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-400/20 text-slate-300'
              )}
            >
              {isGold ? <Coins className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </span>
            <div>
              <DrawerTitle>
                {isGold ? 'Gold 24K (99.9% Pure)' : 'Fine Silver (999 Purity)'}
              </DrawerTitle>
              <DrawerDescription>
                Purchased on{' '}
                {new Date(purchase.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                via {purchase.platform}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-5">
          {/* Main Valuation Hero Card */}
          <div className="rounded-2xl border border-border bg-linear-to-br from-surface to-surface-raised p-4 shadow-card">
            <div className="flex items-center justify-between text-caption text-text-muted">
              <span>Current Market Valuation</span>
              <span className="font-semibold text-text-primary">@ ₹{currentRate}/g today</span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-numeric text-3xl font-extrabold text-text-primary">
                ₹{formatInr(currentVal)}
              </span>
              <span
                className={cn(
                  'flex items-center gap-1 font-numeric text-body-sm font-bold',
                  gain >= 0 ? 'text-success' : 'text-danger'
                )}
              >
                {gain >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {gain >= 0 ? '+' : ''}
                {formatInr(gain)} ({gainPct.toFixed(1)}%)
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-caption">
              <div>
                <span className="text-text-muted">Net Weight Held</span>
                <div className="font-numeric text-body-sm font-semibold text-text-primary">
                  {weight} grams
                </div>
              </div>
              <div>
                <span className="text-text-muted">Total Capital Paid</span>
                <div className="font-numeric text-body-sm font-semibold text-text-primary">
                  ₹{formatInr(amountPaid)}
                </div>
              </div>
            </div>
          </div>

          {/* Price Delta: Buy Price vs Today's Rate */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <h4 className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
              Bullion Rate Comparison
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-text-secondary">Your Buy Rate</span>
                <span className="font-numeric font-semibold text-text-primary">
                  ₹{buyRate.toLocaleString('en-IN')} / gram
                </span>
              </div>

              <div className="flex items-center justify-between text-body-sm">
                <span className="text-text-secondary">Today&apos;s Market Rate</span>
                <span className="font-numeric font-semibold text-primary">
                  ₹{currentRate.toLocaleString('en-IN')} / gram
                </span>
              </div>

              <div className="flex items-center justify-between text-body-sm">
                <span className="text-text-secondary">Rate Movement</span>
                <span
                  className={cn(
                    'font-numeric font-bold',
                    rateDelta >= 0 ? 'text-success' : 'text-danger'
                  )}
                >
                  {rateDelta >= 0 ? '+' : ''}₹{rateDelta.toFixed(1)} / gram (
                  {rateDeltaPct.toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-body-sm border-t border-border/60 pt-2">
                <span className="text-text-secondary">Breakeven Rate (Inc. GST)</span>
                <span className="font-numeric font-medium text-text-muted">
                  ₹{breakevenRate.toLocaleString('en-IN')} / gram
                </span>
              </div>
            </div>
          </div>

          {/* Invoice & GST Breakdown */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <h4 className="text-caption font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Tax & Invoice Breakdown
            </h4>

            <div className="space-y-2 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Base Bullion Cost</span>
                <span className="font-numeric text-text-primary">
                  ₹{formatInr(roundMoney(weight * buyRate))}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Precious Metal GST (3%)</span>
                <span className="font-numeric text-text-primary">+ ₹{formatInr(gst)}</span>
              </div>

              <div className="border-t border-border/60 pt-2 flex items-center justify-between font-semibold">
                <span className="text-text-primary">Total Invoice Amount</span>
                <span className="font-numeric text-primary text-body-md">
                  ₹{formatInr(amountPaid)}
                </span>
              </div>
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter className="flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-danger hover:bg-danger-subtle"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(purchase);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onSell && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onSell(purchase);
                }}
              >
                <DollarSign className="h-3.5 w-3.5" />
                Sell Simulation
              </Button>
            )}

            {onEdit && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(purchase);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
