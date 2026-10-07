import { RunActionOptions, runAction } from '@/libs';
import { SummaryService } from '@/libs/services/finances';
import { MonthlyFinancialOverview, MonthlySummary, GenerateMonthlySummaryDto } from '@kalya/types';
import { queryOptions, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { financeKeys, STALE, QueryOverrides } from './shared';

/* ── Queries ─────────────────────────────────────────────── */

export const summaryQueries = {
  overview: (month: string) =>
    queryOptions({
      queryKey: financeKeys.summaries.overview(month),
      queryFn: () => SummaryService.getOverview(month),
      enabled: Boolean(month),
      staleTime: STALE.medium,
    }),
};

/**
 * Server data stays in React Query only. The old version also copied the
 * result into Zustand from inside `queryFn`; read it from this hook instead.
 */
export function useMonthlyOverviewQuery(
  month: string,
  options?: QueryOverrides<MonthlyFinancialOverview>
) {
  return useQuery({
    ...summaryQueries.overview(month),
    ...options,
    enabled: Boolean(month) && (options?.enabled ?? true),
  });
}

/* ── Mutations ───────────────────────────────────────────── */

export function useGenerateMonthlySummaryMutation() {
  const qc = useQueryClient();
  return useMutation<MonthlySummary, Error, GenerateMonthlySummaryDto>({
    mutationFn: (dto) => SummaryService.generateStatement(dto),
    onSuccess: (data) =>
      qc.invalidateQueries({ queryKey: financeKeys.summaries.overview(data.month) }),
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useSummaryActions() {
  const { mutateAsync: generateAsync, isPending: isGenerating } =
    useGenerateMonthlySummaryMutation();

  const generateSummary = useCallback(
    (dto: GenerateMonthlySummaryDto, options?: RunActionOptions<MonthlySummary>) =>
      runAction(() => generateAsync(dto), {
        loading: 'Generating monthly summary…',
        success: 'Monthly summary generated!',
        ...options,
      }),
    [generateAsync]
  );

  return { generateSummary, isGenerating, isSubmitting: isGenerating };
}
