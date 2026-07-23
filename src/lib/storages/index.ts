import { LocalStorage } from "./local.storage";
import { CloudinaryStorage } from "./cloudinary.storage";
import type { StorageProvider } from "./types";

// Re-exports so consumers only ever need to import from "@/storages"
export * from "./types";
export * from "./optimize";
export { LocalStorage } from "./local.storage";
export { CloudinaryStorage } from "./cloudinary.storage";

let cachedStorage: StorageProvider | undefined;

/**
 * Returns the active StorageProvider for the current environment.
 * Production -> Cloudinary, everything else (dev/test) -> LocalStorage.
 * Cached as a singleton so we don't reconfigure Cloudinary / re-touch
 * the filesystem root on every call.
 */
export function getStorage(): StorageProvider {
  if (cachedStorage) return cachedStorage;

  if (process.env.NODE_ENV === "production") {
    const required = [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ] as const;

    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required Cloudinary env vars in production: ${missing.join(", ")}`
      );
    }

    cachedStorage = new CloudinaryStorage(
      {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      },
      process.env.CLOUDINARY_BASE_FOLDER ?? "kalya"
    );
  } else {
    cachedStorage = new LocalStorage();
  }

  return cachedStorage;
}

/**
 * For tests or scripts that need to force a fresh instance
 * instead of the cached singleton (e.g. swapping uploadRoot per test).
 */
export function resetStorageCache(): void {
  cachedStorage = undefined;
}