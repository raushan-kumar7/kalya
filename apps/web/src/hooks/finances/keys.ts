import {
  BudgetFilterQueryDto,
  DigitalAssetFilterQueryDto,
  EquityAssetFilterQueryDto,
  ExpenseFilterQueryDto,
  GoalFilterQueryDto,
  IncomeFilterQueryDto,
} from '@kalya/types';

export const financeKeys = {
  all: ['finances'] as const,
  buckets: () => [...financeKeys.all, 'buckets'] as const,
  bucketDetail: (id: string) => [...financeKeys.all, 'buckets', id] as const,
  categories: (bucketId?: string) => [...financeKeys.all, 'categories', { bucketId }] as const,
  categoryDetail: (id: string) => [...financeKeys.all, 'categories', id] as const,
  income: (query?: IncomeFilterQueryDto) => [...financeKeys.all, 'income', query] as const,
  incomeDetail: (id: string) => [...financeKeys.all, 'income', id] as const,
  budgets: (query?: BudgetFilterQueryDto) => [...financeKeys.all, 'budgets', query] as const,
  budgetDetail: (id: string) => [...financeKeys.all, 'budgets', id] as const,
  budgetHealth: (id: string) => [...financeKeys.all, 'budgets', id, 'health'] as const,
  expenses: (query?: ExpenseFilterQueryDto) => [...financeKeys.all, 'expenses', query] as const,
  expenseDetail: (id: string) => [...financeKeys.all, 'expenses', id] as const,
  splitsContacts: () => [...financeKeys.all, 'splits', 'contacts'] as const,
  splitsPending: () => [...financeKeys.all, 'splits', 'pending'] as const,
  goals: (query?: GoalFilterQueryDto) => [...financeKeys.all, 'goals', query] as const,
  goalDetail: (id: string) => [...financeKeys.all, 'goals', id] as const,
  assetsDigital: (query?: DigitalAssetFilterQueryDto) =>
    [...financeKeys.all, 'assets', 'digital', query] as const,
  assetsEquities: (query?: EquityAssetFilterQueryDto) =>
    [...financeKeys.all, 'assets', 'equities', query] as const,
  assetsPortfolio: () => [...financeKeys.all, 'assets', 'portfolio-summary'] as const,
  overview: (month: string) => [...financeKeys.all, 'summaries', 'overview', month] as const,
};
