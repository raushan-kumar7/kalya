import {
  CreateDigitalAssetDto,
  CreateEquityAssetDto,
  DigitalAsset,
  DigitalAssetFilterQueryDto,
  EquityAsset,
  EquityAssetFilterQueryDto,
  UpdateDigitalAssetDto,
  UpdateEquityAssetDto,
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

export function useUpdateDigitalAssetMutation() {
  const qc = useQueryClient();
  return useMutation<DigitalAsset, Error, { id: string; dto: UpdateDigitalAssetDto }>({
    mutationFn: ({ id, dto }) => AssetService.updateDigital(id, dto),
    onSuccess: () => invalidateAssets(qc),
  });
}

export function useDeleteDigitalAssetMutation() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; id?: string }, Error, string>({
    mutationFn: (id) => AssetService.deleteDigital(id),
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

export function useUpdateEquityAssetMutation() {
  const qc = useQueryClient();
  return useMutation<EquityAsset, Error, { id: string; dto: UpdateEquityAssetDto }>({
    mutationFn: ({ id, dto }) => AssetService.updateEquity(id, dto),
    onSuccess: () => invalidateAssets(qc),
  });
}

export function useDeleteEquityAssetMutation() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; id?: string }, Error, string>({
    mutationFn: (id) => AssetService.deleteEquity(id),
    onSuccess: () => invalidateAssets(qc),
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useAssetActions() {
  const { mutateAsync: createDigitalAsync, isPending: isCreatingDigital } =
    useCreateDigitalAssetMutation();
  const { mutateAsync: updateDigitalAsync, isPending: isUpdatingDigital } =
    useUpdateDigitalAssetMutation();
  const { mutateAsync: deleteDigitalAsync, isPending: isDeletingDigital } =
    useDeleteDigitalAssetMutation();
  const { mutateAsync: createEquityAsync, isPending: isCreatingEquity } =
    useCreateEquityAssetMutation();
  const { mutateAsync: updateEquityAsync, isPending: isUpdatingEquity } =
    useUpdateEquityAssetMutation();
  const { mutateAsync: deleteEquityAsync, isPending: isDeletingEquity } =
    useDeleteEquityAssetMutation();

  const createDigitalAsset = useCallback(
    (dto: CreateDigitalAssetDto, options?: RunActionOptions<DigitalAsset>) =>
      runAction(() => createDigitalAsync(dto), {
        loading: 'Adding digital asset…',
        success: 'Digital asset added!',
        ...options,
      }),
    [createDigitalAsync]
  );

  const updateDigitalAsset = useCallback(
    (id: string, dto: UpdateDigitalAssetDto, options?: RunActionOptions<DigitalAsset>) =>
      runAction(() => updateDigitalAsync({ id, dto }), {
        loading: 'Updating digital asset…',
        success: 'Digital asset updated!',
        ...options,
      }),
    [updateDigitalAsync]
  );

  const deleteDigitalAsset = useCallback(
    (id: string, options?: RunActionOptions<{ success: boolean; id?: string }>) =>
      runAction(() => deleteDigitalAsync(id), {
        loading: 'Deleting digital asset…',
        success: 'Digital asset deleted!',
        ...options,
      }),
    [deleteDigitalAsync]
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

  const updateEquityAsset = useCallback(
    (id: string, dto: UpdateEquityAssetDto, options?: RunActionOptions<EquityAsset>) =>
      runAction(() => updateEquityAsync({ id, dto }), {
        loading: 'Updating equity asset…',
        success: 'Equity asset updated!',
        ...options,
      }),
    [updateEquityAsync]
  );

  const deleteEquityAsset = useCallback(
    (id: string, options?: RunActionOptions<{ success: boolean; id?: string }>) =>
      runAction(() => deleteEquityAsync(id), {
        loading: 'Deleting equity asset…',
        success: 'Equity asset deleted!',
        ...options,
      }),
    [deleteEquityAsync]
  );

  return {
    createDigitalAsset,
    updateDigitalAsset,
    deleteDigitalAsset,
    createEquityAsset,
    updateEquityAsset,
    deleteEquityAsset,
    isCreatingDigital,
    isUpdatingDigital,
    isDeletingDigital,
    isCreatingEquity,
    isUpdatingEquity,
    isDeletingEquity,
    isSubmitting:
      isCreatingDigital ||
      isUpdatingDigital ||
      isDeletingDigital ||
      isCreatingEquity ||
      isUpdatingEquity ||
      isDeletingEquity,
  };
}
