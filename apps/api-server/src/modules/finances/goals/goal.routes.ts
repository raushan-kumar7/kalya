import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { GoalController } from './goal.controller';
import { CreateGoalSchema, GoalFilterQuerySchema, UpdateGoalSchema, z } from '@kalya/validations';

export const createGoalRoutes = (controller: GoalController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/', {
      schema: {
        tags: ['Finances - Goals'],
        summary: 'List goals with tracking pace',
        querystring: GoalFilterQuerySchema,
      },
      handler: controller.list,
    });

    fastify.get('/:id', {
      schema: {
        tags: ['Finances - Goals'],
        summary: 'Get goal by ID',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.getById,
    });

    fastify.post('/', {
      schema: {
        tags: ['Finances - Goals'],
        summary: 'Create savings goal',
        body: CreateGoalSchema,
      },
      handler: controller.create,
    });

    fastify.patch('/:id', {
      schema: {
        tags: ['Finances - Goals'],
        summary: 'Update goal parameters',
        params: z.object({ id: z.string().min(1) }),
        body: UpdateGoalSchema,
      },
      handler: controller.update,
    });

    fastify.delete('/:id', {
      schema: {
        tags: ['Finances - Goals'],
        summary: 'Delete savings goal',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.delete,
    });
  };
};
