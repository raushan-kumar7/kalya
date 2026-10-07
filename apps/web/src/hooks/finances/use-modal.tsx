import { useFinancesStore } from '@/stores/finances';
import { FinanceModalType } from '@/stores/finances/types';
import { useCallback } from 'react';

export function useFinanceModal() {
  const activeModal = useFinancesStore((s) => s.activeModal);
  const openModal = useFinancesStore((s) => s.openModal);
  const closeModal = useFinancesStore((s) => s.closeModal);

  // bucket
  const activeBucketId = useFinancesStore((s) => s.activeBucketId);
  const setActiveBucketId = useFinancesStore((s) => s.setActiveBucketId);

  // category
  const activeCategoryId = useFinancesStore((s) => s.activeCategoryId);
  const setActiveCategoryId = useFinancesStore((s) => s.setActiveCategoryId);

  // split-contact
  const activeContactId = useFinancesStore((s) => s.activeContactId);
  const setActiveContactId = useFinancesStore((s) => s.setActiveContactId);

  // expense
  const activeExpenseId = useFinancesStore((s) => s.activeExpenseId);
  const setActiveExpenseId = useFinancesStore((s) => s.setActiveExpenseId);

  // budget
  const activeBudgetId = useFinancesStore((s) => s.activeBudgetId);
  const setActiveBudgetId = useFinancesStore((s) => s.setActiveBudgetId);

  // goal
  const activeGoalId = useFinancesStore((s) => s.activeGoalId);
  const setActiveGoalId = useFinancesStore((s) => s.setActiveGoalId);

  const isOpen = useCallback(
    (type: FinanceModalType | FinanceModalType[]) => {
      return Array.isArray(type)
        ? type.includes(activeModal as FinanceModalType)
        : activeModal === type;
    },
    [activeModal]
  );

  return {
    activeModal,
    openModal,
    closeModal,
    isOpen,

    activeBucketId,
    setActiveBucketId,

    activeCategoryId,
    setActiveCategoryId,

    activeContactId,
    setActiveContactId,

    activeExpenseId,
    setActiveExpenseId,

    activeBudgetId,
    setActiveBudgetId,

    activeGoalId,
    setActiveGoalId,
  };
}
