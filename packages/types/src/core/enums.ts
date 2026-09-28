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

/**
 * Standard operational states for health checks and individual subsystems.
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Overall system operational status.
 */
export type SystemOperationalStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

/**
 * Subsystem categories monitored by the system.
 */
export type HealthCheckName = 'database' | 'storage' | 'mail' | 'cache' | (string & {});
