"use client";

import { useEffect } from "react";
import { Icon } from "@/components/shared/logo";
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <Icon width={48} height={48} />

      <div className="flex flex-col items-center gap-2">
        <span className="rounded-full bg-danger-subtle px-3 py-1 text-caption font-medium text-danger">
          Something went wrong
        </span>
        <h1 className="font-display text-display-md text-text-primary">
          We hit a snag
        </h1>
        <p className="max-w-md text-body-md text-text-secondary">
          An unexpected error occurred. Try again, or head back home if the
          problem continues.
        </p>
        {error.digest && (
          <p className="font-numeric text-caption text-text-muted">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-primary px-5 py-2.5 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border bg-surface px-5 py-2.5 text-body-sm font-medium text-text-primary transition-colors hover:bg-surface-raised"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}