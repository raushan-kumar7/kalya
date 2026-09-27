import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
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
