import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from '@/configs';
import { log } from '@/logger';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

/**
 * Builds and configures the primary Fastify application instance.
 *
 * @description Initializes Fastify with Zod type providers, server timeout configurations,
 * security headers (Helmet), CORS, rate limiting, request observability hooks,
 * standardized 404 responses, and centralized error handling.
 *
 * @returns {FastifyInstance} Configured Fastify instance ready for plugin and route registration.
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

  // Security Headers
  app.register(helmet, {
    contentSecurityPolicy: config.isProd,
    crossOriginEmbedderPolicy: false,
  });

  // Cross-Origin Resource Sharing
  app.register(cors, {
    origin: config.server.corsAllowedOrigins,
    methods: config.server.corsAllowedMethods,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    maxAge: 86400,
  });

  // Global Rate Limiting
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

  // Request Observability Hook (skips spammy health check polling)
  app.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply, done) => {
    if (request.url !== '/health') {
      log.info(`${request.method} ${request.url} ${reply.statusCode}`, {
        method: request.method,
        path: request.url,
        status: reply.statusCode,
        latency_ms: Math.round(reply.elapsedTime * 100) / 100,
        ip: request.ip,
      });
    }
    done();
  });

  // Observability Health Check Endpoint
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
