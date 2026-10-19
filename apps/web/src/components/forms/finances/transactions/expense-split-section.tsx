'use client';

import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { PaymentMethod, SplitContactMember, SplitType } from '@kalya/types';
import type { CreateExpenseInput } from '@kalya/validations';
import type { SplitBreakdownCalculation } from '@kalya/utils';
import { formatCardDate, roundMoney } from '@kalya/utils';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Scale,
  User,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import {
  getContactInitials,
  resolveContactColor,
} from '@/components/dashboard/finances/splits/contacts/card';
import { type CategoryGroup, SPLIT_TYPE_OPTIONS } from './helper';
import {
  ExpenseDateCategoryFields,
  ExpenseDescriptionAmountFields,
  ExpensePaymentMethodField,
} from './expense-form-fields';

export interface ExpenseSplitSectionProps {
  form: UseFormReturn<CreateExpenseInput>;
  contacts: SplitContactMember[];
  selectedMembers: SplitContactMember[];
  selectedContactIds: string[];
  onToggleContact: (id: string) => void;
  onSelectAllContacts: () => void;
  onDeselectAllContacts: () => void;
  splitType: SplitType;
  onSplitTypeChange: (type: SplitType) => void;
  splitValues: Record<string, number | string>;
  onParticipantValueChange: (id: string, val: string) => void;
  onParticipantValueBlur: (id: string) => void;
  splitBreakdown: SplitBreakdownCalculation;
  onAutoBalance: () => void;
  onResetToEqual: () => void;
  totalAmount: number;
  paidBy: string | null;
  onPaidByChange: (paidBy: string | null) => void;
  categoriesByBucket: CategoryGroup[];
  watchedDate?: string;
  watchedCategoryId?: string;
  watchedPaymentMethod?: PaymentMethod | null;
}

/**
 * Dedicated Split Bill UI.
 * Organized strictly top-to-bottom:
 * 1. Description & Total Amount
 * 2. Paid by (You / a friend)
 * 3. Split between (friend chips)
 * 4. Split method tabs
 * 5. Interactive Breakdown with single footer status line
 * 6. Collapsed "More details" (Date, Category, Payment Instrument)
 */
