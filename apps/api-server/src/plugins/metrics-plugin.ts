import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

/**
 * Dedicated Prometheus metric registry for the Kalya application.
 */
export const metricsRegistry = new Registry();

// Collect Node.js process & runtime metrics (CPU, Heap, Event Loop, GC)
collectDefaultMetrics({
  register: metricsRegistry,
  prefix: 'kalya_',
});

/**
 * Total incoming HTTP requests counter partitioned by HTTP method, route template, and status code.
 */
export const httpRequestsTotal = new Counter({
  name: 'kalya_http_requests_total',
  help: 'Total number of HTTP requests processed by the server',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [metricsRegistry],
});

/**
 * HTTP request latency histogram in seconds.
 */
export const httpRequestDurationSeconds = new Histogram({
  name: 'kalya_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

/**
 * Gauge measuring the number of concurrent in-flight requests.
 */
export const httpRequestsInFlight = new Gauge({
  name: 'kalya_http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method'] as const,
  registers: [metricsRegistry],
});

/**
 * Response payload size histogram in bytes.
 */
export const httpResponseSizeBytes = new Histogram({
  name: 'kalya_http_response_size_bytes',
  help: 'Size of HTTP response payloads in bytes',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
  registers: [metricsRegistry],
});

/**
 * Application errors counter partitioned by error code and status code.
 */
export const appErrorsTotal = new Counter({
  name: 'kalya_app_errors_total',
  help: 'Total number of application domain and unhandled errors',
  labelNames: ['error_code', 'status_code'] as const,
  registers: [metricsRegistry],
});

/**
 * Helper to normalize route names and prevent metric high cardinality.
 */
function resolveRoute(request: FastifyRequest): string {
  if (request.routeOptions?.url) {
    return request.routeOptions.url;
  }
  // If route is 404 or undefined, group into generic label
  return 'unmatched';
}

/**
 * Fastify Prometheus Observability Plugin.
 *
 * @description Automatically measures incoming HTTP request rates, latencies,
 * status codes, active concurrency, and Node.js runtime metrics while exposing
 * a standard GET /metrics scrape endpoint for Prometheus.
 */
export const metricsPlugin = fp(
  async (app: FastifyInstance) => {
    // 1. In-flight concurrency tracker
    app.addHook('onRequest', async (request: FastifyRequest) => {
      if (request.url === '/metrics') return;
      httpRequestsInFlight.inc({ method: request.method });
    });

    // 2. Request completion metrics recorder
    app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.url === '/metrics') return;

      httpRequestsInFlight.dec({ method: request.method });

      const route = resolveRoute(request);
      const method = request.method;
      const statusCode = reply.statusCode.toString();
      const durationSeconds = reply.elapsedTime / 1000;

      httpRequestsTotal.inc({
        method,
        route,
        status_code: statusCode,
      });

      httpRequestDurationSeconds.observe(
        {
          method,
          route,
          status_code: statusCode,
        },
        durationSeconds
      );

      const contentLengthHeader = reply.getHeader('content-length');
      if (typeof contentLengthHeader === 'number') {
        httpResponseSizeBytes.observe(
          { method, route, status_code: statusCode },
          contentLengthHeader
        );
      } else if (typeof contentLengthHeader === 'string') {
        const parsed = parseInt(contentLengthHeader, 10);
        if (!isNaN(parsed)) {
          httpResponseSizeBytes.observe({ method, route, status_code: statusCode }, parsed);
        }
      }
    });

    // 3. Prometheus /metrics scrape endpoint
    app.get(
      '/metrics',
      {
        schema: {
          description: 'Prometheus metrics scrape target',
          tags: ['Observability'],
          summary: 'Scrapes Prometheus formatted application and runtime metrics',
          produces: ['text/plain'],
        },
      },
      async (_request: FastifyRequest, reply: FastifyReply) => {
        const metrics = await metricsRegistry.metrics();
        return reply.header('Content-Type', metricsRegistry.contentType).send(metrics);
      }
    );
  },
  {
    name: 'metrics-plugin',
  }
);
