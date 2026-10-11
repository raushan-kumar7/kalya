import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { SplitController } from './split.controller';
import {
  CreateSplitContactMemberSchema,
  LinkSplitContactSchema,
  RespondSplitInvitationSchema,
  SettleSplitExpenseSchema,
  UpdateSplitContactMemberSchema,
  z,
} from '@kalya/validations';

export const createSplitRoutes = (controller: SplitController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/contacts', {
      schema: { tags: ['Finances - Splits'], summary: 'List split contact members' },
      handler: controller.listContacts,
    });

    fastify.post('/contacts', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'Add split contact member',
        body: CreateSplitContactMemberSchema,
      },
      handler: controller.createContact,
    });

    fastify.patch('/contacts/:id', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'Update split contact',
        params: z.object({ id: z.string().min(1) }),
        body: UpdateSplitContactMemberSchema,
      },
      handler: controller.updateContact,
    });

    fastify.post('/contacts/:id/link', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'Link unlinked contact to a Kalya user',
        params: z.object({ id: z.string().min(1) }),
        body: LinkSplitContactSchema,
      },
      handler: controller.linkContact,
    });

    fastify.post('/contacts/:id/unlink', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'Unlink contact from Kalya user',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.unlinkContact,
    });

    fastify.get('/contacts/suggestions', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'Get suggestions for unlinked contacts matching Kalya users',
      },
      handler: controller.getSuggestions,
    });

    fastify.delete('/contacts/:id', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'Delete split contact member',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.deleteContact,
    });

    fastify.get('/invitations', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'List incoming pending split invitations',
      },
      handler: controller.listInvitations,
    });

    fastify.post('/invitations/:id/respond', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'Accept or decline split invitation',
        params: z.object({ id: z.string().min(1) }),
        body: RespondSplitInvitationSchema,
      },
      handler: controller.respondInvitation,
    });

    fastify.get('/pending', {
      schema: { tags: ['Finances - Splits'], summary: 'List unsettled split expense shares' },
      handler: controller.listPending,
    });

    fastify.post('/shares/:id/settle', {
      schema: {
        tags: ['Finances - Splits'],
        summary: 'Record payment settlement on a split share',
        params: z.object({ id: z.string().min(1) }),
        body: SettleSplitExpenseSchema,
      },
      handler: controller.settle,
    });
  };
};
