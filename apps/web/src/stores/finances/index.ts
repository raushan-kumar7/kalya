import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FinancesState, FinancesStore, INITIAL_EXPENSE_FILTERS, INITIAL_STATE } from './types';

export const useFinancesStore = create<FinancesStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setSelectedMonth: (selectedMonth) =>
        set((state) => ({
          selectedMonth,
          // Invalidate cached overview when switching months
          cachedOverview: state.selectedMonth === selectedMonth ? state.cachedOverview : null,
        })),

      setSelectedBucketId: (selectedBucketId) => set({ selectedBucketId }),

      setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),

      setExpenseFilters: (partial) =>
        set((state) => ({
          expenseFilters: {
            ...state.expenseFilters,
            ...partial,
            offset: partial.offset !== undefined ? partial.offset : 0, // reset offset on filter update unless specified
          },
        })),

      resetExpenseFilters: () => set({ expenseFilters: INITIAL_EXPENSE_FILTERS }),

      setCachedOverview: (cachedOverview) => set({ cachedOverview }),

      setCachedPortfolioSummary: (cachedPortfolioSummary) => set({ cachedPortfolioSummary }),

      setActiveBucketId: (activeBucketId) => set({ activeBucketId }),

      setActiveCategoryId: (activeCategoryId) => set({ activeCategoryId }),

      setActiveExpenseId: (activeExpenseId) => set({ activeExpenseId }),

      setActiveBudgetId: (activeBudgetId) => set({ activeBudgetId }),

      setActiveGoalId: (activeGoalId) => set({ activeGoalId }),

      setActiveSplitShareId: (activeSplitShareId) => set({ activeSplitShareId }),

      setActiveContactId: (activeContactId) => set({ activeContactId }),

      openModal: (activeModal, contextId) =>
        set((state) => {
          const updates: Partial<FinancesState> = { activeModal };
          if (activeModal === 'edit-bucket' && contextId) updates.activeBucketId = contextId;
          if (activeModal === 'edit-category' && contextId) updates.activeCategoryId = contextId;
          if (activeModal === 'edit-expense' && contextId) updates.activeExpenseId = contextId;
          if (activeModal === 'settle-split' && contextId) updates.activeSplitShareId = contextId;
          if (activeModal === 'edit-split-contact' && contextId)
            updates.activeContactId = contextId;
          return { ...state, ...updates };
        }),

      closeModal: () => set({ activeModal: null }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'kalya-finances-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences, not transient open modals or contextual IDs
      partialize: (state) => ({
        selectedMonth: state.selectedMonth,
        selectedBucketId: state.selectedBucketId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

/* ------------------------------------------------------------------ */
/* Granular Selectors for Optimized Component Re-rendering            */
/* ------------------------------------------------------------------ */
export const useSelectedMonth = () => useFinancesStore((s) => s.selectedMonth);
export const useSelectedBucketId = () => useFinancesStore((s) => s.selectedBucketId);
export const useSelectedCategoryId = () => useFinancesStore((s) => s.selectedCategoryId);
export const useExpenseFilters = () => useFinancesStore((s) => s.expenseFilters);
export const useCachedOverview = () => useFinancesStore((s) => s.cachedOverview);
export const useCachedPortfolioSummary = () => useFinancesStore((s) => s.cachedPortfolioSummary);
export const useActiveFinanceModal = () => useFinancesStore((s) => s.activeModal);
export const useActiveBucketId = () => useFinancesStore((s) => s.activeBucketId);
export const useActiveCategoryId = () => useFinancesStore((s) => s.activeCategoryId);
export const useActiveExpenseId = () => useFinancesStore((s) => s.activeExpenseId);
export const useActiveBudgetId = () => useFinancesStore((s) => s.activeBudgetId);
export const useActiveGoalId = () => useFinancesStore((s) => s.activeGoalId);
export const useActiveSplitShareId = () => useFinancesStore((s) => s.activeSplitShareId);
export const useActiveContactId = () => useFinancesStore((s) => s.activeContactId);
