"use client";

import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  id?: string;
  required?: boolean;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, label, description, error, id, required, children, ...props }, ref) => {
    // Generate a fallback unique ID if not provided, for accessibility association
    const defaultId = React.useId();
    const controlId = id || defaultId;
    const errorId = `${controlId}-error`;
    const descriptionId = `${controlId}-description`;

    // Clone the child component to automatically inject the id, error, and aria attributes
    const renderedChild = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<{ id?: string; error?: boolean; "aria-describedby"?: string }>, {
          id: controlId,
          error: !!error,
          "aria-describedby": cn(
            description && descriptionId,
            error && errorId
          ) || undefined,
        });
      }
      return child;
    });

    return (
      <div ref={ref} className={cn("flex flex-col space-y-1.5 w-full", className)} {...props}>
        {label && (
          <div className="flex items-center justify-between">
            <Label htmlFor={controlId} className="flex items-center gap-1">
              {label}
              {required && <span className="text-danger" aria-hidden="true">*</span>}
            </Label>
          </div>
        )}

        {renderedChild}

        {description && !error && (
          <p id={descriptionId} className="text-xs text-text-muted leading-none mt-1">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-xs text-danger font-medium leading-none mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Field.displayName = "Field";

export { Field };
