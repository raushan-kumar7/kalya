import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { BudgetController } from './budget.controller';
import {
  BudgetFilterQuerySchema,
  CreateBudgetSchema,
  UpdateBudgetSchema,
  z,
} from '@kalya/validations';

export const createBudgetRoutes = (controller: BudgetController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/', {
      schema: {
        tags: ['Finances - Budgets'],
        summary: 'List budget plans',
        querystring: BudgetFilterQuerySchema,
      },
      handler: controller.list,
    });

    fastify.get('/:id', {
      schema: {
        tags: ['Finances - Budgets'],
        summary: 'Get budget by ID',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.getById,
    });

    fastify.get('/:id/health', {
      schema: {
        tags: ['Finances - Budgets'],
        summary: 'Evaluate real-time budget consumption and status',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.getHealth,
    });

    fastify.post('/', {
      schema: {
        tags: ['Finances - Budgets'],
        summary: 'Create budget plan for bucket & income',
        body: CreateBudgetSchema,
      },
      handler: controller.create,
    });

    fastify.patch('/:id', {
      schema: {
        tags: ['Finances - Budgets'],
        summary: 'Update budget parameters',
        params: z.object({ id: z.string().min(1) }),
        body: UpdateBudgetSchema,
      },
      handler: controller.update,
    });

    fastify.delete('/:id', {
      schema: {
        tags: ['Finances - Budgets'],
        summary: 'Delete budget plan',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.delete,
    });
  };
};
