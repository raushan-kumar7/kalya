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
import {
  Bell,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
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
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{item.description}&rdquo;? This will
              permanently remove this record and recalculate your monthly finances and budget
              tracking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-danger text-white hover:bg-danger-hover"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
