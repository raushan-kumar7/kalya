/**
 * Standard API response envelope and error types for Kalya web client.
 */

export interface StandardResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  meta?: PaginationMeta | CursorPaginationMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CursorPaginationMeta {
  nextCursor?: string | null;
  hasMore: boolean;
  limit: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  statusCode?: number;
  message?: string;
  success: boolean;
  meta?: PaginationMeta | CursorPaginationMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: ApiErrorDetail[];
  rawResponse?: unknown;

  constructor(message: string, statusCode = 500, errors?: ApiErrorDetail[], rawResponse?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.rawResponse = rawResponse;
  }
}
