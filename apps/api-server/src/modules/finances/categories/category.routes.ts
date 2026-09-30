import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { CategoryController } from './category.controller';
import { CreateCategorySchema, UpdateCategorySchema, z } from '@kalya/validations';

export const createCategoryRoutes = (controller: CategoryController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/', {
      schema: {
        tags: ['Finances - Categories'],
        summary: 'List categories with optional bucket filter',
        querystring: z.object({ bucket_id: z.string().optional() }),
      },
      handler: controller.list,
    });

    fastify.post('/seed-defaults', {
      schema: {
        tags: ['Finances - Categories'],
        summary: 'Seed standard default categories nested under allocation buckets',
      },
      handler: controller.seedDefaults,
    });

    fastify.get('/:id', {
      schema: {
        tags: ['Finances - Categories'],
        summary: 'Get category by ID',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.getById,
    });

    fastify.post('/', {
      schema: {
        tags: ['Finances - Categories'],
        summary: 'Create expense category',
        body: CreateCategorySchema,
      },
      handler: controller.create,
    });

    fastify.patch('/:id', {
      schema: {
        tags: ['Finances - Categories'],
        summary: 'Update expense category',
        params: z.object({ id: z.string().min(1) }),
        body: UpdateCategorySchema,
      },
      handler: controller.update,
    });

    fastify.delete('/:id', {
      schema: {
        tags: ['Finances - Categories'],
        summary: 'Delete category',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.delete,
    });
  };
};
