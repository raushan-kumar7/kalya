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
  multipartPlugin,
  requestLoggerPlugin,
  securityPlugin,
  staticFilesPlugin,
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
  app.register(cors, {
    origin: env.server.corsAllowedOrigins,
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

  // 4. Application Modules (Auth, Health, and domain features)
  app.register(modulesPlugin);

  // 5. Payload & File Handling
  app.register(multipartPlugin);
  app.register(staticFilesPlugin);

  // 6. Observability & Logging
  app.register(requestLoggerPlugin);

  // 7. Global Error & 404 Handling (Registered after hooks to catch all unhandled exceptions)
  app.register(errorHandlerPlugin);

  return app;
};
