'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Button,
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui';

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader icon={<AlertTriangle className="h-5 w-5 text-danger" />} tone="danger">
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>

        <ModalBody>
          <p className="text-body-sm text-text-secondary">
            This action cannot be undone. The transaction will be removed from your asset ledger and
            net worth calculations.
          </p>
        </ModalBody>

        <ModalFooter className="items-center justify-end gap-2">
          <ModalClose asChild>
            <Button type="button" variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </ModalClose>
          <Button type="button" variant="danger" isLoading={isDeleting} onClick={handleConfirm}>
            Delete Holding
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
