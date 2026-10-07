import { useCallback } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  financeKeys,
  invalidateAfterTaxonomyRemoval,
  QueryOverrides,
  STALE,
  SuccessResponse,
} from './shared';
import { CategoryService } from '@/libs/services/finances';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@kalya/types';
import { RunActionOptions, runAction } from '@/libs';

/* ── Queries ─────────────────────────────────────────────── */

export const categoryQueries = {
  list: (bucketId?: string) =>
    queryOptions({
      queryKey: financeKeys.categories.list(bucketId),
      queryFn: () => CategoryService.list(bucketId),
      staleTime: STALE.long,
    }),
};

export function useCategoriesQuery(bucketId?: string, options?: QueryOverrides<Category[]>) {
  return useQuery({ ...categoryQueries.list(bucketId), ...options });
}

/* ── Mutations ───────────────────────────────────────────── */

const invalidateCategories = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: financeKeys.categories.all() });

export function useSeedDefaultCategoriesMutation() {
  const qc = useQueryClient();
  return useMutation<Category[], Error, void>({
    mutationFn: () => CategoryService.seedDefaults(),
    onSuccess: () => invalidateCategories(qc),
  });
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<Category, Error, CreateCategoryDto>({
    mutationFn: (dto) => CategoryService.create(dto),
    onSuccess: () => invalidateCategories(qc),
  });
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<Category, Error, { id: string; dto: UpdateCategoryDto }>({
    mutationFn: ({ id, dto }) => CategoryService.update(id, dto),
    onSuccess: () => invalidateCategories(qc),
  });
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<SuccessResponse, Error, string>({
    mutationFn: (id) => CategoryService.delete(id),
    onSuccess: async (_data, id) => {
      qc.removeQueries({ queryKey: financeKeys.categories.detail(id) });
      await Promise.all([invalidateCategories(qc), invalidateAfterTaxonomyRemoval(qc)]);
    },
  });
}

/* ── Actions (toast-integrated) ──────────────────────────── */

export function useCategoryActions() {
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateCategoryMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateCategoryMutation();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteCategoryMutation();
  const { mutateAsync: seedAsync, isPending: isSeeding } = useSeedDefaultCategoriesMutation();

  const createCategory = useCallback(
    (dto: CreateCategoryDto, options?: RunActionOptions<Category>) =>
      runAction(() => createAsync(dto), {
        loading: 'Creating category…',
        success: 'Category created successfully!',
        ...options,
      }),
    [createAsync]
  );

  const updateCategory = useCallback(
    (id: string, dto: UpdateCategoryDto, options?: RunActionOptions<Category>) =>
      runAction(() => updateAsync({ id, dto }), {
        loading: 'Updating category…',
        success: 'Category updated successfully!',
        ...options,
      }),
    [updateAsync]
  );

  const deleteCategory = useCallback(
    (id: string, options?: RunActionOptions<SuccessResponse>) =>
      runAction(() => deleteAsync(id), {
        loading: 'Deleting category…',
        success: 'Category deleted successfully!',
        ...options,
      }),
    [deleteAsync]
  );

  const seedDefaultCategories = useCallback(
    (options?: RunActionOptions<Category[]>) =>
      runAction(() => seedAsync(), {
        loading: 'Seeding standard categories…',
        success: 'Default categories created!',
        ...options,
      }),
    [seedAsync]
  );

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    seedDefaultCategories,
    isCreating,
    isUpdating,
    isDeleting,
    isSeeding,
    isSubmitting: isCreating || isUpdating || isDeleting || isSeeding,
  };
}
