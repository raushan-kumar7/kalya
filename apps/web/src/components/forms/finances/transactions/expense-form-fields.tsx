'use client';

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { PaymentMethod } from '@kalya/types';
import type { CreateExpenseInput } from '@kalya/validations';
import { formatCardDate, fromISO, toISO } from '@kalya/utils';
import {
  DatePicker,
  Field,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { IndianRupee } from 'lucide-react';
import { cn } from '@/libs/utils';
import { type CategoryGroup, PAYMENT_OPTIONS } from './helper';

/**
 * Props for Date and Category selector fields.
 */
export interface ExpenseDateCategoryFieldsProps {
  form: UseFormReturn<CreateExpenseInput>;
  categoriesByBucket: CategoryGroup[];
  watchedDate?: string;
  watchedCategoryId?: string;
  selectTriggerId?: string;
}

/**
 * Shared Date and Category fields.
 */
export function ExpenseDateCategoryFields({
  form,
  categoriesByBucket,
  watchedDate,
  watchedCategoryId,
  selectTriggerId = 'category-select-trigger',
}: ExpenseDateCategoryFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="Transaction Date"
        description={
          watchedDate ? `Spent on ${formatCardDate(watchedDate)}` : 'When the transaction occurred'
        }
        error={form.formState.errors.date?.message}
        required
      >
        <DatePicker
          date={watchedDate}
          onDateChange={(date, plainDate) => {
            const pDate = plainDate ?? (date ? fromISO(date.toISOString().slice(0, 10)) : null);
            if (pDate) {
              form.setValue('date', toISO(pDate), { shouldValidate: true });
            }
          }}
          error={Boolean(form.formState.errors.date)}
          clearable={false}
        />
      </Field>

      <Field
        label="Category"
        description="Assign to an expense category"
        error={form.formState.errors.category_id?.message}
        required
      >
        <Select
          value={watchedCategoryId || ''}
          onValueChange={(val) => form.setValue('category_id', val, { shouldValidate: true })}
        >
          <SelectTrigger id={selectTriggerId} error={Boolean(form.formState.errors.category_id)}>
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {categoriesByBucket.map((group) => (
              <SelectGroup key={group.bucketLabel}>
                <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
                  {group.bucketLabel}
                </div>
                {group.items.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      {cat.color && (
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

/**
 * Props for Description and Amount fields.
 */
export interface ExpenseDescriptionAmountFieldsProps {
  form: UseFormReturn<CreateExpenseInput>;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  descriptionHelperText?: string;
  amountLabel?: string;
}

/**
 * Shared Description / Merchant narration and Amount input fields.
 */
export function ExpenseDescriptionAmountFields({
  form,
  descriptionLabel = 'Description / Merchant',
  descriptionPlaceholder = 'e.g. Swiggy Dinner, Groceries, Metro Recharge',
  descriptionHelperText = 'Brief narration of this spend',
  amountLabel = 'Total Amount',
}: ExpenseDescriptionAmountFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="sm:col-span-2">
        <Input
          label={descriptionLabel}
          placeholder={descriptionPlaceholder}
          helperText={descriptionHelperText}
          errorMessage={form.formState.errors.description?.message}
          required
          {...form.register('description')}
        />
      </div>

      <div>
        <Input
          label={amountLabel}
          placeholder="0.00"
          leadingIcon={<IndianRupee size={16} />}
          type="number"
          step="0.01"
          min="0.01"
          className="font-numeric"
          errorMessage={form.formState.errors.amount?.message}
          required
          {...form.register('amount', { valueAsNumber: true })}
        />
      </div>
    </div>
  );
}

/**
 * Props for Payment Method selector field.
 */
export interface ExpensePaymentMethodFieldProps {
  form: UseFormReturn<CreateExpenseInput>;
  watchedPaymentMethod?: PaymentMethod | null;
  label?: string;
}

/**
 * Shared Payment Instrument selector button group.
 */
export function ExpensePaymentMethodField({
  form,
  watchedPaymentMethod,
  label = 'Payment Instrument',
}: ExpensePaymentMethodFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-body-sm font-medium text-text-primary block">{label}</label>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 sm:grid-cols-6">
        {PAYMENT_OPTIONS.map((method) => {
          const isSelected = (watchedPaymentMethod ?? 'upi') === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => form.setValue('payment_method', method.id, { shouldValidate: true })}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg border p-1.5 sm:p-2 text-center transition-all cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary-subtle/50 text-primary font-medium shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface text-text-secondary hover:border-border/80 hover:bg-surface-raised'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-[11px] truncate w-full">{method.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Composite form fields for personal expense logging.
 */
export interface ExpenseFormFieldsProps {
  form: UseFormReturn<CreateExpenseInput>;
  categoriesByBucket: CategoryGroup[];
  watchedDate?: string;
  watchedCategoryId?: string;
  watchedPaymentMethod?: PaymentMethod | null;
}

export function ExpenseFormFields({
  form,
  categoriesByBucket,
  watchedDate,
  watchedCategoryId,
  watchedPaymentMethod,
}: ExpenseFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Date & Category */}
      <ExpenseDateCategoryFields
        form={form}
        categoriesByBucket={categoriesByBucket}
        watchedDate={watchedDate}
        watchedCategoryId={watchedCategoryId}
      />

      {/* Description & Amount */}
      <ExpenseDescriptionAmountFields form={form} />

      {/* Payment Instrument */}
      <ExpensePaymentMethodField form={form} watchedPaymentMethod={watchedPaymentMethod} />
    </div>
  );
}
