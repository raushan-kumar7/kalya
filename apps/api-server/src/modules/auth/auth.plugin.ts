import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { createAuth } from './auth.instance';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ForbiddenError, UnauthorizedError } from '@/errors';
import { createAuthRoutes } from './auth.routes';
import type { Session, User } from '@kalya/types';
import { clientInfoPlugin } from '@/modules/helpers';

export const authPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    // 0. Register Client Intelligence Plugin (decorates request.clientInfo & sets Accept-CH)
    await fastify.register(clientInfoPlugin);

    // 1. Initialize Better-Auth with the existing database connection from db-plugin
    const auth = createAuth(fastify.db);

    // 2. Instantiate module service & controller
    const authService = new AuthService(fastify.db, auth);
    const authController = new AuthController(authService, auth);

    // 3. Decorate Fastify Instance & Request
    fastify.decorate('auth', auth);
    fastify.decorateRequest('user', null);
    fastify.decorateRequest('session', null);

    // 4. Decorate PreHandler Guard for Protected Routes
    fastify.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
      const sessionResult = await authService.resolveSession(request.headers as HeadersInit);

      if (!sessionResult || !sessionResult.user) {
        throw new UnauthorizedError('Authentication required to access this resource');
      }

      request.user = sessionResult.user as unknown as User;
      request.session = sessionResult.session as unknown as Session;
    });

    // 5. Decorate PreHandler Guard for Verified Email Required Routes
    fastify.decorate(
      'requireVerifiedEmail',
      async (request: FastifyRequest, _reply: FastifyReply) => {
        if (!request.user) {
          throw new UnauthorizedError('Authentication required to access this resource');
        }

        if (!request.user.emailVerified) {
          throw new ForbiddenError(
            'Email verification is required to perform this action',
            'EMAIL_NOT_VERIFIED'
          );
        }
      }
    );

    // 6. Register Routes
    await fastify.register(createAuthRoutes(authController));
  },
  {
    name: 'auth-plugin',
    dependencies: ['db-plugin'], // Ensures fastify.db is initialized and ready
  }
);
