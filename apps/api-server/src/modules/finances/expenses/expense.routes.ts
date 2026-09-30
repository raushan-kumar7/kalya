import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { ExpenseController } from './expense.controller';
import {
  CreateExpenseSchema,
  ExpenseFilterQuerySchema,
  UpdateExpenseSchema,
  z,
} from '@kalya/validations';

export const createExpenseRoutes = (controller: ExpenseController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/', {
      schema: {
        tags: ['Finances - Expenses'],
        summary: 'List expenses with multi-field filtering',
        querystring: ExpenseFilterQuerySchema,
      },
      handler: controller.list,
    });

    fastify.get('/:id', {
      schema: {
        tags: ['Finances - Expenses'],
        summary: 'Get expense with split shares',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.getById,
    });

    fastify.post('/', {
      schema: {
        tags: ['Finances - Expenses'],
        summary: 'Record new expenditure transaction',
        body: CreateExpenseSchema,
      },
      handler: controller.create,
    });

    fastify.patch('/:id', {
      schema: {
        tags: ['Finances - Expenses'],
        summary: 'Update expenditure record',
        params: z.object({ id: z.string().min(1) }),
        body: UpdateExpenseSchema,
      },
      handler: controller.update,
    });

    fastify.delete('/:id', {
      schema: {
        tags: ['Finances - Expenses'],
        summary: 'Delete expense transaction and linked split shares',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.delete,
    });
  };
};
