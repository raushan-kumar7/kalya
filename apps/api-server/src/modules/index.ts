import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { env } from '@kalya/env';
import { authPlugin } from './auth';
import { healthPlugin } from './health';

/**
 * Root Application Modules Plugin.
 *
 * @description Encapsulates and registers all domain module plugins (Auth, Health,
 * and future modules like User Profile) in a single unified Fastify plugin call.
 */
export const modulesPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    // 1. Authentication & Better-Auth Module
    await fastify.register(authPlugin);

    // 2. Health & Observability Module (when enabled)
    if (env.observability.healthChecks.enabled) {
      await fastify.register(healthPlugin);
    }
  },
  {
    name: 'modules-plugin',
    dependencies: ['db-plugin'],
  }
);
