import {
  CreateDigitalAssetDto,
  CreateEquityAssetDto,
  DigitalAsset,
  DigitalAssetFilterQueryDto,
  EquityAsset,
  EquityAssetFilterQueryDto,
} from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { AssetService } from '@/libs/services/finances/assets.service';
import { PortfolioSummaryResponse } from '@/libs/services/finances';
import { useFinancesStore } from '@/stores/finances';

export function useDigitalAssetsQuery(
  query?: DigitalAssetFilterQueryDto,
  options?: Omit<UseQueryOptions<DigitalAsset[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.assetsDigital(query),
    queryFn: () => AssetService.listDigital(query),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useEquityAssetsQuery(
  query?: EquityAssetFilterQueryDto,
  options?: Omit<UseQueryOptions<EquityAsset[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.assetsEquities(query),
    queryFn: () => AssetService.listEquities(query),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function usePortfolioSummaryQuery(
  options?: Omit<UseQueryOptions<PortfolioSummaryResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const setCached = useFinancesStore((s) => s.setCachedPortfolioSummary);
  return useQuery({
    queryKey: financeKeys.assetsPortfolio(),
    queryFn: async () => {
      const res = await AssetService.getPortfolioSummary();
      setCached(res);
      return res;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useCreateDigitalAssetMutation(
  options?: UseMutationOptions<DigitalAsset, Error, CreateDigitalAssetDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: AssetService.createDigital,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.assetsDigital() });
      queryClient.invalidateQueries({ queryKey: financeKeys.assetsPortfolio() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useCreateEquityAssetMutation(
  options?: UseMutationOptions<EquityAsset, Error, CreateEquityAssetDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: AssetService.createEquity,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.assetsEquities() });
      queryClient.invalidateQueries({ queryKey: financeKeys.assetsPortfolio() });
      options?.onSuccess?.(data, ...args);
    },
  });
}
