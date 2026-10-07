import { roundMoney } from './money';

/**
 * Computes savings goal pace and recommended monthly allocation.
 */
export function calculateGoalPace(
  targetAmount: number,
  currentProgress: number,
  targetDate: string | Date,
  monthlyContributionPlan: number = 0
): {
  progressPercentage: number;
  remainingAmount: number;
  monthsRemaining: number;
  recommendedMonthly: number;
  isOnTrack: boolean;
  isOverdue: boolean;
  projectedMonths?: number;
} {
  const safeTarget = roundMoney(targetAmount);
  const safeProgress = roundMoney(currentProgress);
  const remainingAmount = roundMoney(Math.max(0, safeTarget - safeProgress));
  const progressPercentage = safeTarget > 0 ? roundMoney((safeProgress / safeTarget) * 100) : 100;

  const now = new Date();
  const target = new Date(targetDate);
  const diffMonths =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  const isOverdue = diffMonths < 0 && remainingAmount > 0;
  const monthsRemaining = Math.max(0, diffMonths);

  const recommendedMonthly =
    monthsRemaining > 0 ? roundMoney(remainingAmount / monthsRemaining) : remainingAmount;

  const safeMonthlyPlan = roundMoney(monthlyContributionPlan);
  // On track if 100% completed, or if not overdue and planned saving meets/exceeds recommended
  // Or if no plan yet specified but progress is already at target
  const isOnTrack =
    progressPercentage >= 100 ||
    (!isOverdue &&
      (safeMonthlyPlan > 0
        ? safeMonthlyPlan >= recommendedMonthly
        : safeProgress >= recommendedMonthly));

  const projectedMonths =
    remainingAmount <= 0
      ? 0
      : safeMonthlyPlan > 0
        ? Math.ceil(remainingAmount / safeMonthlyPlan)
        : undefined;

  return {
    progressPercentage,
    remainingAmount,
    monthsRemaining,
    recommendedMonthly,
    isOnTrack,
    isOverdue,
    projectedMonths,
  };
}
