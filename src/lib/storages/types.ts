import type { OptimizeOptions } from "./optimize";

export interface UploadResult {
  url: string;
  publicId: string; // needed later for deletion
}

export interface UploadOptions {
  filename: string;
  folder: string;
  /** Pass a preset (e.g. AVATAR_OPTIMIZE_PRESET) or custom options to optimize before upload. Omit/false to skip. */
  optimize?: OptimizeOptions | false;
}

export interface StorageProvider {
  upload(file: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
}
