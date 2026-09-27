/**
 * Defines the deployment environments for the Kalya application ecosystem.
 */
export type AppEnvironment = 'local' | 'development' | 'staging' | 'production';

/**
 * Standardized logging levels across the application for Observability.
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

/**
 * Valid SameSite cookie policy attributes for session management.
 */
export type CookieSameSite = 'lax' | 'strict' | 'none';
