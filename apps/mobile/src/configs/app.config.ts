import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolves the API base URL intelligently for development:
 * - On iOS Simulator: 'http://localhost:3600' connects directly to host Mac.
 * - On Android Emulator: 'localhost' is the emulator VM; replaces with '10.0.2.2' (or Metro host IP).
 * - On Physical Devices (Wi-Fi): Uses Metro's hostUri (e.g. '192.168.1.X') so mobile connects seamlessly.
 */
function resolveApiBaseUrl(rawUrl?: string): string {
  const url = rawUrl || 'http://localhost:3600';
  if (!__DEV__) return url;

  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
  if (!isLocalhost) return url;

  // 1. Try to extract the host IP from Expo Metro bundler connection (works for both Wi-Fi & emulator)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return url.replace(/localhost|127\.0\.0\.1/, hostIp);
    }
  }

  // 2. Fallback for Android emulator when hostUri is unavailable
  if (Platform.OS === 'android') {
    return url.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');
  }

  return url;
}

const APP_CONFIG = {
  kalyaSeverApi: {
    url: resolveApiBaseUrl(process.env.EXPO_PUBLIC_KALYA_API_SERVER_URL),
    version: process.env.EXPO_PUBLIC_KALYA_API_VERSION || 'v1',
  },
  database: { url: process.env.EXPO_PUBLIC_DATABASE_URL || '/data/kalya.db' },
};

export { APP_CONFIG };
