import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { SummaryController } from './summary.controller';
import { GenerateMonthlySummarySchema, MonthStringSchema, z } from '@kalya/validations';

export const createSummaryRoutes = (controller: SummaryController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/overview', {
      schema: {
        tags: ['Finances - Summaries'],
        summary: 'Dashboard high-level overview metrics',
        querystring: z.object({ month: MonthStringSchema }),
      },
      handler: controller.getOverview,
    });

    fastify.post('/statements/generate', {
      schema: {
        tags: ['Finances - Summaries'],
        summary: 'Generate monthly statement snapshot',
        body: GenerateMonthlySummarySchema,
      },
      handler: controller.generateStatement,
    });
  };
};
