'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateIncomeSchema,
  UpdateIncomeSchema,
  type CreateIncomeInput,
  type UpdateIncomeInput,
} from '@kalya/validations';
import type { Income } from '@kalya/types';
import {
  calculateNetIncome,
  formatCardDate,
  formatMonthLabel,
  formatTimeAgo,
  fromISO,
  getCurrentMonthString,
  roundMoney,
  Temporal,
  toISO,
  toMonthKey,
} from '@kalya/utils';
import { FinanceFormModal } from '../modal';
import { DatePicker, Field, Input } from '@/components/ui';
import { ComputedValue } from '@/components/shared';
import {
  Calendar,
  Clock,
  Coins,
  IndianRupee,
  Info,
  PiggyBank,
  Sparkles,
  Wallet,
} from 'lucide-react';

export interface IncomeFormProps {
  /** Controlled open state of the modal dialog */
  open: boolean;
  /** Callback fired when the modal open state changes */
  onOpenChange: (open: boolean) => void | Promise<void>;
  /** Optional existing Income entity to edit. Omit or pass null when logging new income */
  income?: Income;
  /** Async or sync save handler receiving validated payload */
  onSave: (payload: CreateIncomeInput | UpdateIncomeInput) => Promise<void>;
}

/**
 * Derives normalized initial values for the form using @kalya/utils date helpers.
 */
function getInitialValues(income?: Income | null): CreateIncomeInput {
  const todayPlainDate = Temporal.Now.plainDateISO();
  const defaultIsoDate = toISO(todayPlainDate);
  const defaultMonthKey = getCurrentMonthString();

  return {
    credit_date: income?.credit_date ?? defaultIsoDate,
    month: income?.month ?? defaultMonthKey,
    salary: income?.salary != null ? Number(income.salary) : ('' as unknown as number),
    other: income?.other != null ? Number(income.other) : 0,
    previous_month_left:
      income?.previous_month_left != null ? Number(income.previous_month_left) : 0,
    total_income: income?.total_income != null ? Number(income.total_income) : 0,
  };
}

