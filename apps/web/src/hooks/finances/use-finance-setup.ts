import { useCallback } from 'react';
import { runAction } from '@/libs';
import { useSeedDefaultBucketsMutation } from './use-buckets';
import { useSeedDefaultCategoriesMutation } from './use-categories';

/**
 * First-run setup: seeds the 50/30/20 buckets, then the default categories.
 * (Replaces `seedDefaults` from the old `useFinances` god hook.)
 */
export function useFinanceSetup() {
  const { mutateAsync: seedBuckets, isPending: isSeedingBuckets } = useSeedDefaultBucketsMutation();
  const { mutateAsync: seedCategories, isPending: isSeedingCategories } =
    useSeedDefaultCategoriesMutation();

  const seedDefaults = useCallback(
    () =>
      runAction(
        async () => {
          // Order matters: categories reference buckets.
          await seedBuckets();
          await seedCategories();
          return true;
        },
        {
          loading: 'Initializing 50/30/20 framework…',
          success: 'Default buckets and categories initialized!',
        }
      ),
    [seedBuckets, seedCategories]
  );

  return { seedDefaults, isSeeding: isSeedingBuckets || isSeedingCategories };
}
