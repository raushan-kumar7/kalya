'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Expense, PaymentMethod, SplitType } from '@kalya/types';
import {
  CreateExpenseSchema,
  UpdateExpenseSchema,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from '@kalya/validations';
import {
  autoBalanceSplitValues,
  calculateDetailedSplitBreakdown,
  formatCardDate,
  formatTimeAgo,
  fromISO,
  getDefaultSplitInputValues,
  roundMoney,
  toISO,
} from '@kalya/utils';
import { FinanceFormModal } from '../modal';
import { useBucketsQuery, useCategoriesQuery, useSplitContactsQuery } from '@/hooks/finances';
import { AlertCircle, ArrowRight, Clock, Receipt, Split } from 'lucide-react';
import { cn } from '@/libs/utils';
import { ExpenseFormFields } from './expense-form-fields';
import {
  type ExpenseFormMode,
  PAYMENT_OPTIONS,
  getExpenseInitialValues,
  groupCategoriesByBucket,
} from './helper';
import { ExpenseSplitSection } from './expense-split-section';

export interface ExpenseFormProps {
  /** Controlled open state of the modal dialog */
  open: boolean;
  /** Callback fired when the open state changes */
  onOpenChange: (open: boolean) => Promise<void> | void;
  /** Optional existing Expense to edit */
  expense?: Expense | null;
  /** Callback fired with validated form payload */
  onSave: (payload: CreateExpenseInput | UpdateExpenseInput) => Promise<void>;
  /** Form entry mode: 'personal' for standard spending, 'split' for shared group bills */
  mode?: ExpenseFormMode;
}

/**
 * Standard Form Modal for expenses.
 * Dynamically switches between:
 * - 'personal': Clean, compact personal spend logger without split clutter.
 * - 'split': Streamlined group bill split modal with Paid By, friends, and breakdown.
 */
export function ExpenseForm({
  open,
  onOpenChange,
  expense,
  onSave,
  mode = 'personal',
}: ExpenseFormProps) {
  const isEdit = Boolean(expense);

  // Active UI mode (initialized from prop or existing expense)
  const [currentMode, setCurrentMode] = useState<ExpenseFormMode>(
    mode ?? (expense?.is_split ? 'split' : 'personal')
  );

  // Paid by selector (null means 'self' / You paid)
  const [paidBy, setPaidBy] = useState<string | null>(expense?.paid_by ?? null);

  // Queries for categories, buckets, and split contact directory
  const categoriesQuery = useCategoriesQuery();
  const bucketsQuery = useBucketsQuery();
  const contactsQuery = useSplitContactsQuery();

  const categories = categoriesQuery.data ?? [];
  const buckets = bucketsQuery.data ?? [];
  const contacts = contactsQuery.data ?? [];

  // Selected contacts state for split billing
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  // Custom numeric inputs for split participants
  const [splitValues, setSplitValues] = useState<Record<string, number | string>>({});

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver((isEdit ? UpdateExpenseSchema : CreateExpenseSchema) as any),
    defaultValues: getExpenseInitialValues(expense, currentMode),
  });

  // Re-sync form default values whenever modal opens or active expense changes
  useEffect(() => {
    if (open) {
      const activeMode = mode ?? (expense?.is_split ? 'split' : 'personal');
      setCurrentMode(activeMode);
      setPaidBy(expense?.paid_by ?? null);

      form.reset(getExpenseInitialValues(expense, activeMode));

      const initialContacts =
        expense && (expense as any).splits
          ? (expense as any).splits.map((s: any) => s.split_member_id)
          : [];
      setSelectedContactIds(initialContacts);

      const initialVals: Record<string, number> = {};
      if (expense && expense.is_split) {
        if (expense.your_share != null) {
          initialVals['self'] = Number(expense.your_share);
        }
        if ((expense as any).splits) {
          for (const s of (expense as any).splits) {
            if (s.amount != null) {
              initialVals[s.split_member_id] = Number(s.amount);
            }
          }
        }
      }
      setSplitValues(initialVals);
    }
  }, [open, expense, mode, form]);

  // Reactive single-tuple watch
  const [watchedDate, watchedAmount, watchedCategoryId, watchedPaymentMethod, watchedSplitType] =
    useWatch({
      control: form.control,
      name: ['date', 'amount', 'category_id', 'payment_method', 'split_type'],
    });

  const isSplit = currentMode === 'split';

  // Categories grouped by parent bucket
  const categoriesByBucket = useMemo(() => {
    return groupCategoriesByBucket(categories, buckets);
  }, [categories, buckets]);

  // Active selected split contact members
  const selectedMembers = useMemo(() => {
    return contacts.filter((c) => selectedContactIds.includes(c.id));
  }, [contacts, selectedContactIds]);

  // Unified list of participants for breakdown calculation
  const participantsList = useMemo(() => {
    const list = [{ id: 'self', name: 'You', isPayer: !paidBy }];
    for (const m of selectedMembers) {
      list.push({ id: m.id, name: m.name || 'Friend', isPayer: paidBy === m.id });
    }
    return list;
  }, [selectedMembers, paidBy]);

  // Clean numeric mapping of split values
  const numericSplitValues = useMemo(() => {
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(splitValues)) {
      const parsed = typeof v === 'number' ? v : parseFloat(String(v));
      result[k] = !isNaN(parsed) ? parsed : 0;
    }
    return result;
  }, [splitValues]);

  // Live calculation of peer obligations and your personal share via @kalya/utils
  const splitBreakdown = useMemo(() => {
    const numericAmount = roundMoney(Number(watchedAmount) || 0);
    if (!isSplit || numericAmount <= 0 || selectedMembers.length === 0) {
      return calculateDetailedSplitBreakdown({
        totalAmount: numericAmount,
        splitType: (watchedSplitType as SplitType) || 'equal',
        participants: [{ id: 'self', name: 'You', isPayer: !paidBy }],
        paidById: paidBy,
      });
    }

    return calculateDetailedSplitBreakdown({
      totalAmount: numericAmount,
      splitType: (watchedSplitType as SplitType) || 'equal',
      participants: participantsList,
      values: numericSplitValues,
      primaryUserId: 'self',
      paidById: paidBy,
    });
  }, [
    watchedAmount,
    isSplit,
    selectedMembers,
    watchedSplitType,
    participantsList,
    numericSplitValues,
    paidBy,
  ]);

  // Synchronize your_share field with computed share
  useEffect(() => {
    if (isSplit) {
      form.setValue('your_share', splitBreakdown.yourShare);
    } else {
      form.setValue('your_share', Number(watchedAmount) || 0);
    }
  }, [isSplit, watchedAmount, splitBreakdown.yourShare, form]);

  // Handle switching split mode and auto-seeding sensible initial values
  const handleSplitTypeChange = (newType: SplitType) => {
    form.setValue('split_type', newType, { shouldValidate: true });
    const numericAmount = roundMoney(Number(watchedAmount) || 0);
    const participantIds = ['self', ...selectedContactIds];
    const defaultVals = getDefaultSplitInputValues(numericAmount, newType, participantIds);
    setSplitValues(defaultVals);
  };

  // Toggle contact selection in split
  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) => {
      const isSelected = prev.includes(contactId);
      const nextIds = isSelected ? prev.filter((id) => id !== contactId) : [...prev, contactId];

      const numericAmount = roundMoney(Number(watchedAmount) || 0);
      const activeType = (watchedSplitType as SplitType) || 'equal';
      const allIds = ['self', ...nextIds];

      if (isSelected) {
        const nextVals: Record<string, number> = {};
        for (const [k, v] of Object.entries(splitValues)) {
          if (k !== contactId) {
            nextVals[k] = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
          }
        }
        const balanced = autoBalanceSplitValues(
          numericAmount,
          activeType,
          allIds,
          nextVals,
          'self'
        );
        setSplitValues(balanced);
        // If the removed contact was the paid_by member, reset paid_by to 'self'
        if (paidBy === contactId) {
          setPaidBy(null);
          form.setValue('paid_by', null);
        }
      } else {
        const defaultVals = getDefaultSplitInputValues(numericAmount, activeType, allIds);
        setSplitValues(defaultVals);
      }

      return nextIds;
    });
  };

  const handleSelectAllContacts = () => {
    const nextIds = contacts.map((c) => c.id);
    setSelectedContactIds(nextIds);
    const numericAmount = roundMoney(Number(watchedAmount) || 0);
    const activeType = (watchedSplitType as SplitType) || 'equal';
    const defaultVals = getDefaultSplitInputValues(numericAmount, activeType, ['self', ...nextIds]);
    setSplitValues(defaultVals);
  };

  const handleDeselectAllContacts = () => {
    setSelectedContactIds([]);
    setSplitValues({});
    setPaidBy(null);
    form.setValue('paid_by', null);
  };

  // Update a specific participant's split input value
  const handleParticipantValueChange = (id: string, rawVal: string) => {
    setSplitValues((prev) => ({
      ...prev,
      [id]: rawVal,
    }));
  };

  const handleParticipantValueBlur = (id: string) => {
    const current = splitValues[id];
    const parsed = typeof current === 'number' ? current : parseFloat(String(current));
    const safeVal = !isNaN(parsed) && parsed >= 0 ? roundMoney(parsed) : 0;
    setSplitValues((prev) => ({
      ...prev,
      [id]: safeVal,
    }));
  };

  // Auto-balance remainder onto You (Payer)
  const handleAutoBalance = () => {
    const numericAmount = roundMoney(Number(watchedAmount) || 0);
    const activeType = (watchedSplitType as SplitType) || 'equal';
    const allIds = ['self', ...selectedContactIds];
    const balanced = autoBalanceSplitValues(
      numericAmount,
      activeType,
      allIds,
      numericSplitValues,
      'self'
    );
    setSplitValues(balanced);
  };

  // Reset all participant allocations back to equal distribution
  const handleResetToEqual = () => {
    const numericAmount = roundMoney(Number(watchedAmount) || 0);
    const activeType = (watchedSplitType as SplitType) || 'equal';
    const allIds = ['self', ...selectedContactIds];
    const defaultVals = getDefaultSplitInputValues(numericAmount, activeType, allIds);
    setSplitValues(defaultVals);
  };

  const handlePaidByChange = (newPaidBy: string | null) => {
    setPaidBy(newPaidBy);
    form.setValue('paid_by', newPaidBy, { shouldValidate: true });
  };

  const handleSubmit = async (payload: CreateExpenseInput | UpdateExpenseInput) => {
    const numericAmount = roundMoney(Number(payload.amount) || 0);
    const isSplitExpense = currentMode === 'split';

    if (isSplitExpense && selectedContactIds.length > 0 && !splitBreakdown.isBalanced) {
      form.setError('root', {
        type: 'manual',
        message:
          splitBreakdown.validationError ||
          'The split allocations do not match the total bill. Please balance before saving.',
      });
      return;
    }

    const peerShares = isSplitExpense
      ? splitBreakdown.participants
          .filter((p) => p.id !== 'self')
          .map((p) => ({
            split_member_id: p.id,
            amount: p.amount,
            settled: false,
          }))
      : [];

    const finalPayload = {
      ...payload,
      amount: numericAmount,
      your_share: isSplitExpense ? splitBreakdown.yourShare : numericAmount,
      is_split: isSplitExpense,
      paid_by: isSplitExpense ? paidBy : null,
      split_type: isSplitExpense ? (watchedSplitType as SplitType) || 'equal' : 'equal',
      splits: peerShares,
    };

    await onSave(finalPayload as CreateExpenseInput | UpdateExpenseInput);
    await onOpenChange(false);
  };

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={handleSubmit}
      title={
        isEdit
          ? isSplit
            ? 'Edit Split Bill'
            : 'Edit Expense'
          : isSplit
            ? 'Split Bill'
            : 'Record Expense'
      }
      description={
        isSplit
          ? 'Share obligations with friends and track settlements automatically.'
          : 'Track an outgoing spend and assign a category.'
      }
      icon={isSplit ? <Split className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
      tone="accent"
      submitLabel={
        isEdit
          ? isSplit
            ? 'Update Split Bill'
            : 'Update Expense'
          : isSplit
            ? 'Save Split Bill'
            : 'Save Expense'
      }
      size={isSplit ? 'xl' : 'lg'}
      submitDisabled={isSplit && selectedContactIds.length > 0 && !splitBreakdown.isBalanced}
      resetOnClose
    >
      <div className="space-y-4">
        {/* Form Root Error Alert */}
        {form.formState.errors.root?.message && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger-subtle/30 p-2.5 text-caption text-danger font-medium animate-fadeIn">
            <AlertCircle size={15} className="shrink-0" />
            <span>{form.formState.errors.root.message}</span>
          </div>
        )}

        {/* PERSONAL MODE: Clean, compact personal spend logger without split clutter */}
        {!isSplit && (
          <div className="space-y-4">
            {/* Standard Personal Form Fields */}
            <ExpenseFormFields
              form={form}
              categoriesByBucket={categoriesByBucket}
              watchedDate={watchedDate}
              watchedCategoryId={watchedCategoryId}
              watchedPaymentMethod={watchedPaymentMethod}
            />

            {/* Switch to Split Bill Helper Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-dashed border-border/80 bg-surface-raised/30 p-3 text-caption">
              <span className="text-text-muted">Need to split this bill with friends?</span>
              <button
                type="button"
                onClick={() => {
                  setCurrentMode('split');
                  form.setValue('is_split', true);
                  if (contacts.length > 0 && selectedContactIds.length === 0) {
                    const defaultIds = [contacts[0].id];
                    setSelectedContactIds(defaultIds);
                    const numericAmount = roundMoney(Number(form.getValues('amount')) || 0);
                    const defaultVals = getDefaultSplitInputValues(numericAmount, 'equal', [
                      'self',
                      ...defaultIds,
                    ]);
                    setSplitValues(defaultVals);
                  }
                }}
                className="text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Split this with friends instead</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* SPLIT BILL MODE: Dedicated group split layout */}
        {isSplit && (
          <div className="space-y-4">
            <ExpenseSplitSection
              form={form}
              contacts={contacts}
              selectedMembers={selectedMembers}
              selectedContactIds={selectedContactIds}
              onToggleContact={toggleContact}
              onSelectAllContacts={handleSelectAllContacts}
              onDeselectAllContacts={handleDeselectAllContacts}
              splitType={(watchedSplitType as SplitType) || 'equal'}
              onSplitTypeChange={handleSplitTypeChange}
              splitValues={splitValues}
              onParticipantValueChange={handleParticipantValueChange}
              onParticipantValueBlur={handleParticipantValueBlur}
              splitBreakdown={splitBreakdown}
              onAutoBalance={handleAutoBalance}
              onResetToEqual={handleResetToEqual}
              totalAmount={Number(watchedAmount) || 0}
              paidBy={paidBy}
              onPaidByChange={handlePaidByChange}
              categoriesByBucket={categoriesByBucket}
              watchedDate={watchedDate}
              watchedCategoryId={watchedCategoryId}
              watchedPaymentMethod={watchedPaymentMethod}
            />

            {/* Switch Back to Personal Spend Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setCurrentMode('personal');
                  form.setValue('is_split', false);
                  form.setValue('paid_by', null);
                  setPaidBy(null);
                }}
                className="text-caption text-text-muted hover:text-text-primary hover:underline cursor-pointer"
              >
                ← Switch to personal expense
              </button>
            </div>
          </div>
        )}

        {/* Audit Timestamp if editing existing expense */}
        {isEdit && expense?.updated_at && (
          <div className="flex items-center gap-1.5 pt-1 text-caption text-text-muted">
            <Clock size={12} className="shrink-0 text-text-muted/70" />
            <span>Last updated {formatTimeAgo(expense.updated_at)}</span>
          </div>
        )}
      </div>
    </FinanceFormModal>
  );
}

export default ExpenseForm;
