import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { createUserRoutes } from './user.routes';

/**
 * Fastify plugin encapsulating the User Profile and Session Management module.
 *
 * @description Registers user profile service, controller, and routes within Fastify, requiring prior database and authentication plugin initialization.
 */
export const userPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    // 1. Initialize Module Service & Controller
    const userService = new UserService(fastify.db);
    const userController = new UserController(userService);

    // 2. Mount Module Routes
    await fastify.register(createUserRoutes(userController));
  },
  {
    name: 'user-plugin',
    dependencies: ['db-plugin', 'auth-plugin'],
  }
);
