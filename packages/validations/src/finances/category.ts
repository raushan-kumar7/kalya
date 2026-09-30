import { z } from 'zod';
import { CreateCategoryDto, FINANCE_LIMITS, UpdateCategoryDto } from '@kalya/types';
import { ISOTimestampSchema, UUIDSchema } from '../core';
import { HexColorSchema, KeySlugSchema, OriginSchema } from './bucket';

/**
 * Schema for creating a new Category nested under a bucket.
 */
export const CreateCategorySchema: z.ZodType<CreateCategoryDto> = z.object({
  bucket_id: UUIDSchema,
  key: KeySlugSchema,
  label: z
    .string({ error: 'Label is required' })
    .trim()
    .min(FINANCE_LIMITS.MIN_LABEL_LENGTH, 'Label is required')
    .max(FINANCE_LIMITS.MAX_LABEL_LENGTH, 'Label is too long'),
  origin: OriginSchema.optional().default('custom'),
  color: HexColorSchema.nullable().optional(),
  icon: z.string().trim().max(50).nullable().optional(),
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

/**
 * Schema for updating an existing category.
 */
export const UpdateCategorySchema: z.ZodType<UpdateCategoryDto> = z.object({
  bucket_id: UUIDSchema.optional(),
  key: KeySlugSchema.optional(),
  label: z
    .string()
    .trim()
    .min(FINANCE_LIMITS.MIN_LABEL_LENGTH, 'Label cannot be empty')
    .max(FINANCE_LIMITS.MAX_LABEL_LENGTH, 'Label is too long')
    .optional(),
  origin: OriginSchema.optional(),
  color: HexColorSchema.nullable().optional(),
  icon: z.string().trim().max(50).nullable().optional(),
});
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

/** Backwards-compatible alias */
export const CategoryUpdateSchema = UpdateCategorySchema;

/**
 * Full Category entity schema.
 */
export const CategorySchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  bucket_id: UUIDSchema,
  key: KeySlugSchema,
  label: z.string().min(1),
  origin: OriginSchema,
  color: HexColorSchema.nullable().optional(),
  icon: z.string().nullable().optional(),
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type CategoryInput = z.infer<typeof CategorySchema>;
