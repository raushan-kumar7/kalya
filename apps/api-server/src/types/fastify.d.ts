import 'fastify';
import { DatabaseClient } from '@kalya/db';

import type { HealthCheckRegistry, Session, User, ClientIntelligence } from '@kalya/types';
import { AuthInstance } from '@/modules/auth';

declare module 'fastify' {
  interface FastifyInstance {
    /** Global Drizzle ORM client bound to application schemas */
    db: DatabaseClient;

    /** Global Health & Monitoring registry */
    healthRegistry: HealthCheckRegistry;

    auth: AuthInstance;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireVerifiedEmail: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    /** Global Drizzle ORM client bound to application schemas */
    db: DatabaseClient;

    /** client */
    clientInfo: ClientIntelligence;

    /** True if this request error has already been logged by the error handler */
    errorLogged?: boolean;

    /** Authenticated user session or token payload */
    user: User | null;
    session: Session | null;
  }
}
