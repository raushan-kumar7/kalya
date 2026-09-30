import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { env } from '@kalya/env';
import { authPlugin } from './auth';
import { healthPlugin } from './health';
import { userPlugin } from './users';
import { financesPlugin } from './finances';
import { notificationsPlugin } from './notifications';

/**
 * Root Application Modules Plugin.
 *
 * @description Encapsulates and registers all domain module plugins:
 * Auth, User Profiles, Finances, Notifications, and Health Checks.
 */
export const modulesPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    // 1. Authentication & Better-Auth Module
    await fastify.register(authPlugin);

    // 2. User Profile Management Module
    await fastify.register(userPlugin);

    // 3. Finances Domain Module
    await fastify.register(financesPlugin);

    // 4. Notifications & Alerts Module
    await fastify.register(notificationsPlugin);

    // 5. Health & Observability Module (when enabled)
    if (env.observability.healthChecks.enabled) {
      await fastify.register(healthPlugin);
    }
  },
  {
    name: 'modules-plugin',
    dependencies: ['db-plugin'],
  }
);
