import { AUTH_TOKEN_KEY } from '@/libs/api';
import * as SecureStore from 'expo-secure-store';

export class SecureStoreTokenService {
  /**
   * Retrieves the persisted Bearer session token from hardware-encrypted storage.
   *
   * @description Reads the token saved under the global auth token key using Expo SecureStore.
   * Gracefully returns null if the token does not exist or if hardware decryption fails.
   * @returns {Promise<string | null>} The active Bearer token string, or null if unauthenticated.
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      return token ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Securely saves the Bearer session token into hardware-encrypted storage.
   *
   * @description Writes the token to the OS hardware keystore (iOS Keychain or Android Keystore).
   * @param {string} token - The raw Bearer token string received from the server.
   * @returns {Promise<void>} Resolves when the write operation completes.
   */
  static async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  }

  /**
   * Removes the Bearer session token from hardware-encrypted storage.
   *
   * @description Deletes the token entry. Swallows non-critical removal errors if storage is already empty.
   * @returns {Promise<void>} Resolves when the deletion operation completes.
   */
  static async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch {
      // Ignore deletion errors on already cleared storage
    }
  }

  /**
   * Verifies whether an active session token currently exists in secure storage.
   *
   * @description Fast non-empty string check on the stored token.
   * @returns {Promise<boolean>} True if a valid token is present, false otherwise.
   */
  static async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return Boolean(token && token.length > 0);
  }
}
