import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { env } from '@kalya/env';
import { AuthController } from './auth.controller';
import { AvailabilityResponseSchema, CheckAvailabilitySchema } from '@kalya/validations';
import { standardResponseSchema } from '@/responses';

export const createAuthRoutes = (controller: AuthController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    // 1. Better-Auth Wildcard Route Handler (Standard Better-Auth client basePath)
    fastify.all(`/api/${env.app.apiVersion}/auth/*`, controller.handleAuthRequest);

    // 2. Custom Kalya Auth Endpoints (Versioned)
    fastify.get(`/api/${env.app.apiVersion}/auth/check-availability`, {
      schema: {
        tags: ['Authentication'],
        summary: 'Check username or email availability',
        querystring: CheckAvailabilitySchema,
        response: {
          200: standardResponseSchema(AvailabilityResponseSchema),
        },
      },
      handler: controller.checkAvailability,
    });
  };
};
