'use client';

import * as React from 'react';
import type { ComponentType, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form';
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
  ModalTrigger,
} from '@/components/ui';

// HELPER: Flexible Icon Renderer (supports LucideIcon component or ReactNode)
function renderIcon(icon?: ReactNode | LucideIcon, className = 'h-5 w-5'): ReactNode {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return icon;
  }
  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && 'render' in icon)
  ) {
    const IconComponent = icon as ComponentType<{ className?: string }>;
    return <IconComponent className={className} />;
  }
  return <>{icon}</>;
}

// TYPES
export interface FinanceFormModalProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues,
> {
  /** Controlled open state of the modal dialog */
  open: boolean;
  /** Callback fired when the open state changes (open/close) */
  onOpenChange: (open: boolean) => void;
  /** React Hook Form instance managing validation and state */
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  /** Async or sync submit handler receiving transformed form values */
  onSubmit: (payload: TTransformedValues) => void | Promise<void>;
  /** Primary modal heading */
  title: ReactNode;
  /** Subtitle or explanatory description placed under the title */
  description?: ReactNode;
  /** Form fields and child components rendered within the scrollable body */
  children: ReactNode;
  /** Header icon (supports Lucide icon component or JSX node) */
  icon?: ReactNode | LucideIcon;
  /** Color tone of the header icon badge */
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  /** Text for the primary submit action button (defaults to 'Save') */
  submitLabel?: string;
  /** Text for the cancel action button (defaults to 'Cancel') */
  cancelLabel?: string;
  /** Explicit loading state for submission (defaults to form.formState.isSubmitting) */
  isSubmitting?: boolean;
  /** Modal width size preset (defaults to 'md') */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Optional interactive element that triggers the modal */
  trigger?: ReactNode;
  /** If true, automatically resets form state when modal closes */
  resetOnClose?: boolean;
  /** Hide the built-in top-right close button */
  hideClose?: boolean;
  /** Optional auxiliary action slot on the left side of the footer */
  footerExtra?: ReactNode;
  /** Custom class for the modal content container */
  className?: string;
  /** Custom class for the scrollable modal body */
  bodyClassName?: string;
}

/**
 * Standardized Form Modal for Financial Entities.
 * Wraps React Hook Form FormProvider around a composed Radix Modal with sticky header and footer.
 */
export function FinanceFormModal<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
  description,
  children,
  icon,
  tone = 'default',
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting,
  size = 'md',
  trigger,
  resetOnClose = false,
  hideClose = false,
  footerExtra,
  className,
  bodyClassName,
}: FinanceFormModalProps<TFieldValues, TContext, TTransformedValues>) {
  const submitting = isSubmitting ?? form.formState.isSubmitting;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && resetOnClose) {
        form.reset();
      }
      onOpenChange(nextOpen);
    },
    [form, onOpenChange, resetOnClose]
  );

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}

      <ModalContent size={size} hideClose={hideClose} className={className}>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            noValidate
          >
            <ModalHeader tone={tone} icon={renderIcon(icon)}>
              <ModalTitle>{title}</ModalTitle>
              {description && <ModalDescription>{description}</ModalDescription>}
            </ModalHeader>

            <ModalBody className={bodyClassName}>{children}</ModalBody>

            <ModalFooter className="items-center justify-between sm:justify-between">
              {footerExtra ? <div className="flex items-center gap-2">{footerExtra}</div> : <div />}

              <div className="flex items-center gap-2">
                <ModalClose asChild>
                  <Button type="button" variant="outline" disabled={submitting}>
                    {cancelLabel}
                  </Button>
                </ModalClose>

                <Button type="submit" isLoading={submitting}>
                  {submitLabel}
                </Button>
              </div>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
}
