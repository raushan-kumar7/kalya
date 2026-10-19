'use client';

import React, { useState } from 'react';
import { AlertTriangle, Plus, RotateCw, Target } from 'lucide-react';
import {
  Button,
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui';
import { useGoalsData } from '@/hooks/finances';
import type { CreateGoalDto, UpdateGoalDto } from '@kalya/types';
import type { CreateGoalInput, UpdateGoalInput } from '@kalya/validations';
import { GoalForm } from '@/components/forms/finances/goal';
import { GoalsSummaryStrip, GoalCard, GoalCardSkeleton, GoalCompactRow } from './cards';
import { GoalsChartsSection } from './charts';
import { GoalDetailsSheet } from './details-sheet';
import { GoalsFilters } from './filters';
import { GoalsInsightsBanner } from './insights';
import { GoalsEmptyState, type GoalTemplate } from './empty-state';
import { AddContributionDialog } from './add-contribution-dialog';
import type { GoalRow } from './types';

export function Goals() {
  const {
    goals,
    filteredGoals,
    buckets,
    totals,
    insights,
    filters,
    setFilters,
    selectedGoal,
    selectedGoalId,
    setSelectedGoalId,
    modal,
    actions,
    handleAddContribution,
    handleDeleteContribution,
    handleTogglePause,
    handleMarkComplete,
    isLoading,
    refetchAll,
  } = useGoalsData();

  // Active dialog states
  const [goalToEdit, setGoalToEdit] = useState<GoalRow | null>(null);
  const [goalToAddMoney, setGoalToAddMoney] = useState<GoalRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GoalRow | null>(null);
  const [templateInitialValues, setTemplateInitialValues] =
    useState<Partial<CreateGoalInput> | null>(null);
  const [dismissedInsightIds, setDismissedInsightIds] = useState<string[]>([]);

  const visibleInsights = insights.filter((i) => !dismissedInsightIds.includes(i.id));

  // Open Create Goal modal with blank or template defaults
  const handleOpenCreateModal = (template?: GoalTemplate) => {
    if (template) {
      const d = new Date();
      d.setMonth(d.getMonth() + template.monthsAhead);
      setTemplateInitialValues({
        name: template.name,
        target_amount: template.target_amount,
        target_date: d.toISOString().slice(0, 10),
        monthly_contribution_plan: template.monthly_contribution_plan,
        current_progress: 0,
      });
    } else {
      setTemplateInitialValues(null);
    }
    setGoalToEdit(null);
    modal.openModal('add-goal');
  };

  const handleEditGoal = (goal: GoalRow) => {
    setGoalToEdit(goal);
    setTemplateInitialValues(null);
    modal.openModal('edit-goal');
  };

  const handleSaveGoal = async (payload: CreateGoalInput | UpdateGoalInput) => {
    if (goalToEdit) {
      await actions.updateGoal(goalToEdit.id, payload as UpdateGoalDto);
      setGoalToEdit(null);
    } else {
      await actions.createGoal(payload as CreateGoalDto);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await actions.deleteGoal(pendingDelete.id);
    if (selectedGoalId === pendingDelete.id) {
      setSelectedGoalId(null);
    }
    setPendingDelete(null);
  };

  const isEmpty = goals.length === 0 && !isLoading;

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-16">
      {/* ── Page Header & Controls Row ──────────────────────────── */}
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary shadow-xs">
              <Target className="h-5 w-5" />
            </span>
            <h1 className="font-display text-text-display-md font-bold tracking-tight text-text-primary">
              Savings Goals
            </h1>
          </div>
          <p className="mt-1 text-body-sm text-text-muted">
            Track milestones, plan monthly contributions, and keep your savings objectives on
            schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={refetchAll}
            className="h-9 w-9 p-0 text-text-muted hover:text-text-primary"
            title="Refresh Goals"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenCreateModal()}
            className="gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </Button>
        </div>
      </div>

      {/* ── Summary Strip (6 KPI Cards) ─────────────────────────── */}
      <GoalsSummaryStrip totals={totals} isLoading={isLoading} />

      {/* ── Smart Insights & Milestone Celebrations ─────────────── */}
      <GoalsInsightsBanner
        insights={visibleInsights}
        onActionClick={(goalId) => {
          if (goalId) setSelectedGoalId(goalId);
        }}
        onDismiss={(id) => setDismissedInsightIds((prev) => [...prev, id])}
      />

      {/* ── Charts Section (Expandable/Tabbed) ───────────────────── */}
      {!isEmpty && <GoalsChartsSection goals={goals} isLoading={isLoading} />}

      {/* ── Filters & Controls ─────────────────────────────────── */}
      {!isEmpty && (
        <GoalsFilters
          filters={filters}
          onFiltersChange={setFilters}
          buckets={buckets}
          totalGoalsCount={goals.length}
          filteredCount={filteredGoals.length}
        />
      )}

      {/* ── Main Goals Grid / List Content ──────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
        </div>
      ) : isEmpty ? (
        <GoalsEmptyState
          onCreateGoal={() => handleOpenCreateModal()}
          onSelectTemplate={(tmpl) => handleOpenCreateModal(tmpl)}
        />
      ) : filteredGoals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-body-sm text-text-muted">
          No goals found matching the selected filter criteria.
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  ...filters,
                  status: 'all',
                  bucketId: 'all',
                  searchQuery: '',
                })
              }
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : filters.viewMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((g: GoalRow) => (
            <GoalCard
              key={g.id}
              goal={g}
              onClick={(goal) => setSelectedGoalId(goal.id)}
              onAddMoney={(goal) => setGoalToAddMoney(goal)}
              onEdit={handleEditGoal}
              onTogglePause={handleTogglePause}
              onMarkComplete={handleMarkComplete}
              onDelete={(goal) => setPendingDelete(goal)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredGoals.map((g: GoalRow) => (
            <GoalCompactRow
              key={g.id}
              goal={g}
              onClick={(goal) => setSelectedGoalId(goal.id)}
              onAddMoney={(goal) => setGoalToAddMoney(goal)}
              onEdit={handleEditGoal}
              onTogglePause={handleTogglePause}
              onDelete={(goal) => setPendingDelete(goal)}
            />
          ))}
        </div>
      )}

      {/* ── Goal Details Drawer Sheet ───────────────────────────── */}
      <GoalDetailsSheet
        goal={selectedGoal}
        open={Boolean(selectedGoalId)}
        onOpenChange={(open) => !open && setSelectedGoalId(null)}
        onAddMoney={(goal) => setGoalToAddMoney(goal)}
        onEdit={(goal) => {
          setSelectedGoalId(null);
          handleEditGoal(goal);
        }}
        onDelete={(goal) => {
          setSelectedGoalId(null);
          setPendingDelete(goal);
        }}
        onDeleteContribution={handleDeleteContribution}
      />

      {/* ── Create / Edit Goal Form Modal ───────────────────────── */}
      <GoalForm
        open={modal.activeModal === 'add-goal' || modal.activeModal === 'edit-goal'}
        onOpenChange={(open) => {
          if (!open) {
            modal.closeModal();
            setGoalToEdit(null);
            setTemplateInitialValues(null);
          }
        }}
        goal={goalToEdit as any}
        initialValues={templateInitialValues ?? undefined}
        onSave={handleSaveGoal}
        buckets={buckets}
      />

      {/* ── Add Contribution / Add Money Dialog ─────────────────── */}
      <AddContributionDialog
        goal={goalToAddMoney}
        open={Boolean(goalToAddMoney)}
        onOpenChange={(open) => !open && setGoalToAddMoney(null)}
        onSubmit={handleAddContribution}
      />

      {/* ── Delete Confirmation Dialog ──────────────────────────── */}
      <Modal open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <ModalContent size="sm">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-subtle text-danger">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <ModalTitle>Delete Goal</ModalTitle>
                <ModalDescription>
                  Are you sure you want to delete &ldquo;{pendingDelete?.name}&rdquo;? This will
                  permanently remove its target progress and contribution records.
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </ModalClose>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Delete Goal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
