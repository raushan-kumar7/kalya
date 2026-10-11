// 'use client';

// import React, { useState } from 'react';
// import {
//   INITIAL_TRANSACTION_FILTERS,
//   type SplitBillFeedItem,
//   type TransactionFilterState,
//   type TransactionTab,
//   type UnifiedTransactionItem,
// } from './types';
// import { useTransactions } from '@/hooks/finances/use-transactions';
// import { TransactionsHeader } from './header';
// import { SummaryStrip } from './summary-strip';
// import { FilterBar } from './filter-bar';
// import { TransactionsTable } from './table/transactions-table';
// import {
//   DEFAULT_COLUMN_VISIBILITY,
//   type ColumnVisibilityState,
// } from './table/column-visibility-menu';
// import { DetailsDrawer } from './details-drawer';
// import { TransactionsEmptyState } from './empty-states';
// import { TransactionsTableSkeleton } from './skeletons';
// import { ErrorState } from '@/components/ui/states';
// import {
//   ExpenseForm,
//   IncomeForm,
//   type ExpenseFormMode,
// } from '@/components/forms/finances/transactions';
// import type {
//   CreateExpenseDto,
//   CreateIncomeDto,
//   Expense,
//   Income,
//   UpdateExpenseDto,
//   UpdateIncomeDto,
// } from '@kalya/types';
// import type {
//   CreateExpenseInput,
//   CreateIncomeInput,
//   UpdateExpenseInput,
//   UpdateIncomeInput,
// } from '@kalya/validations';
// import { toast } from '@/components/ui/feedback';
// import { useRouter } from 'next/navigation';

// export function Transactions() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState<TransactionTab>('all');
//   const [filters, setFilters] = useState<TransactionFilterState>(INITIAL_TRANSACTION_FILTERS);

//   // Modal dialog states
//   const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
//   const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
//   const [expenseFormMode, setExpenseFormMode] = useState<ExpenseFormMode>('personal');
//   const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
//   const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

//   // Details drawer state
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [selectedDrawerItem, setSelectedDrawerItem] = useState<UnifiedTransactionItem | null>(null);

//   // Table-specific states: Row selection & column visibility
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [columnVisibility, setColumnVisibility] =
//     useState<ColumnVisibilityState>(DEFAULT_COLUMN_VISIBILITY);

//   // Master aggregation hook
//   const {
//     allCount,
//     filteredCount,
//     tabCounts,
//     summaryMetrics,
//     paginatedPageItems,
//     filteredTotals,
//     page,
//     setPage,
//     pageSize,
//     setPageSize,
//     isLoading,
//     isError,
//     error,
//     refetch,
//     monthLabel,
//     goToPreviousMonth,
//     goToNextMonth,
//     currentCalendarMonth,
//     goToCurrentMonth,
//     selectedMonth,
//     categories,
//     buckets,
//     isFilterActive,
//   } = useTransactions({ filters, activeTab });

//   // Mutations from useFinances
//   const { createExpense, updateExpense, deleteExpense, logIncome } = useFinances();

//   const updateIncomeMutation = useUpdateIncomeMutation();
//   const deleteIncomeMutation = useDeleteIncomeMutation();
//   const settleSplitMutation = useSettleSplitExpenseMutation();

//   // Filter handlers
//   const handleFilterChange = (partial: Partial<TransactionFilterState>) => {
//     setFilters((prev) => ({ ...prev, ...partial }));
//     setPage(1); // reset to page 1 on filter modification
//   };

//   const handleResetFilters = () => {
//     setFilters(INITIAL_TRANSACTION_FILTERS);
//     setPage(1);
//   };

//   // Column visibility handlers
//   const handleToggleColumnVisibility = (col: keyof ColumnVisibilityState) => {
//     setColumnVisibility((prev) => ({ ...prev, [col]: !prev[col] }));
//   };

//   const handleResetColumnVisibility = () => {
//     setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
//   };

//   // Row selection handlers
//   const handleSelectRow = (id: string) => {
//     setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
//   };

