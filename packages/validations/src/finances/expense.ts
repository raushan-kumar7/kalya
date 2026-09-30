import { z } from 'zod';
import {
  CreateExpenseDto,
  CreateSplitContactMemberDto,
  CreateSplitExpenseDto,
  ExpenseFilterQueryDto,
  FINANCE_LIMITS,
  PAYMENT_METHOD_OPTIONS,
  SETTLEMENT_METHOD_OPTIONS,
  SettleSplitExpenseDto,
  SPLIT_TYPE_OPTIONS,
  UpdateExpenseDto,
  UpdateSplitContactMemberDto,
  UpdateSplitExpenseDto,
} from '@kalya/types';
import { DecimalSchema, ISODateSchema, ISOTimestampSchema, UUIDSchema } from '../core';
import { PositiveMoneySchema } from './income';

// ============================================================================
// Enums & Helper Schemas
// ============================================================================

/**
 * Zod schema for Payment Method.
 */
export const PaymentMethodSchema = z.enum(PAYMENT_METHOD_OPTIONS, {
  error: 'Invalid payment method',
});

/**
 * Zod schema for Split Algorithm Type.
 */
export const SplitTypeSchema = z.enum(SPLIT_TYPE_OPTIONS, {
  error: 'Invalid split type',
});

/**
 * Zod schema for Settlement Method.
 */
export const SettlementMethodSchema = z.enum(SETTLEMENT_METHOD_OPTIONS, {
  error: 'Invalid settlement method',
});

/**
 * Schema for inline split breakdown entries when creating an expense.
 */
export const SplitExpenseShareInputSchema = z.object({
  split_member_id: UUIDSchema,
  amount: PositiveMoneySchema.optional(),
  settled: z.boolean().optional().default(false),
});

// ============================================================================
// Expense Schemas
// ============================================================================

/**
 * Schema for recording a new Expense.
 */
export const CreateExpenseSchema: z.ZodType<CreateExpenseDto> = z
  .object({
    date: ISODateSchema,
    category_id: UUIDSchema,
    description: z
      .string({ error: 'Description is required' })
      .trim()
      .min(FINANCE_LIMITS.MIN_DESCRIPTION_LENGTH, 'Description cannot be empty')
      .max(FINANCE_LIMITS.MAX_DESCRIPTION_LENGTH, 'Description is too long'),
    amount: PositiveMoneySchema,
    payment_method: PaymentMethodSchema.nullable().optional(),
    is_split: z.boolean().optional().default(false),
    paid_by: UUIDSchema.nullable().optional(),
    your_share: PositiveMoneySchema.optional(),
    split_type: SplitTypeSchema.optional().default('equal'),
    splits: z.array(SplitExpenseShareInputSchema).optional(),
  })
  .transform((data) => {
    // If not a split expense and your_share not explicitly specified, defaults to total amount
    return {
      ...data,
      your_share: data.your_share ?? (data.is_split ? 0 : data.amount),
    };
  });
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

/**
 * Schema for updating an existing Expense.
 */
export const UpdateExpenseSchema: z.ZodType<UpdateExpenseDto> = z.object({
  date: ISODateSchema.optional(),
  category_id: UUIDSchema.optional(),
  description: z
    .string()
    .trim()
    .min(FINANCE_LIMITS.MIN_DESCRIPTION_LENGTH, 'Description cannot be empty')
    .max(FINANCE_LIMITS.MAX_DESCRIPTION_LENGTH, 'Description is too long')
    .optional(),
  amount: PositiveMoneySchema.optional(),
  payment_method: PaymentMethodSchema.nullable().optional(),
  is_split: z.boolean().optional(),
  paid_by: UUIDSchema.nullable().optional(),
  your_share: PositiveMoneySchema.optional(),
  split_type: SplitTypeSchema.optional(),
});
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;

/** Backwards-compatible alias */
export const ExpenseUpdateSchema = UpdateExpenseSchema;

/**
 * Query filter schema for listing expenses with pagination.
 */
