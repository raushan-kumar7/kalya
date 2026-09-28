import sharp, { type Metadata, type Sharp } from 'sharp';
import type { ImageFormat, OptimizedImage, OptimizeOptions } from '@kalya/types';
import { BadRequestError } from '@/errors';

/**
 * MIME type mapping for supported raster image output formats.
 */
export const CONTENT_TYPE: Record<ImageFormat, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
};

/**
 * Standard file extension mapping for supported raster image output formats.
 */
export const EXTENSION: Record<ImageFormat, string> = {
  webp: 'webp',
  jpeg: 'jpg',
  png: 'png',
  avif: 'avif',
};

/**
 * Fallback transformation rules applied when specific options are omitted.
 */
const DEFAULTS: Required<Pick<OptimizeOptions, 'fit' | 'position' | 'quality' | 'format'>> = {
  fit: 'cover',
  position: 'attention',
  quality: 82,
  format: 'webp',
};

/**
 * Whitelist of acceptable input raster formats verified by Sharp's internal decoder.
 */
const SUPPORTED_INPUT_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'avif'] as const;

/**
 * Transforms, sanitizes, and optimizes a raw image buffer.
 *
 * @description Sanitizes, auto-orients, and re-encodes raw image buffers into optimized web formats with metadata stripping and safe proportional resizing.
 *
 * @param {Buffer} input - Raw binary image buffer from multipart upload.
 * @param {OptimizeOptions} [options={}] - Custom dimensions, fit strategy, focal crop point, and quality settings.
 * @returns {Promise<OptimizedImage>} Resulting buffer, content type, and file extension.
 * @throws {BadRequestError} If buffer is empty, corrupted, unreadable, or formatted in an unpermitted type.
 */
export async function optimizeImage(
  input: Buffer,
  options: OptimizeOptions = {}
): Promise<OptimizedImage> {
  if (!input || input.length === 0) {
    throw new BadRequestError('Empty image buffer provided', 'EMPTY_IMAGE_BUFFER');
  }

  const opts = { ...DEFAULTS, ...options };

  let pipeline: Sharp;
  let metadata: Metadata;

  try {
    pipeline = sharp(input, { failOn: 'none', animated: false });
    metadata = await pipeline.metadata();
  } catch (err) {
    throw new BadRequestError(
      'Invalid or corrupted image file',
      'INVALID_IMAGE_FILE',
      undefined,
      err
    );
  }

  if (
    !metadata.format ||
    !SUPPORTED_INPUT_FORMATS.includes(metadata.format as (typeof SUPPORTED_INPUT_FORMATS)[number])
  ) {
    throw new BadRequestError(
      `Unsupported image format. Allowed: ${SUPPORTED_INPUT_FORMATS.join(', ')}`,
      'UNSUPPORTED_IMAGE_FORMAT',
      { allowed: SUPPORTED_INPUT_FORMATS, detected: metadata.format }
    );
  }

  // Rotate based on EXIF orientation, then re-encode drops all original EXIF/GPS metadata
  pipeline = pipeline.rotate();

  if (opts.width || opts.height) {
    pipeline = pipeline.resize(opts.width, opts.height, {
      fit: opts.fit,
      position: opts.fit === 'cover' ? opts.position : undefined,
      withoutEnlargement: true,
    });
  }

  switch (opts.format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality: opts.quality, compressionLevel: 9 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: opts.quality });
      break;
    case 'webp':
    default:
      pipeline = pipeline.webp({ quality: opts.quality });
      break;
  }

  const buffer = await pipeline.toBuffer();

  return {
    buffer,
    contentType: CONTENT_TYPE[opts.format],
    extension: EXTENSION[opts.format],
  };
}

/**
 * Prepares an asset buffer for storage drivers, applying optional optimization and synchronizing filename extension.
 *
 * @description Optimizes image buffers when requested, stripping metadata and updating the file extension to match the target encoded image format.
 *
 * @param {Buffer} file - Original file buffer.
 * @param {string} filename - Original upload filename.
 * @param {OptimizeOptions | false} [optimize] - Transformation rules or false to bypass.
 * @returns {Promise<{ buffer: Buffer; filename: string }>} Processed buffer and matching filename.
 */
export async function prepareUploadBuffer(
  file: Buffer,
  filename: string,
  optimize?: OptimizeOptions | false
): Promise<{ buffer: Buffer; filename: string }> {
  if (!optimize) return { buffer: file, filename };

  const optimized = await optimizeImage(file, optimize);
  return {
    buffer: optimized.buffer,
    filename: `${filename.replace(/\.[^/.]+$/, '')}.${optimized.extension}`,
  };
}

/**
 * Standard preset for user profile avatars featuring square dimensions, WebP compression, and smart attention-based focal cropping.
 */
export const AVATAR_OPTIMIZE_PRESET: OptimizeOptions = {
  width: 512,
  height: 512,
  fit: 'cover',
  position: 'attention',
  quality: 82,
  format: 'webp',
};
