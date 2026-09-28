import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary';
import type {
  CloudinaryStorageConfig,
  StorageProvider,
  UploadOptions,
  UploadResult,
} from '@kalya/types';
import { InternalServerError } from '@/errors';
import { prepareUploadBuffer } from './optimize';

/**
 * Cloudinary cloud media driver for the Kalya Storage subsystem.
 *
 * @description Delivers cloud storage via Cloudinary SDK by streaming optimized assets with global CDN distribution and secure transformations.
 */
export class CloudinaryStorage implements StorageProvider {
  readonly name = 'cloudinary';
  private readonly baseFolder: string;

  /**
   * Initializes the Cloudinary storage provider with API credentials and root namespace.
   *
   * @description Configures the Cloudinary SDK using validated credentials and sets the default organizational folder for uploaded assets.
   *
   * @param {CloudinaryStorageConfig} config - Cloudinary credentials (cloudName, apiKey, apiSecret, folder).
   */
  constructor(config: CloudinaryStorageConfig) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    this.baseFolder = config.folder || 'kalya';
  }

  /**
   * Optimizes and streams a file buffer to Cloudinary.
   *
   * @description Streams an optimized binary buffer directly to Cloudinary and returns the secure CDN URL and resource public identifier.
   *
   * @param {Buffer} file - Binary file data to upload.
   * @param {UploadOptions} options - Upload configurations including destination folder and optimization.
   * @returns {Promise<UploadResult>} Upload result containing the secure URL and public ID.
   * @throws {InternalServerError} If Cloudinary rejected the upload stream or encountered an API error.
   */
  async upload(file: Buffer, { filename, folder, optimize }: UploadOptions): Promise<UploadResult> {
    const { buffer, filename: finalFilename } = await prepareUploadBuffer(file, filename, optimize);

    return new Promise((resolve, reject) => {
      const uploadPath = this.baseFolder ? `${this.baseFolder}/${folder}` : folder;

      const options: UploadApiOptions = {
        folder: uploadPath,
        public_id: finalFilename.replace(/\.[^/.]+$/, ''),
        resource_type: optimize ? 'image' : 'auto',
      };

      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error || !result) {
          return reject(
            new InternalServerError(
              error?.message ?? 'Cloudinary upload failed',
              'CLOUDINARY_UPLOAD_FAILED',
              undefined,
              error
            )
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
        });
      });

      stream.end(buffer);
    });
  }

  /**
   * Deletes a remote asset from Cloudinary by its public identifier.
   *
   * @description Removes a remote asset from Cloudinary using its public identifier, invalidating cached CDN copies to ensure complete deletion.
   *
   * @param {string} publicId - Cloudinary public ID (e.g., `kalya/avatars/123/avatar`).
   * @returns {Promise<void>} Resolves when the resource is destroyed on Cloudinary.
   * @throws {InternalServerError} If Cloudinary deletion API request fails.
   */
  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (err) {
      throw new InternalServerError(
        'Failed to delete asset from Cloudinary',
        'CLOUDINARY_DELETE_FAILED',
        { publicId },
        err
      );
    }
  }

  /**
   * Generates a secure HTTPS delivery URL for a Cloudinary public ID.
   *
   * @description Generates a secure HTTPS delivery URL with optional transformations for a specified Cloudinary public asset identifier.
   *
   * @param {string} publicId - Cloudinary public identifier.
   * @returns {string} CDN URL for the asset.
   */
  getUrl(publicId: string): string {
    return cloudinary.url(publicId, { secure: true });
  }
}
