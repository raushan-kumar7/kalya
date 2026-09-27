import type { AppConfig } from '@kalya/types';
import { rawEnv } from './env';

/**
 * Transforms validated environment variables into the domain-structured AppConfig.
 *
 * @description Maps raw flat environment variables from rawEnv to the nested,
 * domain-separated AppConfig structure defined in @kalya/types. Freezes the resulting
 * configuration object to ensure complete immutability at runtime.
 *
 * @returns {AppConfig} The deeply frozen application configuration object.
 */
function createConfig(): AppConfig {
  const env = rawEnv['KALYA_PRIMARY.ENV'];

  const config: AppConfig = {
    app: {
      name: rawEnv['KALYA_APP.NAME'],
      apiVersion: rawEnv['KALYA_APP.API_VERSION'],
      clientUrl: rawEnv['KALYA_APP.CLIENT_URL'],
    },

    env,
    isLocal: env === 'local',
    isDev: env === 'development',
    isStaging: env === 'staging',
    isProd: env === 'production',

    server: {
      host: rawEnv['KALYA_SERVER.HOST'],
      port: rawEnv['KALYA_SERVER.PORT'],
      readTimeoutSec: rawEnv['KALYA_SERVER.READ_TIMEOUT'],
      writeTimeoutSec: rawEnv['KALYA_SERVER.WRITE_TIMEOUT'],
      idleTimeoutSec: rawEnv['KALYA_SERVER.IDLE_TIMEOUT'],
      corsAllowedOrigins: rawEnv['KALYA_SERVER.CORS_ALLOWED_ORIGINS'],
      corsAllowedMethods: rawEnv['KALYA_SERVER.CORS_ALLOWED_METHODS'],
    },

    database: {
      url: rawEnv['KALYA_DATABASE.URL'],
    },

    auth: {
      secretKey: rawEnv['KALYA_AUTH.SECRET_KEY'],
      baseUrl: rawEnv['KALYA_AUTH.BASE_URL'],
      accessTokenExpiresLife: rawEnv['KALYA_AUTH.ACCESS_TOKEN_EXPIRES_LIFE'],
      refreshTokenExpiresLife: rawEnv['KALYA_AUTH.REFRESH_TOKEN_EXPIRES_LIFE'],
    },

    cookie: {
      domain: rawEnv['KALYA_COOKIE.DOMAIN'] || undefined,
      sameSite: rawEnv['KALYA_COOKIE.SAME_SITE'],
    },

    observability: {
      serviceName: rawEnv['KALYA_OBSERVABILITY.SERVICE_NAME'],
      environment: rawEnv['KALYA_OBSERVABILITY.ENVIRONMENT'],
      logging: {
        level: rawEnv['KALYA_OBSERVABILITY.LOGGING.LEVEL'],
        format: rawEnv['KALYA_OBSERVABILITY.LOGGING.FORMAT'],
        slowQueryThresholdMs: rawEnv['KALYA_OBSERVABILITY.LOGGING.SLOW_QUERY_THRESHOLD'],
      },
      healthChecks: {
        enabled: rawEnv['KALYA_OBSERVABILITY.HEALTH_CHECKS.ENABLED'],
        intervalMs: rawEnv['KALYA_OBSERVABILITY.HEALTH_CHECKS.INTERVAL'],
        timeoutMs: rawEnv['KALYA_OBSERVABILITY.HEALTH_CHECKS.TIMEOUT'],
        checks: rawEnv['KALYA_OBSERVABILITY.HEALTH_CHECKS.CHECKS'],
      },
    },

    smtp: {
      host: rawEnv['KALYA_SMTP.HOST'],
      port: rawEnv['KALYA_SMTP.PORT'],
      secure: rawEnv['KALYA_SMTP.SECURE'],
      user: rawEnv['KALYA_SMTP.USER'],
      password: rawEnv['KALYA_SMTP.PASSWORD'],
      email: rawEnv['KALYA_SMTP.EMAIL'],
    },

    mail: {
      provider: rawEnv['KALYA_MAIL.PROVIDER'],
      from: rawEnv['KALYA_MAIL.FROM'],
      resendApiKey: rawEnv['KALYA_MAIL.RESEND_API_KEY'],
    },

    storage: {
      provider: rawEnv['KALYA_STORAGE.PROVIDER'],
      local: {
        uploadDir: rawEnv['KALYA_STORAGE.LOCAL_UPLOAD_DIR'],
        baseUrl: rawEnv['KALYA_STORAGE.LOCAL_BASE_URL'],
      },
      cloudinary: {
        cloudName: rawEnv['KALYA_STORAGE.CLOUDINARY_CLOUD_NAME'],
        apiKey: rawEnv['KALYA_STORAGE.CLOUDINARY_API_KEY'],
        apiSecret: rawEnv['KALYA_STORAGE.CLOUDINARY_API_SECRET'],
        folder: rawEnv['KALYA_STORAGE.CLOUDINARY_FOLDER'],
      },
    },
  };

  return Object.freeze(config);
}

/**
 * Strongly typed and frozen server configuration instance.
 */
export const config: AppConfig = createConfig();
