import type { HttpStatusCode } from '@/constants';

/**
 * Metadata contract for offset-based and page-based paginated list responses.
 */
export interface PaginationMeta {
  /** Total count of records matching the query in the database. */
  total: number;
  /** Maximum number of records requested per page. */
  limit: number;
  /** Number of records skipped before beginning to return results. */
  offset: number;
  /** Current 1-based page index. */
  currentPage: number;
  /** Total number of pages available. */
  totalPages: number;
  /** True if there is a subsequent page available. */
  hasNext: boolean;
  /** True if there is a preceding page available. */
  hasPrev: boolean;
}

/**
 * Raw pagination parameters from database or query inputs.
 * Accepts either offset-based ({ offset, limit, total }) or page-based ({ page, limit, total }).
 */
export type PaginationInput =
  | { total: number; limit: number; offset: number; page?: never }
  | { total: number; limit: number; page: number; offset?: never };

/**
 * Metadata contract for cursor-based paginated responses (infinite scroll, feeds).
 */
export interface CursorPaginationMeta {
  /** Next cursor identifier (opaque string or record ID). Null if end of collection. */
  nextCursor: string | null;
  /** Previous cursor identifier if bidirectional navigation is supported. */
  prevCursor?: string | null;
  /** True if more records exist beyond the current cursor. */
  hasMore: boolean;
  /** Total count if known (optional for performance). */
  total?: number;
}

/**
 * Unified JSON envelope returned for all successful API responses.
 *
 * @template T - Type of the response payload contained in data.
 */
export interface StandardResponse<T> {
  /** Always true for 2xx responses. */
  success: true;
  /** The HTTP status code number. */
  statusCode: HttpStatusCode;
  /** Human-readable status confirmation message. */
  message: string;
  /** The primary payload. */
  data: T;
  /** Optional pagination, query, or cursor metadata. */
  meta?: Partial<PaginationMeta> | CursorPaginationMeta;
  /** ISO 8601 timestamp string when the response was generated. */
  timestamp: string;
}

/**
 * Type helper for paginated responses where data is an array of items.
 *
 * @template T - Type of individual items in the paginated collection.
 */
export type PaginatedResponse<T> = StandardResponse<T[]> & {
  meta: PaginationMeta;
};
