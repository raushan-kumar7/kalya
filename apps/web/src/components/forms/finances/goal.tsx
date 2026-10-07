import { zodResolver } from '@hookform/resolvers/zod';
import { Goal } from '@kalya/types';
import {
  CreateGoalInput,
  CreateGoalSchema,
  UpdateGoalInput,
  UpdateGoalSchema,
} from '@kalya/validations';
import { useForm } from 'react-hook-form';
import { FinanceFormModal } from './modal';
import { Target } from 'lucide-react';

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  onSave: (payload: CreateGoalInput | UpdateGoalInput) => Promise<void>;
}

export function GoalForm({ open, onOpenChange, goal, onSave }: GoalFormProps) {
  const isEdit = Boolean(goal);

  const form = useForm<CreateGoalInput>({
    resolver: zodResolver(isEdit ? UpdateGoalSchema : (CreateGoalSchema as any)),
    defaultValues: {
      bucket_id: goal?.bucket_id ?? '',
      name: goal?.name ?? '',
      target_amount: goal?.target_amount ?? '',
      current_progress: goal?.current_progress ?? 0,
      monthly_contribution_plan: goal?.monthly_contribution_plan ?? 0,
      status: goal?.status ?? '',
    },
  });

  const onSubmit = async (payload: CreateGoalInput | UpdateGoalInput) => {};

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={onSubmit}
      title={isEdit ? 'Edit Goal' : 'Create Goal'}
      description="hh"
    ></FinanceFormModal>
  );
}
