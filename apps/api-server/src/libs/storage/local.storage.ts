import { StorageProvider, UploadOptions, UploadResult } from '@kalya/types';
import path from 'node:path';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { BadRequestError, InternalServerError } from '@/errors';
import { prepareUploadBuffer } from './optimize';

/**
 * Local filesystem driver for the Kalya Storage subsystem.
 *
 * @description Implements local disk storage with path traversal protection, timestamp-based filename sanitization, and recursive directory creation for assets.
 */
export class LocalStorage implements StorageProvider {
  readonly name = 'local';
  private readonly uploadRoot: string;
  private readonly baseUrl: string;

  /**
   * Initializes the LocalStorage driver with a resolved disk root and public URL base.
   *
   * @param {string} uploadDir - Relative or absolute directory path where assets are saved.
   * @param {string} baseUrl - Base HTTP URL used for serving public static assets.
   */
  constructor(uploadDir: string, baseUrl: string) {
    this.uploadRoot = path.resolve(process.cwd(), uploadDir);
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Optimizes and writes an uploaded file buffer to the local disk.
   *
   * @description Validates destination boundaries, creates required parent directories, and saves the optimized file buffer safely to local disk storage.
   *
   * @param {Buffer} file - Raw binary file payload to write.
   * @param {UploadOptions} options - Upload metadata including target folder and optimization rules.
   * @returns {Promise<UploadResult>} Details of the persisted file including URL and identifier.
   * @throws {BadRequestError} If the destination folder attempts directory traversal.
   * @throws {InternalServerError} If disk write operations fail unexpectedly.
   */
  async upload(file: Buffer, { filename, folder, optimize }: UploadOptions): Promise<UploadResult> {
    const { buffer, filename: finalFilename } = await prepareUploadBuffer(file, filename, optimize);

    // Resolve destination folder safely under uploadRoot
    const targetDir = path.resolve(this.uploadRoot, folder);
    if (!targetDir.startsWith(this.uploadRoot)) {
      throw new BadRequestError(
        `Directory traversal blocked for target folder: ${folder}`,
        'STORAGE_PATH_TRAVERSAL'
      );
    }

    try {
      await mkdir(targetDir, { recursive: true });

      // Prefix with timestamp and sanitize filename
      const safeName = `${Date.now()}-${finalFilename.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const filePath = path.join(targetDir, safeName);

      await writeFile(filePath, buffer);

      const relativePublicId = path.posix.join(folder, safeName);

      return {
        url: `${this.baseUrl}/${relativePublicId}`,
        publicId: relativePublicId,
        bytes: buffer.byteLength,
      };
    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      throw new InternalServerError(
        'Failed to save file to local disk storage',
        'STORAGE_WRITE_FAILED',
        { folder, filename },
        err
      );
    }
  }

  /**
   * Deletes a stored file from local disk by its public identifier.
   *
   * @description Removes a stored file from local disk by path identifier, verifying directory boundaries and ignoring missing files idempotently.
   *
   * @param {string} publicId - Relative storage path identifier (e.g. `avatars/123/avatar.webp`).
   * @returns {Promise<void>} Resolves when the file is removed or verified nonexistent.
   * @throws {BadRequestError} If the publicId attempts directory traversal outside the storage volume.
   * @throws {InternalServerError} If unlinking encounters an unhandled filesystem error.
   */
  async delete(publicId: string): Promise<void> {
    const target = path.resolve(this.uploadRoot, publicId);

    // Block path traversal attempts immediately
    if (!target.startsWith(this.uploadRoot)) {
      throw new BadRequestError(
        `Directory traversal blocked for deletion target: ${publicId}`,
        'STORAGE_PATH_TRAVERSAL'
      );
    }

    try {
      await unlink(target);
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code !== 'ENOENT') {
        throw new InternalServerError(
          'Failed to delete file from local disk storage',
          'STORAGE_DELETE_FAILED',
          { publicId },
          err
        );
      }
    }
  }

  /**
   * Formats a publicly accessible HTTP URL for a given storage identifier.
   *
   * @description Constructs a fully qualified public HTTP access URL for a designated local storage asset identifier.
   *
   * @param {string} publicId - Relative storage path identifier.
   * @returns {string} Fully qualified public URL.
   */
  getUrl(publicId: string): string {
    return `${this.baseUrl}/${publicId.replace(/^\/+/, '')}`;
  }
}
