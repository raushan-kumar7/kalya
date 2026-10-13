import { env } from '@kalya/env';
import { log } from '@/logger';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Request observability and latency logging plugin.
 *
 * @description Attaches an onResponse lifecycle hook that records incoming HTTP
 * requests, status codes, route latency, and client metadata while filtering
 * automated health check spam.
 */
export const requestLoggerPlugin = fp(
  async (app: FastifyInstance) => {
    app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
      // Prevent duplicate logging if already recorded by errorHandlerPlugin
      if (request.errorLogged) return;

      // Filter automated health check and metrics scrape polling
      if (
        request.url === '/health' ||
        request.url === '/metrics' ||
        request.url.startsWith('/health/')
      )
        return;

      // In production, suppress 2xx/3xx to keep log volume efficient unless configured
      if (!env.isDev && reply.statusCode < 400) return;

      const userId = request.user?.id ?? undefined;
      const latencyMs = Math.round(reply.elapsedTime * 100) / 100;

      log.info(`HTTP ${request.method} ${request.url} ${reply.statusCode}`, {
        service: env.app.name,
        environment: env.env,
        requestId: request.id,
        userId,
        method: request.method,
        path: request.url,
        status: reply.statusCode,
        latency_ms: latencyMs,
        ip: request.ip,
      });
    });
  },
  { name: 'request-logger-plugin' }
);
