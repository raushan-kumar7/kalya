import React from 'react';
import { CreditCard, QrCode, Smartphone } from 'lucide-react';
import type { Category, Bucket, Expense, PaymentMethod, SplitType } from '@kalya/types';
import type { CreateExpenseInput } from '@kalya/validations';
import { Temporal, toISO } from '@kalya/utils';

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: React.ElementType;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'upi', label: 'UPI / QR', icon: QrCode },
  { id: 'gpay', label: 'Google Pay', icon: Smartphone },
  { id: 'phonepe', label: 'PhonePe', icon: Smartphone },
  { id: 'paytm', label: 'Paytm', icon: Smartphone },
  { id: 'debit_card', label: 'Debit Card', icon: CreditCard },
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
];

export interface SplitTypeOption {
  id: SplitType;
  label: string;
  desc: string;
}

export const SPLIT_TYPE_OPTIONS: SplitTypeOption[] = [
  { id: 'equal', label: 'Split Equally', desc: 'Evenly divided across all' },
  { id: 'exact', label: 'Exact Amounts', desc: 'Custom monetary amounts' },
  { id: 'percentage', label: 'Percentages', desc: 'Allocated by percent (%)' },
  { id: 'shares', label: 'Shares', desc: 'Split by share ratios' },
];

export type ExpenseFormMode = 'personal' | 'split';

/**
 * Derives normalized initial values for the form using @kalya/utils temporal helpers.
 */
export function getExpenseInitialValues(
  expense?: Expense | null,
  mode: ExpenseFormMode = 'personal'
): CreateExpenseInput {
  const todayPlainDate = Temporal.Now.plainDateISO();
  const defaultIsoDate = toISO(todayPlainDate);

  const isSplit = expense != null ? Boolean(expense.is_split) : mode === 'split';

  return {
    date: expense?.date ?? defaultIsoDate,
    category_id: expense?.category_id ?? '',
    description: expense?.description ?? '',
    amount: expense?.amount != null ? Number(expense.amount) : ('' as unknown as number),
    payment_method: (expense?.payment_method as PaymentMethod) ?? 'upi',
    is_split: isSplit,
    paid_by: expense?.paid_by ?? null,
    your_share:
      expense?.your_share != null ? Number(expense.your_share) : ('' as unknown as number),
    split_type: (expense?.split_type as SplitType) ?? 'equal',
    splits: [],
  };
}

export interface CategoryGroup {
  bucketLabel: string;
  items: Category[];
}

/**
 * Groups categories under their parent bucket for organized dropdown display.
 */
export function groupCategoriesByBucket(
  categories: Category[],
  buckets: Bucket[]
): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>();

  for (const cat of categories) {
    const parentBucket = buckets.find((b) => b.id === cat.bucket_id);
    const bucketLabel = parentBucket?.label || 'General Categories';

    if (!map.has(bucketLabel)) {
      map.set(bucketLabel, { bucketLabel, items: [] });
    }
    map.get(bucketLabel)!.items.push(cat);
  }

  return Array.from(map.values());
}
