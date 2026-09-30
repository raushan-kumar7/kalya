import { BudgetStatus } from '@kalya/types';
import { roundMoney } from './money';

/**
 * Determines budget consumption status and percentage based on amber/red alert thresholds.
 */
export function calculateBudgetStatus(
  budgetAmount: number,
  spentAmount: number,
  amberThreshold: number = 80,
  redThreshold: number = 100
): { status: BudgetStatus; percentage: number; remaining: number } {
  const safeBudget = roundMoney(budgetAmount);
  const safeSpent = roundMoney(spentAmount);

  if (safeBudget <= 0) {
    return {
      status: safeSpent > 0 ? 'over' : 'under',
      percentage: safeSpent > 0 ? 100 : 0,
      remaining: 0,
    };
  }

  const percentage = roundMoney((safeSpent / safeBudget) * 100);
  const remaining = roundMoney(Math.max(0, safeBudget - safeSpent));

  let status: BudgetStatus = 'under';
  if (percentage >= redThreshold) {
    status = 'over';
  } else if (percentage >= amberThreshold) {
    status = 'warning';
  }

  return { status, percentage, remaining };
}