export const ExpenseFilterQuerySchema: z.ZodType<ExpenseFilterQueryDto> = z.object({
  category_id: UUIDSchema.optional(),
  bucket_id: UUIDSchema.optional(),
  from: ISODateSchema.optional(),
  to: ISODateSchema.optional(),
  is_split: z
    .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
    .optional(),
  payment_method: PaymentMethodSchema.optional(),
  search: z.string().trim().max(100).optional(),
  min_amount: PositiveMoneySchema.optional(),
  max_amount: PositiveMoneySchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type ExpenseFilterQueryInput = z.infer<typeof ExpenseFilterQuerySchema>;

/**
 * Full Expense entity schema.
 */
export const ExpenseSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  date: ISODateSchema,
  category_id: UUIDSchema,
  description: z.string().min(1),
  amount: PositiveMoneySchema,
  payment_method: PaymentMethodSchema.nullable().optional(),
  is_split: z.boolean(),
  paid_by: UUIDSchema.nullable().optional(),
  your_share: PositiveMoneySchema,
  split_type: SplitTypeSchema,
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type ExpenseInput = z.infer<typeof ExpenseSchema>;

// ============================================================================
// Split Contact Member Schemas
// ============================================================================

/**
 * Schema for creating a new split contact member.
 */
export const CreateSplitContactMemberSchema: z.ZodType<CreateSplitContactMemberDto> = z.object({
  name: z
    .string({ error: 'Contact name is required' })
    .trim()
    .min(1, 'Contact name is required')
    .max(FINANCE_LIMITS.MAX_NAME_LENGTH, 'Name is too long'),
  phone: z.string().trim().max(20).nullable().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().nullable().optional(),
  image: z.string().url('Invalid image URL').nullable().optional(),
  is_linked: z.boolean().optional().default(false),
});
export type CreateSplitContactMemberInput = z.infer<typeof CreateSplitContactMemberSchema>;

/**
 * Schema for updating a split contact member.
 */
export const UpdateSplitContactMemberSchema: z.ZodType<UpdateSplitContactMemberDto> = z.object({
  name: z.string().trim().min(1).max(FINANCE_LIMITS.MAX_NAME_LENGTH).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().nullable().optional(),
  image: z.string().url('Invalid image URL').nullable().optional(),
  is_linked: z.boolean().optional(),
});
export type UpdateSplitContactMemberInput = z.infer<typeof UpdateSplitContactMemberSchema>;

/** Backwards-compatible alias */
export const SplitContactMemberUpdateSchema = UpdateSplitContactMemberSchema;

/**
 * Full Split Contact Member entity schema.
 */
export const SplitContactMemberSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  is_linked: z.boolean(),
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type SplitContactMemberInput = z.infer<typeof SplitContactMemberSchema>;

// ============================================================================
// Split Expense Share Schemas
// ============================================================================

/**
 * Schema for creating a split expense share ledger entry.
 */
export const CreateSplitExpenseSchema: z.ZodType<CreateSplitExpenseDto> = z.object({
  expense_id: UUIDSchema,
  split_member_id: UUIDSchema,
  amount: PositiveMoneySchema.optional(),
  settled_amount: PositiveMoneySchema.optional().default(0),
  settled: z.boolean().optional().default(false),
  settled_via: SettlementMethodSchema.nullable().optional(),
  settled_at: ISOTimestampSchema.nullable().optional(),
});
export type CreateSplitExpenseInput = z.infer<typeof CreateSplitExpenseSchema>;

/**
 * Schema for updating an existing split expense share.
 */
export const UpdateSplitExpenseSchema: z.ZodType<UpdateSplitExpenseDto> = z.object({
  amount: PositiveMoneySchema.optional(),
  settled_amount: PositiveMoneySchema.optional(),
  settled: z.boolean().optional(),
  settled_via: SettlementMethodSchema.nullable().optional(),
  settled_at: ISOTimestampSchema.nullable().optional(),
});
export type UpdateSplitExpenseInput = z.infer<typeof UpdateSplitExpenseSchema>;

/** Backwards-compatible alias */
export const SplitExpenseUpdateSchema = UpdateSplitExpenseSchema;

/**
 * Schema for settling a split expense balance.
 */
export const SettleSplitExpenseSchema: z.ZodType<SettleSplitExpenseDto> = z.object({
  settled_amount: PositiveMoneySchema,
  settled_via: SettlementMethodSchema,
  settled_at: ISOTimestampSchema.optional(),
});
export type SettleSplitExpenseInput = z.infer<typeof SettleSplitExpenseSchema>;

/**
 * Full Split Expense entity schema.
 */
export const SplitExpenseSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  expense_id: UUIDSchema,
  split_member_id: UUIDSchema,
  amount: PositiveMoneySchema.nullable().optional(),
  settled_amount: PositiveMoneySchema.nullable().optional(),
  settled: z.boolean(),
  settled_via: SettlementMethodSchema.nullable().optional(),
  settled_at: ISOTimestampSchema.nullable().optional(),
});
export type SplitExpenseInput = z.infer<typeof SplitExpenseSchema>;
