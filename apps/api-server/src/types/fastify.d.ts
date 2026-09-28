import 'fastify';
import { DatabaseClient } from '@kalya/db';

import type { HealthCheckRegistry } from '@kalya/types';

declare module 'fastify' {
  interface FastifyInstance {
    /** Global Drizzle ORM client bound to application schemas */
    db: DatabaseClient;

    /** Global Health & Monitoring registry */
    healthRegistry: HealthCheckRegistry;
  }

  interface FastifyRequest {
    /** Global Drizzle ORM client bound to application schemas */
    db: DatabaseClient;

    /** True if this request error has already been logged by the error handler */
    errorLogged?: boolean;

    /** Authenticated user session or token payload */
    user?: {
      id: string;
      email?: string;
      role?: string;
      [key: string]: unknown;
    };
  }
}
