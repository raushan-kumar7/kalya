'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';
import { Label } from './label';
import { FOCUS_RING, INTERACTION_STATES, TRANSITIONS_CSS } from '@/components/ui/constants';

const textareaVariants = cva(
  cn(
    'flex w-full font-body text-text-primary placeholder:text-text-muted resize-y transition-colors duration-150',
    INTERACTION_STATES.disabled
  ),
  {
    variants: {
      variant: {
        default: cn(
          'rounded-md border border-border bg-surface hover:border-text-secondary/70 focus-visible:border-primary',
          FOCUS_RING.primary
        ),
        error: cn(
          'rounded-md border border-danger bg-surface hover:border-danger focus-visible:border-danger',
          FOCUS_RING.danger
        ),
        warning: cn(
          'rounded-md border border-warning bg-surface hover:border-warning focus-visible:border-warning',
          FOCUS_RING.accent
        ),
        success: cn(
          'rounded-md border border-success bg-surface hover:border-success focus-visible:border-success',
          FOCUS_RING.primary
        ),
      },
      size: {
        sm: 'min-h-20 px-3 py-2 text-caption rounded-sm',
        default: 'min-h-24 px-3.5 py-2.5 text-body-sm rounded-md',
        md: 'min-h-24 px-3.5 py-2.5 text-body-sm rounded-md',
        lg: 'min-h-32 px-4 py-3 text-body-md rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TextareaProps
  extends
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  error?: boolean;
  errorMessage?: string;
  warning?: boolean;
  warningMessage?: string;
  success?: boolean;
  successMessage?: string;
  helperText?: string;
  label?: string;
  labelAction?: React.ReactNode;
  required?: boolean;
  showCount?: boolean;
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      wrapperClassName,
      variant,
      size = 'default',
      error = false,
      errorMessage,
      warning = false,
      warningMessage,
      success = false,
      successMessage,
      helperText,
      label,
      labelAction,
      required = false,
      showCount = false,
      maxLength,
      disabled,
      id,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ''
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(String(value));
      }
    }, [value]);

    const hasError = Boolean(errorMessage) || Boolean(error);
    const hasWarning = !hasError && (Boolean(warningMessage) || Boolean(warning));
    const hasSuccess = !hasError && !hasWarning && (Boolean(successMessage) || Boolean(success));

    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;
    const warningId = `${textareaId}-warning`;
    const successId = `${textareaId}-success`;

    const describedBy = hasError
      ? errorId
      : hasWarning
        ? warningId
        : hasSuccess
          ? successId
          : helperText
            ? helperId
            : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const resolvedVariant =
      variant ?? (hasError ? 'error' : hasWarning ? 'warning' : hasSuccess ? 'success' : 'default');

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {(label || labelAction) && (
          <div className="mb-1.5 flex items-center justify-between w-full">
            {label ? (
              <Label htmlFor={textareaId} required={required}>
                {label}
              </Label>
            ) : (
              <span />
            )}
            {labelAction && <div className="text-caption">{labelAction}</div>}
          </div>
        )}

        <textarea
          id={textareaId}
          className={cn(
            textareaVariants({
              variant: resolvedVariant,
              size,
            }),
            className
          )}
          ref={ref}
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          {...props}
        />

        <div className="mt-1.5 flex items-center justify-between text-caption gap-2">
          <div className="flex-1">
            {errorMessage ? (
              <p
                id={errorId}
                role="alert"
                className="font-medium text-danger flex items-center gap-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-danger shrink-0" />
                <span>{errorMessage}</span>
              </p>
            ) : warningMessage ? (
              <p
                id={warningId}
                role="status"
                className="font-medium text-warning flex items-center gap-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                <span>{warningMessage}</span>
              </p>
            ) : successMessage ? (
              <p
                id={successId}
                role="status"
                className="font-medium text-success flex items-center gap-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                <span>{successMessage}</span>
              </p>
            ) : helperText ? (
              <p id={helperId} className="text-text-secondary">
                {helperText}
              </p>
            ) : null}
          </div>

          {showCount && maxLength !== undefined && (
            <span className="text-text-muted font-numeric text-[11px] shrink-0">
              {internalValue.length} / {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
