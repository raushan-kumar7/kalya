import { env } from '@kalya/env';
import type {
  HealthChecker,
  HealthCheckName,
  HealthCheckRegistry,
  HealthCheckResult,
  HealthLivenessResponse,
  HealthReadinessResponse,
  HealthStatus,
  SystemHealthReport,
  SystemOperationalStatus,
} from '@kalya/types';

/**
 * Central registry and orchestration service for application health checks.
 *
 * @description Coordinates non-blocking execution of registered health checkers,
 * manages execution timeout boundaries, and aggregates readiness and operational diagnostics.
 */
export class HealthService implements HealthCheckRegistry {
  private readonly checkers = new Map<HealthCheckName, HealthChecker>();

  /**
   * Registers a new subsystem health checker.
   *
   * @param {HealthChecker} checker - The dependency health checker implementation.
   */
  register(checker: HealthChecker): void {
    this.checkers.set(checker.name, checker);
  }

  /**
   * Executes a single named health check bounded by its configured timeout.
   *
   * @param {HealthCheckName} name - Identifier of the check to execute.
   * @returns {Promise<HealthCheckResult>} Evaluated health result.
   */
  async runCheck(name: HealthCheckName): Promise<HealthCheckResult> {
    const checker = this.checkers.get(name);
    if (!checker) {
      return {
        name,
        status: 'unhealthy',
        latencyMs: 0,
        message: `No health checker registered for "${name}"`,
        checkedAt: new Date().toISOString(),
      };
    }

    const timeoutMs = checker.timeoutMs ?? 2000;
    let timer: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<HealthCheckResult>((resolve) => {
      timer = setTimeout(() => {
        resolve({
          name: checker.name,
          status: 'unhealthy',
          latencyMs: timeoutMs,
          message: `Health check timed out after ${timeoutMs}ms`,
          checkedAt: new Date().toISOString(),
        });
      }, timeoutMs);

      // Do not keep Node.js process alive solely for health check timeout
      timer.unref?.();
    });

    try {
      const result = await Promise.race([checker.check(), timeoutPromise]);
      if (timer) clearTimeout(timer);
      return result;
    } catch (err) {
      if (timer) clearTimeout(timer);
      return {
        name: checker.name,
        status: 'unhealthy',
        latencyMs: 0,
        message: err instanceof Error ? err.message : 'Unknown execution failure',
        checkedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Executes all registered health checks in parallel.
   *
   * @returns {Promise<Record<string, HealthCheckResult>>} Map of check names to results.
   */
  async runAllChecks(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};
    const promises = Array.from(this.checkers.values()).map(async (checker) => {
      const res = await this.runCheck(checker.name);
      results[checker.name] = res;
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Generates a lightweight liveness probe response with zero I/O overhead.
   *
   * @returns {HealthLivenessResponse}
   */
  getLiveness(): HealthLivenessResponse {
    return {
      status: 'alive',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluates all critical dependencies to construct a readiness probe response.
   *
   * @returns {Promise<HealthReadinessResponse>}
   */
  async getReadiness(): Promise<HealthReadinessResponse> {
    const checks: Record<string, HealthStatus> = {};
    let isReady = true;

    for (const checker of this.checkers.values()) {
      if (checker.isCritical) {
        const result = await this.runCheck(checker.name);
        checks[checker.name] = result.status;
        if (result.status !== 'healthy') {
          isReady = false;
        }
      }
    }

    return {
      status: isReady ? 'ready' : 'not_ready',
      service: env.observability.serviceName,
      environment: env.env,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluates all registered dependencies to construct a comprehensive diagnostics report.
   *
   * @returns {Promise<SystemHealthReport>}
   */
  async getDetailedHealth(): Promise<SystemHealthReport> {
    const checks = await this.runAllChecks();

    let overallStatus: SystemOperationalStatus = 'operational';
    let message = 'All systems operational';

    const checkValues = Object.values(checks);
    const hasUnhealthy = checkValues.some((c) => c.status === 'unhealthy');
    const hasDegraded = checkValues.some((c) => c.status === 'degraded');

    if (hasUnhealthy) {
      overallStatus = 'down';
      message = 'One or more critical subsystems are unhealthy';
    } else if (hasDegraded) {
      overallStatus = 'degraded';
      message = 'One or more non-critical subsystems are degraded';
    }

    return {
      status: overallStatus,
      service: env.observability.serviceName,
      environment: env.env,
      version: env.app.apiVersion,
      message,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
