'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Label } from './label';
import { FOCUS_RING, INTERACTION_STATES, ICON_SIZES } from '@/components/ui/constants';

const inputVariants = cva(
  cn(
    'flex w-full min-w-0 font-body text-text-primary placeholder:text-text-muted transition-colors duration-150',
    INTERACTION_STATES.disabled,
    '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden'
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
        unstyled:
          'border-0 bg-transparent rounded-none shadow-none outline-none ring-0 ring-offset-0 focus:border-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
      },
      size: {
        xs: 'h-7 text-[11px] rounded-xs',
        sm: 'h-8.5 text-caption rounded-sm',
        default: 'h-10 text-body-sm rounded-md',
        md: 'h-10 text-body-sm rounded-md',
        lg: 'h-12 text-body-md rounded-md',
        xl: 'h-14 text-body-lg rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const iconSizeBySize = {
  xs: ICON_SIZES.xs,
  sm: ICON_SIZES.sm,
  default: ICON_SIZES.md,
  md: ICON_SIZES.md,
  lg: ICON_SIZES.lg,
  xl: ICON_SIZES.xl,
} as const;

type InputSize = keyof typeof iconSizeBySize;

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Icon on the left side of the field */
  leadingIcon?: React.ReactNode;
  /** Icon on the right side. Hidden if reveal/clear/loading is active */
  trailingIcon?: React.ReactNode;
  /** Text prefix displayed inside the input container (e.g. '$', 'https://') */
  prefixText?: string;
  /** Text suffix displayed inside the input container (e.g. 'USD', '%') */
  suffixText?: string;
  /** Show a clear (×) button once there's a value */
  clearable?: boolean;
  /** Called when the clear button is clicked */
  onClear?: () => void;
  /** Show a spinner in the trailing slot */
  loading?: boolean;
  /** Error text below the field; also forces variant="error" */
  errorMessage?: string;
  /** Boolean error flag (styling only; use errorMessage to show text) */
  error?: boolean;
  /** Warning message below the field */
  warningMessage?: string;
  /** Boolean warning flag */
  warning?: boolean;
  /** Success message below the field */
  successMessage?: string;
  /** Boolean success flag */
  success?: boolean;
  /** Helper text below the field, shown when there's no status message */
  helperText?: string;
  /** Label above the field */
  label?: string;
  /** Secondary action beside the label (e.g., 'Forgot password?') */
  labelAction?: React.ReactNode;
  /** Marks the field required and shows an asterisk next to the label */
  required?: boolean;
  /** Display character counter (e.g., current / maxLength) */
  showCount?: boolean;
  /** className for the outer wrapper div, separate from the input itself */
  wrapperClassName?: string;
  /** Indicates whether the input is rendered inside a compound InputGroup */
  inGroup?: boolean;
}

function sizeIcon(icon: React.ReactNode, size: InputSize) {
  if (!React.isValidElement(icon)) return icon;
  const el = icon as React.ReactElement<{ className?: string }>;
  return React.cloneElement(el, {
    className: cn(iconSizeBySize[size] || iconSizeBySize.default, el.props.className),
  });
}

