'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/states';

export function TransactionsTableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      {/* Table Header Placeholder */}
      <div className="h-11 border-b border-border bg-surface-raised px-4 flex items-center gap-6">
        <Skeleton className="h-4 w-6 rounded-xs" />
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md hidden md:block" />
        <Skeleton className="h-4 w-16 rounded-md hidden md:block" />
        <Skeleton className="h-4 w-20 rounded-md hidden lg:block" />
        <Skeleton className="h-4 w-20 rounded-md ml-auto" />
        <Skeleton className="h-4 w-24 rounded-md hidden sm:block" />
        <Skeleton className="h-4 w-8 rounded-md" />
      </div>

      {/* Row Placeholders */}
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-3.5">
            <Skeleton className="h-4 w-4 rounded-xs shrink-0" />
            <Skeleton className="h-4 w-20 rounded-md shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-2.5 w-24 rounded-md" />
            </div>
            <div className="hidden md:flex items-center gap-2 w-28 shrink-0">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full hidden md:block shrink-0" />
            <Skeleton className="h-4 w-20 rounded-md hidden lg:block shrink-0" />
            <Skeleton className="h-4 w-20 rounded-md ml-auto shrink-0" />
            <Skeleton className="h-5 w-24 rounded-md hidden sm:block shrink-0" />
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionsSkeleton() {
  return <TransactionsTableSkeleton rows={7} />;
}
