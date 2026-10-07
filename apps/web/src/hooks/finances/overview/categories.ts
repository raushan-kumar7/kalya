import { roundMoney } from '@kalya/utils';
import type { UnifiedTransactionItem } from '../transactions/types';
import { spentAmount } from '../transactions/summary';
import type { TopCategorySpend } from './types';

/**
 * Calculates top spending categories for the selected month items.
 */
export function computeTopCategories(
  monthItems: UnifiedTransactionItem[],
  limit = 5
): TopCategorySpend[] {
  const byCategory = new Map<string, number>();
  let totalSpent = 0;

  for (const item of monthItems) {
    if (item.kind === 'income') continue;
    const amt = spentAmount(item);
    if (amt <= 0) continue;

    const name = item.category?.label?.trim() || 'Uncategorised';
    byCategory.set(name, (byCategory.get(name) ?? 0) + amt);
    totalSpent += amt;
  }

  return [...byCategory.entries()]
    .map(([category, spent]) => ({
      category,
      spent: roundMoney(spent),
      percent: totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit);
}
