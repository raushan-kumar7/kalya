import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { PushController } from './push.controller';
import {
  RegisterMobilePushTokenSchema,
  RegisterWebPushSubscriptionSchema,
  SendTestPushSchema,
  z,
} from '@kalya/validations';

export const createPushRoutes = (controller: PushController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    // VAPID Public Key - accessible to client
    fastify.get('/vapid-key', {
      schema: {
        tags: ['Notifications - Push'],
        summary: 'Get VAPID public key for Web Push subscription',
      },
      handler: controller.getVapidKey,
    });

    // Authenticated push endpoints
    fastify.register(async (authScope) => {
      authScope.addHook('preHandler', authScope.authenticate);

      authScope.post('/web/subscribe', {
        schema: {
          tags: ['Notifications - Push'],
          summary: 'Register or refresh browser Web Push subscription',
          body: RegisterWebPushSubscriptionSchema,
        },
        handler: controller.registerWeb,
      });

      authScope.post('/web/unsubscribe', {
        schema: {
          tags: ['Notifications - Push'],
          summary: 'Unregister browser Web Push subscription',
          body: z.object({ endpoint: z.string().url() }),
        },
        handler: controller.unregisterWeb,
      });

      authScope.post('/mobile/register', {
        schema: {
          tags: ['Notifications - Push'],
          summary: 'Register or refresh mobile push device token (Expo/FCM)',
          body: RegisterMobilePushTokenSchema,
        },
        handler: controller.registerMobile,
      });

      authScope.get('/devices', {
        schema: {
          tags: ['Notifications - Push'],
          summary: 'List user active registered push devices',
        },
        handler: controller.listDevices,
      });

      authScope.delete('/devices/:id', {
        schema: {
          tags: ['Notifications - Push'],
          summary: 'Revoke and deactivate a push device',
          params: z.object({ id: z.string().min(1) }),
        },
        handler: controller.revokeDevice,
      });

      authScope.post('/test', {
        schema: {
          tags: ['Notifications - Push'],
          summary: 'Send an immediate diagnostic test push to active devices',
          body: SendTestPushSchema,
        },
        handler: controller.sendTestPush,
      });
    });
  };
};
