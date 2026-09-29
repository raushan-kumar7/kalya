import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { parseClientInfo } from './client-info';
import { ClientIntelligence } from '@kalya/types';

export const clientInfoPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    fastify.decorateRequest('clientInfo', null as unknown as ClientIntelligence);

    // Instruct clients to send high-entropy hardware Client Hints on subsequent requests
    fastify.addHook('onSend', async (_request, reply) => {
      reply.header(
        'Accept-CH',
        'Sec-CH-UA-Model, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile'
      );
    });

    // Parse once per incoming request with zero network latency
    fastify.addHook('onRequest', async (request: FastifyRequest) => {
      request.clientInfo = parseClientInfo(
        request.headers['user-agent'],
        request.ip,
        request.headers
      );
    });
  },
  {
    name: 'kalya-client-info',
  }
);

export default clientInfoPlugin;
