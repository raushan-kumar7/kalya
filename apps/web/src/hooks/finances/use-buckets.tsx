import { Bucket, CreateBucketDto, UpdateBucketDto } from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { BucketService } from '@/libs/services/finances/buckets.service';

export function useBucketsQuery(
  options?: Omit<UseQueryOptions<Bucket[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.buckets(),
    queryFn: BucketService.list,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
}

export function useBucketDetailQuery(
  id: string,
  options?: Omit<UseQueryOptions<Bucket, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.bucketDetail(id),
    queryFn: () => BucketService.getById(id),
    enabled: Boolean(id && options?.enabled !== false),
    ...options,
  });
}

export function useSeedDefaultBucketsMutation(options?: UseMutationOptions<Bucket[], Error, void>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: BucketService.seedDefaults,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.buckets() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useCreateBucketMutation(
  options?: UseMutationOptions<Bucket, Error, CreateBucketDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: BucketService.create,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.buckets() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useUpdateBucketMutation(
  options?: UseMutationOptions<Bucket, Error, { id: string; dto: UpdateBucketDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, dto }) => BucketService.update(id, dto),
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.buckets() });
      queryClient.invalidateQueries({ queryKey: financeKeys.bucketDetail(variables.id) });
      options?.onSuccess?.(data, variables, ...args);
    },
  });
}

export function useDeleteBucketMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: BucketService.delete,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.buckets() });
      queryClient.removeQueries({ queryKey: financeKeys.bucketDetail(id) });
      options?.onSuccess?.(data, id, ...args);
    },
  });
}
