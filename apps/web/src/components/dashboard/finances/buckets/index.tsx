'use client';

import React, { useMemo, useState } from 'react';
import { useBucketActions, useBucketsQuery, useFinanceModal } from '@/hooks/finances';
import {
  BucketCard,
  CreateCustomBucketCard,
  AllocationBar,
  type AllocationSegment,
  BucketCardSkeleton,
} from './card';
import { BucketForm } from '@/components/forms/finances';
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
import { AlertTriangle, PiggyBank, Sparkles } from 'lucide-react';
import type { Bucket, CreateBucketDto, UpdateBucketDto } from '@kalya/types';
import type { CreateBucketInput, UpdateBucketInput } from '@kalya/validations';

const SKELETON_COUNT = 3;

export function Buckets() {
  // Queries
  const {
    data: buckets = [],
    isLoading: isBucketsLoading,
    error: bucketsError,
    refetch: refetchBuckets,
  } = useBucketsQuery();

  // Actions
  const { createBucket, updateBucket, deleteBucket, seedDefaultBuckets, isDeleting, isSeeding } =
    useBucketActions();

  // Modal
  const { activeModal, openModal, closeModal, activeBucketId, setActiveBucketId } =
    useFinanceModal();

  const [pendingDelete, setPendingDelete] = useState<Bucket | null>(null);

  const builtInBuckets = useMemo(() => {
    return buckets.filter((b) => b.origin === 'built-in');
  }, [buckets]);

  const customBuckets = useMemo(() => {
    return buckets.filter((b) => b.origin === 'custom');
  }, [buckets]);

  // Robust percentage calculation (handles camelCase targetPercent from API or snake_case target_percent)
  const allocatedPercent = useMemo(() => {
    const total = buckets.reduce((sum, b) => {
      const raw = (b as any).targetPercent ?? b.target_percent;
      const val = raw != null ? parseFloat(String(raw)) : 0;
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);
    return Math.round(total * 10) / 10;
  }, [buckets]);

  // Active bucket selected for edit mode
  const editingBucket =
    activeModal === 'edit-bucket' && activeBucketId
      ? buckets.find((b) => b.id === activeBucketId)
      : undefined;

  // Other allocated percent for the active editing bucket
  const otherAllocated = useMemo(() => {
    if (editingBucket) {
      const raw = (editingBucket as any).targetPercent ?? editingBucket.target_percent;
      const currentVal = raw != null ? parseFloat(String(raw)) : 0;
      return Math.max(0, allocatedPercent - (Number.isFinite(currentVal) ? currentVal : 0));
    }
    return allocatedPercent;
  }, [editingBucket, allocatedPercent]);

  // Segments for multi-bucket allocation bar
  const allocationSegments = useMemo<AllocationSegment[]>(() => {
    return buckets
      .map((b) => {
        const raw = (b as any).targetPercent ?? b.target_percent;
        const val = raw != null ? parseFloat(String(raw)) : 0;
        return {
          key: b.id,
          label: b.label,
          percent: Number.isFinite(val) ? val : 0,
          color: b.color ?? undefined,
          builtInKey: b.origin === 'built-in' ? (b.key as any) : undefined,
        };
      })
      .filter((s) => s.percent > 0);
  }, [buckets]);

  const handleSaveBucket = async (payload: CreateBucketInput | UpdateBucketInput) => {
    if (activeModal === 'edit-bucket' && activeBucketId) {
      const res = await updateBucket(activeBucketId, payload as UpdateBucketDto);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update bucket');
      }
      setActiveBucketId(null);
    } else {
      const res = await createBucket(payload as CreateBucketDto);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create bucket');
      }
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const res = await deleteBucket(pendingDelete.id);
    if (res.success) {
      setPendingDelete(null);
    }
  };

  const handleSeed = async () => {
    await seedDefaultBuckets();
  };

  return (
    <section className="flex h-full min-h-0 flex-col space-y-6">
      {/* Top Header Row */}
      <div className="shrink-0 space-y-5 mt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-display-md text-text-primary">Buckets</h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {isBucketsLoading
                ? 'Loading buckets…'
                : bucketsError
                  ? bucketsError.message
                  : `${buckets.length} ${buckets.length === 1 ? 'bucket' : 'buckets'} · ${allocatedPercent}% allocated`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={isSeeding || isBucketsLoading}
              isLoading={isSeeding}
            >
              Reset to 50/30/20
            </Button>
            <Button
              size="sm"
              onClick={() => openModal('add-bucket')}
              className="gap-1.5"
              disabled={isBucketsLoading}
            >
              <Sparkles size={16} />
              New Bucket
            </Button>
          </div>
        </div>
      </div>

      {/* Target Allocation Visual Bar Hero */}
      {!isBucketsLoading && buckets.length > 0 && (
        <div className="border-border bg-surface rounded-xl border p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-body-sm text-text-primary font-medium">Allocation</h3>
            <span className="font-numeric text-caption text-text-muted">
              {allocatedPercent}% Total
            </span>
          </div>
          <AllocationBar segments={allocationSegments} total={allocatedPercent} />
        </div>
      )}

      {/* Scrollable Content Zone */}
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto pb-8">
        {/* Built-in Empty State */}
        {!isBucketsLoading && builtInBuckets.length === 0 ? (
          <EmptyState
            icon={<PiggyBank className="text-text-muted" size={28} />}
            title="No built-in buckets yet"
            description="Seed the 50/30/20 defaults — needs, wants, and savings — to get started, then adjust the targets to fit your budget."
            action={
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                isLoading={isSeeding}
                leadingIcon={<Sparkles className="h-4 w-4" />}
              >
                Seed 50/30/20 Defaults
              </Button>
            }
            secondaryAction={
              <Button variant="outline" onClick={() => openModal('add-bucket')}>
                Create Custom Bucket
              </Button>
            }
          />
        ) : (
          <>
            {/* Built-in Buckets Section */}
            <div>
              <h3 className="text-body-sm text-text-muted mb-3 font-medium">Built-in Buckets</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                {isBucketsLoading
                  ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                      <BucketCardSkeleton key={i} />
                    ))
                  : builtInBuckets.map((b) => (
                      <BucketCard
                        key={b.id}
                        bucket={b}
                        onEdit={(bucket) => {
                          setActiveBucketId(bucket.id);
                          openModal('edit-bucket', bucket.id);
                        }}
                      />
                    ))}
              </div>
            </div>

            {/* Custom Buckets Section */}
            <div>
              <h3 className="text-body-sm text-text-muted mb-3 font-medium">Custom Buckets</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                <CreateCustomBucketCard onClick={() => openModal('add-bucket')} />
                {!isBucketsLoading &&
                  customBuckets.map((b) => (
                    <BucketCard
                      key={b.id}
                      bucket={b}
                      onEdit={(bucket) => {
                        setActiveBucketId(bucket.id);
                        openModal('edit-bucket', bucket.id);
                      }}
                      onDelete={(bucket) => setPendingDelete(bucket)}
                    />
                  ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Shared Form Modal for Creating & Editing Buckets */}
      <BucketForm
        open={activeModal === 'add-bucket' || activeModal === 'edit-bucket'}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
            setActiveBucketId(null);
          } else {
            openModal('add-bucket');
          }
        }}
        bucket={editingBucket}
        onSave={handleSaveBucket}
        otherBucketsAllocatedPercent={otherAllocated}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <ModalContent size="sm">
          <ModalHeader tone="danger" icon={<AlertTriangle className="h-5 w-5" />}>
            <ModalTitle>Delete bucket</ModalTitle>
            <ModalDescription>
              {pendingDelete && (
                <>
                  This removes <strong className="text-text-primary">{pendingDelete.label}</strong>.
                  Categories and budgets already tagged with it keep the tag, but you won&apos;t be
                  able to pick it again.
                </>
              )}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete bucket
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}

export default Buckets;
