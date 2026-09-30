import { roundMoney } from './money';

/**
 * Computes savings goal pace and recommended monthly allocation.
 */
export function calculateGoalPace(
  targetAmount: number,
  currentProgress: number,
  targetDate: string | Date
): {
  progressPercentage: number;
  remainingAmount: number;
  monthsRemaining: number;
  recommendedMonthly: number;
  isOnTrack: boolean;
} {
  const safeTarget = roundMoney(targetAmount);
  const safeProgress = roundMoney(currentProgress);
  const remainingAmount = roundMoney(Math.max(0, safeTarget - safeProgress));
  const progressPercentage = safeTarget > 0 ? roundMoney((safeProgress / safeTarget) * 100) : 100;

  const now = new Date();
  const target = new Date(targetDate);
  const diffMonths =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  const monthsRemaining = Math.max(1, diffMonths);

  const recommendedMonthly = roundMoney(remainingAmount / monthsRemaining);
  const isOnTrack = progressPercentage >= 100 || safeProgress >= recommendedMonthly;

  return {
    progressPercentage,
    remainingAmount,
    monthsRemaining,
    recommendedMonthly,
    isOnTrack,
  };
}
