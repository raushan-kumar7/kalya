import { z } from 'zod';
import {
  CreateGoalDto,
  FINANCE_LIMITS,
  GOAL_STATUS_OPTIONS,
  GoalFilterQueryDto,
  UpdateGoalDto,
} from '@kalya/types';
import { ISODateSchema, ISOTimestampSchema, UUIDSchema } from '../core';
import { PositiveMoneySchema } from './income';

/**
 * Zod schema for Goal progression status.
 */
export const GoalStatusSchema = z.enum(GOAL_STATUS_OPTIONS, {
  error: 'Invalid goal status',
});

/**
 * Schema for creating a financial savings Goal.
 */
export const CreateGoalSchema: z.ZodType<CreateGoalDto> = z.object({
  bucket_id: UUIDSchema,
  name: z
    .string({ error: 'Goal name is required' })
    .trim()
    .min(1, 'Goal name is required')
    .max(FINANCE_LIMITS.MAX_NAME_LENGTH, 'Goal name is too long'),
  target_amount: PositiveMoneySchema.refine((v) => v > 0, {
    message: 'Target amount must be greater than zero',
  }),
  target_date: ISODateSchema,
  current_progress: PositiveMoneySchema.optional().default(0),
  monthly_contribution_plan: PositiveMoneySchema.optional().default(0),
  status: GoalStatusSchema.optional().default('not_started'),
});
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;

/**
 * Schema for updating an existing Goal.
 */
export const UpdateGoalSchema: z.ZodType<UpdateGoalDto> = z.object({
  bucket_id: UUIDSchema.optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Goal name cannot be empty')
    .max(FINANCE_LIMITS.MAX_NAME_LENGTH, 'Goal name is too long')
    .optional(),
  target_amount: PositiveMoneySchema.refine((v) => v > 0, {
    message: 'Target amount must be greater than zero',
  }).optional(),
  target_date: ISODateSchema.optional(),
  current_progress: PositiveMoneySchema.optional(),
  monthly_contribution_plan: PositiveMoneySchema.optional(),
  status: GoalStatusSchema.optional(),
});
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;

/** Backwards-compatible alias */
export const GoalUpdateSchema = UpdateGoalSchema;

/**
 * Query filter schema for goals.
 */
export const GoalFilterQuerySchema: z.ZodType<GoalFilterQueryDto> = z.object({
  bucket_id: UUIDSchema.optional(),
  status: GoalStatusSchema.optional(),
});
export type GoalFilterQueryInput = z.infer<typeof GoalFilterQuerySchema>;

/**
 * Full Goal entity schema.
 */
export const GoalSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  bucket_id: UUIDSchema,
  name: z.string().min(1),
  target_amount: PositiveMoneySchema,
  target_date: ISODateSchema,
  current_progress: PositiveMoneySchema,
  monthly_contribution_plan: PositiveMoneySchema,
  status: GoalStatusSchema,
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type GoalInput = z.infer<typeof GoalSchema>;
