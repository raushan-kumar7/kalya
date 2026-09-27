import 'fastify';
import { DatabaseClient } from '@kalya/db';

declare module 'fastify' {
  interface FastifyInstance {
    /** Global Drizzle ORM client bound to application schemas */
    db: DatabaseClient;
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
