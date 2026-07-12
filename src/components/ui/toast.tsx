"use client";

import * as React from "react";
import { Toaster as HotToaster, toast } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        className: "border border-border bg-surface text-text-primary rounded-lg shadow-md font-body text-sm px-4 py-2.5 flex items-center gap-2",
        duration: 4000,
        success: {
          iconTheme: {
            primary: "var(--color-success)",
            secondary: "var(--color-surface)",
          },
          className: "border border-success/20 bg-success-subtle text-success rounded-lg shadow-md font-body text-sm px-4 py-2.5 flex items-center gap-2",
        },
        error: {
          iconTheme: {
            primary: "var(--color-danger)",
            secondary: "var(--color-surface)",
          },
          className: "border border-danger/20 bg-danger-subtle text-danger rounded-lg shadow-md font-body text-sm px-4 py-2.5 flex items-center gap-2",
        },
      }}
    />
  );
}

export { toast };
