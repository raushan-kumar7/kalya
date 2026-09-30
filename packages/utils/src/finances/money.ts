/**
 * Safely rounds numeric monetary amounts to 2 decimal places.
 * Mitigates IEEE 754 floating-point drift in arithmetic.
 */
export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