export function ExpenseSplitSection({
  form,
  contacts,
  selectedMembers,
  selectedContactIds,
  onToggleContact,
  onSelectAllContacts,
  onDeselectAllContacts,
  splitType,
  onSplitTypeChange,
  splitValues,
  onParticipantValueChange,
  onParticipantValueBlur,
  splitBreakdown,
  onAutoBalance,
  onResetToEqual,
  totalAmount,
  paidBy,
  onPaidByChange,
  categoriesByBucket,
  watchedDate,
  watchedCategoryId,
  watchedPaymentMethod,
}: ExpenseSplitSectionProps) {
  // Collapsed "More details" disclosure state
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const isUserPayer = paidBy === null || paidBy === 'self' || paidBy === '';

  // Get active category label for the collapsed summary preview
  const activeCategory = React.useMemo(() => {
    if (!watchedCategoryId) return null;
    for (const group of categoriesByBucket) {
      const match = group.items.find((item) => item.id === watchedCategoryId);
      if (match) return match;
    }
    return null;
  }, [categoriesByBucket, watchedCategoryId]);

  return (
    <div className="space-y-4">
      {/* 1. Description / Merchant & Total Amount */}
      <ExpenseDescriptionAmountFields
        form={form}
        descriptionLabel="Description / Bill Title"
        descriptionPlaceholder="e.g. Swiggy Dinner, Airbnb Cabin, Groceries"
        descriptionHelperText="What was this shared expense for?"
        amountLabel="Total Bill Amount"
      />

      {/* 2. Paid By Selector */}
      <div className="space-y-1.5">
        <label className="text-body-sm font-medium text-text-primary block">
          Who paid this bill?
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {/* You / Primary User */}
          <button
            type="button"
            onClick={() => onPaidByChange(null)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 text-caption font-medium transition-all cursor-pointer',
              isUserPayer
                ? 'border-primary bg-primary-subtle text-primary shadow-xs ring-1 ring-primary/40'
                : 'border-border bg-surface text-text-secondary hover:border-border/80'
            )}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
              You
            </span>
            <span>You paid</span>
            {isUserPayer && <Check size={12} className="shrink-0 text-primary" />}
          </button>

          {/* Friends who are part of the split */}
          {selectedMembers.map((member) => {
            const isSelectedPayer = paidBy === member.id;
            const initials = getContactInitials(member.name);
            const color = resolveContactColor(member.id);

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onPaidByChange(member.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-caption font-medium transition-all cursor-pointer',
                  isSelectedPayer
                    ? 'border-primary bg-primary-subtle text-primary shadow-xs ring-1 ring-primary/40'
                    : 'border-border bg-surface text-text-secondary hover:border-border/80'
                )}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-on-primary"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </span>
                <span className="truncate max-w-28">{member.name} paid</span>
                {isSelectedPayer && <Check size={12} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Split Between (Participant Chips) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-caption">
          <span className="font-medium text-text-secondary">
            Split between ({selectedContactIds.length} friends selected + You)
          </span>
          {contacts.length > 0 && (
            <button
              type="button"
              onClick={
                selectedContactIds.length === contacts.length
                  ? onDeselectAllContacts
                  : onSelectAllContacts
              }
              className="text-primary hover:underline text-[11px] font-medium cursor-pointer"
            >
              {selectedContactIds.length === contacts.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>

        {contacts.length === 0 ? (
          <p className="text-caption text-text-muted italic py-1">
            No contacts found. Add friends in the Contacts directory to split bills.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            {contacts.map((contact) => {
              const isSelected = selectedContactIds.includes(contact.id);
              const isLinked = Boolean(contact.is_linked ?? (contact as any).isLinked);
              const initials = getContactInitials(contact.name);
              const color = resolveContactColor(contact.id || contact.name);

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => onToggleContact(contact.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-2.5 py-1 text-caption transition-all cursor-pointer select-none',
                    isSelected
                      ? 'border-primary bg-primary-subtle/50 text-text-primary shadow-xs ring-1 ring-primary/40'
                      : 'border-border bg-surface text-text-muted hover:border-border/80 hover:text-text-secondary'
                  )}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-on-primary"
                    style={{ backgroundColor: color }}
                  >
                    {initials || <User size={10} />}
                  </span>
                  <span className="font-medium truncate max-w-30">{contact.name}</span>
                  {isLinked && <UserCheck size={12} className="text-success shrink-0" />}
                  {isSelected && <Check size={12} className="text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Split Method Tabs & Breakdown */}
      {selectedMembers.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-surface p-3.5 space-y-3 shadow-xs">
          {/* Split Mode Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
            <span className="text-caption font-medium text-text-secondary shrink-0">
              Split Method:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SPLIT_TYPE_OPTIONS.map((type) => {
                const isSelected = (splitType ?? 'equal') === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => onSplitTypeChange(type.id)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-raised text-text-secondary hover:text-text-primary border border-border'
                    )}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Breakdown Rows */}
          <div className="space-y-1.5">
            {splitBreakdown.participants.map((item) => {
              const isSelf = item.id === 'self';
              const contact = selectedMembers.find((m) => m.id === item.id);
              const initials = isSelf
                ? 'You'
                : getContactInitials(contact?.name || item.name || 'P');
              const color = isSelf ? 'var(--color-primary, #0d9488)' : resolveContactColor(item.id);
              const displayName = isSelf ? 'You' : contact?.name || item.name || 'Friend';
              const isItemPayer = item.isPayer;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 rounded-lg border px-3 py-2 transition-colors',
                    isSelf
                      ? 'border-primary/40 bg-primary-subtle/20 font-medium'
                      : 'border-border/60 bg-surface hover:border-border'
                  )}
                >
                  {/* Left: Participant */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-on-primary shadow-xs"
                      style={{ backgroundColor: color }}
                    >
                      {initials}
                    </span>
                    <div className="truncate flex items-center gap-1.5">
                      <span className="text-body-sm text-text-primary truncate font-medium">
                        {displayName}
                      </span>
                      {isItemPayer && (
                        <span className="rounded-full bg-surface-raised px-1.5 py-0.2 text-[10px] font-semibold text-primary border border-primary/30">
                          Payer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Allocation Control */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
                    {/* Equal mode: simple amount */}
                    {splitType === 'equal' && (
                      <span className="font-semibold text-text-primary font-numeric text-body-sm">
                        ₹
                        {item.amount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}

                    {/* Exact mode: numeric input with ₹ */}
                    {splitType === 'exact' && (
                      <div className="relative w-full sm:w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption text-text-muted font-numeric">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            splitValues[item.id] !== undefined ? splitValues[item.id] : item.amount
                          }
                          onChange={(e) => onParticipantValueChange(item.id, e.target.value)}
                          onBlur={() => onParticipantValueBlur(item.id)}
                          className={cn(
                            'w-full rounded-md border bg-surface px-2.5 py-1 pl-6 text-right font-numeric text-body-sm text-text-primary focus:outline-hidden transition-all',
                            !splitBreakdown.isBalanced
                              ? 'border-warning/70 focus:border-warning focus:ring-1 focus:ring-warning/40'
                              : 'border-border focus:border-primary focus:ring-1 focus:ring-primary/40'
                          )}
                          placeholder="0.00"
                        />
                      </div>
                    )}

                    {/* Percentage mode: % input and live computed ₹ amount */}
                    {splitType === 'percentage' && (
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                        <div className="relative w-20">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={
                              splitValues[item.id] !== undefined
                                ? splitValues[item.id]
                                : item.percentage
                            }
                            onChange={(e) => onParticipantValueChange(item.id, e.target.value)}
                            onBlur={() => onParticipantValueBlur(item.id)}
                            className={cn(
                              'w-full rounded-md border bg-surface px-2 py-1 pr-6 text-right font-numeric text-body-sm text-text-primary focus:outline-hidden transition-all',
                              !splitBreakdown.isBalanced
                                ? 'border-warning/70 focus:border-warning focus:ring-1 focus:ring-warning/40'
                                : 'border-border focus:border-primary focus:ring-1 focus:ring-primary/40'
                            )}
                            placeholder="0"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-caption text-text-muted font-numeric">
                            %
                          </span>
                        </div>
                        <span className="font-semibold text-text-primary font-numeric text-body-sm min-w-20 text-right">
                          ₹
                          {item.amount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Shares mode: parts input and live computed ₹ amount */}
                    {splitType === 'shares' && (
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            min="0.1"
                            value={
                              splitValues[item.id] !== undefined
                                ? splitValues[item.id]
                                : item.shares
                            }
                            onChange={(e) => onParticipantValueChange(item.id, e.target.value)}
                            onBlur={() => onParticipantValueBlur(item.id)}
                            className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-center font-numeric text-body-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/40 focus:outline-hidden"
                          />
                          <span className="text-[11px] text-text-muted">parts</span>
                        </div>
                        <span className="font-semibold text-text-primary font-numeric text-body-sm min-w-20 text-right">
                          ₹
                          {item.amount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Single Footer Status Line (replacing 3x redundant balance widgets) */}
          <div className="border-t border-border/60 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              {splitBreakdown.isBalanced ? (
                <div className="flex items-center gap-1.5 text-caption font-medium text-success font-numeric">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>
                    ₹
                    {splitBreakdown.totalAllocated.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    of ₹
                    {roundMoney(Number(totalAmount) || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    allocated ✓
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-caption font-medium text-danger font-numeric">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>
                    {splitBreakdown.remainingAmount > 0
                      ? `₹${splitBreakdown.remainingAmount.toFixed(2)} left to assign`
                      : `Over-allocated by ₹${Math.abs(splitBreakdown.remainingAmount).toFixed(2)}`}
                  </span>
                </div>
              )}

              {/* Single Line Obligation Summary: e.g. "Friends owe you ₹400" or "You owe Ritik ₹200" */}
              {splitBreakdown.isBalanced && splitBreakdown.userOwedSummary && (
                <p className="text-[11px] text-text-muted font-medium">
                  {splitBreakdown.userOwedSummary}
                </p>
              )}
            </div>

            {/* Quick Actions (Auto-balance & Reset) */}
            {splitType !== 'equal' && (
              <div className="flex items-center gap-2 self-end sm:self-auto sm:ml-auto">
                {!splitBreakdown.isBalanced &&
                  (splitType === 'exact' || splitType === 'percentage') && (
                    <button
                      type="button"
                      onClick={onAutoBalance}
                      className="flex items-center gap-1 rounded-md bg-primary-subtle px-2 py-1 text-caption font-medium text-primary hover:bg-primary-subtle/80 transition-colors cursor-pointer"
                    >
                      <Scale size={12} />
                      <span>Auto-balance You</span>
                    </button>
                  )}
                <button
                  type="button"
                  onClick={onResetToEqual}
                  className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                >
                  <RotateCcw size={11} />
                  <span>Reset to Equal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Collapsed "More details" (Date, Category, Payment Instrument) */}
      <div className="rounded-xl border border-border/60 bg-surface-raised/30 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMoreDetails((prev) => !prev)}
          className="flex w-full items-center justify-between p-3 text-caption font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <span>More details</span>
            <span className="text-[11px] text-text-muted font-normal">
              ({watchedDate ? formatCardDate(watchedDate) : 'Today'} ·{' '}
              {activeCategory?.label || 'General'}
              {isUserPayer ? ' · You paid' : ''})
            </span>
          </span>
          {showMoreDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showMoreDetails && (
          <div className="p-3.5 pt-0 space-y-4 border-t border-border/40">
            {/* Date & Category */}
            <div className="pt-2">
              <ExpenseDateCategoryFields
                form={form}
                categoriesByBucket={categoriesByBucket}
                watchedDate={watchedDate}
                watchedCategoryId={watchedCategoryId}
                selectTriggerId="split-category-select-trigger"
              />
            </div>

            {/* Payment Instrument (ONLY shown when You paid!) */}
            {isUserPayer ? (
              <ExpensePaymentMethodField
                form={form}
                watchedPaymentMethod={watchedPaymentMethod}
                label="Payment Instrument (Since You paid)"
              />
            ) : (
              <p className="text-caption text-text-muted italic">
                Payment instrument is omitted because a friend paid this bill.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
