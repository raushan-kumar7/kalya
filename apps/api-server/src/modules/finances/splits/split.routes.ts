import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { SplitController } from './split.controller';
import {
  CreateSplitContactMemberSchema,
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
