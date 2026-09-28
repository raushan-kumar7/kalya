import type { FastifyReply, FastifyRequest } from 'fastify';
import type { HealthService } from './health.service';

/**
 * Controller handling HTTP transport logic for health & observability probes.
 */
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /health/live
   *
   * @description Ultra-fast liveness probe confirming the Node.js event loop is
   * active and responsive. Orchestrators use this to determine if the container
   * should be restarted due to deadlock.
   */
  getLiveness = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    const response = this.healthService.getLiveness();
    return reply.status(200).send(response);
  };

  /**
   * GET /health/ready
   *
   * @description Readiness probe verifying critical system dependencies (e.g. database).
   * Ingress controllers and load balancers use this to determine whether traffic should
   * be routed to this process instance. Returns 200 if ready, 503 if unready.
   */
  getReadiness = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    const response = await this.healthService.getReadiness();
    const statusCode = response.status === 'ready' ? 200 : 503;
    return reply.status(statusCode).send(response);
  };

  /**
   * GET /health
   *
   * @description Comprehensive operational diagnostics endpoint evaluating all
   * registered subsystems (database, storage, mail, etc.) alongside server uptime.
   * Returns 200 when operational/degraded, 503 when critical systems are down.
   */
  getDetailedHealth = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    const report = await this.healthService.getDetailedHealth();
    const statusCode = report.status === 'down' ? 503 : 200;
    return reply.status(statusCode).send(report);
  };
}
