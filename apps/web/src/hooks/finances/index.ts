'use client';

import { useCallback } from 'react';
import { useFinancesStore } from '@/stores/finances';
import { runAction, type RunActionOptions } from '@/libs';
import type {
  Bucket,
  CreateBucketDto,
  UpdateBucketDto,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  Income,
  CreateIncomeDto,
  Budget,
  CreateBudgetDto,
  Goal,
  CreateGoalDto,
  SplitExpense,
  SettleSplitExpenseDto,
  SplitContactMember,
  CreateSplitContactMemberDto,
  UpdateSplitContactMemberDto,
} from '@kalya/types';

// Query & Mutation Hooks
import {
  useBucketsQuery,
  useCreateBucketMutation,
  useUpdateBucketMutation,
  useDeleteBucketMutation,
  useSeedDefaultBucketsMutation,
} from './use-buckets';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useSeedDefaultCategoriesMutation,
} from './use-categories';
import { useIncomeQuery, useCreateIncomeMutation } from './use-income';
import { useBudgetsQuery, useCreateBudgetMutation } from './use-budgets';
import {
  useExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from './use-expenses';
import {
  usePendingSplitSharesQuery,
  useSettleSplitExpenseMutation,
  useSplitContactsQuery,
  useCreateSplitContactMutation,
  useUpdateSplitContactMutation,
  useDeleteSplitContactMutation,
  useSplitContacts,
  useUnsettledSplits,
  usePendingSplits,
} from './use-splits';
import { useGoalsQuery, useCreateGoalMutation } from './use-goals';
import { usePortfolioSummaryQuery } from './use-assets';
import { useMonthlyOverviewQuery } from './use-summaries';

/**
 * Master hook for financial views. Exposes active filters, reactive data,
 * loading/error states, and toast-integrated action handlers.
 */
export function useFinances() {
  // Store selectors
  const selectedMonth = useFinancesStore((s) => s.selectedMonth);
  const setSelectedMonth = useFinancesStore((s) => s.setSelectedMonth);
  const selectedBucketId = useFinancesStore((s) => s.selectedBucketId);
  const setSelectedBucketId = useFinancesStore((s) => s.setSelectedBucketId);
  const activeBucketId = useFinancesStore((s) => s.activeBucketId);
  const setActiveBucketId = useFinancesStore((s) => s.setActiveBucketId);
  const activeCategoryId = useFinancesStore((s) => s.activeCategoryId);
  const setActiveCategoryId = useFinancesStore((s) => s.setActiveCategoryId);
  const expenseFilters = useFinancesStore((s) => s.expenseFilters);
  const setExpenseFilters = useFinancesStore((s) => s.setExpenseFilters);
  const activeModal = useFinancesStore((s) => s.activeModal);
  const openModal = useFinancesStore((s) => s.openModal);
  const closeModal = useFinancesStore((s) => s.closeModal);
  const activeContactId = useFinancesStore((s) => s.activeContactId);
  const setActiveContactId = useFinancesStore((s) => s.setActiveContactId);
  const activeSplitShareId = useFinancesStore((s) => s.activeSplitShareId);
  const setActiveSplitShareId = useFinancesStore((s) => s.setActiveSplitShareId);

  // Queries
  const bucketsQuery = useBucketsQuery();
  const overviewQuery = useMonthlyOverviewQuery(selectedMonth);
  const categoriesQuery = useCategoriesQuery(selectedBucketId || undefined);
  const expensesQuery = useExpensesQuery(expenseFilters);
  const budgetsQuery = useBudgetsQuery();
  const goalsQuery = useGoalsQuery();
  const portfolioQuery = usePortfolioSummaryQuery();
  const pendingSplitsQuery = usePendingSplitSharesQuery();
  const splitContactsQuery = useSplitContactsQuery();

  // Bucket Mutations
  const createBucketMutation = useCreateBucketMutation();
  const updateBucketMutation = useUpdateBucketMutation();
  const deleteBucketMutation = useDeleteBucketMutation();
  const seedBucketsMutation = useSeedDefaultBucketsMutation();

  // Other Domain Mutations
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const seedCategoriesMutation = useSeedDefaultCategoriesMutation();
  const createExpenseMutation = useCreateExpenseMutation();
  const updateExpenseMutation = useUpdateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();
  const createIncomeMutation = useCreateIncomeMutation();
  const createBudgetMutation = useCreateBudgetMutation();
  const createGoalMutation = useCreateGoalMutation();
  const settleSplitMutation = useSettleSplitExpenseMutation();
  const createSplitContactMutation = useCreateSplitContactMutation();
  const updateSplitContactMutation = useUpdateSplitContactMutation();
  const deleteSplitContactMutation = useDeleteSplitContactMutation();

  // ==========================================================================
  // Bucket Toast-Integrated Actions
  // ==========================================================================
  const createBucket = useCallback(
    async (dto: CreateBucketDto, options?: RunActionOptions<Bucket>) => {
      return runAction(() => createBucketMutation.mutateAsync(dto), {
        loading: 'Creating allocation bucket…',
        success: 'Bucket created successfully!',
        ...options,
      });
    },
    [createBucketMutation]
  );

  const updateBucket = useCallback(
    async (id: string, dto: UpdateBucketDto, options?: RunActionOptions<Bucket>) => {
      return runAction(() => updateBucketMutation.mutateAsync({ id, dto }), {
        loading: 'Updating bucket…',
        success: 'Bucket updated successfully!',
        ...options,
      });
    },
    [updateBucketMutation]
  );

  const deleteBucket = useCallback(
    async (id: string, options?: RunActionOptions<{ success: boolean }>) => {
      return runAction(() => deleteBucketMutation.mutateAsync(id), {
        loading: 'Deleting bucket…',
        success: 'Bucket deleted successfully!',
        ...options,
      });
    },
    [deleteBucketMutation]
  );

  const seedDefaultBuckets = useCallback(
    async (options?: RunActionOptions<Bucket[]>) => {
      return runAction(() => seedBucketsMutation.mutateAsync(), {
        loading: 'Seeding 50/30/20 buckets…',
        success: 'Default buckets created!',
        ...options,
      });
    },
    [seedBucketsMutation]
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
        success: 'Default buckets and categories initialized!',
      }
    );
  }, [seedBucketsMutation, seedCategoriesMutation]);

  // ==========================================================================
  // Category Toast-Integrated Actions
  // ==========================================================================
  const createCategory = useCallback(
    async (dto: CreateCategoryDto, options?: RunActionOptions<Category>) => {
      return runAction(() => createCategoryMutation.mutateAsync(dto), {
        loading: 'Creating category…',
        success: 'Category created successfully!',
        ...options,
      });
    },
    [createCategoryMutation]
  );

  const updateCategory = useCallback(
    async (id: string, dto: UpdateCategoryDto, options?: RunActionOptions<Category>) => {
      return runAction(() => updateCategoryMutation.mutateAsync({ id, dto }), {
        loading: 'Updating category…',
        success: 'Category updated successfully!',
        ...options,
      });
    },
    [updateCategoryMutation]
  );

  const deleteCategory = useCallback(
    async (id: string, options?: RunActionOptions<{ success: boolean }>) => {
      return runAction(() => deleteCategoryMutation.mutateAsync(id), {
        loading: 'Deleting category…',
        success: 'Category deleted successfully!',
        ...options,
      });
    },
    [deleteCategoryMutation]
  );

  const seedDefaultCategories = useCallback(
    async (options?: RunActionOptions<Category[]>) => {
      return runAction(() => seedCategoriesMutation.mutateAsync(), {
        loading: 'Seeding standard categories…',
        success: 'Default categories created!',
        ...options,
      });
    },
    [seedCategoriesMutation]
  );

  // Other Action Wrappers
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

  const createSplitContact = useCallback(
    async (dto: CreateSplitContactMemberDto, options?: RunActionOptions<SplitContactMember>) => {
      return runAction(() => createSplitContactMutation.mutateAsync(dto), {
        loading: 'Adding split contact…',
        success: 'Contact added successfully!',
        ...options,
      });
    },
    [createSplitContactMutation]
  );

  const updateSplitContact = useCallback(
    async (
      id: string,
      dto: UpdateSplitContactMemberDto,
      options?: RunActionOptions<SplitContactMember>
    ) => {
      return runAction(() => updateSplitContactMutation.mutateAsync({ id, dto }), {
        loading: 'Updating contact…',
        success: 'Contact updated successfully!',
        ...options,
      });
    },
    [updateSplitContactMutation]
  );

  const deleteSplitContact = useCallback(
    async (id: string, options?: RunActionOptions<{ success: boolean }>) => {
      return runAction(() => deleteSplitContactMutation.mutateAsync(id), {
        loading: 'Deleting contact…',
        success: 'Contact removed successfully!',
        ...options,
      });
    },
    [deleteSplitContactMutation]
  );

  const splitContactsError = splitContactsQuery.error
    ? splitContactsQuery.error.message || 'Failed to load contacts'
    : null;

  const pendingSplitsError = pendingSplitsQuery.error
    ? pendingSplitsQuery.error.message || 'Failed to load unsettled splits'
    : null;

  return {
    // ------------------------------------------------------------------------
    // BUCKETS DOMAIN API
    // ------------------------------------------------------------------------
    buckets: bucketsQuery.data ?? [],
    isBucketsLoading: bucketsQuery.isLoading,
    isBucketsRefetching: bucketsQuery.isRefetching,
    bucketsError: bucketsQuery.error,
    refetchBuckets: bucketsQuery.refetch,

    // Bucket Actions
    createBucket,
    updateBucket,
    deleteBucket,
    seedDefaultBuckets,
    seedDefaults,

    // Bucket Mutation States
    isCreatingBucket: createBucketMutation.isPending,
    isUpdatingBucket: updateBucketMutation.isPending,
    isDeletingBucket: deleteBucketMutation.isPending,

    // Bucket Selection Context
    activeBucketId,
    setActiveBucketId,
    selectedBucketId,
    setSelectedBucketId,

    // ------------------------------------------------------------------------
    // GENERAL STORE & FILTER STATE
    // ------------------------------------------------------------------------
    selectedMonth,
    setSelectedMonth,
    expenseFilters,
    setExpenseFilters,
    activeModal,
    openModal,
    closeModal,

    // ------------------------------------------------------------------------
    // CATEGORIES DOMAIN API
    // ------------------------------------------------------------------------
    categories: categoriesQuery.data ?? [],
    isCategoriesLoading: categoriesQuery.isLoading,
    isCategoriesRefetching: categoriesQuery.isRefetching,
    categoriesError: categoriesQuery.error,
    refetchCategories: categoriesQuery.refetch,

    // Category Actions
    createCategory,
    updateCategory,
    deleteCategory,
    seedDefaultCategories,

    // Category Mutation States
    isCreatingCategory: createCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,

    // Category Selection Context
    activeCategoryId,
    setActiveCategoryId,

    // ------------------------------------------------------------------------
    // SPLIT CONTACTS DOMAIN API
    // ------------------------------------------------------------------------
    contacts: splitContactsQuery.data ?? [],
    splitContacts: splitContactsQuery.data ?? [],
    isContactsLoading: splitContactsQuery.isLoading,
    isSplitContactsLoading: splitContactsQuery.isLoading,
    isSplitContactsRefetching: splitContactsQuery.isRefetching,
    splitContactsError,
    contactsError: splitContactsError,
    refetchSplitContacts: splitContactsQuery.refetch,
    refetchContacts: splitContactsQuery.refetch,

    // Split Contact Actions
    createSplitContact,
    createContact: createSplitContact,
    updateSplitContact,
    updateContact: updateSplitContact,
    deleteSplitContact,
    deleteContact: deleteSplitContact,

    // Split Contact Mutation States
    isCreatingSplitContact: createSplitContactMutation.isPending,
    isUpdatingSplitContact: updateSplitContactMutation.isPending,
    isDeletingSplitContact: deleteSplitContactMutation.isPending,

    // Contact Selection Context
    activeContactId,
    setActiveContactId,

    // Convenient view-level fallbacks
    isLoading: splitContactsQuery.isLoading,
    error: splitContactsError,

    // ------------------------------------------------------------------------
    // UNSETTLED / PENDING SPLITS DOMAIN API
    // ------------------------------------------------------------------------
    unsettledSplits: pendingSplitsQuery.data ?? [],
    pendingSplits: pendingSplitsQuery.data ?? [],
    unsettledLoading: pendingSplitsQuery.isLoading,
    isPendingSplitsLoading: pendingSplitsQuery.isLoading,
    isUnsettledSplitsLoading: pendingSplitsQuery.isLoading,
    isPendingSplitsRefetching: pendingSplitsQuery.isRefetching,
    unsettledError: pendingSplitsError,
    pendingSplitsError,
    refetchUnsettledSplits: pendingSplitsQuery.refetch,
    refetchPendingSplits: pendingSplitsQuery.refetch,
    settleSplit,
    settleShare: settleSplit,
    isSettlingSplit: settleSplitMutation.isPending,
    isSettling: settleSplitMutation.isPending,
    activeSplitShareId,
    setActiveSplitShareId,

    // ------------------------------------------------------------------------
    // OTHER DOMAINS (Expenses, Budgets, Goals, Portfolio)
    // ------------------------------------------------------------------------
    expenses: expensesQuery.data ?? [],
    budgets: budgetsQuery.data ?? [],
    goals: goalsQuery.data ?? [],
    portfolio: portfolioQuery.data,
    overview: overviewQuery.data,
    isOverviewLoading: overviewQuery.isLoading,

    // Other Actions
    createExpense,
    updateExpense,
    deleteExpense,
    logIncome,
    createBudget,
    createGoal,

    // Overall Submitting Status
    isSubmitting:
      createBucketMutation.isPending ||
      updateBucketMutation.isPending ||
      deleteBucketMutation.isPending ||
      seedBucketsMutation.isPending ||
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending ||
      seedCategoriesMutation.isPending ||
      createExpenseMutation.isPending ||
      updateExpenseMutation.isPending ||
      createIncomeMutation.isPending ||
      createBudgetMutation.isPending ||
      settleSplitMutation.isPending ||
      createSplitContactMutation.isPending ||
      updateSplitContactMutation.isPending ||
      deleteSplitContactMutation.isPending,
  };
}

export * from './use-splits';
export * from './use-buckets';
export * from './use-categories';
export * from './use-expenses';
export * from './use-income';
export * from './use-budgets';
export * from './use-goals';
export * from './use-assets';
export * from './use-summaries';
export * from './keys';
