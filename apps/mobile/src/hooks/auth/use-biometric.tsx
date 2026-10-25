import * as React from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/stores/auth';
import { BiometricService } from '@/libs/services/biometrics';

export interface UseBiometricReturn {
  /** Whether the physical device contains compatible biometric hardware */
  isSupported: boolean;
  /** Whether biometric credentials (Face ID or fingerprints) are registered in OS settings */
  isEnrolled: boolean;
  /** Whether the user has opted-in to biometric unlock for this app */
  isEnabled: boolean;
  /** Array of supported biometric hardware types on this device */
  supportedTypes: LocalAuthentication.AuthenticationType[];
  /** Human-readable display label for the primary biometric type ('Face ID', 'Fingerprint', etc.) */
  biometricLabel: string;
  /**
   * Prompts biometric verification and enables biometric unlock preference upon success.
   *
   * @description Prompts the user with native biometric dialog. If verified, persists preference to auth store.
   * @param {string} [promptMessage] - Optional custom message to display in the system prompt.
   * @returns {Promise<boolean>} True if authentication passed and feature was enabled; false otherwise.
   */
  enableBiometrics: (promptMessage?: string) => Promise<boolean>;
  /**
   * Disables biometric unlock preference in the application state.
   *
   * @description Clears the opted-in biometric flag from persistent store.
   * @returns {void}
   */
  disableBiometrics: () => void;
  /**
   * Performs biometric authentication and restores the active session from the server.
   *
   * @description Delegates to BiometricService to prompt the biometric sensor, read the hardware
   * session token from SecureStore, validate it with the backend, and update the Zustand auth store.
   * @param {string} [promptMessage] - Optional custom message for the biometric dialog.
   * @returns {Promise<boolean>} True if biometric scan succeeded and session was hydrated; false otherwise.
   */
  authenticateWithBiometrics: (promptMessage?: string) => Promise<boolean>;
}

/**
 * Custom hook managing native biometric authentication state and operations.
 *
 * @description Coordinates hardware inspection, enrollment checks, user preference toggling,
 * and biometric session restoration using BiometricService and useAuthStore.
 * @returns {UseBiometricReturn} Reactive biometric state, labels, and action handlers.
 * @example
 * const { isSupported, isEnabled, authenticateWithBiometrics } = useBiometric();
 *
 * const onBiometricPress = async () => {
 *   const success = await authenticateWithBiometrics();
 *   if (success) router.replace('/(tabs)/dashboard');
 * };
 */
export function useBiometric(): UseBiometricReturn {
  const isSupported = useAuthStore((s) => s.isBiometricSupported);
  const isEnrolled = useAuthStore((s) => s.isBiometricEnrolled);
  const isEnabled = useAuthStore((s) => s.isBiometricEnabled);

  const setBiometricSupported = useAuthStore((s) => s.setBiometricSupported);
  const setBiometricEnrolled = useAuthStore((s) => s.setBiometricEnrolled);
  const setBiometricEnabled = useAuthStore((s) => s.setBiometricEnabled);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [supportedTypes, setSupportedTypes] = React.useState<
    LocalAuthentication.AuthenticationType[]
  >([]);

  // Query hardware capabilities on mount
  React.useEffect(() => {
    let isMounted = true;

    async function loadCapabilities() {
      try {
        const capabilities = await BiometricService.getCapabilities();
        if (isMounted) {
          setBiometricSupported(capabilities.isSupported);
          setBiometricEnrolled(capabilities.isEnrolled);
          setSupportedTypes(capabilities.supportedTypes);
        }
      } catch {
        if (isMounted) {
          setBiometricSupported(false);
          setBiometricEnrolled(false);
        }
      }
    }

    loadCapabilities();
    return () => {
      isMounted = false;
    };
  }, [setBiometricSupported, setBiometricEnrolled]);

  const biometricLabel = React.useMemo(() => {
    return BiometricService.getBiometricLabel(supportedTypes);
  }, [supportedTypes]);

  /**
   * Enables biometric unlock after verifying user ownership with a test scan.
   */
  const enableBiometrics = React.useCallback(
    async (promptMessage?: string): Promise<boolean> => {
      if (!isSupported || !isEnrolled) return false;

      const result = await BiometricService.authenticate({
        promptMessage: promptMessage ?? `Verify your identity to enable ${biometricLabel}`,
      });

      if (result.success) {
        setBiometricEnabled(true);
        return true;
      }

      return false;
    },
    [isSupported, isEnrolled, biometricLabel, setBiometricEnabled]
  );

  /**
   * Disables biometric unlock in persistent app state.
   */
  const disableBiometrics = React.useCallback(() => {
    setBiometricEnabled(false);
  }, [setBiometricEnabled]);

  /**
   * Authenticates user and hydrates active session from backend via BiometricService.
   */
  const authenticateWithBiometrics = React.useCallback(
    async (promptMessage?: string): Promise<boolean> => {
      if (!isSupported || !isEnrolled || !isEnabled) {
        return false;
      }

      const result = await BiometricService.verifyAndHydrateSession(
        promptMessage ?? `Log in to Kalya with ${biometricLabel}`
      );

      if (result.success && result.sessionData?.user && result.sessionData?.session) {
        setAuth(result.sessionData.user, result.sessionData.session);
        return true;
      }

      return false;
    },
    [isSupported, isEnrolled, isEnabled, biometricLabel, setAuth]
  );

  return {
    isSupported,
    isEnrolled,
    isEnabled,
    supportedTypes,
    biometricLabel,
    enableBiometrics,
    disableBiometrics,
    authenticateWithBiometrics,
  };
}