export function IncomeForm({ open, onOpenChange, income, onSave }: IncomeFormProps) {
  const isEdit = Boolean(income);

  const form = useForm<CreateIncomeInput>({
    resolver: zodResolver((isEdit ? UpdateIncomeSchema : CreateIncomeSchema) as any),
    defaultValues: getInitialValues(income),
  });

  // Re-sync form default values whenever modal opens or active income entity changes
  useEffect(() => {
    if (open) {
      form.reset(getInitialValues(income));
    }
  }, [open, income, form]);

  // Reactive watches for live financial calculations
  const [watchedSalary, watchedOther, watchedPreviousLeft, watchedCreditDate, watchedMonth] =
    useWatch({
      control: form.control,
      name: ['salary', 'other', 'previous_month_left', 'credit_date', 'month'],
    });

  // Live computation: total net available income for the cycle using @kalya/utils
  const computedTotal = useMemo(() => {
    return calculateNetIncome(
      Number(watchedSalary) || 0,
      Number(watchedOther) || 0,
      Number(watchedPreviousLeft) || 0
    );
  }, [watchedSalary, watchedOther, watchedPreviousLeft]);

  // Synchronize derived total_income field with computed value
  useEffect(() => {
    form.setValue('total_income', computedTotal);
  }, [computedTotal, form]);

  const handleSubmit = async (payload: CreateIncomeInput | UpdateIncomeInput) => {
    const salary = roundMoney(Number(payload.salary) || 0);
    const other = roundMoney(Number(payload.other) || 0);
    const prev = roundMoney(Number(payload.previous_month_left) || 0);
    const total = calculateNetIncome(salary, other, prev);

    const finalPayload = {
      ...payload,
      salary,
      other,
      previous_month_left: prev,
      total_income: total,
    };

    await onSave(finalPayload as CreateIncomeInput | UpdateIncomeInput);
    await onOpenChange(false);
  };

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={handleSubmit}
      title={isEdit ? 'Edit Monthly Income' : 'Log Monthly Income'}
      description="Record salary, freelance earnings, and carryover surplus to seed your monthly budgets."
      icon={<Wallet className="h-5 w-5" />}
      tone="success"
      submitLabel={isEdit ? 'Update Income' : 'Register Income'}
      size="lg"
      resetOnClose
    >
      <div className="space-y-4">
        {/* Row 1: Target Budget Cycle & Credit Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Target Budget Cycle */}
          <div>
            <Input
              label="Budget Cycle (Month)"
              type="month"
              leadingIcon={<Calendar size={16} />}
              helperText={
                watchedMonth
                  ? `Allocates funds for ${formatMonthLabel(watchedMonth)}`
                  : 'Target cycle (YYYY-MM)'
              }
              errorMessage={form.formState.errors.month?.message}
              required
              {...form.register('month')}
            />
          </div>

          {/* Credit Date Picker */}
          <div>
            <Field
              label="Credit Date"
              description={
                watchedCreditDate
                  ? `Credited on ${formatCardDate(watchedCreditDate)}`
                  : 'Date funds were deposited'
              }
              error={form.formState.errors.credit_date?.message}
              required
            >
              <DatePicker
                date={watchedCreditDate}
                onDateChange={(date, plainDate) => {
                  const pDate =
                    plainDate ?? (date ? fromISO(date.toISOString().slice(0, 10)) : null);

                  if (pDate) {
                    const isoDate = toISO(pDate);
                    form.setValue('credit_date', isoDate, { shouldValidate: true });

                    // Automatically derive and sync month if empty
                    if (!form.getValues('month')) {
                      form.setValue('month', toMonthKey(pDate), {
                        shouldValidate: true,
                      });
                    }
                  }
                }}
                error={Boolean(form.formState.errors.credit_date)}
                clearable={false}
              />
            </Field>
          </div>
        </div>

        {/* Row 2: Primary Salary */}
        <Input
          label="Primary Salary / Core Income"
          helperText="Net take-home pay from your main job or primary salary stream"
          leadingIcon={<IndianRupee size={16} />}
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g. 75000"
          className="font-numeric"
          errorMessage={form.formState.errors.salary?.message}
          required
          {...form.register('salary', { valueAsNumber: true })}
        />

        {/* Row 3: Secondary Inflows & Carry-over Surplus */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Other Inflows / Secondary"
            helperText="Freelance, side gigs, bonuses, dividends, refunds"
            leadingIcon={<Coins size={16} />}
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            className="font-numeric"
            errorMessage={form.formState.errors.other?.message}
            {...form.register('other', { valueAsNumber: true })}
          />

          <Input
            label="Carried Over from Last Month"
            helperText="Unspent surplus (+) or negative deficit (-) from previous cycle"
            leadingIcon={<PiggyBank size={16} />}
            type="number"
            step="0.01"
            placeholder="0"
            className="font-numeric"
            errorMessage={form.formState.errors.previous_month_left?.message}
            {...form.register('previous_month_left', { valueAsNumber: true })}
          />
        </div>

        {/* Live Total Available Computed Card */}
        <ComputedValue
          label="Total Available Budget This Month"
          value={`₹${computedTotal.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          tone="primary"
        />

        {/* 50/30/20 Rule Preview Allocation Helper */}
        {computedTotal > 0 && (
          <div className="rounded-xl border border-border/60 bg-surface-raised/40 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-caption font-medium text-text-secondary">
              <Sparkles size={14} className="text-primary" />
              <span>50 / 30 / 20 Budget Guidelines Preview</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-numeric">
              <div className="rounded-lg border border-border/40 bg-surface p-2">
                <span className="text-[11px] text-text-muted block">Needs (50%)</span>
                <span className="text-body-sm font-semibold text-text-primary">
                  ₹{roundMoney(computedTotal * 0.5).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="rounded-lg border border-border/40 bg-surface p-2">
                <span className="text-[11px] text-text-muted block">Wants (30%)</span>
                <span className="text-body-sm font-semibold text-text-primary">
                  ₹{roundMoney(computedTotal * 0.3).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="rounded-lg border border-border/40 bg-surface p-2">
                <span className="text-[11px] text-text-muted block">Savings (20%)</span>
                <span className="text-body-sm font-semibold text-success">
                  ₹{roundMoney(computedTotal * 0.2).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-text-muted flex items-center gap-1 pt-0.5">
              <Info size={12} className="shrink-0" />
              <span>
                Saving this income will activate and update your monthly budget limits
                automatically.
              </span>
            </p>
          </div>
        )}

        {/* Audit Timestamp if editing existing income */}
        {isEdit && income?.updated_at && (
          <div className="flex items-center gap-1.5 pt-1 text-caption text-text-muted">
            <Clock size={12} className="shrink-0 text-text-muted/70" />
            <span>Last updated {formatTimeAgo(income.updated_at)}</span>
          </div>
        )}
      </div>
    </FinanceFormModal>
  );
}
