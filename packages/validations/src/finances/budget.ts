import { z } from 'zod';
import {
  BUDGET_PERIOD_OPTIONS,
  BUDGET_STATUS_OPTIONS,
  BudgetFilterQueryDto,
  CreateBudgetDto,
  FINANCE_LIMITS,
  UpdateBudgetDto,
} from '@kalya/types';
import { DecimalSchema, ISOTimestampSchema, UUIDSchema } from '../core';
import { PositiveMoneySchema } from './income';

/**
 * Zod schema for Budget recurring cadence.
 */
export const BudgetPeriodSchema = z.enum(BUDGET_PERIOD_OPTIONS, {
  error: 'Invalid budget period',
});

/**
 * Zod schema for Budget health state.
 */
export const BudgetStatusSchema = z.enum(BUDGET_STATUS_OPTIONS, {
  error: 'Invalid budget status',
});

/**
 * Alert threshold percentage schema (0 - 200%).
 */
export const AlertThresholdSchema = DecimalSchema.min(0, 'Threshold cannot be negative').max(
  200,
  'Threshold cannot exceed 200%'
);

/**
 * Schema for creating a new Budget plan.
 */
export const CreateBudgetSchema: z.ZodType<CreateBudgetDto> = z
  .object({
    bucket_id: UUIDSchema,
    income_id: UUIDSchema,
    period: BudgetPeriodSchema.optional().default('monthly'),
    amount: PositiveMoneySchema,
    alert_threshold_amber: AlertThresholdSchema.optional().default(
      FINANCE_LIMITS.DEFAULT_AMBER_THRESHOLD
    ),
    alert_threshold_red: AlertThresholdSchema.optional().default(
      FINANCE_LIMITS.DEFAULT_RED_THRESHOLD
    ),
    rollover: z.boolean().optional().default(false),
    status: BudgetStatusSchema.optional().default('under'),
  })
  .refine(
    (data) => {
      const amber = data.alert_threshold_amber ?? FINANCE_LIMITS.DEFAULT_AMBER_THRESHOLD;
      const red = data.alert_threshold_red ?? FINANCE_LIMITS.DEFAULT_RED_THRESHOLD;
      return amber <= red;
    },
    {
      message: 'Amber threshold cannot be greater than red threshold',
      path: ['alert_threshold_amber'],
    }
  );
export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;

/**
 * Schema for updating an existing Budget.
 */
export const UpdateBudgetSchema: z.ZodType<UpdateBudgetDto> = z
  .object({
    bucket_id: UUIDSchema.optional(),
    income_id: UUIDSchema.optional(),
    period: BudgetPeriodSchema.optional(),
    amount: PositiveMoneySchema.optional(),
    alert_threshold_amber: AlertThresholdSchema.optional(),
    alert_threshold_red: AlertThresholdSchema.optional(),
    rollover: z.boolean().optional(),
    status: BudgetStatusSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.alert_threshold_amber !== undefined && data.alert_threshold_red !== undefined) {
        return data.alert_threshold_amber <= data.alert_threshold_red;
      }
      return true;
    },
    {
      message: 'Amber threshold cannot be greater than red threshold',
      path: ['alert_threshold_amber'],
    }
  );
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;

/** Backwards-compatible alias */
export const BudgetUpdateSchema = UpdateBudgetSchema;

/**
 * Query filter schema for Budgets.
 */
export const BudgetFilterQuerySchema: z.ZodType<BudgetFilterQueryDto> = z.object({
  bucket_id: UUIDSchema.optional(),
  income_id: UUIDSchema.optional(),
  period: BudgetPeriodSchema.optional(),
  status: BudgetStatusSchema.optional(),
});
export type BudgetFilterQueryInput = z.infer<typeof BudgetFilterQuerySchema>;

/**
 * Full Budget entity schema.
 */
export const BudgetSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  bucket_id: UUIDSchema,
  income_id: UUIDSchema,
  period: BudgetPeriodSchema,
  amount: PositiveMoneySchema,
  alert_threshold_amber: AlertThresholdSchema,
  alert_threshold_red: AlertThresholdSchema,
  rollover: z.boolean(),
  status: BudgetStatusSchema,
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type BudgetInput = z.infer<typeof BudgetSchema>;
