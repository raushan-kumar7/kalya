import { useCallback, useMemo, useState } from 'react';
import { Budget, BudgetFilterQueryDto, CreateBudgetDto, UpdateBudgetDto } from '@kalya/types';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeKeys, QueryOverrides, STALE, SuccessResponse } from './shared';
import { BudgetHealthEvaluation, BudgetService } from '@/libs/services/finances';
import { runAction, RunActionOptions } from '@/libs';

/* ── Queries ─────────────────────────────────────────────── */

export const budgetQueries = {
  list: (query?: BudgetFilterQueryDto) =>
    queryOptions({
      queryKey: financeKeys.budgets.list(query),
      queryFn: () => BudgetService.list(query),
      staleTime: STALE.short,
    }),
  health: (id: string) =>
    queryOptions({
      queryKey: financeKeys.budgets.health(id),
      queryFn: () => BudgetService.getHealth(id),
      enabled: Boolean(id),
      staleTime: STALE.realtime, // real-time spend gauge
    }),
};

export function useBudgetsQuery(query?: BudgetFilterQueryDto, options?: QueryOverrides<Budget[]>) {
  return useQuery({ ...budgetQueries.list(query), ...options });
}

export function useBudgetHealthQuery(id: string, options?: QueryOverrides<BudgetHealthEvaluation>) {
  return useQuery({
    ...budgetQueries.health(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

/* ── Mutations ───────────────────────────────────────────── */

const invalidateBudgets = (qc: ReturnType<typeof useQueryClient>) =>
  // `all` covers lists, details and health.
  qc.invalidateQueries({ queryKey: financeKeys.budgets.all() });

export function useCreateBudgetMutation() {
  const qc = useQueryClient();
  return useMutation<Budget, Error, CreateBudgetDto>({
    mutationFn: (dto) => BudgetService.create(dto),
    onSuccess: () => invalidateBudgets(qc),
  });
}

export function useUpdateBudgetMutation() {
  const qc = useQueryClient();
  return useMutation<Budget, Error, { id: string; dto: UpdateBudgetDto }>({
    mutationFn: ({ id, dto }) => BudgetService.update(id, dto),
    onSuccess: () => invalidateBudgets(qc),
  });
}

export function useDeleteBudgetMutation() {
  const qc = useQueryClient();
  return useMutation<SuccessResponse, Error, string>({
    mutationFn: (id) => BudgetService.delete(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: financeKeys.budgets.detail(id) });
      return invalidateBudgets(qc);
    },
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useBudgetActions() {
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateBudgetMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateBudgetMutation();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteBudgetMutation();

  const createBudget = useCallback(
    (dto: CreateBudgetDto, options?: RunActionOptions<Budget>) =>
      runAction(() => createAsync(dto), {
        loading: 'Configuring budget limit…',
        success: 'Budget plan active!',
        ...options,
      }),
    [createAsync]
  );

  const updateBudget = useCallback(
    (id: string, dto: UpdateBudgetDto, options?: RunActionOptions<Budget>) =>
      runAction(() => updateAsync({ id, dto }), {
        loading: 'Updating budget…',
        success: 'Budget updated successfully!',
        ...options,
      }),
    [updateAsync]
  );

  const deleteBudget = useCallback(
    (id: string, options?: RunActionOptions<SuccessResponse>) =>
      runAction(() => deleteAsync(id), {
        loading: 'Deleting budget…',
        success: 'Budget deleted successfully!',
        ...options,
      }),
    [deleteAsync]
  );

  return {
    createBudget,
    updateBudget,
    deleteBudget,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting: isCreating || isUpdating || isDeleting,
  };
}

/* ── Unified Page Data Hook ──────────────────────────────── */

import { useIncomeQuery } from './use-income';
import { useExpensesQuery } from './use-expenses';
import { useCategoriesQuery } from './use-categories';
import { useBucketsQuery } from './use-buckets';
import { useMonthNavigation } from './use-month-navigation';
import { useFinanceModal } from './use-modal';
import { buildView } from '@/components/dashboard/finances/budgets/helper';
import { roundMoney } from '@kalya/utils';
import type { BudgetRow } from '@/components/dashboard/finances/budgets/types';

export function useBudgetsData(monthOverride?: string) {
  const monthNav = useMonthNavigation();
  const selectedMonth = monthOverride ?? monthNav.selectedMonth;

  const budgetsQuery = useBudgetsQuery();
  const incomeQuery = useIncomeQuery();
  const expensesQuery = useExpensesQuery();
  const categoriesQuery = useCategoriesQuery();
  const bucketsQuery = useBucketsQuery();

  const budgets = budgetsQuery.data ?? [];
  const incomes = incomeQuery.data ?? [];
  const expenses = expensesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const buckets = bucketsQuery.data ?? [];

  const actions = useBudgetActions();
  const { mutateAsync: createBudgetAsync } = useCreateBudgetMutation();
  const modal = useFinanceModal();

  const [generating, setGenerating] = useState(false);
  const [selectedDrillDownBudget, setSelectedDrillDownBudget] = useState<BudgetRow | null>(null);

  const view = useMemo(
    () => buildView({ month: selectedMonth, budgets, incomes, expenses, categories, buckets }),
    [selectedMonth, budgets, incomes, expenses, categories, buckets]
  );

  const monthIncome = useMemo(
    () => incomes.find((i) => i.month === selectedMonth),
    [incomes, selectedMonth]
  );

  const hasIncome = Boolean(monthIncome);
  const isEmpty = view.rows.length === 0;
  const canGenerate = hasIncome && isEmpty && buckets.length > 0;

  const isLoading =
    budgetsQuery.isLoading ||
    incomeQuery.isLoading ||
    expensesQuery.isLoading ||
    categoriesQuery.isLoading ||
    bucketsQuery.isLoading;

  const isError =
    budgetsQuery.isError ||
    incomeQuery.isError ||
    expensesQuery.isError ||
    categoriesQuery.isError ||
    bucketsQuery.isError;

  const error =
    budgetsQuery.error?.message ||
    incomeQuery.error?.message ||
    expensesQuery.error?.message ||
    categoriesQuery.error?.message ||
    bucketsQuery.error?.message;

  /** Generate one monthly budget per bucket from income × bucket's target percent */
  const handleGenerateFromIncome = useCallback(async () => {
    if (!monthIncome) return false;
    setGenerating(true);
    try {
      const res = await runAction(
        async () => {
          const total = Number(monthIncome.total_income) || 0;
          for (const bucket of buckets) {
            const percent = Number(bucket.target_percent) || 0;
            if (!percent) continue;
            await createBudgetAsync({
              bucket_id: bucket.id,
              income_id: monthIncome.id,
              period: 'monthly',
              amount: roundMoney((total * percent) / 100),
            });
          }
          return true;
        },
        { loading: 'Generating budgets from income…', success: '50/30/20 budgets active!' }
      );
      return res.success;
    } finally {
      setGenerating(false);
    }
  }, [monthIncome, buckets, createBudgetAsync]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      budgetsQuery.refetch(),
      incomeQuery.refetch(),
      expensesQuery.refetch(),
      categoriesQuery.refetch(),
      bucketsQuery.refetch(),
    ]);
  }, [budgetsQuery, incomeQuery, expensesQuery, categoriesQuery, bucketsQuery]);

  return {
    month: monthNav,
    selectedMonth,
    budgets,
    incomes,
    expenses,
    categories,
    buckets,
    monthIncome,
    view,
    totals: view.totals,
    rows: view.rows,
    alerts: view.alerts,
    insights: view.insights,
    pace: view.pace,
    history: view.history,
    totalIncome: view.totalIncome,
    hasIncome,
    isEmpty,
    canGenerate,
    generating,
    isLoading,
    isError,
    error,
    actions,
    modal,
    selectedDrillDownBudget,
    setSelectedDrillDownBudget,
    handleGenerateFromIncome,
    refetchAll,
  };
}
