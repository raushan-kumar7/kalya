import { z } from 'zod';
import { zBoolString, zCsvList, zDurationMs } from '../core';

/**
 * Isolated validation schema for database connection credentials.
 */
export const databaseEnvSchema = z.object({
  'KALYA_DATABASE.URL': z.string().min(1),
});

export type DatabaseRawEnv = z.infer<typeof databaseEnvSchema>;

/**
 * Complete environment validation schema for the API server.
 */
export const envSchema = databaseEnvSchema.extend({
  // ---- App ----
  'KALYA_APP.NAME': z.string().min(1),
  'KALYA_APP.API_VERSION': z.string().min(1),
  'KALYA_APP.CLIENT_URL': z.string().url(),

  // ---- Environment ----
  'KALYA_PRIMARY.ENV': z.enum(['local', 'development', 'staging', 'production']),

  // ---- Server ----
  'KALYA_SERVER.HOST': z.string().min(1),
  'KALYA_SERVER.PORT': z.coerce.number().int().positive(),
  'KALYA_SERVER.READ_TIMEOUT': z.coerce.number().int().positive(),
  'KALYA_SERVER.WRITE_TIMEOUT': z.coerce.number().int().positive(),
  'KALYA_SERVER.IDLE_TIMEOUT': z.coerce.number().int().positive(),
  'KALYA_SERVER.CORS_ALLOWED_ORIGINS': zCsvList,
  'KALYA_SERVER.CORS_ALLOWED_METHODS': z
    .string()
    .default('GET,POST,PUT,PATCH,DELETE,OPTIONS')
    .transform((v) =>
      v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    ),

  // ---- Auth ----
  'KALYA_AUTH.SECRET_KEY': z.string().min(32, 'SECRET_KEY must be at least 32 chars'),
  'KALYA_AUTH.BASE_URL': z.string().url(),
  'KALYA_AUTH.ACCESS_TOKEN_EXPIRES_LIFE': z.string(),
  'KALYA_AUTH.REFRESH_TOKEN_EXPIRES_LIFE': z.string(),

  // ---- Google Auth ----
  'KALYA_AUTH.GOOGLE_CLIENT_ID': z.string().optional(),
  'KALYA_AUTH.GOOGLE_CLIENT_SECRET': z.string().optional(),

  // ---- Cookies ----
  'KALYA_COOKIE.DOMAIN': z.string().optional(),
  'KALYA_COOKIE.SAME_SITE': z.enum(['lax', 'strict', 'none']),

  // ---- Observability ----
  'KALYA_OBSERVABILITY.SERVICE_NAME': z.string().min(1),
  'KALYA_OBSERVABILITY.ENVIRONMENT': z.string().min(1),
  'KALYA_OBSERVABILITY.LOGGING.LEVEL': z.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent',
  ]),
  'KALYA_OBSERVABILITY.LOGGING.FORMAT': z.enum(['console', 'json']),
  'KALYA_OBSERVABILITY.LOGGING.SLOW_QUERY_THRESHOLD': zDurationMs,
  'KALYA_OBSERVABILITY.HEALTH_CHECKS.ENABLED': zBoolString,
  'KALYA_OBSERVABILITY.HEALTH_CHECKS.INTERVAL': zDurationMs,
  'KALYA_OBSERVABILITY.HEALTH_CHECKS.TIMEOUT': zDurationMs,
  'KALYA_OBSERVABILITY.HEALTH_CHECKS.CHECKS': zCsvList,

  // ---- SMTP ----
  'KALYA_SMTP.HOST': z.string().min(1),
  'KALYA_SMTP.PORT': z.coerce.number().int().positive(),
  'KALYA_SMTP.SECURE': z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  'KALYA_SMTP.USER': z.string().optional().default(''),
  'KALYA_SMTP.PASSWORD': z.string().optional().default(''),
  'KALYA_SMTP.EMAIL': z.string().optional().default(''),

  // ---- Mail Provider ----
  'KALYA_MAIL.PROVIDER': z.enum(['smtp', 'resend']).default('smtp'),
  'KALYA_MAIL.FROM': z.string().default('Kalya <noreply@kalya.io>'),
  'KALYA_MAIL.RESEND_API_KEY': z.string().optional().default(''),

  // ---- Storage ----
  'KALYA_STORAGE.PROVIDER': z.enum(['local', 'cloudinary']).default('local'),
  'KALYA_STORAGE.LOCAL_UPLOAD_DIR': z.string().default('./uploads'),
  'KALYA_STORAGE.LOCAL_BASE_URL': z.string().default('http://localhost:3600/uploads'),
  'KALYA_STORAGE.CLOUDINARY_CLOUD_NAME': z.string().optional().default(''),
  'KALYA_STORAGE.CLOUDINARY_API_KEY': z.string().optional().default(''),
  'KALYA_STORAGE.CLOUDINARY_API_SECRET': z.string().optional().default(''),
  'KALYA_STORAGE.CLOUDINARY_FOLDER': z.string().optional().default('kalya'),
});

export type RawEnv = z.infer<typeof envSchema>;
