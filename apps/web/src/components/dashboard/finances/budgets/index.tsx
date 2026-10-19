'use client';

import React, { useState } from 'react';
import { AlertTriangle, Plus, RotateCw, Sparkles, Wallet } from 'lucide-react';
import { MonthSwitcher } from '@/components/shared';
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
import { BudgetCard, BudgetCardSkeleton, BudgetSummaryStrip } from './cards';
import { AllocationChart, BudgetHistoryChart, BudgetVsActualChart, SpendPaceChart } from './charts';
import { BudgetAlertsCard } from './alerts';
import { BudgetDetailsSheet } from './details-sheet';
import type { BudgetRow } from './types';
import { BudgetForm } from '@/components/forms/finances';
import type { CreateBudgetDto, UpdateBudgetDto } from '@kalya/types';
import type { CreateBudgetInput, UpdateBudgetInput } from '@kalya/validations';
import { useBudgetsData } from '@/hooks/finances';
import { cn } from '@/libs/utils';

export function Budgets() {
  const {
    month,
    budgets,
    incomes,
    buckets,
    totals,
    rows,
    alerts,
    insights,
    pace,
    history,
    totalIncome,
    hasIncome,
    isEmpty,
    canGenerate,
    generating,
    isLoading,
    error,
    actions,
    modal,
    selectedDrillDownBudget,
    setSelectedDrillDownBudget,
    handleGenerateFromIncome,
    refetchAll,
  } = useBudgetsData();

  const [pendingDelete, setPendingDelete] = useState<BudgetRow | null>(null);

  const editingBudget =
    modal.activeModal === 'edit-budget' && modal.activeBudgetId
      ? budgets.find((b) => b.id === modal.activeBudgetId)
      : undefined;

  const handleSaveBudget = async (payload: CreateBudgetInput | UpdateBudgetInput) => {
    if (modal.activeModal === 'edit-budget' && modal.activeBudgetId) {
      const res = await actions.updateBudget(modal.activeBudgetId, payload as UpdateBudgetDto);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update budget');
      }
      modal.setActiveBudgetId(null);
    } else {
      const res = await actions.createBudget(payload as CreateBudgetDto);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create budget');
      }
    }
  };

  const handleEdit = (b: BudgetRow) => {
    modal.setActiveBudgetId(b.id);
    modal.openModal('edit-budget', b.id);
  };

  const handleDelete = (b: BudgetRow) => setPendingDelete(b);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const res = await actions.deleteBudget(pendingDelete.id);
    if (res.success) {
      setPendingDelete(null);
      if (selectedDrillDownBudget?.id === pendingDelete.id) {
        setSelectedDrillDownBudget(null);
      }
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-12">
      {/* Header & Controls Row */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h2 className="font-display text-display-md text-text-primary">Budgets &amp; Limits</h2>
          <p className="text-body-sm text-text-secondary mt-1">
            {month.monthLabel
              ? `${month.monthLabel} allocation targets & spending caps`
              : 'Allocation targets & spending caps'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <MonthSwitcher
            monthLabel={month.monthLabel}
            isCurrentMonth={month.isCurrentMonth}
            onPreviousMonth={month.goToPrevMonth}
            onNextMonth={month.goToNextMonth}
            onGoToCurrentMonth={month.goToCurrentMonth}
            resetLabel="This Month"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchAll()}
            disabled={isLoading}
            className="gap-1.5"
            aria-label="Refresh budgets"
          >
            <RotateCw size={15} className={cn('shrink-0', isLoading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5"
            disabled={!canGenerate || generating}
            onClick={handleGenerateFromIncome}
            title={canGenerate ? undefined : 'Available when this month has income and no budgets'}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Generate from income</span>
            <span className="sm:hidden">Generate</span>
          </Button>

          <Button
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={() => modal.openModal('add-budget')}
          >
            <Plus className="h-4 w-4" />
            <span>Create budget</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 space-y-6">
        {error ? (
          <div className="rounded-xl border border-danger/30 bg-danger-subtle/30 p-4 text-body-sm text-danger flex items-center justify-between">
            <span>Could not load budget data: {error}</span>
            <Button variant="outline" size="sm" onClick={() => refetchAll()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-raised" />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <BudgetCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={<Wallet className="h-6 w-6" size={28} />}
            title={hasIncome ? 'No active budgets for this month' : 'Log income first'}
            description={
              hasIncome
                ? 'Generate 50/30/20 budgets automatically from this month’s income or configure custom bucket limits.'
                : 'Budgets are funded by monthly income cycles. Log this month’s income first, then generate budgets.'
            }
            action={
              hasIncome ? (
                <Button
                  size="sm"
                  className="cursor-pointer gap-1.5"
                  disabled={!canGenerate || generating}
                  onClick={handleGenerateFromIncome}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate from income</span>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* KPI Summary Strip */}
            <BudgetSummaryStrip totals={totals} isLoading={isLoading} />

            {/* Alerts & Insights Section if active warnings or useful insights exist */}
            <BudgetAlertsCard
              alerts={alerts}
              insights={insights}
              budgets={rows}
              onSelectBudget={(id) => {
                const found = rows.find((r) => r.id === id);
                if (found) setSelectedDrillDownBudget(found);
              }}
            />

            {/* Main Budget Cards Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-caption font-medium text-text-muted px-1">
                <span>Active Bucket Budgets ({rows.length})</span>
                <span>Click any card to inspect category breakdown &amp; safe pace</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((b) => (
                  <BudgetCard
                    key={b.id}
                    budget={b}
                    onClick={() => setSelectedDrillDownBudget(b)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

            {/* Financial Visualizations Grid */}
            <div className="grid gap-5 lg:grid-cols-2">
              <BudgetVsActualChart budgets={rows} isLoading={isLoading} />
              <AllocationChart budgets={rows} totalIncome={totalIncome} isLoading={isLoading} />
              <SpendPaceChart data={pace} totalBudget={totals.budgeted} isLoading={isLoading} />
              <BudgetHistoryChart data={history} isLoading={isLoading} />
            </div>
          </>
        )}
      </div>

      {/* Drill-Down Panel (Drawer Sheet) */}
      <BudgetDetailsSheet
        budget={selectedDrillDownBudget}
        open={Boolean(selectedDrillDownBudget)}
        onOpenChange={(open) => !open && setSelectedDrillDownBudget(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Shared Form Modal for Creating & Editing Budgets */}
      <BudgetForm
        open={modal.activeModal === 'add-budget' || modal.activeModal === 'edit-budget'}
        onOpenChange={(open) => {
          if (!open) {
            modal.closeModal();
            modal.setActiveBudgetId(null);
          } else {
            modal.openModal('add-budget');
          }
        }}
        budget={editingBudget}
        onSave={handleSaveBudget}
        buckets={buckets}
        incomes={incomes}
        selectedMonth={month.selectedMonth}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <ModalContent size="sm">
          <ModalHeader tone="danger" icon={<AlertTriangle className="h-5 w-5" />}>
            <ModalTitle>Delete budget plan</ModalTitle>
            <ModalDescription>
              {pendingDelete && (
                <>
                  This permanently removes the{' '}
                  <strong className="text-text-primary">{pendingDelete.bucketLabel}</strong> budget
                  cap. Historical transactions will not be affected.
                </>
              )}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => setPendingDelete(null)}
              disabled={actions.isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={actions.isDeleting}
              disabled={actions.isDeleting}
            >
              Delete budget
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}

export default Budgets;
