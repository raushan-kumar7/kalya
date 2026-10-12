'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Bucket, Goal } from '@kalya/types';
import {
  CreateGoalInput,
  CreateGoalSchema,
  UpdateGoalInput,
  UpdateGoalSchema,
} from '@kalya/validations';
import { formatInr, roundMoney } from '@kalya/utils';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  Coins,
  IndianRupee,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Button,
  Field,
  Input,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { FinanceFormModal } from './modal';
import { useBucketsQuery } from '@/hooks/finances';
import { cn } from '@/libs/utils';

export interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  onSave: (payload: CreateGoalInput | UpdateGoalInput) => Promise<void>;
  buckets?: Bucket[];
  initialValues?: Partial<CreateGoalInput>;
}

export function GoalForm({
  open,
  onOpenChange,
  goal,
  onSave,
  buckets: propBuckets,
  initialValues,
}: GoalFormProps) {
  const isEdit = Boolean(goal);

  const { data: fetchedBuckets = [] } = useBucketsQuery({
    enabled: !propBuckets,
  });

  const availableBuckets = propBuckets ?? fetchedBuckets;

  // Default target date: 6 months in the future
  const defaultTargetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  }, []);

  const form = useForm<CreateGoalInput>({
    resolver: zodResolver(isEdit ? (UpdateGoalSchema as any) : (CreateGoalSchema as any)),
    defaultValues: {
      bucket_id:
        goal?.bucket_id ??
        (goal as any)?.bucketId ??
        initialValues?.bucket_id ??
        availableBuckets[0]?.id ??
        '',
      name: goal?.name ?? initialValues?.name ?? '',
      target_amount: Number(
        goal?.target_amount ?? (goal as any)?.targetAmount ?? initialValues?.target_amount ?? 100000
      ),
      target_date: String(
        goal?.target_date ??
          (goal as any)?.targetDate ??
          initialValues?.target_date ??
          defaultTargetDate
      ),
      current_progress: Number(
        goal?.current_progress ??
          (goal as any)?.currentProgress ??
          initialValues?.current_progress ??
          0
      ),
      monthly_contribution_plan: Number(
        goal?.monthly_contribution_plan ??
          (goal as any)?.monthlyContributionPlan ??
          initialValues?.monthly_contribution_plan ??
          15000
      ),
      status: (goal?.status as any) ?? initialValues?.status ?? 'in_progress',
    },
  });

  // Re-sync form state when opened or goal changes
  useEffect(() => {
    if (open) {
      form.reset({
        bucket_id:
          goal?.bucket_id ??
          (goal as any)?.bucketId ??
          initialValues?.bucket_id ??
          availableBuckets[0]?.id ??
          '',
        name: goal?.name ?? initialValues?.name ?? '',
        target_amount: Number(
          goal?.target_amount ??
            (goal as any)?.targetAmount ??
            initialValues?.target_amount ??
            100000
        ),
        target_date: String(
          goal?.target_date ??
            (goal as any)?.targetDate ??
            initialValues?.target_date ??
            defaultTargetDate
        ),
        current_progress: Number(
          goal?.current_progress ??
            (goal as any)?.currentProgress ??
            initialValues?.current_progress ??
            0
        ),
        monthly_contribution_plan: Number(
          goal?.monthly_contribution_plan ??
            (goal as any)?.monthlyContributionPlan ??
            initialValues?.monthly_contribution_plan ??
            15000
        ),
        status: (goal?.status as any) ?? initialValues?.status ?? 'in_progress',
      });
    }
  }, [open, goal, initialValues, availableBuckets, defaultTargetDate, form]);

  const watchedTargetAmount = useWatch({ control: form.control, name: 'target_amount' });
  const watchedCurrentProgress = useWatch({ control: form.control, name: 'current_progress' });
  const watchedTargetDate = useWatch({ control: form.control, name: 'target_date' });
  const watchedMonthlyPlan = useWatch({ control: form.control, name: 'monthly_contribution_plan' });
  const watchedBucketId = useWatch({ control: form.control, name: 'bucket_id' });

  // Compute recommended monthly allocation dynamically
  const recommendedMonthly = useMemo(() => {
    const target = Number(watchedTargetAmount) || 0;
    const progress = Number(watchedCurrentProgress) || 0;
    const remaining = Math.max(0, target - progress);

    if (remaining <= 0) return 0;

    const now = new Date();
    const tDate = new Date(watchedTargetDate || defaultTargetDate);
    const diffMonths = Math.max(
      1,
      (tDate.getFullYear() - now.getFullYear()) * 12 + (tDate.getMonth() - now.getMonth())
    );

    return roundMoney(remaining / diffMonths);
  }, [watchedTargetAmount, watchedCurrentProgress, watchedTargetDate, defaultTargetDate]);

  const remainingToSave = Math.max(
    0,
    (Number(watchedTargetAmount) || 0) - (Number(watchedCurrentProgress) || 0)
  );

  const handleApplyRecommended = () => {
    form.setValue('monthly_contribution_plan', recommendedMonthly, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSetMonthsAhead = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    form.setValue('target_date', d.toISOString().slice(0, 10), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSetTargetPreset = (val: number) => {
    form.setValue('target_amount', val, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const selectedBucket = availableBuckets.find((b) => b.id === watchedBucketId);

  const onSubmit = async (values: CreateGoalInput) => {
    const payload = {
      ...values,
      target_amount: Number(values.target_amount),
      current_progress: Number(values.current_progress ?? 0),
      monthly_contribution_plan: Number(values.monthly_contribution_plan ?? 0),
    };
    await onSave(payload);
    onOpenChange(false);
  };

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={onSubmit}
      title={isEdit ? 'Edit Savings Goal' : 'Create New Goal'}
      description={
        isEdit
          ? 'Modify your goal target amount, deadline, or monthly contribution plan.'
          : 'Define your savings objective, assign a target bucket, and plan your monthly contribution pace.'
      }
      icon={Target}
      tone="accent"
      submitLabel={isEdit ? 'Save Changes' : 'Create Goal'}
      size="xl"
    >
      <div className="space-y-6 py-1">
        {/* Two-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* ── Left Column: Goal Details ── */}
          <div className="space-y-4">
            <div className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5 pb-1 border-b border-border/50">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span>Goal Profile</span>
            </div>

            {/* Goal Name Field */}
            <Field
              label="Goal Name"
              required
              error={form.formState.errors.name?.message}
              description="e.g. Emergency Fund (6 Months), Japan Trip, New Laptop"
            >
              <Input
                placeholder="What are you saving for?"
                {...form.register('name')}
                className="text-body-sm"
              />
            </Field>

            {/* Bucket Selection Field */}
            <Field
              label="Associated Bucket"
              required
              error={form.formState.errors.bucket_id?.message}
              description="The financial bucket this savings goal is drawn from"
            >
              <Select
                value={watchedBucketId}
                onValueChange={(val) => form.setValue('bucket_id', val, { shouldValidate: true })}
              >
                <SelectTrigger className="text-body-sm">
                  <SelectValue placeholder="Select a bucket" />
                </SelectTrigger>
                <SelectContent>
                  {availableBuckets.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: b.color || 'var(--primary)' }}
                        />
                        <span>{b.label}</span>
                        <span className="text-caption text-text-muted capitalize">
                          ({b.origin})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Target Date Field with Quick Presets */}
            <Field
              label="Target Completion Date"
              required
              error={form.formState.errors.target_date?.message}
              description="Deadline to have this goal fully funded"
            >
              <DatePicker
                date={watchedTargetDate ?? ''}
                onDateChange={(d) => {
                  if (d) {
                    form.setValue('target_date', d.toISOString().slice(0, 10), {
                      shouldValidate: true,
                    });
                  }
                }}
                formatStyle="card"
                className="w-full text-body-sm font-numeric"
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-text-muted mr-1">Quick:</span>
                {[
                  { label: '3 Months', m: 3 },
                  { label: '6 Months', m: 6 },
                  { label: '1 Year', m: 12 },
                  { label: '2 Years', m: 24 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSetMonthsAhead(p.m)}
                    className="rounded-md border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-primary/50 hover:bg-primary-subtle hover:text-primary cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* ── Right Column: Financial Targets & Pace ── */}
          <div className="space-y-4">
            <div className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5 pb-1 border-b border-border/50">
              <Coins className="h-3.5 w-3.5 text-accent" />
              <span>Financial Targets & Pace</span>
            </div>

            {/* Target Amount Field with Presets */}
            <Field
              label="Target Amount"
              required
              error={form.formState.errors.target_amount?.message}
              description="The total financial target you want to achieve"
            >
              <Input
                type="number"
                min="1"
                step="any"
                placeholder="100000"
                value={watchedTargetAmount ?? ''}
                trailingIcon={<IndianRupee className="h-4 w-4 text-text-muted" />}
                onChange={(e) =>
                  form.setValue('target_amount', Number(e.target.value) || 0, {
                    shouldValidate: true,
                  })
                }
                className="font-numeric text-body-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-text-muted mr-1">Quick:</span>
                {[
                  { label: '₹50,000', val: 50000 },
                  { label: '₹1 Lakh', val: 100000 },
                  { label: '₹2.5 Lakh', val: 250000 },
                  { label: '₹5 Lakh', val: 500000 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSetTargetPreset(p.val)}
                    className="rounded-md border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-primary/50 hover:bg-primary-subtle hover:text-primary cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Initial Progress / Starting Saved Balance */}
            <Field
              label="Initial Progress (Starting Balance)"
              error={form.formState.errors.current_progress?.message}
              description="Amount already accumulated toward this goal"
            >
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={watchedCurrentProgress ?? ''}
                trailingIcon={<IndianRupee className="h-4 w-4 text-text-muted" />}
                onChange={(e) =>
                  form.setValue('current_progress', Number(e.target.value) || 0, {
                    shouldValidate: true,
                  })
                }
                className="font-numeric text-body-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </Field>

            {/* Monthly Contribution Plan Field with Auto-Recommend Button */}
            <Field
              label="Monthly Contribution Plan"
              error={form.formState.errors.monthly_contribution_plan?.message}
              description={
                <span className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mt-1">
                  <span>Planned monthly deposit toward this goal</span>
                  {recommendedMonthly > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyRecommended}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer text-left"
                    >
                      <Calculator className="h-3 w-3 shrink-0" />
                      <span>Set recommended ({formatInr(recommendedMonthly)}/mo)</span>
                    </button>
                  )}
                </span>
              }
            >
              <Input
                type="number"
                min="0"
                step="any"
                placeholder={String(recommendedMonthly || 10000)}
                value={watchedMonthlyPlan ?? ''}
                trailingIcon={<IndianRupee className="h-4 w-4 text-text-muted" />}
                onChange={(e) =>
                  form.setValue('monthly_contribution_plan', Number(e.target.value) || 0, {
                    shouldValidate: true,
                  })
                }
                className="font-numeric text-body-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </Field>
          </div>
        </div>

        {/* ── Bottom Summary & Projection Card ── */}
        <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2 text-caption border-b border-border/50 pb-2">
            <span className="text-text-muted font-medium flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary shrink-0" />
              <span>Pace Assessment & Timeline Preview</span>
            </span>
            {selectedBucket && (
              <span className="flex items-center gap-1.5 text-text-secondary text-xs sm:text-caption">
                <span>Drawing from</span>
                <strong className="text-text-primary">{selectedBucket.label}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-caption pt-1">
            <div className="rounded-lg bg-surface p-2.5 border border-border/50">
              <span className="text-text-muted block text-[11px]">Remaining to Save</span>
              <span className="font-numeric text-body-sm font-bold text-text-primary">
                {formatInr(remainingToSave)}
              </span>
            </div>

            <div className="rounded-lg bg-surface p-2.5 border border-border/50">
              <span className="text-text-muted block text-[11px]">Recommended Pace</span>
              <span className="font-numeric text-body-sm font-bold text-primary">
                {formatInr(recommendedMonthly)}/mo
              </span>
            </div>

            <div className="rounded-lg bg-surface p-2.5 border border-border/50">
              <span className="text-text-muted block text-[11px]">Strategy Status</span>
              <span
                className={cn(
                  'text-body-sm font-bold block truncate',
                  Number(watchedMonthlyPlan) >= recommendedMonthly ? 'text-success' : 'text-warning'
                )}
              >
                {Number(watchedMonthlyPlan) >= recommendedMonthly
                  ? '✓ On Track to Finish'
                  : `⚠️ ₹${(recommendedMonthly - Number(watchedMonthlyPlan)).toLocaleString('en-IN')}/mo Shortfall`}
              </span>
            </div>
          </div>

          {Number(watchedTargetAmount) > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>
                  Initial Funding:{' '}
                  <strong className="text-text-primary font-numeric">
                    {Math.min(
                      100,
                      Math.round(
                        ((Number(watchedCurrentProgress) || 0) / Number(watchedTargetAmount)) * 100
                      )
                    )}
                    %
                  </strong>
                </span>
                <span className="font-numeric">
                  {formatInr(watchedCurrentProgress || 0)} / {formatInr(watchedTargetAmount)}
                </span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  ((Number(watchedCurrentProgress) || 0) / Number(watchedTargetAmount)) * 100
                )}
                size="sm"
                variant="default"
              />
            </div>
          )}
        </div>
      </div>
    </FinanceFormModal>
  );
}
