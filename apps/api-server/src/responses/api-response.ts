import { HttpStatus, type HttpStatusCode } from '@/constants';
import type { FastifyReply } from 'fastify';
import type {
  CursorPaginationMeta,
  PaginationInput,
  PaginationMeta,
  StandardResponse,
} from './response.types';

/**
 * Computes derived pagination metadata (currentPage, totalPages, hasNext, hasPrev).
 *
 * @description Centralizes pagination arithmetic. Accepts either offset-based
 * ({ offset, limit, total }) or page-based ({ page, limit, total }) inputs.
 *
 * @param {PaginationInput} input - Raw pagination parameters.
 * @returns {PaginationMeta} Complete pagination metadata with 1-based page index.
 */
export function buildPaginationMeta(input: PaginationInput): PaginationMeta {
  const { total } = input;
  const safeLimit = input.limit > 0 ? input.limit : 1;

  let offset: number;
  let currentPage: number;

  if ('page' in input && typeof input.page === 'number') {
    currentPage = Math.max(1, input.page);
    offset = (currentPage - 1) * safeLimit;
  } else {
    offset = Math.max(0, input.offset ?? 0);
    currentPage = Math.floor(offset / safeLimit) + 1;
  }

  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    total,
    limit: safeLimit,
    offset,
    currentPage,
    totalPages,
    hasNext: offset + safeLimit < total,
    hasPrev: offset > 0,
  };
}

/**
 * Standardized API Response factory for Fastify route handlers.
 *
 * @description Provides consistent HTTP response generation across all endpoints.
 */
export class ApiResponse {
  /**
   * Generic sender wrapping payloads into the StandardResponse envelope.
   *
   * @template T - Type of the response payload.
   * @param {FastifyReply} reply - Fastify reply instance.
   * @param {HttpStatusCode} statusCode - HTTP status code number.
   * @param {string} message - Human-readable status message.
   * @param {T} data - Main response payload.
   * @param {Partial<PaginationMeta> | CursorPaginationMeta} [meta] - Optional pagination metadata.
   * @returns {FastifyReply}
   */
  static send<T>(
    reply: FastifyReply,
    statusCode: HttpStatusCode,
    message: string,
    data: T,
    meta?: Partial<PaginationMeta> | CursorPaginationMeta
  ): FastifyReply {
    const body: StandardResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...(meta && { meta }),
    };

    return reply.status(statusCode).send(body);
  }

  /**
   * Returns a 200 OK response with a payload.
   *
   * @template T - Type of the data payload.
   * @param {FastifyReply} reply - Fastify reply instance.
   * @param {T} data - Payload to send.
   * @param {string} [message="Request successful"] - Confirmation message.
   * @returns {FastifyReply}
   */
  static ok<T>(reply: FastifyReply, data: T, message = 'Request successful'): FastifyReply {
    return ApiResponse.send(reply, HttpStatus.OK, message, data);
  }

  /**
   * Returns a 201 Created response for newly created entities.
   *
   * @template T - Type of the newly created entity.
   * @param {FastifyReply} reply - Fastify reply instance.
   * @param {T} data - Newly created entity payload.
   * @param {string} [message="Resource created successfully"] - Confirmation message.
   * @returns {FastifyReply}
   */
  static created<T>(
    reply: FastifyReply,
    data: T,
    message = 'Resource created successfully'
  ): FastifyReply {
    return ApiResponse.send(reply, HttpStatus.CREATED, message, data);
  }

  /**
   * Returns a 202 Accepted response for background/asynchronous tasks.
   *
   * @template T - Type of the task or job payload.
   * @param {FastifyReply} reply - Fastify reply instance.
   * @param {T} data - Job or task identifier payload.
   * @param {string} [message="Request accepted"] - Confirmation message.
   * @returns {FastifyReply}
   */
  static accepted<T>(reply: FastifyReply, data: T, message = 'Request accepted'): FastifyReply {
    return ApiResponse.send(reply, HttpStatus.ACCEPTED, message, data);
  }

  /**
   * Returns a 200 OK response with automatic pagination calculations.
   *
   * @description Takes raw total, limit, and offset/page numbers and computes
   * currentPage, totalPages, hasNext, and hasPrev on the meta object.
   *
   * @template T - Type of elements in the paginated list.
   * @param {FastifyReply} reply - Fastify reply instance.
   * @param {T[]} data - Array of entities for the current page.
   * @param {PaginationInput} pagination - Raw total, limit, and offset/page numbers.
   * @param {string} [message="List retrieved successfully"] - Confirmation message.
   * @returns {FastifyReply}
   */
  static paginated<T>(
    reply: FastifyReply,
    data: T[],
    pagination: PaginationInput,
    message = 'List retrieved successfully'
  ): FastifyReply {
    return ApiResponse.send(reply, HttpStatus.OK, message, data, buildPaginationMeta(pagination));
  }

  /**
   * Returns a 200 OK response with cursor-based pagination metadata.
   *
   * @template T - Type of elements in the cursor collection.
   * @param {FastifyReply} reply - Fastify reply instance.
   * @param {T[]} data - Array of records for the current page.
   * @param {CursorPaginationMeta} meta - Cursor navigation state (nextCursor, hasMore).
   * @param {string} [message="List retrieved successfully"] - Confirmation message.
   * @returns {FastifyReply}
   */
  static cursor<T>(
    reply: FastifyReply,
    data: T[],
    meta: CursorPaginationMeta,
    message = 'List retrieved successfully'
  ): FastifyReply {
    return ApiResponse.send(reply, HttpStatus.OK, message, data, meta);
  }

  /**
   * Returns an HTTP 204 No Content response.
   *
   * @description Defaults to a bodyless 204. If the caller provides custom options
   * (e.g. confirmation message or data), falls back to 200 OK because HTTP 204
   * cannot carry a response body according to RFC specifications.
   *
   * @param {FastifyReply} reply - Fastify reply instance.
   * @param {{ message?: string; data?: unknown }} [options] - Optional confirmation message or fallback data.
   * @returns {FastifyReply}
   */
  static noContent(
    reply: FastifyReply,
    options?: { message?: string; data?: unknown }
  ): FastifyReply {
    if (!options || (options.message === undefined && options.data === undefined)) {
      return reply.status(HttpStatus.NO_CONTENT).send();
    }

    return ApiResponse.send(
      reply,
      HttpStatus.OK,
      options.message ?? 'Request successful',
      options.data ?? null
    );
  }

  /**
   * Issues an HTTP redirect to a destination URL.
   *
   * @param {FastifyReply} reply - Fastify reply instance.
   * @param {string} url - Target URL to redirect to.
   * @param {HttpStatusCode} [statusCode=302] - Redirection status code (301, 302, 307, 308).
   * @returns {FastifyReply}
   */
  static redirect(
    reply: FastifyReply,
    url: string,
    statusCode: HttpStatusCode = HttpStatus.FOUND
  ): FastifyReply {
    return reply.status(statusCode).redirect(url);
  }
}
