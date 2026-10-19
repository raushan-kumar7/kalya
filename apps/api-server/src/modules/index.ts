import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { env } from '@kalya/env';
import { authPlugin } from './auth';
import { healthPlugin } from './health';
import { userPlugin } from './users';
import { financesPlugin } from './finances';
import { jobsPlugin } from './jobs';
import { notificationsPlugin } from './notifications';
import { adminPlugin } from './admin';

/**
 * Root Application Modules Plugin.
 *
 * @description Encapsulates and registers all domain module plugins:
 * Auth, User Profiles, Finances, Jobs, Notifications, Health Checks, and Super-Admin.
 */
export const modulesPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    // 1. Health & Observability Module (when enabled)
    if (env.observability.healthChecks.enabled) {
      await fastify.register(healthPlugin);
    }

    // 2. Authentication & Better-Auth Module
    await fastify.register(authPlugin);

    // 3. User Profile Management Module
    await fastify.register(userPlugin);

    // 4. Background Job Queue & Worker Subsystem
    await fastify.register(jobsPlugin);

    // 5. Finances Domain Module
    await fastify.register(financesPlugin);

    // 6. Notifications & Alerts Module
    await fastify.register(notificationsPlugin);

    // 7. Super-Admin Module
    await fastify.register(adminPlugin);
  },
  {
    name: 'modules-plugin',
    dependencies: ['db-plugin'],
  }
);
