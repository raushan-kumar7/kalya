import type { HttpStatusCode } from '@/constants';
import type { FastifyError } from 'fastify';
import { AppError } from './app-error';
import { ValidationError } from './http-error';

/**
 * Standardized JSON response payload returned on all API errors.
 */
export interface IErrorResponse {
  success: false;
  statusCode: HttpStatusCode;
  code: string;
  message: string;
  errors?: Record<string, string>;
  details?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
  stack?: string;
}

/**
 * better-sqlite3 error shape for constraint violations and SQLite engine failures.
 */
export interface ISqliteError extends Error {
  code: string;
  name: 'SqliteError';
}

/**
 * JWT error shape for expired or malformed tokens.
 */
export interface IJwtError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError';
  expiredAt?: Date;
}

/**
 * Type guard for custom AppError instances.
 */
export const isAppError = (err: unknown): err is AppError =>
  err instanceof Error && 'statusCode' in err && 'isOperational' in err && 'code' in err;

/**
 * Type guard for ValidationError instances containing field-level issues.
 */
export const isValidationError = (err: unknown): err is ValidationError =>
  isAppError(err) && 'fields' in err;

/**
 * Type guard for Fastify schema validation errors.
 */
export const isFastifyValidationError = (
  err: unknown
): err is FastifyError & {
  validation: NonNullable<FastifyError['validation']>;
} =>
  err instanceof Error &&
  'validation' in err &&
  Array.isArray((err as FastifyError).validation) &&
  (err as FastifyError).validation!.length > 0;

/**
 * Type guard for SQLite database engine errors.
 */
export const isSqliteError = (err: unknown): err is ISqliteError =>
  err instanceof Error && err.name === 'SqliteError' && 'code' in err;

/**
 * Type guard for SQLite unique constraint violations (SQLITE_CONSTRAINT_UNIQUE).
 */
export const isSqliteUniqueConstraintError = (err: unknown): err is ISqliteError =>
  isSqliteError(err) && err.code === 'SQLITE_CONSTRAINT_UNIQUE';

/**
 * Type guard for SQLite foreign key constraint violations (SQLITE_CONSTRAINT_FOREIGNKEY).
 */
export const isSqliteForeignKeyError = (err: unknown): err is ISqliteError =>
  isSqliteError(err) && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY';

/**
 * Type guard for JSON Web Token errors (TokenExpiredError, JsonWebTokenError).
 */
export const isJwtError = (err: unknown): err is IJwtError =>
  err instanceof Error && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError');

/**
 * Type guard for Node.js filesystem and network system errors (e.g. ENOENT, ECONNREFUSED).
 */
export const isNodeError = (err: unknown): err is NodeJS.ErrnoException =>
  err instanceof Error && 'code' in err && typeof (err as NodeJS.ErrnoException).code === 'string';
