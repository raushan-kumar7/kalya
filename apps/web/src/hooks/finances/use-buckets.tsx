import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  financeKeys,
  invalidateAfterBucketChange,
  invalidateAfterTaxonomyRemoval,
  QueryOverrides,
  STALE,
  SuccessResponse,
} from './shared';
import { BucketService } from '@/libs/services/finances';
import { Bucket, CreateBucketDto, UpdateBucketDto } from '@kalya/types';
import { useCallback } from 'react';
import { runAction, RunActionOptions } from '@/libs';

/* ── Queries ─────────────────────────────────────────────── */

export const bucketQueries = {
  list: () =>
    queryOptions({
      queryKey: financeKeys.buckets.list(),
      queryFn: () => BucketService.list(),
      staleTime: STALE.long,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: financeKeys.buckets.detail(id),
      queryFn: () => BucketService.getById(id),
      enabled: Boolean(id),
    }),
};

export function useBucketsQuery(options?: QueryOverrides<Bucket[]>) {
  return useQuery({ ...bucketQueries.list(), ...options });
}

export function useBucketDetailQuery(id: string, options?: QueryOverrides<Bucket>) {
  return useQuery({
    ...bucketQueries.detail(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

/* ── Mutations ───────────────────────────────────────────── */

export function useSeedDefaultBucketsMutation() {
  const qc = useQueryClient();
  return useMutation<Bucket[], Error, void>({
    mutationFn: () => BucketService.seedDefaults(),
    onSuccess: () => invalidateAfterBucketChange(qc),
  });
}

export function useCreateBucketMutation() {
  const qc = useQueryClient();
  return useMutation<Bucket, Error, CreateBucketDto>({
    mutationFn: (dto) => BucketService.create(dto),
    onSuccess: () => invalidateAfterBucketChange(qc),
  });
}

export function useUpdateBucketMutation() {
  const qc = useQueryClient();
  return useMutation<Bucket, Error, { id: string; dto: UpdateBucketDto }>({
    mutationFn: ({ id, dto }) => BucketService.update(id, dto),
    onSuccess: () => invalidateAfterBucketChange(qc),
  });
}

export function useDeleteBucketMutation() {
  const qc = useQueryClient();
  return useMutation<SuccessResponse, Error, string>({
    mutationFn: (id) => BucketService.delete(id),
    onSuccess: async (_data, id) => {
      qc.removeQueries({ queryKey: financeKeys.buckets.detail(id) });
      await Promise.all([invalidateAfterBucketChange(qc), invalidateAfterTaxonomyRemoval(qc)]);
    },
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useBucketActions() {
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateBucketMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateBucketMutation();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteBucketMutation();
  const { mutateAsync: seedAsync, isPending: isSeeding } = useSeedDefaultBucketsMutation();

  const createBucket = useCallback(
    (dto: CreateBucketDto, options?: RunActionOptions<Bucket>) =>
      runAction(() => createAsync(dto), {
        loading: 'Creating allocation bucket…',
        success: 'Bucket created successfully!',
        ...options,
      }),
    [createAsync]
  );

  const updateBucket = useCallback(
    (id: string, dto: UpdateBucketDto, options?: RunActionOptions<Bucket>) =>
      runAction(() => updateAsync({ id, dto }), {
        loading: 'Updating bucket…',
        success: 'Bucket updated successfully!',
        ...options,
      }),
    [updateAsync]
  );

  const deleteBucket = useCallback(
    (id: string, options?: RunActionOptions<SuccessResponse>) =>
      runAction(() => deleteAsync(id), {
        loading: 'Deleting bucket…',
        success: 'Bucket deleted successfully!',
        ...options,
      }),
    [deleteAsync]
  );

  const seedDefaultBuckets = useCallback(
    (options?: RunActionOptions<Bucket[]>) =>
      runAction(() => seedAsync(), {
        loading: 'Seeding 50/30/20 buckets…',
        success: 'Default buckets created!',
        ...options,
      }),
    [seedAsync]
  );

  return {
    createBucket,
    updateBucket,
    deleteBucket,
    seedDefaultBuckets,
    isCreating,
    isUpdating,
    isDeleting,
    isSeeding,
    isSubmitting: isCreating || isUpdating || isDeleting || isSeeding,
  };
}
