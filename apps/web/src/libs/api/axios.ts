'use client';

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, type ApiErrorDetail, type StandardResponse } from './types';

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
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ------------------------------------------------------------
// Request Interceptor
// ------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If sending FormData (avatar uploads, file attachments), let browser set Content-Type with boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Attach client request tracking
    config.headers['X-Client-Timestamp'] = new Date().toISOString();

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
      // Retain the unboxed data directly
      response.data = data.data;
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
      const isAuthRoute = window.location.pathname.startsWith('/auth');
      if (!isAuthRoute && !window.location.pathname.startsWith('/api/auth')) {
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
