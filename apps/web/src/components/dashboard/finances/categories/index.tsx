'use client';

import React, { useMemo, useState } from 'react';
import {
  useBucketsQuery,
  useCategoriesQuery,
  useCategoryActions,
  useFinanceModal,
} from '@/hooks/finances';
import { CategoryCard, CreateCategoryCard, CategoryCardSkeleton } from './card';
import { CategoryForm } from '@/components/forms/finances';
import {
  Button,
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui';
import { AlertTriangle, RefreshCw, Sparkles, Tag } from 'lucide-react';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@kalya/types';
import type { CreateCategoryInput, UpdateCategoryInput } from '@kalya/validations';

const SKELETON_COUNT = 6;

export function Categories() {
  // Queries
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategoriesQuery();

  const { data: buckets = [] } = useBucketsQuery();

  // Actions
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    seedDefaultCategories,
    isDeleting,
    isSeeding,
  } = useCategoryActions();

  // Modal
  const { activeModal, openModal, closeModal, activeCategoryId, setActiveCategoryId } =
    useFinanceModal();

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const builtInCategories = useMemo(() => {
    return categories.filter((c) => c.origin === 'built-in');
  }, [categories]);

  const customCategories = useMemo(() => {
    return categories.filter((c) => c.origin === 'custom');
  }, [categories]);

  const bucketCount = useMemo(() => {
    const set = new Set<string>();
    for (const category of categories) {
      const bId = category.bucket_id || (category as any).bucketId;
      if (bId) set.add(bId);
    }
    return set.size > 0 ? set.size : buckets.length;
  }, [categories, buckets]);

  // Helper to resolve parent bucket reliably across camelCase/snake_case
  const getCategoryBucket = useMemo(() => {
    return (cat: Category) => {
      const bId = cat.bucket_id || (cat as any).bucketId;
      const bKey = (cat as any).bucket || (cat as any).bucketKey;
      return buckets.find((b) => (bId && b.id === bId) || (bKey && b.key === bKey));
    };
  }, [buckets]);

  // Active category selected for edit mode
  const editingCategory =
    activeModal === 'edit-category' && activeCategoryId
      ? categories.find((c) => c.id === activeCategoryId)
      : undefined;

  const isFormOpen = activeModal === 'add-category' || activeModal === 'edit-category';

  const openCreate = () => {
    openModal('add-category');
  };

  const openEdit = (category: Category) => {
    openModal('edit-category', category.id);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      setActiveCategoryId(null);
    }
  };

  const handleSaveCategory = async (payload: CreateCategoryInput | UpdateCategoryInput) => {
    if (activeModal === 'edit-category' && activeCategoryId) {
      const res = await updateCategory(activeCategoryId, payload as UpdateCategoryDto);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update category');
      }
    } else {
      const res = await createCategory(payload as CreateCategoryDto);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create category');
      }
    }
    closeModal();
    setActiveCategoryId(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const res = await deleteCategory(pendingDelete.id);
    if (res.success) {
      setPendingDelete(null);
    }
  };

  const handleSeedDefaults = async () => {
    await seedDefaultCategories();
  };

  return (
    <section className="flex h-full min-h-0 flex-col space-y-6">
      {/** Header */}
      <div className="shrink-0 space-y-5 mt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-display-md text-text-primary">Categories</h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {isCategoriesLoading
                ? 'Loading categories…'
                : categoriesError
                  ? categoriesError.message || 'Error loading categories'
                  : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'} across ${bucketCount} ${bucketCount === 1 ? 'bucket' : 'buckets'}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {categories.length === 0 && !isCategoriesLoading && (
              <Button
                variant="outline"
                onClick={handleSeedDefaults}
                isLoading={isSeeding}
                className="gap-1.5"
              >
                Seed standard set
              </Button>
            )}

            <Button onClick={openCreate} className="gap-1.5">
              <Sparkles size={16} />
              New category
            </Button>
          </div>
        </div>
      </div>

      {/** Error banner */}
      {categoriesError && (
        <div className="border-danger/30 bg-danger/10 mb-6 flex items-center justify-between rounded-lg border p-4 text-sm text-danger">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Failed to load categories. Please try again.</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchCategories()}
            className="text-danger hover:bg-danger/20 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/** Main scrollable body */}
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto pb-8">
        {/* Loading skeleton state */}
        {isCategoriesLoading ? (
          <div className="space-y-8">
            <div>
              <div className="bg-surface-raised mb-3 h-4 w-36 animate-pulse rounded" />
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
                  <CategoryCardSkeleton key={idx} />
                ))}
              </div>
            </div>
          </div>
        ) : categories.length === 0 ? (
          /* Empty state */
          <EmptyState
            icon={<Tag className="h-8 w-8 text-primary" />}
            title="No categories yet"
            description="Seed the standard set of everyday categories — groceries, rent, transport, and more — to get started, then customize or add your own alongside them."
            action={
              <Button
                onClick={handleSeedDefaults}
                isLoading={isSeeding}
                leadingIcon={<Sparkles className="h-4 w-4" />}
              >
                Seed standard categories
              </Button>
            }
            secondaryAction={
              <Button variant="outline" onClick={openCreate}>
                Create custom category
              </Button>
            }
          />
        ) : (
          /* Populated categories sections */
          <div className="space-y-8">
            {/* Built-in categories */}
            {builtInCategories.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-body-sm text-text-muted font-medium">
                    Built-in Categories{' '}
                    <span className="text-caption text-text-secondary ml-1 font-mono">
                      ({builtInCategories.length})
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                  {builtInCategories.map((category) => {
                    const parentBucket = getCategoryBucket(category);
                    return (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        bucket={parentBucket}
                        onEdit={() => openEdit(category)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom categories */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-body-sm text-text-muted font-medium">
                  Custom Categories{' '}
                  <span className="text-caption text-text-secondary ml-1 font-mono">
                    ({customCategories.length})
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                <CreateCategoryCard onClick={openCreate} />
                {customCategories.map((category) => {
                  const parentBucket = getCategoryBucket(category);
                  return (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      bucket={parentBucket}
                      onEdit={() => openEdit(category)}
                      onDelete={() => setPendingDelete(category)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Creation / Edit Modal */}
      <CategoryForm
        open={isFormOpen}
        onOpenChange={handleModalOpenChange}
        buckets={buckets}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <ModalContent size="sm">
          <ModalHeader tone="danger" icon={<AlertTriangle className="h-5 w-5 text-danger" />}>
            <ModalTitle>Delete &ldquo;{pendingDelete?.label}&rdquo;?</ModalTitle>
            <ModalDescription>
              This custom category will be permanently removed. Any past transactions assigned to it
              will remain intact, but will no longer be linked to this tag.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Delete Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
