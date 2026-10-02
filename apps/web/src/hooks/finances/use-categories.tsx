import { Category, CreateCategoryDto, UpdateCategoryDto } from '@kalya/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { financeKeys } from './keys';
import { CategoryService } from '@/libs/services/finances/categories.service';

export function useCategoriesQuery(
  bucketId?: string,
  options?: Omit<UseQueryOptions<Category[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financeKeys.categories(bucketId),
    queryFn: () => CategoryService.list(bucketId),
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useSeedDefaultCategoriesMutation(
  options?: UseMutationOptions<Category[], Error, void>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: CategoryService.seedDefaults,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useCreateCategoryMutation(
  options?: UseMutationOptions<Category, Error, CreateCategoryDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: CategoryService.create,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
      options?.onSuccess?.(data, ...args);
    },
  });
}

export function useUpdateCategoryMutation(
  options?: UseMutationOptions<Category, Error, { id: string; dto: UpdateCategoryDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, dto }) => CategoryService.update(id, dto),
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
      queryClient.invalidateQueries({ queryKey: financeKeys.categoryDetail(variables.id) });
      options?.onSuccess?.(data, variables, ...args);
    },
  });
}

export function useDeleteCategoryMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: CategoryService.delete,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
      queryClient.removeQueries({ queryKey: financeKeys.categoryDetail(id) });
      options?.onSuccess?.(data, id, ...args);
    },
  });
}
