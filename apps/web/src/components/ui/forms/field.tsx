'use client';

import * as React from 'react';
import { Label } from './label';
import { cn } from '@/libs/utils';

interface FieldContextValue {
  controlId: string;
  errorId: string;
  warningId: string;
  successId: string;
  descriptionId: string;
  hasError: boolean;
  hasWarning: boolean;
  hasSuccess: boolean;
  required?: boolean;
  disabled?: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

export function useFieldContext() {
  return React.useContext(FieldContext);
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label content displayed above the input control */
  label?: React.ReactNode;
  /** Secondary action/link beside the label (e.g., "Forgot Password?", "Max") */
  labelAction?: React.ReactNode;
  /** Supporting helper text displayed below the control */
  description?: React.ReactNode;
  /** Non-blocking cautionary message (rendered in warning style; suppressed if error is present) */
  warning?: React.ReactNode;
  /** Blocking validation error message (rendered in danger style with role="alert") */
  error?: React.ReactNode;
  /** Positive validation confirmation message (rendered in success style) */
  success?: React.ReactNode;
  /** Optional character counter or metadata slot */
  characterCount?: React.ReactNode;
  /** Custom ID for the form control. If omitted, a unique ID is auto-generated */
  id?: string;
  /** Marks the field as required with an asterisk indicator and aria-required */
  required?: boolean;
  /** Marks the field and its controls as disabled */
  disabled?: boolean;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      label,
      labelAction,
      description,
      warning,
      error,
      success,
      characterCount,
      id,
      required,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const defaultId = React.useId();
    const controlId = id || defaultId;
    const errorId = `${controlId}-error`;
    const warningId = `${controlId}-warning`;
    const successId = `${controlId}-success`;
    const descriptionId = `${controlId}-description`;

    const hasError = Boolean(error);
    const hasWarning = !hasError && Boolean(warning);
    const hasSuccess = !hasError && !hasWarning && Boolean(success);

    // Build aria-describedby list based on active feedback
    const describedBy =
      cn(
        description && descriptionId,
        hasWarning && warningId,
        hasSuccess && successId,
        hasError && errorId
      ) || undefined;

    // Clone child to automatically bind control attributes if standard elements
    const renderedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as Record<string, unknown>;
        const isDomElement = typeof child.type === 'string';

        return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          id: childProps.id || controlId,
          ...(isDomElement
            ? {}
            : {
                error: childProps.error !== undefined ? childProps.error : hasError,
              }),
          'aria-invalid':
            childProps['aria-invalid'] !== undefined
              ? childProps['aria-invalid']
              : hasError || undefined,
          'aria-required':
            childProps['aria-required'] !== undefined
              ? childProps['aria-required']
              : required || undefined,
          'aria-describedby':
            cn(childProps['aria-describedby'] as string, describedBy) || undefined,
          disabled: childProps.disabled !== undefined ? childProps.disabled : disabled,
        });
      }
      return child;
    });

    const contextValue = React.useMemo<FieldContextValue>(
      () => ({
        controlId,
        errorId,
        warningId,
        successId,
        descriptionId,
        hasError,
        hasWarning,
        hasSuccess,
        required,
        disabled,
      }),
      [
        controlId,
        errorId,
        warningId,
        successId,
        descriptionId,
        hasError,
        hasWarning,
        hasSuccess,
        required,
        disabled,
      ]
    );

    return (
      <FieldContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('flex w-full flex-col space-y-1.5 font-body', className)}
          {...props}
        >
          {(label || labelAction) && (
            <div className="flex items-center justify-between w-full">
              {label ? (
                <Label htmlFor={controlId} required={required} action={labelAction}>
                  {label}
                </Label>
              ) : (
                <span />
              )}
            </div>
          )}

          {renderedChildren}

          <div className="flex items-center justify-between text-caption gap-2">
            <div className="flex-1">
              {description && !hasError && !hasWarning && !hasSuccess && (
                <p id={descriptionId} className="text-text-muted mt-1 leading-normal">
                  {description}
                </p>
              )}

              {hasSuccess && (
                <p
                  id={successId}
                  role="status"
                  className="font-medium text-success mt-1 leading-normal flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                  <span>{success}</span>
                </p>
              )}

              {hasWarning && (
                <p
                  id={warningId}
                  role="status"
                  className="font-medium text-warning mt-1 leading-normal flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  <span>{warning}</span>
                </p>
              )}

              {hasError && (
                <p
                  id={errorId}
                  role="alert"
                  className="font-medium text-danger mt-1 leading-normal flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            {characterCount && (
              <span className="text-text-muted font-numeric text-[11px] shrink-0 mt-1">
                {characterCount}
              </span>
            )}
          </div>
        </div>
      </FieldContext.Provider>
    );
  }
);
Field.displayName = 'Field';

export interface FieldLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ htmlFor, required, children, ...props }, ref) => {
    const ctx = useFieldContext();
    return (
      <Label
        ref={ref}
        htmlFor={htmlFor || ctx?.controlId}
        required={required !== undefined ? required : ctx?.required}
        {...props}
      >
        {children}
      </Label>
    );
  }
);
FieldLabel.displayName = 'FieldLabel';

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ className, id, ...props }, ref) => {
    const ctx = useFieldContext();
    return (
      <p
        ref={ref}
        id={id || ctx?.descriptionId}
        className={cn('text-caption text-text-muted mt-1 leading-normal', className)}
        {...props}
      />
    );
  }
);
FieldDescription.displayName = 'FieldDescription';

export interface FieldSuccessProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldSuccess = React.forwardRef<HTMLParagraphElement, FieldSuccessProps>(
  ({ className, id, children, ...props }, ref) => {
    const ctx = useFieldContext();
    return (
      <p
        ref={ref}
        id={id || ctx?.successId}
        role="status"
        className={cn(
          'text-caption font-medium text-success mt-1 leading-normal flex items-center gap-1.5',
          className
        )}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
        <span>{children}</span>
      </p>
    );
  }
);
FieldSuccess.displayName = 'FieldSuccess';

export interface FieldWarningProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldWarning = React.forwardRef<HTMLParagraphElement, FieldWarningProps>(
  ({ className, id, children, ...props }, ref) => {
    const ctx = useFieldContext();
    return (
      <p
        ref={ref}
        id={id || ctx?.warningId}
        role="status"
        className={cn(
          'text-caption font-medium text-warning mt-1 leading-normal flex items-center gap-1.5',
          className
        )}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
        <span>{children}</span>
      </p>
    );
  }
);
FieldWarning.displayName = 'FieldWarning';

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, id, children, ...props }, ref) => {
    const ctx = useFieldContext();
    return (
      <p
        ref={ref}
        id={id || ctx?.errorId}
        role="alert"
        className={cn(
          'text-caption font-medium text-danger mt-1 leading-normal flex items-center gap-1.5',
          className
        )}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
        <span>{children}</span>
      </p>
    );
  }
);
FieldError.displayName = 'FieldError';

export { Field, FieldLabel, FieldDescription, FieldSuccess, FieldWarning, FieldError };
