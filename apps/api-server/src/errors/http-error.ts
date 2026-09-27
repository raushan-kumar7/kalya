import { HttpStatus } from '@/constants';
import { AppError } from './app-error';

export type TokenType = 'access' | 'refresh';

/**
 * 400 Bad Request error.
 */
export class BadRequestError extends AppError {
  constructor(
    message = 'Bad request',
    code = 'BAD_REQUEST',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, true, details, cause);
  }
}

/**
 * 401 Unauthorized error (missing or invalid credentials).
 */
export class UnauthorizedError extends AppError {
  constructor(
    message = 'Unauthorized',
    code = 'UNAUTHORIZED',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.UNAUTHORIZED, code, true, details, cause);
  }
}

/**
 * 403 Forbidden error (authenticated but insufficient permissions).
 */
export class ForbiddenError extends AppError {
  constructor(
    message = 'Forbidden',
    code = 'FORBIDDEN',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.FORBIDDEN, code, true, details, cause);
  }
}

/**
 * 404 Not Found error (requested entity or route does not exist).
 */
export class NotFoundError extends AppError {
  constructor(
    message = 'Resource not found',
    code = 'NOT_FOUND',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.NOT_FOUND, code, true, details, cause);
  }
}

/**
 * 405 Method Not Allowed error.
 */
export class MethodNotAllowedError extends AppError {
  constructor(
    message = 'Method not allowed',
    code = 'METHOD_NOT_ALLOWED',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.METHOD_NOT_ALLOWED, code, true, details, cause);
  }
}

/**
 * 409 Conflict error (e.g. duplicate key or state collision).
 */
export class ConflictError extends AppError {
  constructor(
    message = 'Conflict',
    code = 'CONFLICT',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.CONFLICT, code, true, details, cause);
  }
}

/**
 * 413 Payload Too Large error (upload or body size limit exceeded).
 */
export class PayloadTooLargeError extends AppError {
  constructor(
    message = 'Payload too large',
    code = 'PAYLOAD_TOO_LARGE',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.PAYLOAD_TOO_LARGE, code, true, details, cause);
  }
}

/**
 * 422 Unprocessable Entity error (validation failed on input fields).
 */
export class ValidationError extends AppError {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>, message = 'Validation failed', cause?: unknown) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', true, fields, cause);
    this.fields = fields;
  }
}

/**
 * 429 Too Many Requests error (rate limiting).
 */
export class TooManyRequestsError extends AppError {
  constructor(
    message = 'Too many requests',
    code = 'TOO_MANY_REQUESTS',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, code, true, details, cause);
  }
}

/**
 * 500 Internal Server Error (unexpected programmer error).
 */
export class InternalServerError extends AppError {
  constructor(
    message = 'Internal server error',
    code = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, code, false, details, cause);
  }
}

/**
 * 501 Not Implemented error.
 */
export class NotImplementedError extends AppError {
  constructor(
    message = 'Not implemented',
    code = 'NOT_IMPLEMENTED',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.NOT_IMPLEMENTED, code, false, details, cause);
  }
}

/**
 * 503 Service Unavailable error (database or external dependency down).
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message = 'Service unavailable',
    code = 'SERVICE_UNAVAILABLE',
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, code, false, details, cause);
  }
}

/**
 * Specialized cryptographic hashing failure error.
 */
export class HashingError extends AppError {
  constructor(message = 'Password hashing failed', cause?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'HASHING_ERROR', false, undefined, cause);
  }
}

/**
 * Specialized JWT Token Expiration error.
 */
export class JwtTokenExpiredError extends AppError {
  constructor(type: TokenType, cause?: unknown) {
    super(
      `${type === 'access' ? 'Access' : 'Refresh'} token has expired`,
      HttpStatus.UNAUTHORIZED,
      'JWT_TOKEN_EXPIRED',
      true,
      { tokenType: type },
      cause
    );
  }
}

/**
 * Specialized JWT Token Malformed / Invalid error.
 */
export class JwtInvalidTokenError extends AppError {
  constructor(type: TokenType, cause?: unknown) {
    super(
      `Invalid ${type === 'access' ? 'access' : 'refresh'} token`,
      HttpStatus.UNAUTHORIZED,
      'JWT_INVALID_TOKEN',
      true,
      { tokenType: type },
      cause
    );
  }
}
