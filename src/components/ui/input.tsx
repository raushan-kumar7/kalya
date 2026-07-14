// "use client";

// import * as React from "react";
// import { cn } from "@/lib/utils";
// import { Eye, EyeOff, X, Loader2 } from "lucide-react";

// export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   startIcon?: React.ReactNode;
//   endIcon?: React.ReactNode;
//   isLoading?: boolean;
//   isClearable?: boolean;
//   onClear?: () => void;
//   error?: boolean;
// }

// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   (
//     {
//       className,
//       type = "text",
//       startIcon,
//       endIcon,
//       isLoading = false,
//       isClearable = false,
//       onClear,
//       error = false,
//       disabled,
//       value,
//       onChange,
//       ...props
//     },
//     ref
//   ) => {
//     const [showPassword, setShowPassword] = React.useState(false);
//     const isPassword = type === "password";
//     const currentType = isPassword ? (showPassword ? "text" : "password") : type;

//     const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
//       e.preventDefault();
//       e.stopPropagation();
//       if (onClear) {
//         onClear();
//       }
//     };

//     return (
//       <div className="relative flex w-full items-center">
//         {startIcon && (
//           <div className="text-text-muted pointer-events-none absolute left-3 flex items-center justify-center">
//             {startIcon}
//           </div>
//         )}

//         {/* <input
//           type={currentType}
//           className={cn(
//             "flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted hover:border-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//             startIcon && "pl-10",
//             (endIcon || isLoading || isClearable || isPassword) && "pr-10",
//             error && "border-danger focus-visible:ring-danger",
//             className
//           )}
//           ref={ref}
//           value={value}
//           onChange={onChange}
//           disabled={disabled || isLoading}
//           {...props}
//         /> */}

//         <input
//           type={currentType}
//           className={cn(
//             "border-border bg-surface text-text-primary placeholder:text-text-muted hover:border-text-secondary focus-visible:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
//             startIcon && "pl-10",
//             (endIcon || isLoading || isClearable || isPassword) && "pr-10",
//             error && "border-danger focus-visible:ring-danger",
//             className
//           )}
//           ref={ref}
//           value={value}
//           onChange={onChange}
//           disabled={disabled || isLoading}
//           suppressHydrationWarning
//           {...props}
//         />

//         <div className="absolute right-3 flex items-center gap-1.5">
//           {isLoading && <Loader2 className="text-text-muted h-4 w-4 animate-spin" />}

//           {!isLoading && isClearable && value && (
//             <button
//               type="button"
//               onClick={handleClear}
//               className="text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm p-0.5 focus-visible:ring-1 focus-visible:outline-none"
//               aria-label="Clear input"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           )}

//           {!isLoading && isPassword && (
//             <button
//               type="button"
//               onClick={() => setShowPassword((prev) => !prev)}
//               disabled={disabled}
//               className="text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm p-0.5 focus-visible:ring-1 focus-visible:outline-none"
//               aria-label={showPassword ? "Hide password" : "Show password"}
//             >
//               {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </button>
//           )}

//           {!isLoading && !isPassword && endIcon && (
//             <div className="text-text-muted pointer-events-none flex items-center justify-center">
//               {endIcon}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }
// );
// Input.displayName = "Input";

// export { Input };


"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-lg border bg-surface font-body text-text-primary " +
    "placeholder:text-text-muted transition-colors duration-150 " +
    "focus-visible:outline-none focus-visible:ring-4 " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface-raised " +
    // Hide native WebKit/Edge input decorations so they don't duplicate our own controls.
    "[&::-webkit-search-cancel-button]:appearance-none " +
    "[&::-webkit-search-decoration]:appearance-none " +
    "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden",
  {
    variants: {
      variant: {
        default:
          "border-border hover:border-text-secondary focus-visible:border-primary focus-visible:ring-primary/15",
        error:
          "border-danger hover:border-danger focus-visible:border-danger focus-visible:ring-danger/15",
      },
      size: {
        sm: "h-9 text-body-sm",
        md: "h-11 text-body-sm",
        lg: "h-[3.25rem] text-body-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const iconSizeBySize = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
} as const;

const paddingBySize = {
  sm: { base: "px-3", withLeft: "pl-9", withRight: "pr-9" },
  md: { base: "px-4", withLeft: "pl-10", withRight: "pr-10" },
  lg: { base: "px-4", withLeft: "pl-11", withRight: "pr-11" },
} as const;

type InputSize = keyof typeof iconSizeBySize;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Icon on the left side of the field */
  leadingIcon?: React.ReactNode;
  /** Icon on the right side. Hidden if reveal/clear/loading is active */
  trailingIcon?: React.ReactNode;
  /** Show a clear (×) button once there's a value */
  clearable?: boolean;
  /** Called when the clear button is clicked */
  onClear?: () => void;
  /** Show a spinner in the trailing slot */
  loading?: boolean;
  /** Error text below the field; also forces variant="error" */
  errorMessage?: string;
  /** Helper text below the field, shown when there's no error */
  helperText?: string;
  /** Label above the field */
  label?: string;
  /** Marks the field required and shows a red asterisk next to the label */
  required?: boolean;
  /** className for the outer wrapper div, separate from the input itself */
  wrapperClassName?: string;
}

/** Clones a user-supplied icon element, applying our size class as a default
 *  that the icon's own className (if any) can still override via cn's merge. */
function sizeIcon(icon: React.ReactNode, size: InputSize) {
  if (!React.isValidElement(icon)) return icon;
  const el = icon as React.ReactElement<{ className?: string }>;
  return React.cloneElement(el, {
    className: cn(iconSizeBySize[size], el.props.className),
  });
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      type = "text",
      variant,
      size,
      leadingIcon,
      trailingIcon,
      loading = false,
      clearable = false,
      onClear,
      errorMessage,
      helperText,
      label,
      required = false,
      disabled,
      value,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;
    const hasError = Boolean(errorMessage);
    const resolvedSize: InputSize = size ?? "md";

    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasTrailingContent = Boolean(trailingIcon) || loading || clearable || isPassword;
    const padding = paddingBySize[resolvedSize];

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClear?.();
    };

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-body-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="ml-0.5 text-danger">*</span>}
          </label>
        )}

        <div className="relative flex w-full items-center">
          {leadingIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-text-muted">
              {sizeIcon(leadingIcon, resolvedSize)}
            </div>
          )}

          <input
            id={inputId}
            type={currentType}
            className={cn(
              inputVariants({ variant: hasError ? "error" : variant, size: resolvedSize }),
              padding.base,
              leadingIcon && padding.withLeft,
              hasTrailingContent && padding.withRight,
              className
            )}
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled || loading}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            aria-required={required || undefined}
            suppressHydrationWarning
            {...props}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {loading && (
              <Loader2 className={cn(iconSizeBySize[resolvedSize], "animate-spin text-text-muted")} />
            )}

            {!loading && clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-sm p-0.5 text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                aria-label="Clear input"
              >
                <X className={iconSizeBySize[resolvedSize]} />
              </button>
            )}

            {!loading && isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={disabled}
                className="rounded-sm p-0.5 text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className={iconSizeBySize[resolvedSize]} />
                ) : (
                  <Eye className={iconSizeBySize[resolvedSize]} />
                )}
              </button>
            )}

            {!loading && !isPassword && !clearable && trailingIcon && (
              <div className="pointer-events-none flex items-center justify-center text-text-muted">
                {sizeIcon(trailingIcon, resolvedSize)}
              </div>
            )}
          </div>
        </div>

        {hasError ? (
          <p id={errorId} className="mt-1.5 text-body-sm text-danger">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 text-body-sm text-text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };