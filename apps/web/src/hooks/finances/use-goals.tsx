import { useCallback, useEffect, useMemo, useState } from 'react';
import { RunActionOptions, runAction } from '@/libs';
import { GoalService } from '@/libs/services/finances';
import { GoalFilterQueryDto, Goal, CreateGoalDto, UpdateGoalDto } from '@kalya/types';
import { queryOptions, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { financeKeys, STALE, QueryOverrides, SuccessResponse } from './shared';
import { useBucketsQuery } from './use-buckets';
import { useFinanceModal } from './use-modal';
import type {
  GoalContribution,
  GoalFiltersState,
  GoalRow,
} from '@/components/dashboard/finances/goals/types';
import {
  computeGoalTotals,
  filterAndSortGoals,
  generateGoalInsights,
  normalizeGoalRow,
} from '@/components/dashboard/finances/goals/helper';
import { roundMoney } from '@kalya/utils';

const CONTRIBUTIONS_STORAGE_KEY = 'kalya_goal_contributions_v1';

function getStoredContributions(): Record<string, GoalContribution[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistContributions(map: Record<string, GoalContribution[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTRIBUTIONS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage issues
  }
}

/* ── Queries ─────────────────────────────────────────────── */

export const goalQueries = {
  list: (query?: GoalFilterQueryDto) =>
    queryOptions({
      queryKey: financeKeys.goals.list(query),
      queryFn: () => GoalService.list(query),
      staleTime: STALE.medium,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: financeKeys.goals.detail(id),
      queryFn: () => GoalService.getById(id),
      enabled: Boolean(id),
      staleTime: STALE.medium,
    }),
};

export function useGoalsQuery(query?: GoalFilterQueryDto, options?: QueryOverrides<Goal[]>) {
  return useQuery({ ...goalQueries.list(query), ...options });
}

export function useGoalDetailQuery(id: string, options?: QueryOverrides<Goal>) {
  return useQuery({ ...goalQueries.detail(id), ...options });
}

/* ── Mutations ───────────────────────────────────────────── */

const invalidateGoals = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: financeKeys.goals.all() });

export function useCreateGoalMutation() {
  const qc = useQueryClient();
  return useMutation<Goal, Error, CreateGoalDto>({
    mutationFn: (dto) => GoalService.create(dto),
    onSuccess: () => invalidateGoals(qc),
  });
}

export function useUpdateGoalMutation() {
  const qc = useQueryClient();
  return useMutation<Goal, Error, { id: string; dto: UpdateGoalDto }>({
    mutationFn: ({ id, dto }) => GoalService.update(id, dto),
    onSuccess: () => invalidateGoals(qc),
  });
}

export function useDeleteGoalMutation() {
  const qc = useQueryClient();
  return useMutation<SuccessResponse, Error, string>({
    mutationFn: (id) => GoalService.delete(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: financeKeys.goals.detail(id) });
      return invalidateGoals(qc);
    },
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useGoalActions() {
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateGoalMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateGoalMutation();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteGoalMutation();

  const createGoal = useCallback(
    (dto: CreateGoalDto, options?: RunActionOptions<Goal>) =>
      runAction(() => createAsync(dto), {
        loading: 'Creating savings goal…',
        success: 'Savings goal created!',
        ...options,
      }),
    [createAsync]
  );

  const updateGoal = useCallback(
    (id: string, dto: UpdateGoalDto, options?: RunActionOptions<Goal>) =>
      runAction(() => updateAsync({ id, dto }), {
        loading: 'Updating goal…',
        success: 'Goal updated successfully!',
        ...options,
      }),
    [updateAsync]
  );

  const deleteGoal = useCallback(
    (id: string, options?: RunActionOptions<SuccessResponse>) =>
      runAction(() => deleteAsync(id), {
        loading: 'Deleting goal…',
        success: 'Goal deleted successfully!',
        ...options,
      }),
    [deleteAsync]
  );

  return {
    createGoal,
    updateGoal,
    deleteGoal,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting: isCreating || isUpdating || isDeleting,
  };
}

/* ── Unified Page Data Hook ──────────────────────────────── */

export function useGoalsData() {
  const goalsQuery = useGoalsQuery();
  const bucketsQuery = useBucketsQuery();

  const rawGoals = goalsQuery.data ?? [];
  const buckets = bucketsQuery.data ?? [];

  const actions = useGoalActions();
  const modal = useFinanceModal();

  // Local contributions storage for manual deposits, persisted across sessions
  const [contributionsMap, setContributionsMap] = useState<Record<string, GoalContribution[]>>({});

  useEffect(() => {
    setContributionsMap(getStoredContributions());
  }, []);

  // Selected goal for details sheet drill-down
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Active filters state
  const [filters, setFilters] = useState<GoalFiltersState>({
    status: 'all',
    bucketId: 'all',
    searchQuery: '',
    sortBy: 'target_date',
    sortDirection: 'asc',
    viewMode: 'cards',
  });

  // Normalize all rows with buckets & contributions
  const allRows: GoalRow[] = useMemo(() => {
    return rawGoals.map((g) => normalizeGoalRow(g, buckets, contributionsMap));
  }, [rawGoals, buckets, contributionsMap]);

  // Compute KPI totals across all rows
  const totals = useMemo(() => computeGoalTotals(allRows), [allRows]);

  // Filter and sort for display
  const rows = useMemo(() => filterAndSortGoals(allRows, filters), [allRows, filters]);

  // Generate actionable insights
  const insights = useMemo(() => generateGoalInsights(allRows), [allRows]);

  // Selected goal for details drawer
  const selectedGoal = useMemo(() => {
    if (!selectedGoalId) return null;
    return allRows.find((g) => g.id === selectedGoalId) || null;
  }, [allRows, selectedGoalId]);

  // Add Money / Deposit Contribution handler
  const handleAddContribution = useCallback(
    async ({
      goalId,
      amount,
      date,
      note,
    }: {
      goalId: string;
      amount: number;
      date: string;
      note?: string;
    }) => {
      const newContribution: GoalContribution = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        goal_id: goalId,
        amount,
        date,
        note,
        created_at: new Date().toISOString(),
      };

      setContributionsMap((prev) => {
        const next = {
          ...prev,
          [goalId]: [newContribution, ...(prev[goalId] ?? [])],
        };
        persistContributions(next);
        return next;
      });

      // Update goal on server if it exists in database
      const existing = allRows.find((g) => g.id === goalId);
      if (existing) {
        const newProgress = roundMoney(existing.current_progress + amount);
        const newStatus = newProgress >= existing.target_amount ? 'completed' : existing.status;

        await actions.updateGoal(
          goalId,
          {
            current_progress: newProgress,
            status: newStatus as any,
          },
          {
            loading: 'Recording contribution deposit…',
            success: `Deposited ₹${amount.toLocaleString('en-IN')}!`,
          }
        );
      }
    },
    [allRows, actions]
  );

  // Delete Contribution handler
  const handleDeleteContribution = useCallback(
    async (goalId: string, contributionId: string) => {
      const targetGoal = allRows.find((g) => g.id === goalId);
      const targetContrib = targetGoal?.contributions.find((c) => c.id === contributionId);

      setContributionsMap((prev) => {
        const current = prev[goalId] ?? [];
        const next = {
          ...prev,
          [goalId]: current.filter((c) => c.id !== contributionId),
        };
        persistContributions(next);
        return next;
      });

      if (targetGoal && targetContrib) {
        const newProgress = Math.max(
          0,
          roundMoney(targetGoal.current_progress - targetContrib.amount)
        );
        await actions.updateGoal(goalId, {
          current_progress: newProgress,
        });
      }
    },
    [allRows, actions]
  );

  // Toggle Pause status
  const handleTogglePause = useCallback(
    async (goal: GoalRow) => {
      const nextStatus = goal.status === 'paused' ? 'in_progress' : 'paused';
      await actions.updateGoal(
        goal.id,
        { status: nextStatus as any },
        {
          loading: nextStatus === 'paused' ? 'Pausing goal…' : 'Resuming goal…',
          success: nextStatus === 'paused' ? 'Goal paused' : 'Goal resumed!',
        }
      );
    },
    [actions]
  );

  // Mark as Completed
  const handleMarkComplete = useCallback(
    async (goal: GoalRow) => {
      await actions.updateGoal(
        goal.id,
        {
          status: 'completed' as any,
          current_progress: goal.target_amount,
        },
        {
          loading: 'Marking goal completed…',
          success: '🎉 Goal marked completed!',
        }
      );
    },
    [actions]
  );

  const isLoading = goalsQuery.isLoading || bucketsQuery.isLoading;
  const isError = goalsQuery.isError || bucketsQuery.isError;
  const error = goalsQuery.error?.message || bucketsQuery.error?.message;

  const refetchAll = useCallback(async () => {
    await Promise.all([goalsQuery.refetch(), bucketsQuery.refetch()]);
  }, [goalsQuery, bucketsQuery]);

  return {
    goals: allRows,
    filteredGoals: rows,
    buckets,
    totals,
    insights,
    filters,
    setFilters,
    selectedGoal,
    selectedGoalId,
    setSelectedGoalId,
    modal,
    actions,
    handleAddContribution,
    handleDeleteContribution,
    handleTogglePause,
    handleMarkComplete,
    isLoading,
    isError,
    error,
    refetchAll,
  };
}