//   const handleSelectAllPage = (pageIds: string[]) => {
//     const allSelected = pageIds.every((id) => selectedIds.includes(id));
//     if (allSelected) {
//       setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
//     } else {
//       setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
//     }
//   };

//   const handleClearSelection = () => {
//     setSelectedIds([]);
//   };

//   const handleBulkDelete = async (ids: string[]) => {
//     try {
//       await Promise.all(
//         ids.map(async (id) => {
//           const item = paginatedPageItems.find((i) => i.id === id);
//           if (item?.kind === 'income') {
//             await deleteIncomeMutation.mutateAsync(id);
//           } else {
//             await deleteExpense(id);
//           }
//         })
//       );
//       toast.success(`Deleted ${ids.length} transactions`);
//     } catch {
//       toast.error('Failed to delete some selected transactions');
//     }
//   };

//   // Open creation modals
//   const handleOpenCreateExpense = (mode: ExpenseFormMode = 'personal') => {
//     setSelectedExpense(null);
//     setExpenseFormMode(mode);
//     setIsExpenseFormOpen(true);
//   };

//   const handleOpenCreateIncome = () => {
//     setSelectedIncome(null);
//     setIsIncomeFormOpen(true);
//   };

//   // Form submission
//   const handleSaveExpense = async (payload: CreateExpenseInput | UpdateExpenseInput) => {
//     if (selectedExpense) {
//       await updateExpense(selectedExpense.id, payload as UpdateExpenseDto);
//     } else {
//       await createExpense(payload as CreateExpenseDto);
//     }
//   };

//   const handleSaveIncome = async (payload: CreateIncomeInput | UpdateIncomeInput) => {
//     if (selectedIncome) {
//       await updateIncomeMutation.mutateAsync({
//         id: selectedIncome.id,
//         dto: payload as UpdateIncomeDto,
//       });
//       toast.success('Income updated successfully');
//     } else {
//       await logIncome(payload as CreateIncomeDto);
//     }
//   };

//   // Row Actions: View details, Edit, Duplicate, Delete, Settle
//   const handleViewDetails = (item: UnifiedTransactionItem) => {
//     setSelectedDrawerItem(item);
//     setIsDrawerOpen(true);
//   };

//   const handleEdit = (item: UnifiedTransactionItem) => {
//     if (item.kind === 'personal_expense') {
//       setSelectedExpense(item.raw);
//       setExpenseFormMode('personal');
//       setIsExpenseFormOpen(true);
//     } else if (item.kind === 'split_bill') {
//       setSelectedExpense(item.raw);
//       setExpenseFormMode('split');
//       setIsExpenseFormOpen(true);
//     } else if (item.kind === 'income') {
//       setSelectedIncome(item.raw);
//       setIsIncomeFormOpen(true);
//     }
//   };

//   const handleDelete = async (item: UnifiedTransactionItem) => {
//     try {
//       if (item.kind === 'personal_expense' || item.kind === 'split_bill') {
//         await deleteExpense(item.id);
//       } else if (item.kind === 'income') {
//         await deleteIncomeMutation.mutateAsync(item.id);
//         toast.success('Income deleted successfully');
//       }
//     } catch {
//       toast.error('Failed to delete transaction');
//     }
//   };

//   const handleSettleSplit = async (item: SplitBillFeedItem | UnifiedTransactionItem) => {
//     if (item.kind !== 'split_bill') return;
//     const pendingShare = item.members.find((m) => !m.settled);
//     if (pendingShare) {
//       try {
//         await settleSplitMutation.mutateAsync({
//           id: pendingShare.memberId,
//           dto: {
//             settled_amount: pendingShare.amount,
//             settled_via: 'upi',
//           },
//         });
//         toast.success(`Settled share for ${pendingShare.memberName}`);
//       } catch {
//         router.push('/dashboard/splits');
//       }
//     } else {
//       router.push('/dashboard/splits');
//     }
//   };

