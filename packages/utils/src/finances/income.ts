import { roundMoney } from './money';

/**
 * Calculates net available income from primary, secondary, and carry-over balances.
 */
export function calculateNetIncome(
  salary: number,
  other: number = 0,
  carryOver: number = 0
): number {
  const sum = (salary || 0) + (other || 0) + (carryOver || 0);
  return roundMoney(Math.max(0, sum));
}
