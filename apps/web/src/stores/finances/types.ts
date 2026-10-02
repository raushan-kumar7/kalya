import { PortfolioSummaryResponse } from '@/libs/services/finances';
import { ExpenseFilterQueryDto, MonthlyFinancialOverview } from '@kalya/types';

export type FinanceModalType =
  | 'add-expense'
  | 'edit-expense'
  | 'add-income'
  | 'create-budget'
  | 'add-goal'
  | 'settle-split'
  | 'add-digital-asset'
  | 'add-equity-asset'
  | 'seed-defaults'
  | null;

export interface FinancesState {
  /** Active selected budget cycle month in YYYY-MM format */
  selectedMonth: string;
  /** Active bucket filter for category/budget views */
  selectedBucketId: string | null;
  /** Active category filter for transaction queries */
  selectedCategoryId: string | null;
  /** Reactive query filter state for ledger transactions */
  expenseFilters: ExpenseFilterQueryDto;
  /** Cached overview for current month for zero-latency dashboard cards */
  cachedOverview: MonthlyFinancialOverview | null;
  /** Cached total portfolio valuation */
  cachedPortfolioSummary: PortfolioSummaryResponse | null;

  // Selected item contexts for drawers & modals
  activeExpenseId: string | null;
  activeBudgetId: string | null;
  activeGoalId: string | null;
  activeSplitShareId: string | null;
  activeContactId: string | null;

  // Active dialog modal state
  activeModal: FinanceModalType;
  isHydrated: boolean;
}

export interface FinancesActions {
  /** Sets current working month ('YYYY-MM') */
  setSelectedMonth: (month: string) => void;
  /** Sets active bucket filter */
  setSelectedBucketId: (bucketId: string | null) => void;
  /** Sets active category filter */
  setSelectedCategoryId: (categoryId: string | null) => void;
  /** Updates partial expense filters */
  setExpenseFilters: (filters: Partial<ExpenseFilterQueryDto>) => void;
  /** Resets expense filters back to initial defaults */
  resetExpenseFilters: () => void;
  /** Caches monthly overview */
  setCachedOverview: (overview: MonthlyFinancialOverview | null) => void;
  /** Caches portfolio valuation */
  setCachedPortfolioSummary: (summary: PortfolioSummaryResponse | null) => void;

  // Context selection actions
  setActiveExpenseId: (id: string | null) => void;
  setActiveBudgetId: (id: string | null) => void;
  setActiveGoalId: (id: string | null) => void;
  setActiveSplitShareId: (id: string | null) => void;
  setActiveContactId: (id: string | null) => void;

  // Modal actions
  openModal: (modal: NonNullable<FinanceModalType>, contextId?: string) => void;
  closeModal: () => void;
  setHydrated: (hydrated: boolean) => void;
  /** Full reset back to initial store state */
  reset: () => void;
}

export type FinancesStore = FinancesState & FinancesActions;

export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const INITIAL_EXPENSE_FILTERS: ExpenseFilterQueryDto = {
  limit: 20,
  offset: 0,
};

export const INITIAL_STATE: FinancesState = {
  selectedMonth: getCurrentMonthString(),
  selectedBucketId: null,
  selectedCategoryId: null,
  expenseFilters: INITIAL_EXPENSE_FILTERS,
  cachedOverview: null,
  cachedPortfolioSummary: null,
  activeExpenseId: null,
  activeBudgetId: null,
  activeGoalId: null,
  activeSplitShareId: null,
  activeContactId: null,
  activeModal: null,
  isHydrated: false,
};