//   return (
//     <section className="flex h-full min-h-0 flex-col gap-5 pb-12">
//       {/* 1. Page Action Header */}
//       <TransactionsHeader
//         monthLabel={monthLabel}
//         onPreviousMonth={goToPreviousMonth}
//         onNextMonth={goToNextMonth}
//         isCurrentMonth={selectedMonth === currentCalendarMonth}
//         onGoToCurrentMonth={goToCurrentMonth}
//         onOpenCreateExpense={() => handleOpenCreateExpense('personal')}
//         onOpenCreateSplit={() => handleOpenCreateExpense('split')}
//         onOpenCreateIncome={handleOpenCreateIncome}
//       />

//       {/* 2. Summary Strip */}
//       <SummaryStrip metrics={summaryMetrics} />

//       {/* 3. Unified Filter + Tabs Bar */}
//       <FilterBar
//         filters={filters}
//         onFilterChange={handleFilterChange}
//         onResetFilters={handleResetFilters}
//         isFilterActive={isFilterActive}
//         activeTab={activeTab}
//         onTabChange={(tab) => {
//           setActiveTab(tab);
//           setPage(1);
//         }}
//         tabCounts={tabCounts}
//         categories={categories}
//         columnVisibility={columnVisibility}
//         onToggleColumnVisibility={handleToggleColumnVisibility}
//         onResetColumnVisibility={handleResetColumnVisibility}
//         items={paginatedPageItems}
//         totalRecordsCount={allCount}
//         filteredRecordsCount={filteredCount}
//       />

//       {/* 4. Main Content Area (Unified Table) */}
//       <div className="min-h-75">
//         {isLoading ? (
//           <TransactionsTableSkeleton rows={7} />
//         ) : isError ? (
//           <ErrorState
//             title="Failed to load transactions"
//             message={
//               error?.message ||
//               'Unable to retrieve your transaction history. Please verify your connection.'
//             }
//             onRetry={refetch}
//           />
//         ) : allCount === 0 ? (
//           <TransactionsEmptyState
//             type="no-data"
//             onOpenCreateExpense={() => handleOpenCreateExpense('personal')}
//             onOpenCreateSplit={() => handleOpenCreateExpense('split')}
//             onOpenCreateIncome={handleOpenCreateIncome}
//           />
//         ) : filteredCount === 0 ? (
//           activeTab === 'split' && tabCounts.split === 0 && !isFilterActive ? (
//             <TransactionsEmptyState
//               type="split-empty"
//               onOpenCreateExpense={() => handleOpenCreateExpense('personal')}
//               onOpenCreateSplit={() => handleOpenCreateExpense('split')}
//               onOpenCreateIncome={handleOpenCreateIncome}
//             />
//           ) : (
//             <TransactionsEmptyState
//               type="no-filter-match"
//               onClearFilters={handleResetFilters}
//               onOpenCreateExpense={() => handleOpenCreateExpense('personal')}
//               onOpenCreateSplit={() => handleOpenCreateExpense('split')}
//               onOpenCreateIncome={handleOpenCreateIncome}
//             />
//           )
//         ) : (
//           <TransactionsTable
//             items={paginatedPageItems}
//             totalCount={filteredCount}
//             filteredTotals={filteredTotals}
//             page={page}
//             pageSize={pageSize}
//             onPageChange={setPage}
//             onPageSizeChange={setPageSize}
//             sortBy={filters.sortBy}
//             onSortChange={(sortBy) => handleFilterChange({ sortBy })}
//             columnVisibility={columnVisibility}
//             onToggleColumnVisibility={handleToggleColumnVisibility}
//             onResetColumnVisibility={handleResetColumnVisibility}
//             selectedIds={selectedIds}
//             onSelectRow={handleSelectRow}
//             onSelectAllPage={handleSelectAllPage}
//             onClearSelection={handleClearSelection}
//             onBulkDelete={handleBulkDelete}
//             onViewDetails={handleViewDetails}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//             onSettleSplit={handleSettleSplit}
//             filters={filters}
//             onFilterChange={handleFilterChange}
//             categories={categories}
//             monthLabel={monthLabel}
//           />
//         )}
//       </div>

