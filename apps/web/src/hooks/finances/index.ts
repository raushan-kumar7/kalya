import { useFinancesStore } from '@/stores/finances';
import { useMonthlyOverviewQuery } from './use-summaries';
import { useBucketsQuery, useSeedDefaultBucketsMutation } from './use-buckets';
import { useCategoriesQuery, useSeedDefaultCategoriesMutation } from './use-categories';
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useExpensesQuery,
  useUpdateExpenseMutation,
} from './use-expenses';
import { useBudgetsQuery, useCreateBudgetMutation } from './use-budgets';
import { useCreateGoalMutation, useGoalsQuery } from './use-goals';
import { usePortfolioSummaryQuery } from './use-assets';
import { usePendingSplitSharesQuery, useSettleSplitExpenseMutation } from './use-splits';
import { useCreateIncomeMutation } from './use-income';
import { useCallback } from 'react';
import {
  Budget,
  CreateBudgetDto,
  CreateExpenseDto,
  CreateGoalDto,
  CreateIncomeDto,
  Expense,
  Goal,
  Income,
  SettleSplitExpenseDto,
  SplitExpense,
  UpdateExpenseDto,
} from '@kalya/types';
import { runAction, RunActionOptions } from '@/libs';

/**
 * Master hook for financial views. Exposes active filters, reactive dashboard data,
 * and toast-integrated runAction handlers for fast mutations.
 */
export function useFinances() {
  const selectedMonth = useFinancesStore((s) => s.selectedMonth);
  const setSelectedMonth = useFinancesStore((s) => s.setSelectedMonth);
  const selectedBucketId = useFinancesStore((s) => s.selectedBucketId);
  const setSelectedBucketId = useFinancesStore((s) => s.setSelectedBucketId);
  const expenseFilters = useFinancesStore((s) => s.expenseFilters);
  const setExpenseFilters = useFinancesStore((s) => s.setExpenseFilters);
  const activeModal = useFinancesStore((s) => s.activeModal);
  const openModal = useFinancesStore((s) => s.openModal);
  const closeModal = useFinancesStore((s) => s.closeModal);

  // Queries
  const overviewQuery = useMonthlyOverviewQuery(selectedMonth);
  const bucketsQuery = useBucketsQuery();
  const categoriesQuery = useCategoriesQuery(selectedBucketId || undefined);
  const expensesQuery = useExpensesQuery(expenseFilters);
  const budgetsQuery = useBudgetsQuery();
  const goalsQuery = useGoalsQuery();
  const portfolioQuery = usePortfolioSummaryQuery();
  const pendingSplitsQuery = usePendingSplitSharesQuery();

  // Mutations
  const createExpenseMutation = useCreateExpenseMutation();
  const updateExpenseMutation = useUpdateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();
  const createIncomeMutation = useCreateIncomeMutation();
  const createBudgetMutation = useCreateBudgetMutation();
  const createGoalMutation = useCreateGoalMutation();
  const settleSplitMutation = useSettleSplitExpenseMutation();
  const seedBucketsMutation = useSeedDefaultBucketsMutation();
  const seedCategoriesMutation = useSeedDefaultCategoriesMutation();

  // Toast-integrated Action Wrappers
  const createExpense = useCallback(
    async (dto: CreateExpenseDto, options?: RunActionOptions<Expense>) => {
      return runAction(() => createExpenseMutation.mutateAsync(dto), {
        loading: 'Recording expense…',
        success: 'Expense logged successfully!',
        ...options,
      });
    },
    [createExpenseMutation]
  );

  const updateExpense = useCallback(
    async (id: string, dto: UpdateExpenseDto, options?: RunActionOptions<Expense>) => {
      return runAction(() => updateExpenseMutation.mutateAsync({ id, dto }), {
        loading: 'Updating expense…',
        success: 'Expense updated successfully!',
        ...options,
      });
    },
    [updateExpenseMutation]
  );

  const deleteExpense = useCallback(
    async (id: string, options?: RunActionOptions<{ success: boolean }>) => {
      return runAction(() => deleteExpenseMutation.mutateAsync(id), {
        loading: 'Deleting expense…',
        success: 'Expense deleted successfully!',
        ...options,
      });
    },
    [deleteExpenseMutation]
  );

  const logIncome = useCallback(
    async (dto: CreateIncomeDto, options?: RunActionOptions<Income>) => {
      return runAction(() => createIncomeMutation.mutateAsync(dto), {
        loading: 'Registering income…',
        success: 'Monthly income logged!',
        ...options,
      });
    },
    [createIncomeMutation]
  );

  const createBudget = useCallback(
    async (dto: CreateBudgetDto, options?: RunActionOptions<Budget>) => {
      return runAction(() => createBudgetMutation.mutateAsync(dto), {
        loading: 'Configuring budget limit…',
        success: 'Budget plan active!',
        ...options,
      });
    },
    [createBudgetMutation]
  );

  const createGoal = useCallback(
    async (dto: CreateGoalDto, options?: RunActionOptions<Goal>) => {
      return runAction(() => createGoalMutation.mutateAsync(dto), {
        loading: 'Creating savings goal…',
        success: 'Savings goal created!',
        ...options,
      });
    },
    [createGoalMutation]
  );

  const settleSplit = useCallback(
    async (id: string, dto: SettleSplitExpenseDto, options?: RunActionOptions<SplitExpense>) => {
      return runAction(() => settleSplitMutation.mutateAsync({ id, dto }), {
        loading: 'Recording settlement…',
        success: 'Split bill settled!',
        ...options,
      });
    },
    [settleSplitMutation]
  );

  const seedDefaults = useCallback(async () => {
    return runAction(
      async () => {
        await seedBucketsMutation.mutateAsync();
        await seedCategoriesMutation.mutateAsync();
        return true;
      },
      {
        loading: 'Initializing 50/30/20 framework…',
        success: 'Default buckets and categories created!',
      }
    );
  }, [seedBucketsMutation, seedCategoriesMutation]);

  return {
    // Current Filter State
    selectedMonth,
    setSelectedMonth,
    selectedBucketId,
    setSelectedBucketId,
    expenseFilters,
    setExpenseFilters,

    // Dialog Modal State
    activeModal,
    openModal,
    closeModal,

    // Reactive Query State
    overview: overviewQuery.data,
    isOverviewLoading: overviewQuery.isLoading,
    buckets: bucketsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    expenses: expensesQuery.data ?? [],
    budgets: budgetsQuery.data ?? [],
    goals: goalsQuery.data ?? [],
    portfolio: portfolioQuery.data,
    pendingSplits: pendingSplitsQuery.data ?? [],

    // Action Methods (Toast-wrapped)
    createExpense,
    updateExpense,
    deleteExpense,
    logIncome,
    createBudget,
    createGoal,
    settleSplit,
    seedDefaults,

    // Raw Mutation States
    isSubmitting:
      createExpenseMutation.isPending ||
      updateExpenseMutation.isPending ||
      createIncomeMutation.isPending ||
      createBudgetMutation.isPending ||
      settleSplitMutation.isPending,
  };
}
