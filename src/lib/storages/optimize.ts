import sharp from "sharp";

export type ImageFormat = "webp" | "jpeg" | "png" | "avif";

export interface OptimizeOptions {
  /** Output width. If height is omitted, image is resized keeping aspect ratio. */
  width?: number;
  /** Output height. If width is omitted, image is resized keeping aspect ratio. */
  height?: number;
  /** Crop fit when both width & height are set. Default "cover". */
  fit?: "cover" | "contain" | "inside" | "fill";
  /** Smart-crop anchor for "cover". Default "attention" (face/detail aware). */
  position?: "attention" | "centre" | "entropy";
  quality?: number; // 1-100
  format?: ImageFormat;
}

export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

const CONTENT_TYPE: Record<ImageFormat, string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
};

const EXTENSION: Record<ImageFormat, string> = {
  webp: "webp",
  jpeg: "jpg",
  png: "png",
  avif: "avif",
};

const DEFAULTS: Required<Pick<OptimizeOptions, "fit" | "position" | "quality" | "format">> = {
  fit: "cover",
  position: "attention",
  quality: 82,
  format: "webp",
};

/**
 * Generic image optimizer shared by every StorageProvider.
 * Auto-orients from EXIF, strips metadata, resizes, and re-encodes.
 * Used for avatars, cover photos, thumbnails, etc. via different presets.
 */
export async function optimizeImage(
  input: Buffer,
  options: OptimizeOptions = {}
): Promise<OptimizedImage> {
  const opts = { ...DEFAULTS, ...options };

  let pipeline = sharp(input, { failOn: "none" }).rotate(); // apply EXIF orientation, drop metadata

  if (opts.width || opts.height) {
    pipeline = pipeline.resize(opts.width, opts.height, {
      fit: opts.fit,
      position: opts.fit === "cover" ? opts.position : undefined,
      withoutEnlargement: true,
    });
  }

  switch (opts.format) {
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png({ quality: opts.quality, compressionLevel: 9 });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality: opts.quality });
      break;
    case "webp":
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

/** Preset for square avatar/profile photos. */
export const AVATAR_OPTIMIZE_PRESET: OptimizeOptions = {
  width: 512,
  height: 512,
  fit: "cover",
  position: "attention",
  quality: 82,
  format: "webp",
};
