import Fastify, { type FastifyInstance } from 'fastify';
import { env } from '@kalya/env';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import {
  databasePlugin,
  errorHandlerPlugin,
  metricsPlugin,
  multipartPlugin,
  requestLoggerPlugin,
  securityPlugin,
  staticFilesPlugin,
  swaggerPlugin,
} from '@/plugins';
import { modulesPlugin } from '@/modules';

/**
 * Builds and configures the primary Fastify application instance.
 *
 * @description Orchestrates core server configuration, Zod type provider compilers,
 * security headers, CORS policies, rate limiting, database connectivity, static asset delivery,
 * request observability, and global error interception.
 *
 * @returns {FastifyInstance} Configured Fastify instance ready to listen.
 */
export const buildApp = (): FastifyInstance => {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    connectionTimeout: env.server.readTimeoutSec * 1000,
    requestTimeout: env.server.writeTimeoutSec * 1000,
    keepAliveTimeout: env.server.idleTimeoutSec * 1000,
  }).withTypeProvider<ZodTypeProvider>();

  // Schema Compilers for fastify-type-provider-zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // 1. Security & Access Control
  app.register(securityPlugin);

  const configuredOrigins = new Set(
    [
      env.app.clientUrl,
      ...env.server.corsAllowedOrigins,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ]
      .filter(Boolean)
      .map((url) => {
        try {
          return new URL(url).origin.toLowerCase();
        } catch {
          return url.trim().toLowerCase();
        }
      })
  );

  app.register(cors, {
    origin: (origin, cb) => {
      // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return cb(null, true);
      }

      try {
        const parsed = new URL(origin).origin.toLowerCase();

        // Allow explicitly configured origins (clientUrl, corsAllowedOrigins, local dev ports)
        if (configuredOrigins.has(parsed)) {
          return cb(null, true);
        }

        // Allow any Vercel deployment preview or production domain for Kalya
        const hostname = new URL(origin).hostname.toLowerCase();
        if (hostname.endsWith('.vercel.app')) {
          return cb(null, true);
        }

        return cb(null, false);
      } catch {
        return cb(null, false);
      }
    },
    methods: env.server.corsAllowedMethods,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Client-Timestamp',
      'Cookie',
    ],
    credentials: true,
    maxAge: 86400,
  });

  // 2. Abuse Prevention (Rate Limiting)
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Please try again after ${context.after}.`,
      },
    }),
  });

  // 3. Database Layer (Decorates fastify.db & request.db)
  app.register(databasePlugin);

  // 4. Payload & File Handling (Registered before routes so multipart parsers attach to Fastify)
  app.register(multipartPlugin);
  app.register(staticFilesPlugin);

  // 5. API Documentation & OpenAPI Specification (Registered before route modules)
  app.register(swaggerPlugin);

  // 6. Metrics & Observability (Prometheus Telemetry)
  app.register(metricsPlugin);

  // 7. Root Ping & Status Probe (Handles GET / and HEAD / probes from Render & browsers)
  app.route({
    method: ['GET', 'HEAD'],
    url: '/',
    handler: async (_request, reply) => {
      return reply.status(200).send({
        name: env.app.name,
        status: 'ok',
        version: env.app.apiVersion,
        environment: env.env,
        message: `${env.app.name} API Server is online`,
        ...(!env.isProd || process.env.KALYA_DOCS_ENABLED === 'true'
          ? { documentation: '/docs' }
          : {}),
        health: '/health/live',
      });
    },
  });

  // Favicon handler to silence browser 404 warnings in cloud logs
  app.get('/favicon.ico', async (_request, reply) => {
    return reply.status(204).send();
  });

  // 8. Application Modules (Auth, Health, and domain features)
  app.register(modulesPlugin);

  // 8. Request Observability & Latency Logging
  app.register(requestLoggerPlugin);

  // 9. Global Error & 404 Handling (Registered after hooks to catch all unhandled exceptions)
  app.register(errorHandlerPlugin);

  return app;
};
