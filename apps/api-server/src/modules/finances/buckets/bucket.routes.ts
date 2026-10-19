import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { BucketController } from './bucket.controller';
import { CreateBucketSchema, UpdateBucketSchema, z } from '@kalya/validations';

export const createBucketRoutes = (controller: BucketController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/', {
      schema: {
        tags: ['Finances - Buckets'],
        summary: 'List all allocation buckets',
      },
      handler: controller.list,
    });

    fastify.post('/seed-defaults', {
      schema: {
        tags: ['Finances - Buckets'],
        summary: 'Seed standard default allocation buckets (Needs, Wants, Savings)',
      },
      handler: controller.seedDefaults,
    });

    fastify.get('/:id', {
      schema: {
        tags: ['Finances - Buckets'],
        summary: 'Get bucket by ID',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.getById,
    });

    fastify.post('/', {
      schema: {
        tags: ['Finances - Buckets'],
        summary: 'Create custom allocation bucket',
        body: CreateBucketSchema,
      },
      handler: controller.create,
    });

    fastify.patch('/:id', {
      schema: {
        tags: ['Finances - Buckets'],
        summary: 'Update allocation bucket',
        params: z.object({ id: z.string().min(1) }),
        body: UpdateBucketSchema,
      },
      handler: controller.update,
    });

    fastify.delete('/:id', {
      schema: {
        tags: ['Finances - Buckets'],
        summary: 'Delete custom allocation bucket',
        params: z.object({ id: z.string().min(1) }),
      },
      handler: controller.delete,
    });
  };
};
