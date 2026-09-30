import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { PreferenceController } from './preference.controller';
import {
  NotificationPreferenceFilterQuerySchema,
  UpdateNotificationPreferenceSchema,
  UpsertNotificationPreferenceSchema,
  z,
} from '@kalya/validations';

export const createPreferenceRoutes = (controller: PreferenceController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/', {
      schema: {
        tags: ['Notifications - Preferences'],
        summary: 'List user notification preferences',
        querystring: NotificationPreferenceFilterQuerySchema,
      },
      handler: controller.list,
    });

    fastify.put('/', {
      schema: {
        tags: ['Notifications - Preferences'],
        summary: 'Upsert channel and category notification preference',
        body: UpsertNotificationPreferenceSchema,
      },
      handler: controller.upsert,
    });

    fastify.patch('/:id', {
      schema: {
        tags: ['Notifications - Preferences'],
        summary: 'Partially update notification preference',
        params: z.object({ id: z.string().min(1) }),
        body: UpdateNotificationPreferenceSchema,
      },
      handler: controller.update,
    });
  };
};
