import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { HealthController } from './health.controller';
import {
  HealthLivenessResponseSchema,
  HealthReadinessResponseSchema,
  SystemHealthReportSchema,
} from '@kalya/validations';

/**
 * Creates and registers Fastify routes for the health & observability module.
 *
 * @param {HealthController} controller - Controller instance providing route handlers.
 * @returns {FastifyPluginAsyncZod}
 */
export const createHealthRoutes = (controller: HealthController): FastifyPluginAsyncZod => {
  return async (app) => {
    // 1. Liveness Probe
    app.get(
      '/health/live',
      {
        schema: {
          description: 'Liveness probe confirming the server event loop is responsive',
          tags: ['Health'],
          response: {
            200: HealthLivenessResponseSchema,
          },
        },
      },
      controller.getLiveness
    );

    // 2. Readiness Probe
    app.get(
      '/health/ready',
      {
        schema: {
          description: 'Readiness probe verifying critical dependencies are accessible',
          tags: ['Health'],
          response: {
            200: HealthReadinessResponseSchema,
            503: HealthReadinessResponseSchema,
          },
        },
      },
      controller.getReadiness
    );

    // 3. Detailed Operational Diagnostics
    app.get(
      '/health',
      {
        schema: {
          description: 'Comprehensive operational diagnostics of all registered subsystems',
          tags: ['Health'],
          response: {
            200: SystemHealthReportSchema,
            503: SystemHealthReportSchema,
          },
        },
      },
      controller.getDetailedHealth
    );
  };
};
