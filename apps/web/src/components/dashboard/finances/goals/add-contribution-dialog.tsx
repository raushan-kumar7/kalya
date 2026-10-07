'use client';

import React, { useState } from 'react';
import { Calendar, Coins, IndianRupee, Plus, Sparkles, TrendingUp } from 'lucide-react';
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/overlays/modal';
import { Button } from '@/components/ui/forms/button';
import { Field } from '@/components/ui/forms/field';
import { Input } from '@/components/ui/forms/input';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { Progress } from '@/components/ui/feedback/progress';
import { formatInr, roundMoney } from '@kalya/utils';
import type { GoalRow } from './types';

export interface AddContributionDialogProps {
  goal: GoalRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: {
    goalId: string;
    amount: number;
    date: string;
    note?: string;
  }) => Promise<void> | void;
}

export function AddContributionDialog({
  goal,
  open,
  onOpenChange,
  onSubmit,
}: AddContributionDialogProps) {
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!goal) return null;

  const numAmount = Number(amount) || 0;
  const currentSaved = goal.current_progress;
  const newTotal = roundMoney(currentSaved + numAmount);
  const target = goal.target_amount;
  const currentPct = target > 0 ? (currentSaved / target) * 100 : 0;
  const newPct = Math.min(100, target > 0 ? (newTotal / target) * 100 : 100);

  const presets = [
    { label: '+₹2,000', value: 2000 },
    { label: '+₹5,000', value: 5000 },
    { label: '+₹10,000', value: 10000 },
    {
      label: 'Fill Remaining',
      value: Math.max(0, roundMoney(goal.target_amount - goal.current_progress)),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        goalId: goal.id,
        amount: numAmount,
        date,
        note: note.trim() || undefined,
      });
      setAmount('');
      setNote('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to deposit contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md" className="overflow-hidden">
        <form onSubmit={handleSubmit}>
          <ModalHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary shadow-xs">
                <Coins className="h-5 w-5" />
              </span>
              <div>
                <ModalTitle className="font-display text-body-lg font-bold text-text-primary">
                  Add Money to Goal
                </ModalTitle>
                <ModalDescription className="text-caption text-text-muted mt-0.5">
                  Deposit savings toward &ldquo;{goal.name}&rdquo;
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-4 py-4">
            {/* Amount Field */}
            <Field label="Deposit Amount" required error={error ?? undefined}>
              <Input
                type="number"
                min="1"
                step="any"
                autoFocus
                placeholder="e.g. 10000"
                value={amount}
                trailingIcon={<IndianRupee className="h-4 w-4 text-text-muted" />}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                className="font-numeric text-body-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </Field>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAmount(String(p.value))}
                  className="rounded-lg border border-border bg-surface-raised px-2.5 py-1 text-caption font-medium text-text-secondary transition-colors hover:border-primary/50 hover:bg-primary-subtle hover:text-primary cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Live Progress Preview */}
            <div className="rounded-xl border border-border bg-surface-raised/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-caption">
                <span className="text-text-muted">Progress Preview:</span>
                <span className="font-numeric font-medium text-text-primary">
                  {Math.round(currentPct)}% →{' '}
                  <strong className="text-success">{Math.round(newPct)}%</strong>
                </span>
              </div>
              <Progress value={newPct} size="md" variant={newPct >= 100 ? 'success' : 'default'} />
              <div className="flex items-center justify-between text-caption font-numeric text-text-muted pt-1">
                <span>Current: {formatInr(currentSaved)}</span>
                <span>After deposit: {formatInr(newTotal)}</span>
              </div>
            </div>

            {/* Date Field */}
            <Field label="Contribution Date" required>
              <DatePicker
                date={date}
                onDateChange={(d) => {
                  if (d) {
                    setDate(d.toISOString().slice(0, 10));
                  }
                }}
                formatStyle="card"
                className="w-full text-body-sm font-numeric"
              />
            </Field>

            {/* Optional Note Field */}
            <Field label="Note (Optional)">
              <Input
                type="text"
                placeholder="e.g. Monthly salary savings transfer"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-body-sm"
              />
            </Field>
          </ModalBody>

          <ModalFooter className="border-t border-border/50 pt-3">
            <ModalClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </ModalClose>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || numAmount <= 0}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Depositing…' : 'Deposit Money'}</span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
