import {
  CreateDigitalAssetDto,
  CreateEquityAssetDto,
  DigitalAsset,
  DigitalAssetFilterQueryDto,
  EquityAsset,
  EquityAssetFilterQueryDto,
} from '@kalya/types';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeKeys, QueryOverrides, STALE } from './shared';
import { AssetService, PortfolioSummaryResponse } from '@/libs/services/finances';
import { useCallback } from 'react';
import { runAction, RunActionOptions } from '@/libs';

/* ── Queries ─────────────────────────────────────────────── */

export const assetQueries = {
  digital: (query?: DigitalAssetFilterQueryDto) =>
    queryOptions({
      queryKey: financeKeys.assets.digital(query),
      queryFn: () => AssetService.listDigital(query),
      staleTime: STALE.medium,
    }),
  equities: (query?: EquityAssetFilterQueryDto) =>
    queryOptions({
      queryKey: financeKeys.assets.equities(query),
      queryFn: () => AssetService.listEquities(query),
      staleTime: STALE.medium,
    }),
  portfolio: () =>
    queryOptions({
      queryKey: financeKeys.assets.portfolio(),
      queryFn: () => AssetService.getPortfolioSummary(),
      staleTime: STALE.medium,
    }),
};

export function useDigitalAssetsQuery(
  query?: DigitalAssetFilterQueryDto,
  options?: QueryOverrides<DigitalAsset[]>
) {
  return useQuery({ ...assetQueries.digital(query), ...options });
}

export function useEquityAssetsQuery(
  query?: EquityAssetFilterQueryDto,
  options?: QueryOverrides<EquityAsset[]>
) {
  return useQuery({ ...assetQueries.equities(query), ...options });
}

export function usePortfolioSummaryQuery(options?: QueryOverrides<PortfolioSummaryResponse>) {
  return useQuery({ ...assetQueries.portfolio(), ...options });
}

/* ── Mutations ───────────────────────────────────────────── */

// Any asset change can alter lists and the portfolio summary.
const invalidateAssets = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: financeKeys.assets.all() });

export function useCreateDigitalAssetMutation() {
  const qc = useQueryClient();
  return useMutation<DigitalAsset, Error, CreateDigitalAssetDto>({
    mutationFn: (dto) => AssetService.createDigital(dto),
    onSuccess: () => invalidateAssets(qc),
  });
}

export function useCreateEquityAssetMutation() {
  const qc = useQueryClient();
  return useMutation<EquityAsset, Error, CreateEquityAssetDto>({
    mutationFn: (dto) => AssetService.createEquity(dto),
    onSuccess: () => invalidateAssets(qc),
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useAssetActions() {
  const { mutateAsync: createDigitalAsync, isPending: isCreatingDigital } =
    useCreateDigitalAssetMutation();
  const { mutateAsync: createEquityAsync, isPending: isCreatingEquity } =
    useCreateEquityAssetMutation();

  const createDigitalAsset = useCallback(
    (dto: CreateDigitalAssetDto, options?: RunActionOptions<DigitalAsset>) =>
      runAction(() => createDigitalAsync(dto), {
        loading: 'Adding digital asset…',
        success: 'Digital asset added!',
        ...options,
      }),
    [createDigitalAsync]
  );

  const createEquityAsset = useCallback(
    (dto: CreateEquityAssetDto, options?: RunActionOptions<EquityAsset>) =>
      runAction(() => createEquityAsync(dto), {
        loading: 'Adding equity asset…',
        success: 'Equity asset added!',
        ...options,
      }),
    [createEquityAsync]
  );

  return {
    createDigitalAsset,
    createEquityAsset,
    isCreatingDigital,
    isCreatingEquity,
    isSubmitting: isCreatingDigital || isCreatingEquity,
  };
}