//       {/* 7. Details Drawer */}
//       <DetailsDrawer
//         open={isDrawerOpen}
//         onOpenChange={setIsDrawerOpen}
//         item={selectedDrawerItem}
//         onEdit={handleEdit}
//         onSettleSplit={handleSettleSplit}
//       />

//       {/* Forms (Modals) */}
//       <ExpenseForm
//         open={isExpenseFormOpen}
//         onOpenChange={setIsExpenseFormOpen}
//         expense={selectedExpense}
//         onSave={handleSaveExpense}
//         mode={expenseFormMode}
//       />

//       <IncomeForm
//         open={isIncomeFormOpen}
//         onOpenChange={setIsIncomeFormOpen}
//         income={selectedIncome!}
//         onSave={handleSaveIncome}
//       />
//     </section>
//   );
// }

// export default Transactions;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useTransactions,
  useExpenseActions,
  useIncomeActions,
  useSplitShareActions,
  useDeleteExpenseMutation,
  useDeleteIncomeMutation,
} from '@/hooks/finances';
import {
  INITIAL_TRANSACTION_FILTERS,
  type TransactionFilterState,
  type TransactionKind,
  type TransactionTab,
  type UnifiedTransactionItem,
} from './types';
import { TransactionsHeader } from './header';
import { SummaryStrip } from './summary-strip';
import { FilterBar } from './filter-bar';
import { TransactionsTable } from './table/transactions-table';
import {
  DEFAULT_COLUMN_VISIBILITY,
  type ColumnVisibilityState,
} from './table/column-visibility-menu';
import { DetailsDrawer } from './details-drawer';
import { TransactionsEmptyState } from './empty-states';
import { TransactionsTableSkeleton } from './skeletons';
import { ErrorState } from '@/components/ui/states';
import {
  ExpenseForm,
  IncomeForm,
  type ExpenseFormMode,
} from '@/components/forms/finances/transactions';
import type {
  CreateExpenseDto,
  CreateIncomeDto,
  Expense,
  Income,
  UpdateExpenseDto,
  UpdateIncomeDto,
} from '@kalya/types';
import type {
  CreateExpenseInput,
  CreateIncomeInput,
  UpdateExpenseInput,
  UpdateIncomeInput,
} from '@kalya/validations';
import { toast } from '@/components/ui/feedback';

