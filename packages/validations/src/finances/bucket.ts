import { z } from 'zod';
import { CreateBucketDto, FINANCE_LIMITS, ORIGIN_OPTIONS, UpdateBucketDto } from '@kalya/types';
import { DecimalSchema, ISOTimestampSchema, UUIDSchema } from '../core';

/**
 * Zod schema for Bucket Origin.
 */
export const OriginSchema = z.enum(ORIGIN_OPTIONS, {
  error: 'Invalid origin type',
});

/**
 * Hex color validation regex (#RGB or #RRGGBB).
 */
export const HexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color (e.g. #3B82F6)');

/**
 * Key slug schema (lowercase alphanumeric with dashes/underscores).
 */
export const KeySlugSchema = z
  .string({ error: 'Key is required' })
  .trim()
  .min(FINANCE_LIMITS.MIN_KEY_LENGTH, 'Key is required')
  .max(FINANCE_LIMITS.MAX_KEY_LENGTH, 'Key is too long')
  .regex(
    /^[a-z0-9_-]+$/,
    'Key must be lowercase and contain only alphanumeric characters, underscores, or hyphens'
  );

/**
 * Target percentage schema (0 - 100%).
 */
export const TargetPercentSchema = DecimalSchema.min(
  FINANCE_LIMITS.MIN_PERCENTAGE,
  `Target percent cannot be less than ${FINANCE_LIMITS.MIN_PERCENTAGE}`
).max(
  FINANCE_LIMITS.MAX_PERCENTAGE,
  `Target percent cannot exceed ${FINANCE_LIMITS.MAX_PERCENTAGE}`
);

/**
 * Schema for creating a new budgetary allocation bucket.
 */
export const CreateBucketSchema: z.ZodType<CreateBucketDto> = z.object({
  key: KeySlugSchema,
  label: z
    .string({ error: 'Label is required' })
    .trim()
    .min(FINANCE_LIMITS.MIN_LABEL_LENGTH, 'Label is required')
    .max(FINANCE_LIMITS.MAX_LABEL_LENGTH, 'Label is too long'),
  origin: OriginSchema.optional().default('custom'),
  target_percent: TargetPercentSchema.nullable().optional(),
  color: HexColorSchema.nullable().optional(),
  icon: z.string().trim().max(50).nullable().optional(),
});
export type CreateBucketInput = z.infer<typeof CreateBucketSchema>;

/**
 * Schema for updating an existing bucket.
 */
export const UpdateBucketSchema: z.ZodType<UpdateBucketDto> = z.object({
  key: KeySlugSchema.optional(),
  label: z
    .string()
    .trim()
    .min(FINANCE_LIMITS.MIN_LABEL_LENGTH, 'Label cannot be empty')
    .max(FINANCE_LIMITS.MAX_LABEL_LENGTH, 'Label is too long')
    .optional(),
  origin: OriginSchema.optional(),
  target_percent: TargetPercentSchema.nullable().optional(),
  color: HexColorSchema.nullable().optional(),
  icon: z.string().trim().max(50).nullable().optional(),
});
export type UpdateBucketInput = z.infer<typeof UpdateBucketSchema>;

/**
 * Full Bucket entity schema including database identifiers and timestamps.
 */
export const BucketSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  key: KeySlugSchema,
  label: z.string().min(1),
  origin: OriginSchema,
  target_percent: TargetPercentSchema.nullable().optional(),
  color: HexColorSchema.nullable().optional(),
  icon: z.string().nullable().optional(),
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type BucketInput = z.infer<typeof BucketSchema>;
