import { AppEnvironment, LogLevel, CookieSameSite } from '../core';

/**
 * Strongly typed representation of the fully resolved Server Configuration.
 *
 * This object dictates how the API Server behaves across various
 * domains such as networking, storage, authentication, and observability.
 */
export interface AppConfig {
  /** Core application identity and versioning details. */
  app: {
    /** The human-readable name of the application (e.g., 'Kalya') */
    name: string;
    /** Current API version (e.g., 'v1') */
    apiVersion: string;
    /** The base URL of the client application connecting to this server */
    clientUrl: string;
  };

  /** The primary deployment environment */
  env: AppEnvironment;

  /** True if running locally on a developer's machine */
  isLocal: boolean;
  /** True if running in a development/testing environment */
  isDev: boolean;
  /** True if running in a pre-production staging environment */
  isStaging: boolean;
  /** True if running in the live production environment */
  isProd: boolean;

  /** Fastify server network configuration */
  server: {
    /** The host address to bind to (e.g., '0.0.0.0' or 'localhost') */
    host: string;
    /** The port the server will listen on */
    port: number;
    /** Maximum time (in seconds) to wait for headers/body to be read */
    readTimeoutSec: number;
    /** Maximum time (in seconds) to wait for a response to be written */
    writeTimeoutSec: number;
    /** Maximum time (in seconds) a connection can remain idle */
    idleTimeoutSec: number;
    /** List of origins allowed to make CORS requests */
    corsAllowedOrigins: string[];
    /** List of HTTP methods allowed via CORS */
    corsAllowedMethods: string[];
  };

  /** Database connection configuration */
  database: {
    /** Full PostgreSQL connection string */
    url: string;
  };

  /** Authentication, Session, and JWT configuration */
  auth: {
    /** Cryptographic secret used to sign and verify JWTs */
    secretKey: string;
    /** Base URL for authentication-related redirects and callbacks */
    baseUrl: string;
    /** Lifetime duration of the short-lived access token (e.g., '15m') */
    accessTokenExpiresLife: string;
    /** Lifetime duration of the long-lived refresh token (e.g., '7d') */
    refreshTokenExpiresLife: string;
    /** Google OAuth Client ID (optional, enables "Continue with Google") */
    googleClientId?: string;
    /** Google OAuth Client Secret */
    googleClientSecret?: string;
  };

  /** Browser cookie policies */
  cookie: {
    /** The domain scope for the cookie (optional) */
    domain?: string;
    /** Cross-site cookie enforcement policy */
    sameSite: CookieSameSite;
  };

  /** Telemetry, Health, and Logging configuration */
  observability: {
    /** Name of the service emitted in logs and traces */
    serviceName: string;
    /** Environment tag for metrics */
    environment: string;

    /** Pino logger configuration */
    logging: {
      /** Minimum severity level to emit */
      level: LogLevel;
      /** Output format ('json' for prod, 'console' for dev) */
      format: 'console' | 'json';
      /** Threshold in milliseconds before a DB query is logged as "slow" */
      slowQueryThresholdMs: number;
    };

    /** Automated health check settings */
    healthChecks: {
      /** Whether background health checks are enabled */
      enabled: boolean;
      /** How often (in ms) health checks should run */
      intervalMs: number;
      /** Max duration (in ms) before a check is considered failed */
      timeoutMs: number;
      /** List of specific checks to execute (e.g. 'db', 'redis') */
      checks: string[];
    };
  };

  /** SMTP Server configuration (for standard mail delivery) */
  smtp: {
    host: string;
    port: number;
    /** True if connection uses implicit TLS (usually port 465) */
    secure: boolean;
    user: string;
    password: string;
    /** The default email address to use for SMTP auth */
    email: string;
  };

  /** Application Mail Provider routing */
  mail: {
    /** Which mail provider is actively handling outgoing emails */
    provider: 'smtp' | 'resend';
    /** The default 'From' address for system emails */
    from: string;
    /** API key for Resend (if using provider='resend') */
    resendApiKey: string;
  };

  /** File Storage & Media management configuration */
  storage: {
    /** Which storage backend is actively storing media */
    provider: 'local' | 'cloudinary';

    /** Local disk storage configuration */
    local: {
      /** Absolute or relative path to the local upload directory */
      uploadDir: string;
      /** Base URL to serve local files from */
      baseUrl: string;
    };

    /** Cloudinary cloud storage configuration */
    cloudinary: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
      /** The root folder to upload assets into on Cloudinary */
      folder: string;
    };
  };

  /** Push Notification configuration */
  push: {
    vapidPublicKey: string;
    vapidPrivateKey: string;
    vapidSubject: string;
    expoAccessToken: string;
  };

  /** Default Super-Admin account configuration for automated initial seeding */
  superAdmin: {
    firstName: string;
    middleName?: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  };
}
