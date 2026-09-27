import { config } from '@/configs';
import { HttpStatus } from '@/constants';
import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  isAppError,
  isFastifyValidationError,
  isJwtError,
  isSqliteForeignKeyError,
  isSqliteUniqueConstraintError,
  isValidationError,
  type IErrorResponse,
} from '@/errors';
import { log } from '@/logger';
import { FastifyError, FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Normalizes raw runtime errors (Fastify schema errors, SQLite violations, JWT errors)
 * into a strongly typed AppError instance.
 *
 * @param {unknown} err - Raw exception or rejection value.
 * @returns {AppError} A standardized AppError instance.
 */
function normalize(err: unknown): AppError {
  if (isAppError(err)) return err;

  // Fastify Schema Validation Error
  if (isFastifyValidationError(err)) {
    const fields = Object.fromEntries(
      err.validation.map((issue, i) => [
        issue.instancePath.replace(/^\//, '') || `field_${i}`,
        issue.message ?? 'Invalid value',
      ])
    );
    return new ValidationError(fields);
  }

  // SQLite Unique Constraint
  if (isSqliteUniqueConstraintError(err)) {
    return new ConflictError('Resource already exists', 'RESOURCE_ALREADY_EXISTS');
  }

  // SQLite Foreign Key Constraint
  if (isSqliteForeignKeyError(err)) {
    return new BadRequestError(
      'Referenced resource does not exist',
      'REFERENCED_RESOURCE_NOT_FOUND'
    );
  }

  // JWT Errors
  if (isJwtError(err)) {
    if (err.name === 'TokenExpiredError') {
      return new UnauthorizedError('Token has expired', 'JWT_TOKEN_EXPIRED');
    }
    return new UnauthorizedError('Invalid token', 'JWT_INVALID_TOKEN');
  }

  // Fastify Route 404
  if (err instanceof Error && 'statusCode' in err) {
    const fastifyErr = err as FastifyError;
    if (fastifyErr.statusCode === 404) {
      return new NotFoundError(fastifyErr.message, 'ROUTE_NOT_FOUND');
    }
  }

  // Generic Unhandled Exception
  if (err instanceof Error) {
    return new InternalServerError(err.message, 'INTERNAL_SERVER_ERROR');
  }

  return new InternalServerError('Internal server error', 'INTERNAL_SERVER_ERROR');
}

/**
 * Constructs the standardized JSON payload for API error responses.
 *
 * @param {AppError} appErr - The normalized application error.
 * @returns {IErrorResponse} Standardized error response body.
 */
function buildBody(appErr: AppError): IErrorResponse {
  const body: IErrorResponse = {
    success: false,
    statusCode: appErr.statusCode,
    code: appErr.code,
    message: appErr.isOperational
      ? appErr.message
      : config.isProd
        ? 'Internal server error'
        : appErr.message,
    ...(appErr.details && { details: appErr.details }),
    ...(isValidationError(appErr) && { errors: appErr.fields }),
    ...(config.isDev && appErr.stack && { stack: appErr.stack }),
  };

  return body;
}

/**
 * Centralized Fastify error handling and 404 router plugin.
 *
 * @description Intercepts all unhandled route errors and unmatched routes,
 * logs them using Winston with appropriate severity levels, and returns
 * standardized JSON error envelopes.
 */
export const errorHandlerPlugin = fp(
  async (app: FastifyInstance) => {
    // 404 Not Found Handler
    app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
      const err = new NotFoundError(`Cannot ${request.method} ${request.url}`);

      log.warn(err.message, {
        service: config.app.name,
        environment: config.env,
        method: request.method,
        path: request.url,
        status: err.statusCode,
        ip: request.ip,
        requestId: request.id,
        ...(config.isDev && { stack: err.stack }),
      });

      request.errorLogged = true;
      reply.status(err.statusCode).send(buildBody(err));
    });

    // Centralized Error Handler
    app.setErrorHandler(
      (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
        const appErr = normalize(error);

        if (appErr.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
          log.error(appErr, {
            service: config.app.name,
            environment: config.env,
            method: request.method,
            path: request.url,
            status: appErr.statusCode,
            ip: request.ip,
            requestId: request.id,
          });
        } else {
          log.warn(appErr.message, {
            service: config.app.name,
            environment: config.env,
            method: request.method,
            path: request.url,
            status: appErr.statusCode,
            ip: request.ip,
            requestId: request.id,
          });
        }

        request.errorLogged = true;
        reply.status(appErr.statusCode).send(buildBody(appErr));
      }
    );
  },
  { name: 'error-handler-plugin' }
);
