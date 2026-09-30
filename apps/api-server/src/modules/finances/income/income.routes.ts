import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { IncomeController } from './income.controller';
import {
  CreateIncomeSchema,
  IncomeFilterQuerySchema,
  UpdateIncomeSchema,
  z,
} from '@kalya/validations';

export const createIncomeRoutes = (controller: IncomeController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/', {
      schema: {
        tags: ['Finances - Income'],
        summary: 'List monthly income records',
        querystring: IncomeFilterQuerySchema,
      },
      handler: controller.list,
    });

    fastify.get('/:id', {
      schema: {
        tags: ['Finances - Income'],
        summary: 'Get income record by ID',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.getById,
    });

    fastify.post('/', {
      schema: {
        tags: ['Finances - Income'],
        summary: 'Register monthly income',
        body: CreateIncomeSchema,
      },
      handler: controller.create,
    });

    fastify.patch('/:id', {
      schema: {
        tags: ['Finances - Income'],
        summary: 'Update income record',
        params: z.object({ id: z.string().min(1) }),
        body: UpdateIncomeSchema,
      },
      handler: controller.update,
    });

    fastify.delete('/:id', {
      schema: {
        tags: ['Finances - Income'],
        summary: 'Delete income record',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.delete,
    });
  };
};
