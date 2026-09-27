import Fastify, { type FastifyInstance } from 'fastify';
import { config } from '@/configs';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import {
  errorHandlerPlugin,
  multipartPlugin,
  requestLoggerPlugin,
  securityPlugin,
  staticFilesPlugin,
} from '@/plugins';

/**
 * Builds and configures the primary Fastify application instance.
 *
 * @description Orchestrates core server configuration, Zod type provider compilers,
 * security headers, CORS policies, rate limiting, static asset delivery,
 * request observability, and global error interception.
 *
 * @returns {FastifyInstance} Configured Fastify instance ready to listen.
 */
export const buildApp = (): FastifyInstance => {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    connectionTimeout: config.server.readTimeoutSec * 1000,
    requestTimeout: config.server.writeTimeoutSec * 1000,
    keepAliveTimeout: config.server.idleTimeoutSec * 1000,
  }).withTypeProvider<ZodTypeProvider>();

  // Schema Compilers for fastify-type-provider-zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // 1. Security & Access Control
  app.register(securityPlugin);
  app.register(cors, {
    origin: config.server.corsAllowedOrigins,
    methods: config.server.corsAllowedMethods,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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

  // 3. Payload & File Handling
  app.register(multipartPlugin);
  app.register(staticFilesPlugin);

  // 4. Observability & Logging
  app.register(requestLoggerPlugin);

  // 5. Global Error & 404 Handling (Registered after hooks to catch all unhandled exceptions)
  app.register(errorHandlerPlugin);

  // 6. Operational Health Endpoint
  if (config.observability.healthChecks.enabled) {
    app.get('/health', async () => {
      const memory = process.memoryUsage();
      return {
        status: 'operational',
        service: config.observability.serviceName,
        env: config.env,
        version: config.app.apiVersion,
        uptime: `${Math.floor(process.uptime())}s`,
        memory: {
          heapUsedMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
          rssMB: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        },
        timestamp: new Date().toISOString(),
      };
    });
  }

  return app;
};
