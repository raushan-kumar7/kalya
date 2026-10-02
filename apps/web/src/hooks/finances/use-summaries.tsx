import { useFinancesStore } from '@/stores/finances';
import { GenerateMonthlySummaryDto, MonthlyFinancialOverview, MonthlySummary } from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { SummaryService } from '@/libs/services/finances/summaries.service';

export function useMonthlyOverviewQuery(
  month: string,
  options?: Omit<UseQueryOptions<MonthlyFinancialOverview, Error>, 'queryKey' | 'queryFn'>
) {
  const setCachedOverview = useFinancesStore((s) => s.setCachedOverview);
  return useQuery({
    queryKey: financeKeys.overview(month),
    queryFn: async () => {
      const res = await SummaryService.getOverview(month);
      setCachedOverview(res);
      return res;
    },
    enabled: Boolean(month && options?.enabled !== false),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useGenerateMonthlySummaryMutation(
  options?: UseMutationOptions<MonthlySummary, Error, GenerateMonthlySummaryDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: SummaryService.generateStatement,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.overview(data.month) });
      options?.onSuccess?.(data, ...args);
    },
  });
}
