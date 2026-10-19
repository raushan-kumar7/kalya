'use client';

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, type ApiErrorDetail } from './types';
import { useAuthStore } from '@/stores/auth';
import { toSnake } from '@kalya/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3600';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

/**
 * Singleton Axios client instance configured for the Kalya web frontend.
 * - Forwards Better-Auth HTTP-only session cookies with withCredentials: true.
 * - Connects to Fastify API server with versioned baseURL.
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

// ------------------------------------------------------------
// Request Interceptor
// ------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If sending FormData (avatar uploads, file attachments), ensure Content-Type is unset so browser/client sets multipart with boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as Record<string, unknown>)['Content-Type'];
        delete (config.headers as Record<string, unknown>)['content-type'];
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
          config.headers.delete('content-type');
        }
      }
    } else if (config.data && config.headers && !config.headers.has('Content-Type')) {
      config.headers.set('Content-Type', 'application/json');
    }

    // Ensure relative paths not starting with /api or /health get prefixed with /api/${API_VERSION}
    if (
      config.url &&
      !config.url.startsWith('http://') &&
      !config.url.startsWith('https://') &&
      !config.url.startsWith('/api') &&
      !config.url.startsWith('/health')
    ) {
      const cleanPath = config.url.replace(/^\/+/, '');
      config.url = `/api/${API_VERSION}/${cleanPath}`;
    }

    // Attach Authorization Bearer token from auth store if available and not already set
    if (!config.headers.Authorization) {
      try {
        const token = useAuthStore.getState().session?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Ignore during early initialization or SSR
      }
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ------------------------------------------------------------
// Response Interceptor
// ------------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unbox standardResponseSchema envelope if present
    const data = response.data;
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      if (data.meta !== undefined) {
        if (Array.isArray(data.data)) {
          Object.defineProperty(data.data, 'meta', {
            value: data.meta,
            writable: true,
            enumerable: false,
            configurable: true,
          });
        } else if (typeof data.data === 'object' && data.data !== null) {
          (data.data as Record<string, unknown>).meta = data.meta;
        }
      }
      // Retain the unboxed data directly
      response.data = data.data;
    }

    const url = response.config?.url ?? '';
    if (url.includes('/finances/') || url.includes('/notifications/')) {
      response.data = toSnake(response.data);
    }
    return response;
  },
  (error: AxiosError<Record<string, unknown>>) => {
    const statusCode = error.response?.status ?? 500;
    const responseData = error.response?.data;

    let errorMessage = 'An unexpected server error occurred';
    let errorDetails: ApiErrorDetail[] | undefined;

    if (responseData) {
      if (typeof responseData.message === 'string') {
        errorMessage = responseData.message;
      } else if (typeof responseData.error === 'string') {
        errorMessage = responseData.error;
      } else if (
        typeof responseData.error === 'object' &&
        responseData.error !== null &&
        'message' in responseData.error &&
        typeof responseData.error.message === 'string'
      ) {
        errorMessage = responseData.error.message;
      }

      // Check if Fastify / Zod validation error array is provided
      if (Array.isArray(responseData.errors)) {
        errorDetails = responseData.errors as ApiErrorDetail[];
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Handle 401 Unauthorized globally if desired
    if (statusCode === 401 && typeof window !== 'undefined') {
      const reqUrl = error.config?.url || '';
      const isAuthApi =
        reqUrl.includes('/auth/get-session') ||
        reqUrl.includes('/auth/sign-in') ||
        reqUrl.includes('/auth/check-availability') ||
        reqUrl.includes('/auth/sign-up');

      const isAuthPage = window.location.pathname.startsWith('/auth');

      if (!isAuthApi && !isAuthPage) {
        // Dispatch session expired custom event for UI listeners
        window.dispatchEvent(new CustomEvent('kalya:unauthorized'));
      }
    }

    const apiError = new ApiError(errorMessage, statusCode, errorDetails, responseData);
    return Promise.reject(apiError);
  }
);

// ------------------------------------------------------------
// Strongly-Typed HTTP Helper Methods
// ------------------------------------------------------------
export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },

  /** Access to the raw underlying Axios instance */
  instance: axiosInstance,
};

export { axiosInstance as axios, AxiosError };
export default http;
