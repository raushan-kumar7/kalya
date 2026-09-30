import { z } from 'zod';
import {
  GenerateMonthlySummaryDto,
  MonthlyFinancialOverview,
  MonthlySummaryFilterQueryDto,
} from '@kalya/types';
import {
  DecimalSchema,
  ISODateSchema,
  ISOTimestampSchema,
  MonthStringSchema,
  UUIDSchema,
} from '../core';
import { BudgetStatusSchema } from './budget';
import { PositiveMoneySchema, SignedMoneySchema } from './income';

/**
 * Snapshot schema for per-bucket budget performance.
 */
export const BucketTotalSnapshotSchema = z.object({
  spent: PositiveMoneySchema,
  budgeted: PositiveMoneySchema,
  status: BudgetStatusSchema,
});

/**
 * Snapshot schema for per-category expenditure.
 */
export const CategoryTotalSnapshotSchema = z.object({
  spent: PositiveMoneySchema,
});

/**
 * Schema for triggering the generation of a monthly summary statement.
 */
export const GenerateMonthlySummarySchema: z.ZodType<GenerateMonthlySummaryDto> = z.object({
  month: MonthStringSchema,
  period_start: ISODateSchema.optional(),
  period_end: ISODateSchema.optional(),
});
export type GenerateMonthlySummaryInput = z.infer<typeof GenerateMonthlySummarySchema>;

/**
 * Query filter schema for monthly statements.
 */
export const MonthlySummaryFilterQuerySchema: z.ZodType<MonthlySummaryFilterQueryDto> = z.object({
  month: MonthStringSchema.optional(),
  from: ISODateSchema.optional(),
  to: ISODateSchema.optional(),
});
export type MonthlySummaryFilterQueryInput = z.infer<typeof MonthlySummaryFilterQuerySchema>;

/**
 * Schema validating high-level overview metrics for dashboards.
 */
export const MonthlyFinancialOverviewSchema: z.ZodType<MonthlyFinancialOverview> = z.object({
  month: MonthStringSchema,
  total_income: PositiveMoneySchema,
  total_expenses: PositiveMoneySchema,
  net_savings: SignedMoneySchema,
  savings_rate: DecimalSchema,
  budget_adherence_percent: DecimalSchema,
  unsettled_split_amount: PositiveMoneySchema,
});
export type MonthlyFinancialOverviewInput = z.infer<typeof MonthlyFinancialOverviewSchema>;

/**
 * Full Monthly Summary ledger entity schema.
 */
export const MonthlySummarySchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  month: MonthStringSchema,
  period_start: ISODateSchema,
  period_end: ISODateSchema,
  bucket_totals: z.record(UUIDSchema, BucketTotalSnapshotSchema),
  category_totals: z.record(UUIDSchema, CategoryTotalSnapshotSchema),
  total_spent: PositiveMoneySchema,
  generated_at: ISOTimestampSchema,
});
export type MonthlySummaryInput = z.infer<typeof MonthlySummarySchema>;

/** Backwards-compatible alias */
export const MonthlySummaryUpdateSchema = MonthlySummarySchema.omit({
  id: true,
  user_id: true,
}).partial();
export type MonthlySummaryUpdateInput = z.infer<typeof MonthlySummaryUpdateSchema>;
