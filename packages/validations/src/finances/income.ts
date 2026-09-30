import { z } from 'zod';
import {
  CreateIncomeDto,
  FINANCE_LIMITS,
  IncomeFilterQueryDto,
  UpdateIncomeDto,
} from '@kalya/types';
import {
  DecimalSchema,
  ISODateSchema,
  ISOTimestampSchema,
  MonthStringSchema,
  UUIDSchema,
} from '../core';

/**
 * Monetary currency amount schema bounded by positive financial limits.
 */
export const PositiveMoneySchema = DecimalSchema.min(
  FINANCE_LIMITS.MIN_AMOUNT,
  'Amount cannot be negative'
).max(FINANCE_LIMITS.MAX_AMOUNT, 'Amount exceeds maximum allowable threshold');

/**
 * Money schema allowing negative values (e.g. carry-over deficit).
 */
export const SignedMoneySchema = DecimalSchema.min(
  -FINANCE_LIMITS.MAX_AMOUNT,
  'Deficit exceeds allowable threshold'
).max(FINANCE_LIMITS.MAX_AMOUNT, 'Surplus exceeds allowable threshold');

/**
 * Schema for registering a new monthly income record.
 */
export const CreateIncomeSchema: z.ZodType<CreateIncomeDto> = z
  .object({
    credit_date: ISODateSchema,
    month: MonthStringSchema,
    salary: PositiveMoneySchema,
    other: PositiveMoneySchema.optional().default(0),
    previous_month_left: SignedMoneySchema.optional().default(0),
    total_income: PositiveMoneySchema.optional(),
  })
  .transform((data) => {
    const salary = data.salary ?? 0;
    const other = data.other ?? 0;
    const prev = data.previous_month_left ?? 0;
    const computedTotal = Math.max(0, salary + other + prev);
    return {
      ...data,
      total_income: data.total_income ?? computedTotal,
    };
  });
export type CreateIncomeInput = z.infer<typeof CreateIncomeSchema>;

/**
 * Schema for updating an existing income record.
 */
export const UpdateIncomeSchema: z.ZodType<UpdateIncomeDto> = z.object({
  credit_date: ISODateSchema.optional(),
  month: MonthStringSchema.optional(),
  salary: PositiveMoneySchema.optional(),
  other: PositiveMoneySchema.optional(),
  previous_month_left: SignedMoneySchema.optional(),
  total_income: PositiveMoneySchema.optional(),
});
export type UpdateIncomeInput = z.infer<typeof UpdateIncomeSchema>;

/** Backwards-compatible alias */
export const IncomeUpdateSchema = UpdateIncomeSchema;

/**
 * Query schema for retrieving income records.
 */
export const IncomeFilterQuerySchema: z.ZodType<IncomeFilterQueryDto> = z.object({
  month: MonthStringSchema.optional(),
  from: ISODateSchema.optional(),
  to: ISODateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type IncomeFilterQueryInput = z.infer<typeof IncomeFilterQuerySchema>;

/**
 * Full Income entity schema.
 */
export const IncomeSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  credit_date: ISODateSchema,
  month: MonthStringSchema,
  salary: PositiveMoneySchema,
  other: PositiveMoneySchema,
  previous_month_left: SignedMoneySchema,
  total_income: PositiveMoneySchema,
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type IncomeInput = z.infer<typeof IncomeSchema>;
