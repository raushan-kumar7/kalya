import type { HttpStatusCode } from '@/constants';

/**
 * Base Application Error class extending the native JavaScript Error.
 *
 * @description Serves as the standard foundation for all operational and HTTP errors
 * across the server. Supports machine-readable error codes, HTTP status codes,
 * operational classification, contextual metadata, and native error chaining (`cause`).
 */
export class AppError extends Error {
  /** The HTTP status code associated with this error (e.g., 400, 404, 500). */
  readonly statusCode: HttpStatusCode;

  /** Machine-readable uppercase identifier string (e.g., "NOT_FOUND", "VALIDATION_ERROR"). */
  readonly code: string;

  /** True if this is a known, expected operational error (safe to expose message to client). */
  readonly isOperational: boolean;

  /** Optional contextual metadata, parameter breakdowns, or validation details. */
  readonly details?: Record<string, unknown>;

  /** Optional underlying error that triggered this exception (error chaining). */
  override readonly cause?: unknown;

  /**
   * @param {string} message - Human-readable error message.
   * @param {HttpStatusCode} statusCode - HTTP status code number.
   * @param {string} code - Machine-readable domain error code.
   * @param {boolean} [isOperational=true] - Whether this error is a planned domain outcome.
   * @param {Record<string, unknown>} [details] - Optional context or parameter breakdown.
   * @param {unknown} [cause] - Optional root cause error for error chaining.
   */
  constructor(
    message: string,
    statusCode: HttpStatusCode,
    code: string,
    isOperational = true,
    details?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message);

    // Restore correct prototype chain for reliable instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    if (details) this.details = details;
    if (cause !== undefined) this.cause = cause;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serializes the error to a standardized plain JSON object.
   *
   * @returns {Record<string, unknown>} Plain object representation of the error.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      isOperational: this.isOperational,
      ...(this.details && { details: this.details }),
    };
  }
}
