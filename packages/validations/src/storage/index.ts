import { z } from 'zod';
import {
  ALLOWED_AVATAR_EXTENSIONS,
  ALLOWED_AVATAR_MIME_TYPES,
  ImageFit,
  ImageFormat,
  ImagePosition,
  MAX_AVATAR_BYTES,
  OptimizeOptions,
  StorageProviderType,
  UploadOptions,
} from '@kalya/types';

/**
 * Schema validating permitted storage backend provider identifiers.
 */
export const StorageProviderSchema: z.ZodType<StorageProviderType> = z.enum([
  'local',
  'cloudinary',
]);

/**
 * Schema validating permitted raster output image formats.
 */
export const ImageFormatSchema: z.ZodType<ImageFormat> = z.enum(['webp', 'jpeg', 'png', 'avif']);

/**
 * Schema validating image fit modes.
 */
export const ImageFitSchema: z.ZodType<ImageFit> = z.enum(['cover', 'contain', 'inside', 'fill']);

/**
 * Schema validating crop focus positions.
 */
export const ImagePositionSchema: z.ZodType<ImagePosition> = z.enum([
  'attention',
  'centre',
  'entropy',
]);

/**
 * Schema validating image transformation constraints.
 */
export const OptimizeOptionsSchema: z.ZodType<OptimizeOptions> = z.object({
  width: z.number().int().positive().max(4096).optional(),
  height: z.number().int().positive().max(4096).optional(),
  fit: ImageFitSchema.optional(),
  position: ImagePositionSchema.optional(),
  quality: z.number().int().min(1).max(100).optional(),
  format: ImageFormatSchema.optional(),
});

/**
 * Schema validating general upload options (sanitizes filenames and blocks path traversal).
 */
export const UploadOptionsSchema: z.ZodType<UploadOptions> = z.object({
  filename: z
    .string()
    .min(1, { message: 'Filename is required' })
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, {
      message: 'Filename may only contain alphanumeric characters, dots, underscores, and hyphens',
    }),
  folder: z
    .string()
    .min(1, { message: 'Folder path is required' })
    .max(128)
    .regex(/^[a-zA-Z0-9_\-/]+$/, {
      message: 'Folder may only contain alphanumeric characters, slashes, and dashes',
    })
    .refine((val) => !val.includes('..'), {
      message: 'Folder path must not contain traversal sequence (..)',
    }),
  optimize: z.union([OptimizeOptionsSchema, z.literal(false)]).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

/**
 * Schema validating incoming user avatar uploads.
 */
export const AvatarUploadSchema = z.object({
  size: z.number().max(MAX_AVATAR_BYTES, {
    message: `Avatar file size must not exceed ${MAX_AVATAR_BYTES / (1024 * 1024)}MB`,
  }),
  mimetype: z.enum(ALLOWED_AVATAR_MIME_TYPES, {
    message: 'Avatar must be a valid image file (image/jpeg, image/png, image/webp)',
  }),
  extension: z.enum(ALLOWED_AVATAR_EXTENSIONS, {
    message: 'Avatar file extension must be .jpg, .jpeg, .png, or .webp',
  }),
});
