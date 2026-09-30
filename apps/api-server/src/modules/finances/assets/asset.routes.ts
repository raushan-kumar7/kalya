import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AssetController } from './asset.controller';
import {
  CreateDigitalAssetSchema,
  CreateEquityAssetSchema,
  DigitalAssetFilterQuerySchema,
  EquityAssetFilterQuerySchema,
} from '@kalya/validations';

export const createAssetRoutes = (controller: AssetController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get('/digital', {
      schema: {
        tags: ['Finances - Assets'],
        summary: 'List digital assets',
        querystring: DigitalAssetFilterQuerySchema,
      },
      handler: controller.listDigital,
    });

    fastify.post('/digital', {
      schema: {
        tags: ['Finances - Assets'],
        summary: 'Log digital asset purchase',
        body: CreateDigitalAssetSchema,
      },
      handler: controller.createDigital,
    });

    fastify.get('/equities', {
      schema: {
        tags: ['Finances - Assets'],
        summary: 'List equities portfolio',
        querystring: EquityAssetFilterQuerySchema,
      },
      handler: controller.listEquities,
    });

    fastify.post('/equities', {
      schema: {
        tags: ['Finances - Assets'],
        summary: 'Record equity shares purchase',
        body: CreateEquityAssetSchema,
      },
      handler: controller.createEquity,
    });

    fastify.get('/portfolio-summary', {
      schema: { tags: ['Finances - Assets'], summary: 'Portfolio total net worth breakdown' },
      handler: controller.getPortfolioSummary,
    });
  };
};
