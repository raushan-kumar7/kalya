import { env } from '@kalya/env';

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

/**
 * Base URL for static assets and web links used in email templates.
 * Uses centralized @kalya/env application configuration.
 */
export const BASE_URL =
  (typeof process !== 'undefined' && process.env?.EMAIL_ASSETS_URL?.replace(/\/+$/, '')) ||
  env.app.clientUrl.replace(/\/+$/, '');

export const getBaseUrl = (): string => BASE_URL;

export const EMAILS_CONFIG = {
  font: {
    display: "'Outfit', 'Inter', ui-sans-serif, system-ui, sans-serif",
    body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    numeric: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
  },
  color: {
    primary: '#0D3E26', // Deep Emerald
    primaryHover: '#0A3019',
    primarySubtle: '#E4EEE8',

    accent: '#B8912E', // Satin Gold
    accentSubtle: '#F6EDD4',

    bg: '#F9F8F6', // Alabaster
    surface: '#FFFFFF',
    surfaceRaised: '#FCFBFA',
    border: '#E4E1DA',

    textPrimary: '#16241D',
    textSecondary: '#4E5D6C',
    textMuted: '#8A9098',

    success: '#1E7A4C',
    warning: '#C9862B',
    danger: '#B3432D',
    info: '#3E6B8A',

    successSubtle: '#E5F2EA',
    warningSubtle: '#FBEEDC',
    dangerSubtle: '#F7E5E0',
    infoSubtle: '#E6EEF2',

    onPrimary: '#FFFFFF',
    onAccent: '#16241D',
    onSuccess: '#FFFFFF',
    onDanger: '#FFFFFF',
  },
} as const;
