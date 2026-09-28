import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { env } from '@kalya/env';
import { HealthService } from './health.service';
import { DatabaseHealthChecker, StorageHealthChecker } from './checkers';
import { HealthController } from './health.controller';
import { createHealthRoutes } from './health.routes';

/**
 * Fastify plugin encapsulating the Health & Observability monitoring subsystem.
 *
 * @description
 * 1. Instantiates the central `HealthService` registry.
 * 2. Registers dependency checkers (`DatabaseHealthChecker`, `StorageHealthChecker`).
 * 3. Decorates `fastify.healthRegistry` for global accessibility across handlers.
 * 4. Mounts the health HTTP endpoints (`/health/live`, `/health/ready`, `/health`).
 */
export const healthPlugin = fp(
  async (app: FastifyInstance) => {
    const healthService = new HealthService();

    // 1. Register dependency checkers
    healthService.register(new DatabaseHealthChecker(app.db));
    healthService.register(new StorageHealthChecker(env.storage.local.uploadDir));

    // 2. Decorate Fastify instance for global access
    app.decorate('healthRegistry', healthService);

    // 3. Mount controller & routes
    const controller = new HealthController(healthService);
    await app.register(createHealthRoutes(controller));
  },
  {
    name: 'health-plugin',
    dependencies: ['db-plugin'],
  }
);
