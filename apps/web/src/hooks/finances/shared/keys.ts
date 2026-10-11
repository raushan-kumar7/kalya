import type { QueryKey } from '@tanstack/react-query';
import type {
  BudgetFilterQueryDto,
  DigitalAssetFilterQueryDto,
  EquityAssetFilterQueryDto,
  ExpenseFilterQueryDto,
  GoalFilterQueryDto,
  IncomeFilterQueryDto,
} from '@kalya/types';

const root = ['finances'] as const;

/**
 * Every key is typed as the general `QueryKey` (readonly unknown[]) on purpose.
 * Narrow `as const` tuples clash with `QueryOverrides` when an options object
 * is spread into `useQuery`, which produces "No overload matches this call".
 */
const key = (...parts: unknown[]): QueryKey => parts;

/**
 * Standard key hierarchy for an entity:
 *   all    -> ['finances', name]
 *   lists  -> ['finances', name, 'list']
 *   list   -> ['finances', name, 'list', filters]
 *   detail -> ['finances', name, 'detail', id]
 *
 * Invalidating `lists()` matches ALL filtered lists because it is a key prefix.
 * Filters are normalised to `{}` so `list()` and `list({})` share one cache entry.
 */
function createScope(...path: string[]) {
  const all = key(...root, ...path);
  const lists = key(...all, 'list');
  return {
    all: (): QueryKey => all,
    lists: (): QueryKey => lists,
    list: (filters?: object): QueryKey => key(...lists, filters ?? {}),
    detail: (id: string): QueryKey => key(...all, 'detail', id),
  };
}

const buckets = createScope('buckets');
const categories = createScope('categories');
const income = createScope('income');
const budgets = createScope('budgets');
const expenses = createScope('expenses');
const goals = createScope('goals');
const splits = createScope('splits');
const assets = createScope('assets');
const summaries = createScope('summaries');

export const financeKeys = {
  all: root as QueryKey,

  buckets: {
    all: buckets.all,
    lists: buckets.lists,
    list: (): QueryKey => buckets.list(),
    detail: buckets.detail,
  },

  categories: {
    all: categories.all,
    lists: categories.lists,
    list: (bucketId?: string): QueryKey => categories.list({ bucketId }),
    detail: categories.detail,
  },

  income: {
    all: income.all,
    lists: income.lists,
    list: (query?: IncomeFilterQueryDto): QueryKey => income.list(query),
    detail: income.detail,
  },

  budgets: {
    all: budgets.all,
    lists: budgets.lists,
    list: (query?: BudgetFilterQueryDto): QueryKey => budgets.list(query),
    detail: budgets.detail,
    health: (id: string): QueryKey => key(...budgets.detail(id), 'health'),
  },

  expenses: {
    all: expenses.all,
    lists: expenses.lists,
    list: (query?: ExpenseFilterQueryDto): QueryKey => expenses.list(query),
    detail: expenses.detail,
  },

  goals: {
    all: goals.all,
    lists: goals.lists,
    list: (query?: GoalFilterQueryDto): QueryKey => goals.list(query),
    detail: goals.detail,
  },

  splits: {
    all: splits.all,
    contacts: (): QueryKey => key(...splits.all(), 'contacts'),
    pending: (): QueryKey => key(...splits.all(), 'pending'),
    suggestions: (): QueryKey => key(...splits.all(), 'suggestions'),
    invitations: (): QueryKey => key(...splits.all(), 'invitations'),
  },

  assets: {
    all: assets.all,
    digital: (query?: DigitalAssetFilterQueryDto): QueryKey =>
      key(...assets.all(), 'digital', query ?? {}),
    equities: (query?: EquityAssetFilterQueryDto): QueryKey =>
      key(...assets.all(), 'equities', query ?? {}),
    portfolio: (): QueryKey => key(...assets.all(), 'portfolio-summary'),
  },

  summaries: {
    all: summaries.all,
    overview: (month: string): QueryKey => key(...summaries.all(), 'overview', month),
  },
};
