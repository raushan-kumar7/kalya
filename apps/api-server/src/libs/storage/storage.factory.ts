import { StorageConfig, StorageProvider } from '@kalya/types';
import { env } from '@kalya/env';
import { InternalServerError } from '@/errors';
import { CloudinaryStorage } from './cloudinary.storage';
import { LocalStorage } from './local.storage';

/**
 * Cached singleton instance of the active storage provider.
 */
let cachedStorage: StorageProvider | undefined;

/**
 * Creates and initializes a StorageProvider driver instance based on runtime configuration.
 *
 * @description Instantiates the active storage provider driver using verified environment credentials and falls back to local disk storage.
 *
 * @param {StorageConfig} [customConfig] - Optional explicit storage configuration overriding `env.storage`.
 * @returns {StorageProvider} Concrete driver implementing the `StorageProvider` interface.
 * @throws {InternalServerError} If Cloudinary provider is active but missing required API credentials.
 */
export function createStorage(customConfig?: StorageConfig): StorageProvider {
  const provider = customConfig?.provider ?? env.storage.provider;

  if (provider === 'cloudinary') {
    const cfg = customConfig?.cloudinary ?? env.storage.cloudinary;
    if (!cfg.cloudName || !cfg.apiKey || !cfg.apiSecret) {
      throw new InternalServerError(
        'KALYA_STORAGE.PROVIDER=cloudinary requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET',
        'STORAGE_CONFIG_INVALID',
        { provider: 'cloudinary' }
      );
    }
    return new CloudinaryStorage(cfg);
  }

  const localCfg = customConfig?.local ?? env.storage.local;
  return new LocalStorage(localCfg.uploadDir, localCfg.baseUrl);
}

/**
 * Retrieves the application-wide singleton instance of the active StorageProvider.
 *
 * @description Lazily initializes and caches the active storage provider singleton for shared access across server services and plugins.
 *
 * @returns {StorageProvider} Singleton storage provider instance.
 */
export function getStorage(): StorageProvider {
  if (!cachedStorage) {
    cachedStorage = createStorage();
  }
  return cachedStorage;
}

/**
 * Resets the cached storage provider singleton.
 *
 * @description Clears the cached storage provider singleton to allow clean driver recreation during test fixtures and isolated suites.
 */
export function resetStorageCache(): void {
  cachedStorage = undefined;
}
