import type { UnifiedTransactionItem } from '../transactions/types';
import { computeSummaryMetrics } from '../transactions/summary';
import type { OverviewKpis } from './types';

/**
 * Reuses the Transactions summary strip, so both pages show identical numbers
 * by construction. Only adds what is specific to Overview.
 */
export function computeOverviewKpis(
  items: UnifiedTransactionItem[],
  selectedMonth: string
): OverviewKpis {
  const summary = computeSummaryMetrics(items, selectedMonth);
  const savingsRate =
    summary.totalIncome > 0 ? Math.round((summary.netCashflow / summary.totalIncome) * 100) : 0;
  return { ...summary, savingsRate };
}
