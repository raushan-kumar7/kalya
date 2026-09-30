import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { env } from '@kalya/env';

import { AlertService } from './alerts/alert.service';
import { AlertController } from './alerts/alert.controller';
import { createAlertRoutes } from './alerts/alert.routes';

import { PreferenceService } from './preferences/preference.service';
import { PreferenceController } from './preferences/preference.controller';
import { createPreferenceRoutes } from './preferences/preference.routes';

import { AlertDispatcherService } from './alert-dispatcher.service';

declare module 'fastify' {
  interface FastifyInstance {
    alertDispatcher: AlertDispatcherService;
  }
}

export const notificationsPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    const db = fastify.db;
    const basePrefix = `/api/${env.app.apiVersion}/notifications`;

    // 1. Decorate Fastify with cross-domain Alert Dispatcher
    const alertDispatcher = new AlertDispatcherService(db);
    fastify.decorate('alertDispatcher', alertDispatcher);

    // 2. In-App Alerts Routes
    const alertService = new AlertService(db);
    const alertController = new AlertController(alertService);
    await fastify.register(createAlertRoutes(alertController), { prefix: `${basePrefix}/alerts` });

    // 3. User Delivery Preferences Routes
    const preferenceService = new PreferenceService(db);
    const preferenceController = new PreferenceController(preferenceService);
    await fastify.register(createPreferenceRoutes(preferenceController), {
      prefix: `${basePrefix}/preferences`,
    });
  },
  {
    name: 'notifications-plugin',
    dependencies: ['db-plugin', 'auth-plugin'],
  }
);
