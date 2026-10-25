import * as LocalAuthentication from 'expo-local-authentication';
import { SecureStoreTokenService } from '@/libs/services/auth/token';
import { AuthService } from '@/libs/services/auth';
import type { SessionResponse } from '@kalya/types';

export interface BiometricCapabilities {
  /** Whether the physical device contains compatible biometric hardware */
  isSupported: boolean;
  /** Whether biometric credentials (fingerprints or face) are registered */
  isEnrolled: boolean;
  /** Supported biometric hardware types */
  supportedTypes: LocalAuthentication.AuthenticationType[];
  /** Human-readable display label for UI prompts */
  label: string;
}

export interface BiometricAuthResult {
  /** Whether biometric scan succeeded and valid session was hydrated */
  success: boolean;
  /** Active session data if verification succeeded */
  sessionData?: SessionResponse | null;
  /** Error message if verification or scan failed */
  error?: string;
}

export class BiometricService {
  /**
   * Checks whether the device hardware supports biometric verification.
   *
   * @description Queries native hardware sensor availability.
   * @returns {Promise<boolean>} True if biometric sensor is present, false otherwise.
   */
  static async checkHardwareSupport(): Promise<boolean> {
    try {
      return await LocalAuthentication.hasHardwareAsync();
    } catch {
      return false;
    }
  }

  /**
   * Checks whether the user has enrolled at least one biometric credential.
   *
   * @description Verifies if Face ID or fingerprints are enrolled in OS settings.
   * @returns {Promise<boolean>} True if biometrics are enrolled, false otherwise.
   */
  static async checkEnrolled(): Promise<boolean> {
    try {
      return await LocalAuthentication.isEnrolledAsync();
    } catch {
      return false;
    }
  }

  /**
   * Retrieves all supported authentication types on the current device.
   *
   * @description Returns native enum values (FINGERPRINT, FACIAL_RECOGNITION, IRIS).
   * @returns {Promise<LocalAuthentication.AuthenticationType[]>} Array of supported types.
   */
  static async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch {
      return [];
    }
  }

  /**
   * Resolves a user-friendly display string for the active biometric modality.
   *
   * @description Maps hardware types to recognizable UI terms ('Face ID', 'Fingerprint', etc.).
   * @param {LocalAuthentication.AuthenticationType[]} types - Array of supported authentication types.
   * @returns {string} Human-readable label (e.g., 'Face ID', 'Fingerprint', or 'Biometrics').
   */
  static getBiometricLabel(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Scan';
    }
    return 'Biometrics';
  }

  /**
   * Performs complete capability inspection of hardware and enrollment status.
   *
   * @description Aggregates support, enrollment, and label calculation into a single call.
   * @returns {Promise<BiometricCapabilities>} Combined capability status object.
   */
  static async getCapabilities(): Promise<BiometricCapabilities> {
    const isSupported = await this.checkHardwareSupport();
    const isEnrolled = isSupported ? await this.checkEnrolled() : false;
    const supportedTypes = isSupported ? await this.getSupportedTypes() : [];
    const label = this.getBiometricLabel(supportedTypes);

    return {
      isSupported,
      isEnrolled,
      supportedTypes,
      label,
    };
  }

  /**
   * Triggers native OS biometric authentication prompt.
   *
   * @description Invokes system biometric dialog with custom prompt messages and fallback controls.
   * @param {LocalAuthentication.LocalAuthenticationOptions} [options] - Configuration options for the prompt dialog.
   * @returns {Promise<LocalAuthentication.LocalAuthenticationResult>} Authentication outcome from OS.
   */
  static async authenticate(
    options?: LocalAuthentication.LocalAuthenticationOptions
  ): Promise<LocalAuthentication.LocalAuthenticationResult> {
    return LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Kalya',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      ...options,
    });
  }

  /**
   * Authenticates user via biometrics and hydrates active session from the server.
   *
   * @description High-level business logic: verifies hardware scan, checks SecureStore Bearer token,
   * queries server session endpoint, and returns hydrated session data.
   * @param {string} [promptMessage] - Optional custom message to show in the biometric dialog.
   * @returns {Promise<BiometricAuthResult>} Outcome with success flag and optional hydrated session.
   */
  static async verifyAndHydrateSession(promptMessage?: string): Promise<BiometricAuthResult> {
    const capabilities = await this.getCapabilities();

    if (!capabilities.isSupported) {
      return { success: false, error: 'Biometric hardware is not available on this device' };
    }

    if (!capabilities.isEnrolled) {
      return { success: false, error: 'No biometrics are registered in device settings' };
    }

    const hasToken = await SecureStoreTokenService.hasToken();
    if (!hasToken) {
      return { success: false, error: 'No active session token found in secure storage' };
    }

    const authResult = await this.authenticate({
      promptMessage: promptMessage ?? `Log in to Kalya with ${capabilities.label}`,
    });

    if (!authResult.success) {
      return { success: false, error: 'Biometric authentication was cancelled or failed' };
    }

    const sessionData = await AuthService.getSession();
    if (!sessionData?.user || !sessionData?.session) {
      return { success: false, error: 'Session token has expired or is invalid' };
    }

    return {
      success: true,
      sessionData,
    };
  }
}
