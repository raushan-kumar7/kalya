import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AlertController } from './alert.controller';
import { AlertFilterQuerySchema, MarkAlertsAsReadSchema, z } from '@kalya/validations';

export const createAlertRoutes = (controller: AlertController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/', {
      schema: {
        tags: ['Notifications - Alerts'],
        summary: 'List user in-app alerts',
        querystring: AlertFilterQuerySchema,
      },
      handler: controller.list,
    });

    fastify.get('/unread-count', {
      schema: { tags: ['Notifications - Alerts'], summary: 'Get total unread alerts count' },
      handler: controller.unreadCount,
    });

    fastify.patch('/:id/read', {
      schema: {
        tags: ['Notifications - Alerts'],
        summary: 'Mark single alert as read',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.markRead,
    });

    fastify.post('/mark-read', {
      schema: {
        tags: ['Notifications - Alerts'],
        summary: 'Batch mark alerts as read',
        body: MarkAlertsAsReadSchema,
      },
      handler: controller.batchMarkRead,
    });

    fastify.delete('/:id', {
      schema: {
        tags: ['Notifications - Alerts'],
        summary: 'Dismiss alert notification',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.delete,
    });
  };
};
