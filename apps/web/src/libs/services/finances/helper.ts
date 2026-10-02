import { Budget } from '@kalya/types';

/**
 * Budget evaluation response returned by /budgets/:id/health
 */
export interface BudgetHealthEvaluation extends Budget {
  spent: number;
  percentage: number;
  remaining: number;
}

/**
 * Portfolio net worth breakdown returned by /assets/portfolio-summary
 */
export interface PortfolioSummaryResponse {
  total_commodities_value: number;
  total_equities_value: number;
  total_portfolio_net_worth: number;
}

/**
 * Helper to construct clean URL query strings from DTO record
 */
export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}
