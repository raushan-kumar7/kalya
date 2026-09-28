/**
 * Supported storage drivers.
 */
export type StorageProviderType = 'local' | 'cloudinary';

/**
 * Supported image output formats for processing.
 */
export type ImageFormat = 'webp' | 'jpeg' | 'png' | 'avif';

/**
 * Image resizing fit strategies.
 */
export type ImageFit = 'cover' | 'contain' | 'inside' | 'fill';

/**
 * Image cropping focal point strategies.
 */
export type ImagePosition = 'attention' | 'centre' | 'entropy';

/**
 * Options controlling Sharp image transformation.
 */
export interface OptimizeOptions {
  width?: number;
  height?: number;
  fit?: ImageFit;
  position?: ImagePosition;
  quality?: number;
  format?: ImageFormat;
}

/**
 * Result of an image optimization pipeline.
 */
export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

/**
 * Parameters supplied to upload an asset.
 */
export interface UploadOptions {
  filename: string;
  folder: string;
  optimize?: OptimizeOptions | false;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Output payload returned after successful storage write.
 */
export interface UploadResult {
  url: string;
  publicId: string;
  bytes?: number;
  format?: string;
}

/**
 * Uniform contract implemented by all storage drivers.
 */
export interface StorageProvider {
  readonly name: string;
  upload(file: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
  getUrl?(publicId: string): string;
}

/**
 * Local disk configuration.
 */
export interface LocalStorageConfig {
  uploadDir: string;
  baseUrl: string;
}

/**
 * Cloudinary cloud configuration.
 */
export interface CloudinaryStorageConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
}

/**
 * Combined storage configuration payload.
 */
export interface StorageConfig {
  provider: StorageProviderType;
  local: LocalStorageConfig;
  cloudinary: CloudinaryStorageConfig;
}
