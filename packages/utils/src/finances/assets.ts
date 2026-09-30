import { roundMoney } from './money';

/**
 * Calculates current market valuation of precious metals / commodities.
 */
export function calculateDigitalAssetValuation(
  weightInGrams: number,
  currentRatePerGram: number
): number {
  return roundMoney(Math.max(0, weightInGrams) * Math.max(0, currentRatePerGram));
}

/**
 * Calculates current valuation of equity stock shares.
 */
export function calculateEquityValuation(totalShares: number, pricePerShare: number): number {
  return roundMoney(Math.max(0, totalShares) * Math.max(0, pricePerShare));
}
