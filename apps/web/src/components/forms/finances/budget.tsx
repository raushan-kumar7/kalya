'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Bucket, Budget, Income } from '@kalya/types';
import {
  CreateBudgetInput,
  CreateBudgetSchema,
  UpdateBudgetInput,
  UpdateBudgetSchema,
} from '@kalya/validations';
import { formatInr, formatMonthLabel, roundMoney } from '@kalya/utils';
import {
  AlertTriangle,
  Calculator,
  Calendar,
  IndianRupee,
  Layers,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import {
  Button,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import { FinanceFormModal } from './modal';
import { useBucketsQuery, useIncomeQuery } from '@/hooks/finances';
import { cn } from '@/libs/utils';

export interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
  onSave: (payload: CreateBudgetInput | UpdateBudgetInput) => Promise<void>;
  buckets?: Bucket[];
  incomes?: Income[];
  selectedMonth?: string;
}

export function BudgetForm({
  open,
  onOpenChange,
  budget,
  onSave,
  buckets: propBuckets,
  incomes: propIncomes,
  selectedMonth,
}: BudgetFormProps) {
  const isEdit = Boolean(budget);

  const { data: fetchedBuckets = [] } = useBucketsQuery({
    enabled: !propBuckets,
  });
  const { data: fetchedIncomes = [] } = useIncomeQuery(undefined, {
    enabled: !propIncomes,
  });

  const buckets = propBuckets ?? fetchedBuckets;
  const incomes = propIncomes ?? fetchedIncomes;

  // Find matching default income for the selected month if creating new
  const defaultIncome = useMemo(() => {
    if (budget?.income_id) {
      return incomes.find((i) => i.id === budget.income_id);
    }
    if (selectedMonth) {
      return incomes.find((i) => i.month === selectedMonth) ?? incomes[0];
    }
    return incomes[0];
  }, [budget, incomes, selectedMonth]);

  const form = useForm<CreateBudgetInput>({
    resolver: zodResolver(isEdit ? UpdateBudgetSchema : (CreateBudgetSchema as any)),
    defaultValues: {
      bucket_id: budget?.bucket_id ?? buckets[0]?.id ?? '',
      income_id: budget?.income_id ?? defaultIncome?.id ?? '',
      period: (budget?.period as any) ?? 'monthly',
      amount: budget?.amount ? Number(budget.amount) : 0,
      alert_threshold_amber: budget?.alert_threshold_amber
        ? Number(budget.alert_threshold_amber)
        : 80,
      alert_threshold_red: budget?.alert_threshold_red ? Number(budget.alert_threshold_red) : 100,
      rollover: Boolean(budget?.rollover),
      status: (budget?.status as any) ?? 'under',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Sync form defaults on open or budget change
  useEffect(() => {
    if (open) {
      reset({
        bucket_id: budget?.bucket_id ?? buckets[0]?.id ?? '',
        income_id: budget?.income_id ?? defaultIncome?.id ?? '',
        period: (budget?.period as any) ?? 'monthly',
        amount: budget?.amount ? Number(budget.amount) : 0,
        alert_threshold_amber: budget?.alert_threshold_amber
          ? Number(budget.alert_threshold_amber)
          : 80,
        alert_threshold_red: budget?.alert_threshold_red ? Number(budget.alert_threshold_red) : 100,
        rollover: Boolean(budget?.rollover),
        status: (budget?.status as any) ?? 'under',
      });
    }
  }, [open, budget, buckets, defaultIncome, reset]);

  // Watch fields for dynamic calculations and live preview
  const watchedBucketId = useWatch({ control, name: 'bucket_id' });
  const watchedIncomeId = useWatch({ control, name: 'income_id' });
  const watchedAmount = useWatch({ control, name: 'amount' });
  const watchedAmber = useWatch({ control, name: 'alert_threshold_amber' }) ?? 80;
  const watchedRed = useWatch({ control, name: 'alert_threshold_red' }) ?? 100;
  const watchedRollover = useWatch({ control, name: 'rollover' });
  const watchedPeriod = useWatch({ control, name: 'period' }) ?? 'monthly';

  const selectedBucket = useMemo(
    () => buckets.find((b) => b.id === watchedBucketId),
    [buckets, watchedBucketId]
  );

  const selectedIncome = useMemo(
    () => incomes.find((i) => i.id === watchedIncomeId),
    [incomes, watchedIncomeId]
  );

  // Auto-calculated target amount: income × bucket target %
  const targetRecommendedAmount = useMemo(() => {
    if (!selectedBucket || !selectedIncome) return null;
    const total = Number(selectedIncome.total_income) || 0;
    const pct = Number(selectedBucket.target_percent) || 0;
    if (total <= 0 || pct <= 0) return null;
    return roundMoney((total * pct) / 100);
  }, [selectedBucket, selectedIncome]);

  // Auto-fill recommended target amount on bucket change for new budgets if empty
  useEffect(() => {
    if (!isEdit && targetRecommendedAmount && (!watchedAmount || watchedAmount === 0)) {
      setValue('amount', targetRecommendedAmount, { shouldValidate: true });
    }
  }, [isEdit, targetRecommendedAmount, watchedBucketId, setValue]);

  const handleApplyRecommended = () => {
    if (targetRecommendedAmount) {
      setValue('amount', targetRecommendedAmount, { shouldValidate: true });
    }
  };

  const onSubmit = async (payload: CreateBudgetInput | UpdateBudgetInput) => {
    await onSave(payload);
    onOpenChange(false);
  };

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={onSubmit as any}
      title={isEdit ? 'Edit Budget' : 'Configure New Budget'}
      description={
        isEdit
          ? 'Adjust target limit, warning triggers, or rollover behavior.'
          : 'Define a spending ceiling for a financial bucket with automated pacing alerts.'
      }
      icon={Wallet}
      tone="default"
      submitLabel={isEdit ? 'Save Changes' : 'Create Budget'}
      isSubmitting={isSubmitting}
      size="lg"
    >
      <div className="space-y-5">
        {/* Row 1: Bucket & Income Cycle */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Bucket selection */}
          <Field
            label="Financial Bucket"
            required
            error={errors.bucket_id?.message}
            description="The category grouping this budget governs"
          >
            <Select
              value={watchedBucketId}
              onValueChange={(val) => {
                setValue('bucket_id', val, { shouldValidate: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bucket" />
              </SelectTrigger>
              <SelectContent>
                {buckets.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: b.color ?? 'var(--primary)' }}
                      />
                      <span>{b.label}</span>
                      {b.target_percent && (
                        <span className="text-caption text-text-muted">
                          ({b.target_percent}% target)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Income month selection */}
          <Field
            label="Income Cycle (Month)"
            required
            error={errors.income_id?.message}
            description="Linked income that funds this budget"
          >
            <Select
              value={watchedIncomeId}
              onValueChange={(val) => setValue('income_id', val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {incomes.map((inc) => (
                  <SelectItem key={inc.id} value={inc.id}>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span>{formatMonthLabel(inc.month)}</span>
                      <span className="text-caption font-semibold text-text-muted">
                        +{formatInr(Number(inc.total_income))}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Row 2: Period & Amount */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Period selector */}
          <Field
            label="Budget Cadence"
            required
            error={errors.period?.message}
            description="Evaluation timeframe"
          >
            <Select
              value={watchedPeriod}
              onValueChange={(val: any) => setValue('period', val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cadence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly (Standard)</SelectItem>
                <SelectItem value="quarterly">Quarterly (3 Months)</SelectItem>
                <SelectItem value="annual">Annual (Calendar Year)</SelectItem>
                <SelectItem value="financial_year">Financial Year</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Amount input */}
          <Field
            label="Budget Limit (₹)"
            labelAction={
              targetRecommendedAmount ? (
                <button
                  type="button"
                  onClick={handleApplyRecommended}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Apply 50/30/20 ({formatInr(targetRecommendedAmount)})</span>
                </button>
              ) : undefined
            }
            required
            error={errors.amount?.message}
            description="Total spending ceiling allowed for this period"
          >
            <div>
              <Input
                type="number"
                step="any"
                min="1"
                placeholder="0"
                trailingIcon={<IndianRupee className="h-4 w-4 text-text-muted" />}
                className="font-numeric text-body-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...register('amount', { valueAsNumber: true })}
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-text-muted mr-1">Presets:</span>
                {[
                  { label: '₹10,000', val: 10000 },
                  { label: '₹25,000', val: 25000 },
                  { label: '₹50,000', val: 50000 },
                  { label: '₹1 Lakh', val: 100000 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setValue('amount', p.val, { shouldValidate: true })}
                    className="rounded-md border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-primary/50 hover:bg-primary-subtle hover:text-primary cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </Field>
        </div>

        {/* Threshold triggers */}
        <div className="rounded-xl border border-border/60 bg-surface-raised/30 p-3.5 sm:p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-body-sm font-semibold text-text-primary block">
                Alert Triggers &amp; Thresholds
              </span>
              <span className="text-caption text-text-muted">
                Control when warning and over-budget notices activate
              </span>
            </div>
            <div className="flex items-center gap-2 text-caption">
              <span className="rounded-md bg-warning-subtle px-2 py-0.5 font-medium text-warning border border-warning/20">
                Amber: {watchedAmber}%
              </span>
              <span className="rounded-md bg-danger-subtle px-2 py-0.5 font-medium text-danger border border-danger/20">
                Red: {watchedRed}%
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-text-muted">Presets:</span>
            <button
              type="button"
              onClick={() => {
                setValue('alert_threshold_amber', 80, { shouldValidate: true });
                setValue('alert_threshold_red', 100, { shouldValidate: true });
              }}
              className={cn(
                'rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer',
                watchedAmber === 80 && watchedRed === 100
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-surface text-text-secondary hover:bg-surface-raised'
              )}
            >
              Standard (80% / 100%)
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('alert_threshold_amber', 70, { shouldValidate: true });
                setValue('alert_threshold_red', 90, { shouldValidate: true });
              }}
              className={cn(
                'rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer',
                watchedAmber === 70 && watchedRed === 90
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-surface text-text-secondary hover:bg-surface-raised'
              )}
            >
              Strict (70% / 90%)
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('alert_threshold_amber', 90, { shouldValidate: true });
                setValue('alert_threshold_red', 100, { shouldValidate: true });
              }}
              className={cn(
                'rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer',
                watchedAmber === 90 && watchedRed === 100
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-surface text-text-secondary hover:bg-surface-raised'
              )}
            >
              Relaxed (90% / 100%)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Warning Threshold (%)"
              error={errors.alert_threshold_amber?.message}
              description="Triggers amber caution badge"
            >
              <Input
                type="number"
                min="1"
                max="200"
                placeholder="80"
                {...register('alert_threshold_amber', { valueAsNumber: true })}
              />
            </Field>

            <Field
              label="Over-Budget Threshold (%)"
              error={errors.alert_threshold_red?.message}
              description="Triggers critical red notice"
            >
              <Input
                type="number"
                min="1"
                max="200"
                placeholder="100"
                {...register('alert_threshold_red', { valueAsNumber: true })}
              />
            </Field>
          </div>

          {/* Rollover switch */}
          <div className="flex items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/40">
            <div>
              <label
                htmlFor="rollover-switch"
                className="text-body-sm font-medium text-text-primary block cursor-pointer"
              >
                Rollover Unspent Surplus
              </label>
              <span className="text-caption text-text-muted">
                Carry over positive remaining balances into subsequent month
              </span>
            </div>
            <Switch
              id="rollover-switch"
              checked={Boolean(watchedRollover)}
              onCheckedChange={(checked) => setValue('rollover', checked)}
            />
          </div>
        </div>

        {/* Live Preview Card */}
        {selectedBucket && (
          <div className="space-y-2">
            <span className="text-caption font-semibold text-text-muted uppercase tracking-wider">
              Live Preview &amp; Triggers
            </span>
            <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedBucket.color ?? 'var(--primary)' }}
                  />
                  <span className="font-display text-body-md font-bold text-text-primary">
                    {selectedBucket.label}
                  </span>
                  <span className="text-caption text-text-muted capitalize">
                    · {watchedPeriod.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-success-subtle px-2 py-0.5 text-caption font-semibold text-success border border-success/30">
                    Under
                  </span>
                  {watchedRollover && (
                    <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-muted border border-border/50">
                      Rollover
                    </span>
                  )}
                </div>
              </div>

              {/* Threshold rupee breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-2 border-t border-border/40 text-[11px]">
                <div className="rounded-lg bg-surface-raised/60 p-2.5">
                  <span className="text-text-muted block">Budget Limit</span>
                  <span className="font-numeric font-bold text-text-primary block mt-0.5 text-body-sm">
                    {formatInr(Number(watchedAmount) || 0)}
                  </span>
                </div>
                <div className="rounded-lg bg-warning-subtle/30 p-2.5 border border-warning/20">
                  <span className="text-warning font-medium block">Amber Warning</span>
                  <span className="font-numeric font-bold text-warning block mt-0.5 text-body-sm">
                    {formatInr(roundMoney(((Number(watchedAmount) || 0) * watchedAmber) / 100))}
                  </span>
                  <span className="text-[10px] text-text-muted mt-0.5 block">
                    {watchedAmber}% ceiling
                  </span>
                </div>
                <div className="rounded-lg bg-danger-subtle/30 p-2.5 border border-danger/20">
                  <span className="text-danger font-medium block">Over-Budget</span>
                  <span className="font-numeric font-bold text-danger block mt-0.5 text-body-sm">
                    {formatInr(roundMoney(((Number(watchedAmount) || 0) * watchedRed) / 100))}
                  </span>
                  <span className="text-[10px] text-text-muted mt-0.5 block">
                    {watchedRed}% ceiling
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FinanceFormModal>
  );
}