const iconButtonClass =
  'rounded-xs p-0.5 text-text-muted cursor-pointer transition-colors hover:text-text-primary ' +
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ' +
  'disabled:pointer-events-none disabled:opacity-50';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      type = 'text',
      variant,
      size = 'default',
      leadingIcon,
      trailingIcon,
      prefixText,
      suffixText,
      loading = false,
      clearable = false,
      onClear,
      errorMessage,
      error,
      warningMessage,
      warning,
      successMessage,
      success,
      helperText,
      label,
      labelAction,
      required = false,
      showCount = false,
      maxLength,
      disabled,
      value,
      defaultValue,
      onChange,
      id,
      inGroup = false,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ''
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(String(value));
      }
    }, [value]);

    const isPassword = type === 'password';
    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const hasError = Boolean(errorMessage) || Boolean(error);
    const hasWarning = !hasError && (Boolean(warningMessage) || Boolean(warning));
    const hasSuccess = !hasError && !hasWarning && (Boolean(successMessage) || Boolean(success));

    const resolvedSize: InputSize =
      size && size in iconSizeBySize ? (size as InputSize) : 'default';

    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const warningId = `${inputId}-warning`;
    const successId = `${inputId}-success`;

    const hasValue = internalValue.length > 0;
    const showClear = !loading && clearable && hasValue && !disabled;
    const iconSizeClass = iconSizeBySize[resolvedSize] || iconSizeBySize.default;

    const describedBy =
      cn(
        ariaDescribedBy,
        hasError
          ? errorId
          : hasWarning
            ? warningId
            : hasSuccess
              ? successId
              : helperText
                ? helperId
                : undefined
      ) || undefined;

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setInternalValue('');
      onClear?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const resolvedVariant =
      variant ??
      (inGroup
        ? 'unstyled'
        : hasError
          ? 'error'
          : hasWarning
            ? 'warning'
            : hasSuccess
              ? 'success'
              : 'default');

    // Padding calculations
    const horizontalPad =
      resolvedSize === 'xs'
        ? 'px-2.5'
        : resolvedSize === 'sm'
          ? 'px-3'
          : resolvedSize === 'lg'
            ? 'px-4'
            : resolvedSize === 'xl'
              ? 'px-5'
              : 'px-3.5';

    const hasLeftAffix = Boolean(leadingIcon) || Boolean(prefixText);
    const hasRightAffix =
      Boolean(trailingIcon) ||
      Boolean(suffixText) ||
      loading ||
      clearable ||
      isPassword ||
      hasSuccess ||
      hasWarning;

    return (
      <div
        className={cn(
          inGroup ? 'h-full flex-1 min-w-0 flex items-center' : 'w-full',
          wrapperClassName
        )}
      >
        {!inGroup && (label || labelAction) && (
          <div className="mb-1.5 flex items-center justify-between w-full">
            {label ? (
              <Label htmlFor={inputId} required={required}>
                {label}
              </Label>
            ) : (
              <span />
            )}
            {labelAction && <div className="text-caption">{labelAction}</div>}
          </div>
        )}

        <div className={cn('relative flex w-full items-center', inGroup && 'h-full')}>
          {/* Leading Icon or Prefix Text */}
          {hasLeftAffix && (
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-1.5 text-text-muted select-none">
              {leadingIcon && sizeIcon(leadingIcon, resolvedSize)}
              {prefixText && (
                <span className="text-caption font-numeric font-medium text-text-secondary">
                  {prefixText}
                </span>
              )}
            </div>
          )}

          <input
            id={inputId}
            type={currentType}
            className={cn(
              inputVariants({
                variant: resolvedVariant,
                size: resolvedSize,
              }),
              horizontalPad,
              hasLeftAffix && (prefixText ? 'pl-9' : 'pl-9.5'),
              hasRightAffix && 'pr-10',
              inGroup && 'h-full rounded-none border-0 bg-transparent shadow-none',
              className
            )}
            ref={ref}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            maxLength={maxLength}
            disabled={disabled || loading}
            aria-invalid={ariaInvalid ?? (hasError || undefined)}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            aria-busy={loading || undefined}
            suppressHydrationWarning
            {...props}
          />

          {/* Trailing Controls: Suffix, Status icon, Clear, Password toggle, Custom trailing */}
          {hasRightAffix && (
            <div className="absolute inset-y-0 right-3 flex items-center gap-1.5 select-none">
              {suffixText && (
                <span className="text-caption font-numeric font-medium text-text-secondary pointer-events-none">
                  {suffixText}
                </span>
              )}

              {loading && (
                <Loader2
                  aria-hidden="true"
                  className={cn(iconSizeClass, 'animate-spin text-text-muted')}
                />
              )}

              {showClear && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={iconButtonClass}
                  aria-label="Clear input"
                >
                  <X className={iconSizeClass} />
                </button>
              )}

              {!loading && isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={disabled}
                  className={iconButtonClass}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className={iconSizeClass} />
                  ) : (
                    <Eye className={iconSizeClass} />
                  )}
                </button>
              )}

              {/* Status Icons if not loading and not clearable */}
              {!loading && !isPassword && !clearable && (
                <>
                  {hasSuccess && (
                    <CheckCircle2 className={cn(iconSizeClass, 'text-success shrink-0')} />
                  )}
                  {hasWarning && (
                    <AlertTriangle className={cn(iconSizeClass, 'text-warning shrink-0')} />
                  )}
                  {!hasSuccess && !hasWarning && trailingIcon && (
                    <div className="pointer-events-none flex items-center justify-center text-text-muted">
                      {sizeIcon(trailingIcon, resolvedSize)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Validation and Helper Messages + Character Counter */}
        {!inGroup && (
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
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
