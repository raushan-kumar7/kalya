"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, X, Loader2 } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isLoading?: boolean;
  isClearable?: boolean;
  onClear?: () => void;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      startIcon,
      endIcon,
      isLoading = false,
      isClearable = false,
      onClear,
      error = false,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClear) {
        onClear();
      }
    };

    return (
      <div className="relative flex items-center w-full">
        {startIcon && (
          <div className="absolute left-3 flex items-center justify-center text-text-muted pointer-events-none">
            {startIcon}
          </div>
        )}

        <input
          type={currentType}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted hover:border-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            startIcon && "pl-10",
            (endIcon || isLoading || isClearable || isPassword) && "pr-10",
            error && "border-danger focus-visible:ring-danger",
            className
          )}
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled || isLoading}
          {...props}
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
          )}

          {!isLoading && isClearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-text-muted hover:text-text-primary rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {!isLoading && isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              className="text-text-muted hover:text-text-primary rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {!isLoading && !isPassword && endIcon && (
            <div className="text-text-muted flex items-center justify-center pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
