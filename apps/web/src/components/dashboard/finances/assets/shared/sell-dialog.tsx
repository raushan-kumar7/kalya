'use client';

import React, { useState } from 'react';
import { formatInr, roundMoney } from '@kalya/utils';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  IndianRupee,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Button,
  Field,
  Input,
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui';
import { cn } from '@/libs/utils';

export interface SellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemDescription: string;
  maxUnits: number;
  unitLabel: string;
  buyRate: number;
  defaultMarketRate: number;
  onConfirmSell: (soldUnits: number, exitPrice: number) => Promise<void> | void;
}

export function SellDialog({
  open,
  onOpenChange,
  title,
  itemDescription,
  maxUnits,
  unitLabel,
  buyRate,
  defaultMarketRate,
  onConfirmSell,
}: SellDialogProps) {
  const [soldUnits, setSoldUnits] = useState<number>(maxUnits);
  const [exitPrice, setExitPrice] = useState<number>(defaultMarketRate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Math
  const costBasis = roundMoney(soldUnits * buyRate);
  const grossProceeds = roundMoney(soldUnits * exitPrice);
  const realizedGain = roundMoney(grossProceeds - costBasis);
  const realizedGainPct = costBasis > 0 ? roundMoney((realizedGain / costBasis) * 100) : 0;
  const isProfit = realizedGain >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (soldUnits <= 0 || exitPrice <= 0) return;
    setIsSubmitting(true);
    try {
      await onConfirmSell(soldUnits, exitPrice);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ModalHeader icon={<Wallet className="h-5 w-5 text-warning" />} tone="warning">
            <ModalTitle>{title}</ModalTitle>
            <ModalDescription>{itemDescription}</ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {/* Units to sell */}
            <Field
              label={
                <div className="flex items-center justify-between w-full">
                  <span>Units to Sell ({unitLabel})</span>
                  <button
                    type="button"
                    onClick={() => setSoldUnits(maxUnits)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Sell Max ({maxUnits} {unitLabel})
                  </button>
                </div>
              }
              required
            >
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  min="0.0001"
                  max={maxUnits}
                  value={soldUnits}
                  onChange={(e) =>
                    setSoldUnits(Math.min(maxUnits, parseFloat(e.target.value) || 0))
                  }
                  className="font-numeric pr-14"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-caption text-text-muted font-medium">
                  {unitLabel}
                </span>
              </div>
            </Field>

            {/* Exit Price */}
            <Field label="Selling / Exit Rate (₹ per unit)" required>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                  ₹
                </span>
                <Input
                  type="number"
                  step="any"
                  min="0.01"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(parseFloat(e.target.value) || 0)}
                  className="pl-7 font-numeric"
                />
              </div>
            </Field>

            {/* Realization & PnL Breakdown */}
            <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-caption text-text-secondary">
                <span>Original Cost Basis</span>
                <span className="font-numeric font-medium text-text-primary">
                  ₹{formatInr(costBasis)}
                </span>
              </div>

              <div className="flex items-center justify-between text-caption text-text-secondary">
                <span>Gross Sale Proceeds</span>
                <span className="font-numeric font-medium text-text-primary">
                  ₹{formatInr(grossProceeds)}
                </span>
              </div>

              <div className="border-t border-border/60 pt-2 flex items-center justify-between text-body-sm font-semibold">
                <span>Realized Capital P&L</span>
                <span className={cn('font-numeric', isProfit ? 'text-success' : 'text-danger')}>
                  {isProfit ? '+' : ''}₹{formatInr(realizedGain)} ({realizedGainPct}%)
                </span>
              </div>
            </div>

            <p className="text-caption text-text-muted">
              Note: This records your sale in Kalya and frees up capital in your asset allocation
              ledger.
            </p>
          </ModalBody>

          <ModalFooter className="items-center justify-end gap-2">
            <ModalClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </ModalClose>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting || soldUnits <= 0}
            >
              Confirm Sale
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
