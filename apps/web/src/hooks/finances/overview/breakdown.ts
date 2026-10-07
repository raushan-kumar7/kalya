import { roundMoney } from '@kalya/utils';
import type { Bucket } from '@kalya/types';
import type { UnifiedTransactionItem } from '../transactions/types';
import { spentAmount } from '../transactions/summary';
import type { BucketSpend } from './types';

const UNCATEGORISED = 'uncategorised';

/** Your share of spend per bucket. Expects items of ONE month. */
export function computeBucketBreakdown(monthItems: UnifiedTransactionItem[]): BucketSpend[] {
  const byKey = new Map<string, { bucket?: Bucket; amount: number }>();
  let total = 0;

  for (const item of monthItems) {
    if (item.kind === 'income') continue;
    const amount = spentAmount(item);
    if (amount <= 0) continue;

    const key = item.bucket?.id ?? UNCATEGORISED;
    const row = byKey.get(key);
    if (row) row.amount += amount;
    else byKey.set(key, { bucket: item.bucket, amount });
    total += amount;
  }

  return [...byKey]
    .map(([key, { bucket, amount }]) => ({
      key,
      bucket,
      amount: roundMoney(amount),
      percent: total ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}