export function Transactions() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TransactionTab>('all');
  const [filters, setFilters] = useState<TransactionFilterState>(INITIAL_TRANSACTION_FILTERS);

  // Modal dialog states
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [expenseFormMode, setExpenseFormMode] = useState<ExpenseFormMode>('personal');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  // Details drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<UnifiedTransactionItem | null>(null);

  // Table state. Selection remembers each row's kind, so a bulk delete still
  // routes correctly (income vs expense) for rows selected on other pages.
  const [selection, setSelection] = useState<Map<string, TransactionKind>>(new Map());
  const selectedIds = Array.from(selection.keys());
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(DEFAULT_COLUMN_VISIBILITY);

  // Feed -> filter -> sort -> summarise -> paginate (page resets itself inside the hook)
  const {
    allCount,
    filteredCount,
    tabCounts,
    summaryMetrics,
    filteredTotals,
    paginatedPageItems,
    page,
    setPage,
    pageSize,
    setPageSize,
    isLoading,
    isError,
    error,
    refetch,
    month,
    categories,
    isFilterActive,
  } = useTransactions({ filters, activeTab });

  const { monthLabel, isCurrentMonth, goToPrevMonth, goToNextMonth, goToCurrentMonth } = month;

  // Toast-integrated actions (each one shows its own loading / success / error toast)
  const { createExpense, updateExpense, deleteExpense } = useExpenseActions();
  const { logIncome, updateIncome, deleteIncome } = useIncomeActions();
  const { settleShare } = useSplitShareActions();

  // Raw mutations: used for bulk delete so we show ONE summary toast, not N.
  const deleteExpenseMutation = useDeleteExpenseMutation();
  const deleteIncomeMutation = useDeleteIncomeMutation();

  /* ── filters ── */
  const handleFilterChange = (partial: Partial<TransactionFilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => setFilters(INITIAL_TRANSACTION_FILTERS);

  /* ── column visibility ── */
  const handleToggleColumnVisibility = (col: keyof ColumnVisibilityState) => {
    setColumnVisibility((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const handleResetColumnVisibility = () => setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);

  /* ── row selection ── */
  const handleSelectRow = (id: string) => {
    const item = paginatedPageItems.find((i) => i.id === id);
    setSelection((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else if (item) next.set(id, item.kind);
      return next;
    });
  };

  const handleSelectAllPage = (pageIds: string[]) => {
    setSelection((prev) => {
      const next = new Map(prev);
      const allSelected = pageIds.every((id) => next.has(id));
      for (const id of pageIds) {
        if (allSelected) {
          next.delete(id);
        } else {
          const item = paginatedPageItems.find((i) => i.id === id);
          if (item) next.set(id, item.kind);
        }
      }
      return next;
    });
  };

  const handleClearSelection = () => setSelection(new Map());

  const handleBulkDelete = async (ids: string[]) => {
    const results = await Promise.allSettled(
      ids.map((id) =>
        selection.get(id) === 'income'
          ? deleteIncomeMutation.mutateAsync(id)
          : deleteExpenseMutation.mutateAsync(id)
      )
    );

    const deletedIds = ids.filter((_, i) => results[i].status === 'fulfilled');
    const failedCount = ids.length - deletedIds.length;

    // Drop only what was actually deleted; failed rows stay selected for a retry.
    setSelection((prev) => {
      const next = new Map(prev);
      deletedIds.forEach((id) => next.delete(id));
      return next;
    });

    if (failedCount === 0) toast.success(`Deleted ${deletedIds.length} transactions`);
    else if (deletedIds.length === 0) toast.error('Failed to delete selected transactions');
    else toast.error(`Deleted ${deletedIds.length}, but ${failedCount} failed`);
  };

  /* ── open creation modals ── */
  const handleOpenCreateExpense = (mode: ExpenseFormMode = 'personal') => {
    setSelectedExpense(null);
    setExpenseFormMode(mode);
    setIsExpenseFormOpen(true);
  };

  const handleOpenCreateIncome = () => {
    setSelectedIncome(null);
    setIsIncomeFormOpen(true);
  };

  /* ── form submission (toasts come from the action hooks) ── */
  const handleSaveExpense = async (payload: CreateExpenseInput | UpdateExpenseInput) => {
    if (selectedExpense) {
      await updateExpense(selectedExpense.id, payload as UpdateExpenseDto);
    } else {
      await createExpense(payload as CreateExpenseDto);
    }
  };

  const handleSaveIncome = async (payload: CreateIncomeInput | UpdateIncomeInput) => {
    if (selectedIncome) {
      await updateIncome(selectedIncome.id, payload as UpdateIncomeDto);
    } else {
      await logIncome(payload as CreateIncomeDto);
    }
  };

  /* ── row actions: view, edit, delete, settle ── */
  const handleViewDetails = (item: UnifiedTransactionItem) => {
    setSelectedDrawerItem(item);
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: UnifiedTransactionItem) => {
    if (item.kind === 'income') {
      setSelectedIncome(item.raw);
      setIsIncomeFormOpen(true);
      return;
    }
    setSelectedExpense(item.raw);
    setExpenseFormMode(item.kind === 'split_bill' ? 'split' : 'personal');
    setIsExpenseFormOpen(true);
  };

  const handleDelete = async (item: UnifiedTransactionItem) => {
    try {
      if (item.kind === 'income') await deleteIncome(item.id);
      else await deleteExpense(item.id);
    } catch {
      // runAction already surfaces the error toast
    }
  };

  const handleSettleSplit = async (item: UnifiedTransactionItem) => {
    if (item.kind !== 'split_bill') return;

    const pendingShare = item.members.find((m) => !m.settled);
    if (!pendingShare) {
      router.push('/dashboard/splits');
      return;
    }

    try {
      // The API settles a SHARE (row id), not a member.
      await settleShare(pendingShare.shareId, {
        settled_amount: pendingShare.amount,
        settled_via: 'upi',
      });
    } catch {
      router.push('/dashboard/splits');
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-5 pb-12">
      {/* 1. Page Action Header */}
      <TransactionsHeader
        monthLabel={monthLabel}
        onPreviousMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        isCurrentMonth={isCurrentMonth}
        onGoToCurrentMonth={goToCurrentMonth}
        onOpenCreateExpense={() => handleOpenCreateExpense('personal')}
        onOpenCreateSplit={() => handleOpenCreateExpense('split')}
        onOpenCreateIncome={handleOpenCreateIncome}
      />

      {/* 2. Summary Strip */}
      <SummaryStrip metrics={summaryMetrics} />

      {/* 3. Unified Filter + Tabs Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        isFilterActive={isFilterActive}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
        categories={categories}
        columnVisibility={columnVisibility}
        onToggleColumnVisibility={handleToggleColumnVisibility}
        onResetColumnVisibility={handleResetColumnVisibility}
        items={paginatedPageItems}
        totalRecordsCount={allCount}
        filteredRecordsCount={filteredCount}
      />

      {/* 4. Main Content Area (Unified Table) */}
      <div className="min-h-75">
        {isLoading ? (
          <TransactionsTableSkeleton rows={7} />
        ) : isError ? (
          <ErrorState
            title="Failed to load transactions"
            message={
              error?.message ||
              'Unable to retrieve your transaction history. Please verify your connection.'
            }
            onRetry={refetch}
          />
        ) : allCount === 0 ? (
          <TransactionsEmptyState
            type="no-data"
            onOpenCreateExpense={() => handleOpenCreateExpense('personal')}
            onOpenCreateSplit={() => handleOpenCreateExpense('split')}
            onOpenCreateIncome={handleOpenCreateIncome}
          />
        ) : filteredCount === 0 ? (
          activeTab === 'split' && tabCounts.split === 0 && !isFilterActive ? (
            <TransactionsEmptyState
              type="split-empty"
              onOpenCreateExpense={() => handleOpenCreateExpense('personal')}
              onOpenCreateSplit={() => handleOpenCreateExpense('split')}
              onOpenCreateIncome={handleOpenCreateIncome}
            />
          ) : (
            <TransactionsEmptyState
              type="no-filter-match"
              onClearFilters={handleResetFilters}
              onOpenCreateExpense={() => handleOpenCreateExpense('personal')}
              onOpenCreateSplit={() => handleOpenCreateExpense('split')}
              onOpenCreateIncome={handleOpenCreateIncome}
            />
          )
        ) : (
          <TransactionsTable
            items={paginatedPageItems}
            totalCount={filteredCount}
            filteredTotals={filteredTotals}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            sortBy={filters.sortBy}
            onSortChange={(sortBy) => handleFilterChange({ sortBy })}
            columnVisibility={columnVisibility}
            onToggleColumnVisibility={handleToggleColumnVisibility}
            onResetColumnVisibility={handleResetColumnVisibility}
            selectedIds={selectedIds}
            onSelectRow={handleSelectRow}
            onSelectAllPage={handleSelectAllPage}
            onClearSelection={handleClearSelection}
            onBulkDelete={handleBulkDelete}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSettleSplit={handleSettleSplit}
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
            monthLabel={monthLabel}
          />
        )}
      </div>

      {/* 5. Details Drawer */}
      <DetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        item={selectedDrawerItem}
        onEdit={handleEdit}
        onSettleSplit={handleSettleSplit}
      />

      {/* 6. Forms (Modals) */}
      <ExpenseForm
        open={isExpenseFormOpen}
        onOpenChange={setIsExpenseFormOpen}
        expense={selectedExpense}
        onSave={handleSaveExpense}
        mode={expenseFormMode}
      />

      <IncomeForm
        open={isIncomeFormOpen}
        onOpenChange={setIsIncomeFormOpen}
        income={selectedIncome!}
        onSave={handleSaveIncome}
      />
    </section>
  );
}
