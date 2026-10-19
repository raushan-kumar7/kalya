'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/overlays/alert-dialog';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/libs/utils';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { UnifiedTransactionItem } from '../types';
import { toast } from '@/components/ui/feedback/toast';

export interface RowActionsMenuProps {
  item: UnifiedTransactionItem;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  onSettleSplit?: () => void;
}

export function RowActionsMenu({
  item,
  onViewDetails,
  onEdit,
  onDelete,
  onSettleSplit,
}: RowActionsMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSendReminder = () => {
    if (item.kind !== 'split_bill') return;
    const text = `Hi! Just a friendly reminder for the split bill "${item.description}" (Your share: ₹${item.yourShare}). You can settle it via UPI. Thanks!`;
    navigator.clipboard.writeText(text);
    toast.success('Reminder message copied to clipboard!');
    setMenuOpen(false);
  };

  const handleOpenSplitsPage = () => {
    setMenuOpen(false);
    router.push('/dashboard/splits');
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setDeleteConfirmOpen(false);
    } catch {
      // handled in parent or toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-8 w-8 text-text-muted hover:text-text-primary hover:bg-surface-raised cursor-pointer rounded-lg"
            aria-label="Transaction actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-48 p-1.5 shadow-raised"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onViewDetails();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-caption font-medium text-text-primary transition-colors hover:bg-surface-raised cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-text-muted" />
              <span>View details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-caption font-medium text-text-primary transition-colors hover:bg-surface-raised cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5 text-text-muted" />
              <span>Edit</span>
            </button>

            {/* Split Bills Specific Operations */}
            {item.kind === 'split_bill' && (
              <>
                <div className="my-1 border-t border-border/60" />

                {onSettleSplit && !item.isSettled && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onSettleSplit();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-caption font-medium text-success transition-colors hover:bg-success-subtle/30 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span>Settle with friend</span>
                  </button>
                )}

                {!item.isSettled && item.isUserPayer && (
                  <button
                    type="button"
                    onClick={handleSendReminder}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-caption font-medium text-text-primary transition-colors hover:bg-surface-raised cursor-pointer"
                  >
                    <Bell className="h-3.5 w-3.5 text-accent" />
                    <span>Send reminder</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenSplitsPage}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-caption font-medium text-text-secondary transition-colors hover:bg-surface-raised cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
                  <span>Open in Split Bills</span>
                </button>
              </>
            )}

            <div className="my-1 border-t border-border/60" />

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setDeleteConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-caption font-medium text-danger transition-colors hover:bg-danger-subtle/40 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteConfirmOpen(open);
        }}
      >
        <AlertDialogContent
          className="max-w-lg p-6 bg-surface-raised border border-border/80 rounded-2xl shadow-elevated"
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader className="space-y-3.5 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-subtle/80 text-danger border border-danger/20 shadow-xs">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-body-lg font-semibold text-text-primary">
                  Delete{' '}
                  {item.kind === 'income'
                    ? 'Income Entry'
                    : item.kind === 'split_bill'
                      ? 'Split Bill'
                      : 'Expense'}
                  ?
                </AlertDialogTitle>
                <p className="text-caption text-text-muted mt-0.5">
                  This transaction will be permanently removed.
                </p>
              </div>
            </div>

            {/* Transaction Preview Card */}
            <div className="rounded-xl border border-border/70 bg-surface/90 p-3.5 flex items-center justify-between gap-3 text-left">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary text-body-sm truncate">
                    {item.description}
                  </span>
                  {item.kind === 'split_bill' && (
                    <span className="inline-flex items-center rounded-full bg-accent-subtle/70 px-2 py-0.5 text-[11px] font-medium text-accent shrink-0">
                      Split ({item.participantsCount || 2})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-caption text-text-muted mt-1">
                  <span>{item.date}</span>
                  {item.kind === 'personal_expense' && item.category?.label && (
                    <>
                      <span>•</span>
                      <span className="truncate">{item.category.label}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={cn(
                    'font-bold text-body tabular-nums',
                    item.kind === 'income' ? 'text-success' : 'text-text-primary'
                  )}
                >
                  {item.kind === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                </div>
                {item.kind === 'split_bill' &&
                  item.yourShare !== undefined &&
                  item.yourShare !== item.amount && (
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Your share: ₹{item.yourShare.toLocaleString('en-IN')}
                    </div>
                  )}
              </div>
            </div>

            <AlertDialogDescription asChild>
              {item.kind === 'split_bill' && item.isUserPayer ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-subtle/25 p-3 text-caption text-text-secondary text-left">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-semibold text-danger">Warning:</strong> Deleting this
                    shared bill will permanently remove reciprocal records from your friends&rsquo;
                    accounts and cancel any pending invitations.
                  </div>
                </div>
              ) : (
                <p className="text-body-sm text-text-secondary leading-relaxed text-left">
                  {item.kind === 'split_bill'
                    ? 'This will remove this shared bill from your personal ledger and unlink it from the payer’s receipt.'
                    : item.kind === 'income'
                      ? 'Deleting this entry will adjust your total income and update your cashflow analytics.'
                      : 'Deleting this expense will automatically recalculate your category budgets and monthly spending analytics.'}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-2 sm:gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="cursor-pointer rounded-lg border-border/80 hover:bg-surface-raised"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-danger text-white hover:bg-danger-hover cursor-pointer rounded-lg min-w-24 inline-flex items-center justify-center font-medium shadow-xs"
            >
              {isDeleting ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting…
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
