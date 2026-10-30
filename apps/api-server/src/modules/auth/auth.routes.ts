import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { env } from '@kalya/env';
import { AuthController } from './auth.controller';
import { AvailabilityResponseSchema, CheckAvailabilitySchema } from '@kalya/validations';
import { standardResponseSchema } from '@/responses';

export const createAuthRoutes = (controller: AuthController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    // 1. Custom Kalya Auth Endpoints (Versioned) - Explicit endpoints declared before catch-all
    fastify.get(`/api/${env.app.apiVersion}/auth/check-availability`, {
      schema: {
        tags: ['Authentication'],
        summary: 'Check username or email availability (GET)',
        querystring: CheckAvailabilitySchema,
        response: {
          200: standardResponseSchema(AvailabilityResponseSchema),
        },
      },
      handler: controller.checkAvailability,
    });

    fastify.post(`/api/${env.app.apiVersion}/auth/check-availability`, {
      schema: {
        tags: ['Authentication'],
        summary: 'Check username or email availability (POST)',
        body: CheckAvailabilitySchema,
        response: {
          200: standardResponseSchema(AvailabilityResponseSchema),
        },
      },
      handler: controller.checkAvailability,
    });

    // 2. Better-Auth Wildcard Route Handler (Standard Better-Auth client basePath - hidden from Swagger docs)
    fastify.all(
      `/api/${env.app.apiVersion}/auth/*`,
      {
        schema: {
          hide: true,
        },
      },
      controller.handleAuthRequest
    );
  };
};
