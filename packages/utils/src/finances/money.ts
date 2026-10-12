/**
 * Safely rounds numeric monetary amounts to 2 decimal places.
 * Mitigates IEEE 754 floating-point drift in arithmetic.
 */
export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const inrPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });

/** 12345 -> "₹12,345" */
export function formatInr(n: number): string {
  return inr.format(Number.isFinite(n) ? n : 0);
}

/** 12345.5 -> "₹12,345.50" (formal statements, invoices, detailed ledgers) */
export function formatInrPrecise(n: number): string {
  return inrPrecise.format(Number.isFinite(n) ? n : 0);
}

/** 125000 -> "₹1.3L" (axis ticks, tight spaces) */
export function formatCompactInr(n: number): string {
  return `₹${compact.format(Number.isFinite(n) ? n : 0)}`;
}

/** 42.456 -> "42%" */
export function formatPercent(n: number, digits = 0): string {
  return `${(Number.isFinite(n) ? n : 0).toFixed(digits)}%`;
}
