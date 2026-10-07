'use client';

import { Badge } from '@/components/ui';

export type UsageTone = 'success' | 'warning' | 'danger';

export interface UsageStatus {
  tone: UsageTone;
  label: 'Under' | 'Warning' | 'Over';
}

/**
 * Single source of truth for "how full is this limit?".
 * Budgets pass their own thresholds (server defaults: amber 80, red 100).
 * The Overview widget can call this too, so both screens agree.
 */
export function usageStatus(pct: number, amber = 80, red = 100): UsageStatus {
  if (pct >= red) return { tone: 'danger', label: 'Over' };
  if (pct >= amber) return { tone: 'warning', label: 'Warning' };
  return { tone: 'success', label: 'Under' };
}

export const usagePct = (spent: number, limit: number) => (limit > 0 ? (spent / limit) * 100 : 0);

export function UsageBadge({ status, className }: { status: UsageStatus; className?: string }) {
  return (
    <Badge variant={status.tone} size="sm" dot dotColor={status.tone} className={className}>
      {status.label}
    </Badge>
  );
}
